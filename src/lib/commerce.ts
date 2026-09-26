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
 * Build-your-own combo pricing.
 *
 * 100ml bottles sell in fixed-price bundles: 1 for Rs 1,199, 2 for Rs 1,699,
 * 3 for Rs 2,299, 4 for Rs 2,899. Bigger baskets are packed into the cheapest
 * mix of those bundles (5 = 3+2, 6 = 4+2, 8 = 4+4, ...), so adding a bottle
 * never costs more per bottle than the tier below. Only SINGLE 100ml bottles count: 20ml
 * decants and the pre-made combo pack neither earn nor dilute a bundle. The
 * 4 x 100ml pack is stored with size "100ml", so the size alone is not enough;
 * without the packSize check two packs would price as "2 for Rs 1,699".
 *
 * Combo lines are closed to ordinary coupons; see couponBasePaise.
 *
 * Kept here rather than in the cart context because the server reprices every
 * order from the database and must reach the same number; a discount computed
 * only on the client would be trivially forged.
 */
export const COMBO_SIZE = "100ml";
/** The single-bottle price the bundle prices (and their "% off") are set against. */
export const COMBO_LIST_PAISE = 119_900;

/** Nearest whole percent: the 4-bottle tier is 39.55%, advertised as 40%. */
const percentOff = (fullPaise: number, paidPaise: number) =>
  fullPaise > 0 ? Math.round(((fullPaise - paidPaise) * 100) / fullPaise) : 0;

/** Highest tier first. */
export const COMBO_TIERS = [
  { minQty: 4, totalPaise: 289_900 },
  { minQty: 3, totalPaise: 229_900 },
  { minQty: 2, totalPaise: 169_900 },
].map((tier) => ({
  ...tier,
  percent: percentOff(COMBO_LIST_PAISE * tier.minQty, tier.totalPaise),
}));

/** Cheapest price for `qty` bottles, packing them into bundles. */
export function comboBundlePaise(qty: number, singlePaise = COMBO_LIST_PAISE) {
  const best = [0];
  for (let n = 1; n <= qty; n += 1) {
    best[n] = best[n - 1] + singlePaise;
    for (const tier of COMBO_TIERS)
      if (n >= tier.minQty)
        best[n] = Math.min(best[n], best[n - tier.minQty] + tier.totalPaise);
  }
  return best[qty] ?? 0;
}

/** The next bundle up, for prompting ("add 1 more: 3 for Rs 2,299"). Null at the top. */
export function nextComboTier(qty: number) {
  const better = [...COMBO_TIERS].reverse().find((tier) => tier.minQty > qty);
  return better ? { ...better, addQty: better.minQty - qty } : null;
}

/**
 * Discount in paise for a set of cart lines. Counts total 100ml QUANTITY, so
 * two of the same bottle earn the bundle just as two different ones do.
 */
type ComboLine = {
  size: string;
  packSize: number;
  qty: number;
  unitPricePaise: number;
};

const isBundleBottle = (line: ComboLine) =>
  line.size === COMBO_SIZE && line.packSize === 1;

export function comboDiscountPaise(
  // packSize is required on purpose: every caller must say whether a line is a
  // single bottle, so a new call site cannot silently let a multi-pack in.
  lines: ComboLine[],
) {
  const eligible = lines.filter(isBundleBottle);
  const qty = eligible.reduce((sum, line) => sum + line.qty, 0);
  const eligibleSubtotal = eligible.reduce(
    (sum, line) => sum + line.unitPricePaise * line.qty,
    0,
  );
  if (qty < 2) return { percent: 0, discountPaise: 0, qty };
  // ponytail: singles inside a bundle are costed at the average 100ml price;
  // exact while every 100ml sells at one price, per-line if that ever changes.
  const bundled = comboBundlePaise(qty, Math.round(eligibleSubtotal / qty));
  const discountPaise = Math.max(0, eligibleSubtotal - bundled);
  return {
    percent: percentOff(eligibleSubtotal, eligibleSubtotal - discountPaise),
    discountPaise,
    qty,
  };
}

/**
 * What a coupon may discount. Combo pricing is the offer, so ordinary coupons
 * skip every combo line: 100ml singles once they form a bundle (2+) and the
 * pre-made 100ml multi-packs. A "special" coupon (coupons.applies_to_combos)
 * covers the whole order, but against the bundle price, not the list price.
 * A 0 result means the coupon has nothing it may apply to.
 */
export function couponBasePaise(lines: ComboLine[], specialCoupon: boolean) {
  const subtotal = lines.reduce(
    (sum, line) => sum + line.unitPricePaise * line.qty,
    0,
  );
  const combo = comboDiscountPaise(lines);
  if (specialCoupon) return subtotal - combo.discountPaise;
  const locked = lines
    .filter(
      (line) =>
        (isBundleBottle(line) && combo.qty >= 2) ||
        (line.size === COMBO_SIZE && line.packSize > 1),
    )
    .reduce((sum, line) => sum + line.unitPricePaise * line.qty, 0);
  return subtotal - locked;
}
