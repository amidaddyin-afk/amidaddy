import "server-only";

import { appendAuditEvent } from "@/lib/audit";
import { db, transaction } from "@/lib/db";
import { getOrder, sendOrderEmail } from "@/lib/orders";
import { shadowfax } from "./shadowfax";
import {
  buildTimeline,
  currentStage,
  orderStatusForStage,
  TERMINAL_STAGES,
  type ShipmentStage,
  type ShippingProvider,
  type TrackingEvent,
} from "./stages";

// Add Delhivery etc. here; SHIPPING_PROVIDER picks the one new orders use.
// Existing shipments keep syncing through the provider that booked them.
const providers: Record<string, ShippingProvider> = { shadowfax };

export function activeProvider() {
  const provider = providers[process.env.SHIPPING_PROVIDER ?? "shadowfax"];
  return provider?.configured() ? provider : null;
}

export function providerById(id: string) {
  return providers[id];
}

type ShipmentRow = {
  id: string;
  order_id: string;
  provider: string;
  awb: string;
  stage: ShipmentStage;
  synced_at: Date | null;
  created_at: Date;
};

async function activeShipment(orderId: string) {
  const { rows } = await db().query<ShipmentRow>(
    "select * from public.shipments where order_id=$1 and stage<>'CANCELLED' order by created_at desc limit 1",
    [orderId],
  );
  return rows[0];
}

