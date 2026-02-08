"use client";

export default function CheckoutPage() {
  return (
    <div className="container py-14">
      <h1 className="font-display text-3xl">Checkout</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form className="space-y-4 rounded-2xl bg-white p-6 shadow-soft">
          <h2 className="font-display text-xl">Shipping details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <input className="rounded-xl border border-black/10 px-4 py-3" placeholder="Full name" />
            <input className="rounded-xl border border-black/10 px-4 py-3" placeholder="Phone" />
          </div>
          <input className="rounded-xl border border-black/10 px-4 py-3" placeholder="Address line 1" />
          <input className="rounded-xl border border-black/10 px-4 py-3" placeholder="Address line 2" />
          <div className="grid gap-4 md:grid-cols-3">
            <input className="rounded-xl border border-black/10 px-4 py-3" placeholder="City" />
            <input className="rounded-xl border border-black/10 px-4 py-3" placeholder="State" />
            <input className="rounded-xl border border-black/10 px-4 py-3" placeholder="Postal code" />
          </div>
          <button className="rounded-full bg-clay px-6 py-3 text-sm font-semibold text-white">
            Continue to payment
          </button>
        </form>
        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <h2 className="font-display text-xl">Payment</h2>
          <p className="mt-2 text-sm text-black/50">
            Stripe Elements will render here after integrating the client secret.
          </p>
          <button className="mt-6 w-full rounded-full border border-black/20 px-6 py-3 text-sm font-semibold">
            Pay ₹3,598
          </button>
        </div>
      </div>
    </div>
  );
}
