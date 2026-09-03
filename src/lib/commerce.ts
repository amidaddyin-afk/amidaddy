export const DEFAULT_SHIPPING_FEE_PAISE = 9_900;
export const DEFAULT_FREE_SHIPPING_PAISE = 59_900;

export function shippingPaise(
  // Eligibility is checked against the cart's value before any coupon
  // discount, so applying a coupon can never push an order that qualified
  // for free shipping back into a delivery charge.
  subtotalPaise: number,
  feePaise = DEFAULT_SHIPPING_FEE_PAISE,
  freeAbovePaise = DEFAULT_FREE_SHIPPING_PAISE,
) {
  return subtotalPaise >= freeAbovePaise ? 0 : feePaise;
}

export function couponDiscountPaise(
  subtotalPaise: number,
  type: "PERCENT" | "FIXED",
  value: number,
  maxDiscountPaise?: number | null,
) {
  const raw =
    type === "PERCENT"
      ? Math.round((subtotalPaise * value) / 100)
      : Math.round(value);
  return Math.max(
    0,
    Math.min(raw, maxDiscountPaise ?? Number.MAX_SAFE_INTEGER, subtotalPaise),
  );
}

export function isCustomerCancellationAllowed(status: string) {
  return status === "PAYMENT_PENDING" || status === "CONFIRMED";
}

export function refundablePaise(totalPaise: number, refundedPaise: number) {
  return Math.max(0, totalPaise - refundedPaise);
}

const fulfillmentTransitions: Record<string, string> = {
  CONFIRMED: "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED: "DELIVERED",
};

export function isFulfillmentTransitionAllowed(from: string, to: string) {
  return fulfillmentTransitions[from] === to;
}
