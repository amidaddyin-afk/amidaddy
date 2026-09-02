import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { claimAndListCustomerOrders } from "@/lib/orders";
import { formatInr } from "@/lib/money";

export const dynamic = "force-dynamic";
export default async function OrdersPage() {
  const { user } = await requireUser();
  const orders =
    user.email_confirmed_at && user.email
      ? await claimAndListCustomerOrders(user.id, user.email).catch(() => [])
      : [];
  return (
    <main data-surface="commerce" className="account-shell">
      <div className="mx-auto max-w-5xl px-5 pt-16 pb-24 sm:px-8">
        <p className="eyebrow">Account · Orders</p>
        <h1 className="display-title mt-4 text-5xl">Your fragrance history.</h1>
        <div className="order-list mt-10">
          {orders.map((order) => (
            <Link key={order.id} href={`/account/orders/${order.id}`}>
              <div>
                <span>{order.id}</span>
                <p>
                  {order.lines
                    .map((line) => `${line.name} ${line.size}`)
                    .join(" · ")}
                </p>
              </div>
              <div>
                <span>{order.status.replaceAll("_", " ")}</span>
                <strong>{formatInr(order.totalPaise)}</strong>
              </div>
            </Link>
          ))}
          {!orders.length && (
            <div className="lux-panel p-10 text-center">
              <p className="text-subtle">No orders yet.</p>
              <Link href="/shop" className="lux-button mt-6">
                Explore fragrances
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
