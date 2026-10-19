import { notFound } from "next/navigation";
import Link from "next/link";
import OrderTimeline from "@/components/OrderTimeline";
import ShipmentTracker from "@/components/ShipmentTracker";
import { requireUser } from "@/lib/auth";
import { claimGuestOrders, getCustomerOrder } from "@/lib/orders";
import { getOrderTracking } from "@/lib/shipping";

export const dynamic = "force-dynamic";
export default async function TrackOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await requireUser();
  // Shipping emails link straight here, like the order page.
  if (user.email_confirmed_at && user.email)
    await claimGuestOrders(user.id, user.email).catch(() => {});
  const order = await getCustomerOrder(id, user.id).catch(() => undefined);
  if (!order) notFound();
  const terminal = order.status === "CANCELLED" || order.status === "EXPIRED";
  const tracking = terminal
    ? null
    : await getOrderTracking(order.id, order.createdAt);
  return (
    <main data-surface="commerce" className="account-shell">
      <div className="mx-auto max-w-2xl px-5 pt-16 pb-24 sm:px-8">
        <Link href={`/account/orders/${order.id}`} className="eyebrow">
          ← Order {order.id}
        </Link>
        <h1 className="display-title mt-6 text-5xl">Track your order</h1>
        {tracking ? (
          <ShipmentTracker
            timeline={tracking.timeline}
            courier={tracking.shipment?.courier}
            awb={tracking.shipment?.awb}
          />
        ) : (
          <OrderTimeline status={order.status} />
        )}
      </div>
    </main>
  );
}
