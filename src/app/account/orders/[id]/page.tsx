import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import OrderCancelForm from "@/components/OrderCancelForm";
import OrderTimeline from "@/components/OrderTimeline";
import { requireUser } from "@/lib/auth";
import { getCustomerOrder } from "@/lib/orders";
import { formatInr } from "@/lib/money";

export const dynamic = "force-dynamic";
export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await requireUser();
  const order = await getCustomerOrder(id, user.id).catch(() => undefined);
  if (!order) notFound();
  const canCancel = ["PAYMENT_PENDING", "CONFIRMED"].includes(order.status);
  return (
    <main className="account-shell">
      <div className="mx-auto max-w-5xl px-5 pt-16 pb-24 sm:px-8">
        <Link href="/account/orders" className="eyebrow">
          ← All orders
        </Link>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">Order {order.id}</p>
            <h1 className="display-title mt-3 text-5xl">
              {order.status.replaceAll("_", " ")}
            </h1>
          </div>
          <a href={`/account/orders/${order.id}/receipt`} className="btn-ghost">
            Download receipt
          </a>
        </div>
        <OrderTimeline status={order.status} />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
          <section className="lux-panel p-6 sm:p-8">
            <h2 className="display-title text-3xl">Your selection</h2>
            <div className="mt-6 space-y-5">
              {order.lines.map((line) => (
                <div key={line.id} className="order-line">
                  <div>
                    <p>{line.name}</p>
                    <span>
                      {line.size} × {line.qty}
                    </span>
                  </div>
                  <strong>{formatInr(line.lineTotalPaise)}</strong>
                </div>
              ))}
            </div>
            <dl className="order-totals">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatInr(order.subtotalPaise)}</dd>
              </div>
              {order.discountPaise > 0 && (
                <div>
                  <dt>Discount</dt>
                  <dd>−{formatInr(order.discountPaise)}</dd>
                </div>
              )}
              <div>
                <dt>Shipping</dt>
                <dd>
                  {order.shippingPaise
                    ? formatInr(order.shippingPaise)
                    : "Complimentary"}
                </dd>
              </div>
              <div>
                <dt>Included GST</dt>
                <dd>{formatInr(order.taxPaise)}</dd>
              </div>
              <div>
                <dt>Total</dt>
                <dd>{formatInr(order.totalPaise)}</dd>
              </div>
            </dl>
          </section>
          <aside className="space-y-5">
            <section className="lux-panel p-6">
              <p className="eyebrow">Delivery</p>
              <p className="mt-4 leading-7">
                {order.customerName}
                <br />
                {order.address}
                <br />
                {order.city}, {order.state} {order.postalCode}
                <br />
                India
              </p>
              {order.trackingNumber && (
                <div className="mt-5 border-t border-white/10 pt-5">
                  <p className="text-sm text-white/45">
                    {order.courierName} · {order.trackingNumber}
                  </p>
                  {order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-link mt-3"
                    >
                      Track shipment <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              )}
            </section>
            {canCancel && (
              <section className="lux-panel p-6">
                <p className="eyebrow">Need to change course?</p>
                <p className="mt-3 text-sm leading-6 text-white/45">
                  Cancellation is available until preparation begins. Paid
                  orders receive a full Razorpay refund.
                </p>
                <OrderCancelForm orderId={order.id} />
              </section>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
