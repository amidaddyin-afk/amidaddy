import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, RotateCcw, XCircle } from "lucide-react";
import OrderCancelForm from "@/components/OrderCancelForm";
import ReplacementNotice from "@/components/ReplacementNotice";
import { requireUser } from "@/lib/auth";
import { getCustomerOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cancellation, returns and replacements",
  description:
    "Review Amidaddy cancellation and replacement requirements for your order.",
};

export default async function OrderSupportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await requireUser();
  const order = await getCustomerOrder(id, user.id).catch(() => undefined);
  if (!order) notFound();

  const canCancel = ["PAYMENT_PENDING", "CONFIRMED"].includes(order.status);
  const supportSubject = encodeURIComponent(
    `Return or replacement request for order ${order.id}`,
  );

  return (
    <main data-surface="commerce" className="account-shell">
      <div className="mx-auto max-w-5xl px-5 pt-16 pb-24 sm:px-8">
        <Link
          href={`/account/orders/${order.id}`}
          className="eyebrow inline-flex items-center gap-2"
        >
          <ArrowLeft size={14} /> Back to order
        </Link>

        <div className="mt-8 max-w-3xl">
          <p className="eyebrow">Order {order.id}</p>
          <h1 className="display-title mt-4 text-5xl sm:text-6xl">
            Cancellation, returns & replacements.
          </h1>
          <p className="text-subtle mt-5 max-w-2xl leading-7">
            Review the requirements below before choosing the right action for
            your order.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          <ReplacementNotice />

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="lux-panel p-6 sm:p-8" id="cancel">
              <XCircle size={21} className="text-champagne" />
              <p className="eyebrow mt-5">Cancel order</p>
              <h2 className="display-title mt-3 text-3xl">
                Before preparation begins.
              </h2>
              {canCancel ? (
                <>
                  <p className="text-subtle mt-4 text-sm leading-6">
                    This order can still be cancelled. Paid orders receive a
                    full refund through the original Razorpay payment method.
                  </p>
                  <OrderCancelForm orderId={order.id} />
                </>
              ) : (
                <p className="text-subtle mt-4 text-sm leading-6">
                  Online cancellation is no longer available because this order
                  has reached {order.status.replaceAll("_", " ").toLowerCase()}.
                  Contact support if you still need help.
                </p>
              )}
            </section>

            <section className="lux-panel p-6 sm:p-8" id="replacement">
              <RotateCcw size={21} className="text-champagne" />
              <p className="eyebrow mt-5">Return or replacement</p>
              <h2 className="display-title mt-3 text-3xl">
                Send us the order details.
              </h2>
              <p className="text-subtle mt-4 text-sm leading-6">
                If the parcel contains a wrong product or a broken/damaged
                bottle, email us the order number and the continuous unboxing
                video described above. Our team will review the request and
                reply with the next steps.
              </p>
              <a
                href={`mailto:support@amidaddy.in?subject=${supportSubject}`}
                className="lux-button mt-6 w-full"
              >
                <Mail size={16} /> Contact support
              </a>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
