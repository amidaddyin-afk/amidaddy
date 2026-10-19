// Shadowfax forward-logistics adapter.
// API reference (the one the SFX 360 portal links to):
// https://sfxunifiedapi.docs.apiary.io/ (marketplace model)
//
// Shadowfax answers HTTP 200 even when it rejects an order, so success is
// read from `message`, never the status code.
import { z } from "zod";
import type {
  BookingOrder,
  ShipmentStage,
  ShippingProvider,
  TrackingEvent,
} from "./stages";

// Status codes from the OrderDetails.status enum. Anything not listed maps to
// null: the event still reaches the customer with Shadowfax's own label.
const STAGES: Record<string, ShipmentStage> = {
  new: "BOOKED",
  assigned_for_pickup: "BOOKED",
  assigned_for_seller_pickup: "BOOKED",
  ofp: "BOOKED",
  seller_initiated_delay: "BOOKED",
  seller_not_contactable: "BOOKED",
  pickup_not_attempted: "BOOKED",
  pickup_on_hold: "BOOKED",
  picked: "PICKED_UP",
  recd_at_rev_hub: "IN_TRANSIT",
  item_manifested: "IN_TRANSIT",
  bag_received: "IN_TRANSIT",
  bag_received_at_via: "IN_TRANSIT",
  bag_in_transit: "IN_TRANSIT",
  item_misrouted: "IN_TRANSIT",
  received_from_client_warehouse: "PICKED_UP",
  pending_inscan: "PICKED_UP",
  recd_at_fwd_hub: "IN_TRANSIT",
  recd_at_fwd_dc: "IN_TRANSIT",
  assigned_for_delivery: "IN_TRANSIT",
  on_hold: "IN_TRANSIT",
  ewb_on_hold: "IN_TRANSIT",
  pincode_updated: "IN_TRANSIT",
  reopen_ndr: "IN_TRANSIT",
  // Failed delivery attempts: customer unavailable, not contactable, etc.
  cid: "IN_TRANSIT",
  nc: "IN_TRANSIT",
  na: "IN_TRANSIT",
  ofd: "OUT_FOR_DELIVERY",
  delivered: "DELIVERED",
  partially_delivered: "DELIVERED",
  qc_failed: "RETURNING",
  rts: "RETURNING",
  rts_in_process: "RETURNING",
  rts_nd: "RETURNING",
  rts_ofd: "RETURNING",
  in_transit_return: "RETURNING",
  rto: "RETURNING",
  rto_nd: "RETURNING",
  rts_d: "RETURNED",
  rto_d: "RETURNED",
  cancelled_by_customer: "CANCELLED",
  cancelled_by_seller: "CANCELLED",
  lost: "LOST",
};

export const shadowfaxStage = (code: string): ShipmentStage | null =>
  STAGES[code.trim().toLowerCase()] ?? null;

const env = () => ({
  token: process.env.SHADOWFAX_API_TOKEN,
  baseUrl: (process.env.SHADOWFAX_BASE_URL || "https://dale.shadowfax.in")
    .trim()
    .replace(/\/+$/, ""),
  pickup: {
    name: process.env.SHIPPING_PICKUP_NAME,
    contact: process.env.SHIPPING_PICKUP_PHONE,
    address_line_1: process.env.SHIPPING_PICKUP_ADDRESS,
    city: process.env.SHIPPING_PICKUP_CITY,
    state: process.env.SHIPPING_PICKUP_STATE,
    pincode: Number(process.env.SHIPPING_PICKUP_PINCODE),
  },
});

/** Shadowfax wants 10 digits; checkout stores whatever the customer typed. */
export const tenDigitPhone = (phone: string) =>
  phone.replace(/\D/g, "").slice(-10);

async function call(path: string, init?: RequestInit): Promise<unknown> {
  const { token, baseUrl } = env();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(10_000),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(`Shadowfax returned HTTP ${response.status}.`);
  return body;
}