/** Books the courier pickup for a paid order. Returns the AWB. */
export async function bookShipment(orderId: string, actorId?: string) {
  const provider = activeProvider();
  if (!provider)
    throw new Error(
      "No shipping provider is configured. Set SHIPPING_PROVIDER and its credentials.",
    );
  const order = await getOrder(orderId);
  if (!order || !["CONFIRMED", "PROCESSING"].includes(order.status))
    throw new Error("Only confirmed orders can be booked for pickup.");
  if (await activeShipment(orderId))
    throw new Error("This order already has a courier booking.");
  // The courier remembers client_order_ids, so a re-booking after a
  // cancellation needs a fresh one.
  const previous = Number(
    (
      await db().query(
        "select count(*) count from public.shipments where order_id=$1",
        [orderId],
      )
    ).rows[0].count,
  );
  const clientOrderId = previous ? `${order.id}-${previous + 1}` : order.id;
  const { awb } = await provider.book(order, clientOrderId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  await transaction(async (client) => {
    await client.query(
      "insert into public.shipments(order_id,provider,awb,stage) values($1,$2,$3,'BOOKED')",
      [orderId, provider.id, awb],
    );
    // Existing emails and admin cards already read these columns.
    await client.query(
      "update public.orders set courier_name=$2,tracking_number=$3,tracking_url=$4,updated_at=now() where id=$1",
      [
        orderId,
        provider.label,
        awb,
        appUrl ? `${appUrl}/account/orders/${orderId}/track` : null,
      ],
    );
    await appendAuditEvent(client, actorId ?? null, "shipment.booked", {
      orderId,
      provider: provider.id,
      awb,
    });
  });
  return awb;
}

/** Called after payment. A courier failure must never undo a payment, so it
 *  is logged to the activity feed and the admin books from the order card. */
export async function autoBookShipment(orderId: string) {
  if (!activeProvider()) return;
  try {
    await bookShipment(orderId);
  } catch (error) {
    console.error("[shipping] auto-booking failed:", orderId, error);
    await transaction((client) =>
      appendAuditEvent(client, null, "shipment.booking_failed", {
        orderId,
        error: error instanceof Error ? error.message : String(error),
      }),
    ).catch(() => {});
  }
}

/** Pulls the courier's full history and moves the order along with it. */
async function syncShipment(shipment: ShipmentRow) {
  const provider = providers[shipment.provider];
  if (!provider) return;
  const events = await provider.track(shipment.awb);
  const stage = currentStage(events, shipment.stage);
  await transaction(async (client) => {
    for (const event of events)
      await client.query(
        "insert into public.shipment_events(shipment_id,occurred_at,code,label,remarks,location,stage) values($1,$2,$3,$4,$5,$6,$7) on conflict do nothing",
        [
          shipment.id,
          event.occurredAt,
          event.code,
          event.label,
          event.remarks,
          event.location,
          event.stage,
        ],
      );
    await client.query(
      "update public.shipments set stage=$2,synced_at=now(),updated_at=now() where id=$1",
      [shipment.id, stage],
    );
  });

  const next = orderStatusForStage(stage);
  if (!next) return;
  const pickedAt = events
    .filter((event) => event.stage && event.stage !== "BOOKED")
    .map((event) => event.occurredAt)
    .sort()[0];
  const deliveredAt = events.find(
    (event) => event.stage === "DELIVERED",
  )?.occurredAt;
  const { rowCount } = await db().query(
    `update public.orders set status=$2::public."OrderStatus",
       shipped_at=coalesce(shipped_at,$3::timestamptz,now()),
       delivered_at=case when $2::text='DELIVERED' then coalesce(delivered_at,$4::timestamptz,now()) else delivered_at end,
       updated_at=now()
     where id=$1 and status = any($5::public."OrderStatus"[])`,
    [
      shipment.order_id,
      next,
      pickedAt ?? null,
      deliveredAt ?? null,
      next === "DELIVERED"
        ? ["CONFIRMED", "PROCESSING", "SHIPPED"]
        : ["CONFIRMED", "PROCESSING"],
    ],
  );
  if (rowCount)
    await sendOrderEmail(
      shipment.order_id,
      next === "DELIVERED" ? "order-delivered" : "order-shipped",
    );
}

export async function syncShipmentByAwb(providerId: string, awb: string) {
  const { rows } = await db().query<ShipmentRow>(
    "select * from public.shipments where provider=$1 and awb=$2",
    [providerId, awb],
  );
  if (rows[0]) await syncShipment(rows[0]);
  return Boolean(rows[0]);
}

export async function syncOrderShipment(orderId: string) {
  const shipment = await activeShipment(orderId);
  if (shipment) await syncShipment(shipment);
}

/** Courier callbacks are not retried, so the daily cron catches any we missed. */
export async function syncOpenShipments() {
  const { rows } = await db().query<ShipmentRow>(
    "select * from public.shipments where stage <> all($1::text[]) order by synced_at asc nulls first limit 200",
    [TERMINAL_STAGES],
  );
  let synced = 0;
  for (const shipment of rows)
    await syncShipment(shipment).then(
      () => synced++,
      (error) => console.error("[shipping] sync failed:", shipment.awb, error),
    );
  return synced;
}

/** Cancels a booking that has not been picked up yet. Throws once the parcel
 *  is with the courier, so a cancelled order never ships silently. */
export async function cancelActiveShipment(orderId: string, reason: string) {
  const shipment = await activeShipment(orderId);
  if (!shipment) return;
  if (shipment.stage !== "BOOKED")
    throw new Error(
      "This order is already with the courier and can no longer be cancelled online.",
    );
  await providers[shipment.provider]?.cancel(shipment.awb, reason);
  await db().query(
    "update public.shipments set stage='CANCELLED',updated_at=now() where id=$1",
    [shipment.id],
  );
}

const STALE_MS = 5 * 60 * 1000;

/** The tracking page view: refreshes from the courier if the copy is old. */
export async function getOrderTracking(orderId: string, placedAt: string) {
  let shipment = await activeShipment(orderId);
  if (
    shipment &&
    !TERMINAL_STAGES.includes(shipment.stage) &&
    Date.now() - (shipment.synced_at?.getTime() ?? 0) > STALE_MS
  ) {
    await syncShipment(shipment).catch((error) =>
      console.error("[shipping] on-view sync failed:", shipment?.awb, error),
    );
    shipment = await activeShipment(orderId);
  }
  const events: TrackingEvent[] = shipment
    ? (
        await db().query(
          "select occurred_at,code,label,remarks,location,stage from public.shipment_events where shipment_id=$1 order by occurred_at",
          [shipment.id],
        )
      ).rows.map((row) => ({
        occurredAt: new Date(row.occurred_at).toISOString(),
        code: String(row.code),
        label: String(row.label),
        remarks: row.remarks ? String(row.remarks) : null,
        location: row.location ? String(row.location) : null,
        stage: (row.stage as ShipmentStage | null) ?? null,
      }))
    : [];
  return {
    shipment: shipment
      ? {
          awb: shipment.awb,
          courier: providers[shipment.provider]?.label ?? shipment.provider,
          syncedAt: shipment.synced_at?.toISOString() ?? null,
        }
      : null,
    timeline: buildTimeline({
      placedAt,
      bookedAt: shipment?.created_at.toISOString() ?? null,
      stage: shipment?.stage ?? null,
      events,
    }),
  };
}
