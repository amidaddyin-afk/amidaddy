import Link from "next/link";
import { CheckCircle2, Clock3 } from "lucide-react";
import ClearCartOnSuccess from "@/components/ClearCartOnSuccess";
import { getOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: id } = await searchParams;
  const order = id ? await getOrder(id).catch(() => undefined) : undefined;
  const paid = Boolean(order && order.paymentStatus === "PAID");
  return (
    <main className="empty-state">
      <ClearCartOnSuccess paid={paid} />
      {paid ? <CheckCircle2 size={52} /> : <Clock3 size={52} />}
      <p className="eyebrow mt-6">
        {paid ? "Payment confirmed" : "Confirming payment"}
      </p>
      <h1>
        {paid
          ? "Your signature is on its way."
          : "We are checking your payment."}
      </h1>
      <p className="max-w-lg text-sm leading-7 text-white/48">
        {paid
          ? `Order ${order!.id} is confirmed. Sign in with the same verified email to track every step.`
          : "Razorpay confirmation can take a few moments. Your order will update automatically from the secure payment notification."}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/account/orders" className="lux-button">
          Track my order
        </Link>
        <Link href="/shop" className="btn-ghost">
          Continue exploring
        </Link>
      </div>
    </main>
  );
}