export function shadowfaxOrderBody(order: BookingOrder, clientOrderId: string) {
  const { pickup } = env();
  const address = {
    address_line_1: order.address,
    city: order.city ?? "",
    state: order.state ?? "",
    pincode: Number(order.postalCode),
  };
  return {
    order_type: "marketplace",
    order_details: {
      client_order_id: clientOrderId,
      // product_value excludes GST; total_amount includes it.
      product_value: (order.totalPaise - order.taxPaise) / 100,
      total_amount: order.totalPaise / 100,
      payment_mode: "Prepaid",
      cod_amount: 0,
    },
    customer_details: {
      name: order.customerName,
      contact: tenDigitPhone(order.phone),
      ...address,
    },
    pickup_details: pickup,
    // Undelivered parcels come back to the pickup address.
    rts_details: pickup,
    product_details: order.lines.map((line) => ({
      sku_id: line.variantId ?? line.productId,
      sku_name: `${line.name} ${line.size}`,
      price: line.unitPricePaise / 100,
      // Alcohol-based perfume is flammable: declared so it moves by surface.
      additional_details: {
        requires_extra_care: "True",
        type_extra_care: "Dangerous Goods",
        quantity: line.qty,
      },
    })),
  };
}

const bookingResponse = z.object({
  message: z.string(),
  data: z.object({ awb_number: z.string().min(1) }).nullish(),
  errors: z.unknown().optional(),
});

const trackingResponse = z.object({
  tracking_details: z
    .array(
      z.object({
        created: z.string(),
        status: z.string().nullish(),
        status_id: z.string(),
        remarks: z.string().nullish(),
        location: z.string().nullish(),
      }),
    )
    .default([]),
});

export function parseShadowfaxTracking(body: unknown): TrackingEvent[] {
  return trackingResponse.parse(body).tracking_details.map((event) => ({
    occurredAt: new Date(event.created).toISOString(),
    code: event.status_id,
    label: event.status?.trim() || event.status_id.replaceAll("_", " "),
    remarks: event.remarks?.trim() || null,
    location: event.location?.trim() || null,
    stage: shadowfaxStage(event.status_id),
  }));
}

export const shadowfax: ShippingProvider = {
  id: "shadowfax",
  label: "Shadowfax",
  missingConfig() {
    return [
      "SHADOWFAX_API_TOKEN",
      "SHIPPING_PICKUP_NAME",
      "SHIPPING_PICKUP_PHONE",
      "SHIPPING_PICKUP_ADDRESS",
      "SHIPPING_PICKUP_CITY",
      "SHIPPING_PICKUP_STATE",
      "SHIPPING_PICKUP_PINCODE",
    ].filter((name) => !process.env[name]?.trim());
  },
  async book(order, clientOrderId) {
    const parsed = bookingResponse.safeParse(
      await call("/api/v3/clients/orders/", {
        method: "POST",
        body: JSON.stringify(shadowfaxOrderBody(order, clientOrderId)),
      }),
    );
    if (
      !parsed.success ||
      parsed.data.message !== "Success" ||
      !parsed.data.data
    )
      throw new Error(
        `Shadowfax rejected the booking: ${
          parsed.success
            ? String(parsed.data.errors ?? "no reason given")
            : "unreadable response"
        }`,
      );
    return { awb: parsed.data.data.awb_number };
  },
  async track(awb) {
    return parseShadowfaxTracking(
      await call(`/api/v4/clients/orders/${encodeURIComponent(awb)}/track/`),
    );
  },
  async cancel(awb, reason) {
    const body = (await call("/api/v3/clients/orders/cancel/", {
      method: "POST",
      body: JSON.stringify({ request_id: awb, cancel_remarks: reason }),
    })) as { responseCode?: number; responseMsg?: string } | null;
    // 200 cancelled (or already cancelling), 304 queued until the parcel
    // reaches the next facility; anything else is a refusal.
    if (body?.responseCode && ![200, 304].includes(body.responseCode))
      throw new Error(
        body.responseMsg ?? "Shadowfax could not cancel this shipment.",
      );
  },
};
