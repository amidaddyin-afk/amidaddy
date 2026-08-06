"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowLeft, LockKeyhole, ShoppingBag, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatInr } from "@/lib/money";

export default function CheckoutClient() {
  const router = useRouter();
  const { items, subtotalPaise, estimatedShippingPaise, estimatedTotalPaise } =
    useCart();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [coupon, setCoupon] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const values = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: values.get("name"),
            email: values.get("email"),
            phone: values.get("phone"),
            address: values.get("address"),
            city: values.get("city"),
            state: values.get("state"),
            postalCode: values.get("postalCode"),
          },
          items: items.map((item) => ({
            variantId: item.variantId,
            qty: item.qty,
          })),
          couponCode: coupon || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.razorpayOrderId)
        throw new Error(data.error ?? "Unable to begin checkout.");
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const Razorpay = (
          window as typeof window & {
            Razorpay?: new (options: Record<string, unknown>) => {
              open: () => void;
            };
          }
        ).Razorpay;
        if (!Razorpay) {
          setError("Unable to load secure payment.");
          setSubmitting(false);
          return;
        }
        new Razorpay({
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: "Amidaddy",
          description: "Signature fragrance order",
          order_id: data.razorpayOrderId,
          prefill: {
            name: data.customer.name,
            email: data.customer.email,
            contact: data.customer.phone,
          },
          handler: () =>
            router.push(
              `/checkout/success?order=${encodeURIComponent(data.applicationOrderId)}`,
            ),
          modal: { ondismiss: () => setSubmitting(false) },
          theme: { color: "#c9a96e" },
        }).open();
      };
      script.onerror = () => {
        setError("Unable to load secure payment.");
        setSubmitting(false);
      };
      document.body.appendChild(script);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to begin checkout.",
      );
      setSubmitting(false);
    }
  }
  if (!items.length)
    return (
      <main className="empty-state">
        <ShoppingBag size={42} />
        <h1>Your ritual begins with a scent.</h1>
        <Link href="/shop" className="lux-button">
          Explore fragrances
        </Link>
      </main>
    );
  return (
    <main className="checkout-shell">
      <div className="mx-auto max-w-6xl">
        <Link href="/shop" className="eyebrow inline-flex items-center gap-2">
          <ArrowLeft size={14} /> Continue exploring
        </Link>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
          <form onSubmit={submit} className="lux-panel p-6 sm:p-10">
            <p className="eyebrow">Secure checkout</p>
            <h1 className="display-title mt-4 text-4xl">
              Where should we send your signature?
            </h1>
            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              <label className="field sm:col-span-2">
                <span>Full name</span>
                <input required name="name" autoComplete="name" />
              </label>
              <label className="field">
                <span>Email</span>
                <input
                  required
                  type="email"
                  name="email"
                  autoComplete="email"
                />
              </label>
              <label className="field">
                <span>Phone</span>
                <input
                  required
                  name="phone"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </label>
              <label className="field sm:col-span-2">
                <span>Address</span>
                <textarea
                  required
                  name="address"
                  rows={3}
                  autoComplete="street-address"
                />
              </label>
              <label className="field">
                <span>City</span>
                <input required name="city" autoComplete="address-level2" />
              </label>
              <label className="field">
                <span>State</span>
                <input required name="state" autoComplete="address-level1" />
              </label>
              <label className="field">
                <span>PIN code</span>
                <input
                  required
                  name="postalCode"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  autoComplete="postal-code"
                />
              </label>
              <label className="field">
                <span>Coupon</span>
                <input
                  value={coupon}
                  onChange={(event) =>
                    setCoupon(event.target.value.toUpperCase())
                  }
                  placeholder="Optional"
                />
              </label>
            </div>
            {error && (
              <p role="alert" className="error-banner">
                {error}
              </p>
            )}
            <button disabled={submitting} className="lux-button mt-7 w-full">
              <LockKeyhole size={15} />
              {submitting
                ? "Opening secure payment…"
                : `Pay ${formatInr(estimatedTotalPaise)}`}
            </button>
            <p className="mt-4 text-center text-xs text-white/40">
              Final pricing and coupon eligibility are verified securely before
              payment.
            </p>
          </form>
          <aside className="lux-panel h-fit p-6 lg:sticky lg:top-32">
            <div className="flex items-center gap-3">
              <Sparkles size={16} className="text-champagne" />
              <h2 className="display-title text-2xl">Your selection</h2>
            </div>
            <div className="mt-6 space-y-5 border-b border-white/10 pb-6">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex justify-between gap-4 text-sm"
                >
                  <div>
                    <p>{item.product.name}</p>
                    <p className="mt-1 text-xs text-white/45">
                      {item.size} × {item.qty}
                    </p>
                  </div>
                  <span>{formatInr(item.unitPricePaise * item.qty)}</span>
                </div>
              ))}
            </div>
            <dl className="mt-6 space-y-3 text-sm">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatInr(subtotalPaise)}</dd>
              </div>
              <div>
                <dt>Shipping</dt>
                <dd>
                  {estimatedShippingPaise
                    ? formatInr(estimatedShippingPaise)
                    : "Complimentary"}
                </dd>
              </div>
              <div className="total-row">
                <dt>Estimated total</dt>
                <dd>{formatInr(estimatedTotalPaise)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs leading-5 text-white/40">
              Prices include GST. Shipping is complimentary above ₹1,999.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
