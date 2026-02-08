import Link from "next/link";

export default function OrderConfirmationPage() {
  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-soft">
        <p className="text-xs uppercase tracking-[0.4em] text-black/40">Order placed</p>
        <h1 className="mt-3 font-display text-3xl">Thank you for your order</h1>
        <p className="mt-3 text-black/60">
          Your order has been confirmed. We will notify you once it ships.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-clay px-6 py-3 text-sm font-semibold text-white"
          >
            Continue shopping
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-black/20 px-6 py-3 text-sm font-semibold"
          >
            View orders
          </Link>
        </div>
      </div>
    </div>
  );
}
