import { notFound } from "next/navigation";
import Link from "next/link";
import { SubmitButton } from "@/components/AdminFeedback";
import ShipmentTracker from "@/components/ShipmentTracker";
import { refreshTrackingAction } from "@/features/orders/actions";
import { requireAdminPage } from "@/lib/auth";
import { getOrder } from "@/lib/orders";
import { getOrderTracking } from "@/lib/shipping";

export const dynamic = "force-dynamic";
export default async function AdminTrackOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();
  const tracking = await getOrderTracking(order.id, order.createdAt);
  return (
    <main data-surface="commerce" className="account-shell">
      <div className="mx-auto max-w-2xl px-5 pt-16 pb-24 sm:px-8">
        <Link href="/admin#orders" className="eyebrow">
          ← Admin orders
        </Link>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="display-title text-4xl">{order.id}</h1>
            <p className="text-subtle mt-2 text-sm">
              {order.customerName} · {order.phone} · {order.city}{" "}
              {order.postalCode} · {order.status.replaceAll("_", " ")}
            </p>
          </div>
          {tracking.shipment && (
            <form action={refreshTrackingAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <SubmitButton className="btn-ghost">
                Refresh from courier
              </SubmitButton>
            </form>
          )}
        </div>
        {tracking.shipment?.syncedAt && (
          <p className="text-subtle mt-3 text-xs">
            Last synced{" "}
            {new Date(tracking.shipment.syncedAt).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            })}
          </p>
        )}
        <ShipmentTracker
          timeline={tracking.timeline}
          courier={tracking.shipment?.courier}
          awb={tracking.shipment?.awb}
          showCodes
        />
      </div>
    </main>
  );
}
