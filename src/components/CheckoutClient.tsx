"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import { ArrowLeft, LockKeyhole, ShoppingBag, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatInr } from "@/lib/money";

type CheckoutQuote = {
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  taxPaise: number;
  totalPaise: number;
  couponCode: string | null;
};

export default function CheckoutClient() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const { items, subtotalPaise, estimatedShippingPaise, estimatedTotalPaise } =
    useCart();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [appliedEmail, setAppliedEmail] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);

  const displayedSubtotalPaise = quote?.subtotalPaise ?? subtotalPaise;
  const displayedShippingPaise = quote?.shippingPaise ?? estimatedShippingPaise;
  const displayedTotalPaise = quote?.totalPaise ?? estimatedTotalPaise;

  function clearAppliedCoupon() {
    setAppliedCoupon("");
    setAppliedEmail("");
    setQuote(null);
    setCouponMessage("");
  }

  async function applyCoupon() {
    const form = formRef.current;
    if (!form || !coupon.trim()) return;
    const email = String(new FormData(form).get("email") ?? "")
      .trim()
      .toLowerCase();
    setCouponError("");
    setCouponMessage("");
    setApplyingCoupon(true);
    try {
      const response = await fetch("/api/checkout/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          couponCode: coupon,
          items: items.map((item) => ({
            variantId: item.variantId,
            qty: item.qty,
          })),
        }),
      });
      const data = (await response.json()) as CheckoutQuote & {
        error?: string;
      };
      if (!response.ok || !data.couponCode)
        throw new Error(data.error ?? "Unable to apply coupon.");
      setCoupon(data.couponCode);
      setAppliedCoupon(data.couponCode);
      setAppliedEmail(email);
      setQuote(data);
      setCouponMessage(
        `${data.couponCode} applied. You save ${formatInr(data.discountPaise)}.`,
      );
    } catch (caught) {
      clearAppliedCoupon();
      setCouponError(
        caught instanceof Error ? caught.message : "Unable to apply coupon.",
      );
    } finally {
      setApplyingCoupon(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const values = new FormData(event.currentTarget);
    const checkoutEmail = String(values.get("email") ?? "")
      .trim()
      .toLowerCase();
    if (coupon.trim() && coupon.trim() !== appliedCoupon) {
      setError("Apply the coupon before continuing to payment.");
      return;
    }
    if (appliedCoupon && checkoutEmail !== appliedEmail) {
      clearAppliedCoupon();
      setError("Your email changed. Apply the coupon again before payment.");
      return;
    }
    setSubmitting(true);
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
          couponCode: appliedCoupon || undefined,
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
          handler: async (payment: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            try {
              await fetch("/api/checkout/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpayOrderId: payment.razorpay_order_id,
                  razorpayPaymentId: payment.razorpay_payment_id,
                  razorpaySignature: payment.razorpay_signature,
                }),
              });
            } finally {
              router.push(
                `/checkout/success?order=${encodeURIComponent(data.applicationOrderId)}`,
              );
            }
          },
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
    <main data-surface="commerce" className="checkout-shell">
      <div className="mx-auto max-w-6xl">
        <Link href="/shop" className="eyebrow inline-flex items-center gap-2">
          <ArrowLeft size={14} /> Continue exploring
        </Link>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
          <form
            ref={formRef}
            onSubmit={submit}
            className="lux-panel p-6 sm:p-10"
          >
            <p className="eyebrow">Secure checkout</p>
            <h1 className="display-title mt-4 text-4xl">
              Fill in your delivery details.
            </h1>
            <p className="checkout-intro">
              Enter your contact and address information to continue to secure
              payment.
            </p>
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
                  placeholder="you@example.com"
                  onChange={(event) => {
                    if (
                      appliedCoupon &&
                      event.target.value.trim().toLowerCase() !== appliedEmail
                    )
                      clearAppliedCoupon();
                  }}
                />
              </label>
              <label className="field">
                <span>Phone</span>
                <input
                  required
                  name="phone"
                  autoComplete="tel"
                  inputMode="tel"
                  type="tel"
                  minLength={8}
                  maxLength={20}
                  pattern="[+0-9 ()-]{8,20}"
                  placeholder="+91 98765 43210"
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
              <div className="field">
                <label htmlFor="coupon-code">
                  <span>Coupon</span>
                </label>
                <div className="coupon-control">
                  <input
                    id="coupon-code"
                    value={coupon}
                    onChange={(event) => {
                      const nextCoupon = event.target.value.toUpperCase();
                      setCoupon(nextCoupon);
                      setCouponError("");
                      if (nextCoupon.trim() !== appliedCoupon)
                        clearAppliedCoupon();
                    }}
                    placeholder="Enter code"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={
                      applyingCoupon ||
                      submitting ||
                      !coupon.trim() ||
                      Boolean(quote && coupon.trim() === appliedCoupon)
                    }
                    className="coupon-apply-button"
                  >
                    {applyingCoupon
                      ? "Applying…"
                      : quote && coupon.trim() === appliedCoupon
                        ? "Applied"
                        : "Apply"}
                  </button>
                </div>
              </div>
              {(couponError || couponMessage) && (
                <div
                  className="coupon-feedback sm:col-span-2"
                  aria-live="polite"
                >
                  {couponError ? (
                    <p role="alert" className="coupon-error">
                      {couponError}
                    </p>
                  ) : (
                    <p>{couponMessage}</p>
                  )}
                </div>
              )}
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
                : `Pay ${formatInr(displayedTotalPaise)}`}
            </button>
          </form>
          <aside className="lux-panel h-fit p-6 lg:sticky lg:top-32">
            <div className="flex items-center gap-3">
              <Sparkles size={16} className="text-champagne" />
              <h2 className="display-title text-2xl">Your selection</h2>
            </div>
            <div className="border-line mt-6 space-y-5 border-b pb-6">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex justify-between gap-4 text-sm"
                >
                  <div>
                    <p>{item.product.name}</p>
                    <p className="text-subtle mt-1 text-xs">
                      {item.product.packSize && item.product.packSize > 1
                        ? `${item.product.packSize} × ${item.size}`
                        : item.size}{" "}
                      × {item.qty}
                    </p>
                  </div>
                  <span>{formatInr(item.unitPricePaise * item.qty)}</span>
                </div>
              ))}
            </div>
            <dl className="mt-6 space-y-3 text-sm">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatInr(displayedSubtotalPaise)}</dd>
              </div>
              {quote && quote.discountPaise > 0 && (
                <div className="discount-row">
                  <dt>Coupon ({appliedCoupon})</dt>
                  <dd>−{formatInr(quote.discountPaise)}</dd>
                </div>
              )}
              <div>
                <dt>Shipping</dt>
                <dd>
                  {displayedShippingPaise
                    ? formatInr(displayedShippingPaise)
                    : "Complimentary"}
                </dd>
              </div>
              <div className="total-row">
                <dt>{quote ? "Total" : "Estimated total"}</dt>
                <dd>{formatInr(displayedTotalPaise)}</dd>
              </div>
            </dl>
            <p className="text-subtle mt-4 text-xs leading-5">
              Prices include GST. Shipping is complimentary on orders of ₹599 or
              more.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
