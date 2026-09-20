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

/**
 * Build-your-own combo discount.
 *
 * Buying more than one 100ml bottle earns a tiered discount on those bottles:
 * 2 -> 10%, 3 -> 15%, 4 or more -> 20%. The rate is applied to the selling
 * price (not MRP, which already carries its own markdown) and only to the
 * 100ml lines, so adding 20ml decants or a pre-made combo pack neither earns
 * nor dilutes the tier.
 *
 * Kept here rather than in the cart context because the server reprices every
 * order from the database and must reach the same number; a discount computed
 * only on the client would be trivially forged.
 */
export const COMBO_SIZE = "100ml";
export const COMBO_TIERS = [
  { minQty: 4, percent: 20 },
  { minQty: 3, percent: 15 },
  { minQty: 2, percent: 10 },
] as const;

export function comboPercentFor(qty: number) {
  return COMBO_TIERS.find((tier) => qty >= tier.minQty)?.percent ?? 0;
}

/** The next tier up, for prompting ("add 1 more to save 15%"). Null at the top. */
export function nextComboTier(qty: number) {
  const better = [...COMBO_TIERS].reverse().find((tier) => tier.minQty > qty);
  return better ? { ...better, addQty: better.minQty - qty } : null;
}

/**
 * Discount in paise for a set of cart lines. Counts total 100ml QUANTITY, so
 * two of the same bottle earn the tier just as two different ones do.
 */
export function comboDiscountPaise(
  lines: { size: string; qty: number; unitPricePaise: number }[],
) {
  const eligible = lines.filter((line) => line.size === COMBO_SIZE);
  const qty = eligible.reduce((sum, line) => sum + line.qty, 0);
  const percent = comboPercentFor(qty);
  if (!percent) return { percent: 0, discountPaise: 0, qty };
  const eligibleSubtotal = eligible.reduce(
    (sum, line) => sum + line.unitPricePaise * line.qty,
    0,
  );
  return {
    percent,
    // Round once on the total rather than per line, so the customer-facing
    // number always matches eligibleSubtotal * percent exactly.
    discountPaise: Math.round((eligibleSubtotal * percent) / 100),
    qty,
  };
}
