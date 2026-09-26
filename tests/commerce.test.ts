import assert from "node:assert/strict";
import test from "node:test";
import {
  comboDiscountPaise,
  comboBundlePaise,
  couponBasePaise,
  COMBO_TIERS,
  couponDiscountPaise,
  nextComboTier,
  isCustomerCancellationAllowed,
  isFulfillmentTransitionAllowed,
  refundablePaise,
  shippingPaise,
} from "../src/lib/commerce.ts";
import { includedGstPaise } from "../src/lib/money.ts";
import { isMatchingCapturedPayment } from "../src/lib/razorpay.ts";

test("shipping is charged below the pre-coupon subtotal threshold", () => {
  assert.equal(shippingPaise(59_899), 9_900);
  assert.equal(shippingPaise(59_900), 0);
});

test("a coupon discount cannot cost an order its free shipping", () => {
  // Pre-coupon subtotal clears the threshold; a coupon that drops the paid
  // merchandise total below it must not bring shipping back.
  const subtotalPaise = 60_000;
  assert.equal(shippingPaise(subtotalPaise), 0);
});

test("coupon calculations enforce maximum discount and subtotal", () => {
  assert.equal(couponDiscountPaise(100_000, "PERCENT", 20), 20_000);
  assert.equal(couponDiscountPaise(100_000, "PERCENT", 20, 15_000), 15_000);
  assert.equal(couponDiscountPaise(25_000, "FIXED", 40_000), 25_000);
});

test("GST is extracted from an inclusive price", () => {
  assert.equal(includedGstPaise(118_000, 18), 18_000);
});

test("customer cancellation closes when processing begins", () => {
  assert.equal(isCustomerCancellationAllowed("PAYMENT_PENDING"), true);
  assert.equal(isCustomerCancellationAllowed("CONFIRMED"), true);
  assert.equal(isCustomerCancellationAllowed("PROCESSING"), false);
});

test("fulfillment only moves forward through the supported timeline", () => {
  assert.equal(isFulfillmentTransitionAllowed("CONFIRMED", "PROCESSING"), true);
  assert.equal(isFulfillmentTransitionAllowed("PROCESSING", "SHIPPED"), true);
  assert.equal(isFulfillmentTransitionAllowed("SHIPPED", "DELIVERED"), true);
  assert.equal(isFulfillmentTransitionAllowed("CONFIRMED", "SHIPPED"), false);
});

test("remaining refundable amount cannot be negative", () => {
  assert.equal(refundablePaise(119_900, 20_000), 99_900);
  assert.equal(refundablePaise(119_900, 140_000), 0);
});

test("payment confirmation requires the exact order, amount, currency and captured state", () => {
  const payment = {
    orderId: "order_test",
    paymentId: "pay_test",
    amount: 119_900,
    currency: "INR",
    status: "captured",
  };
  assert.equal(isMatchingCapturedPayment(payment, "order_test", 119_900), true);
  assert.equal(
    isMatchingCapturedPayment({ ...payment, amount: 1 }, "order_test", 119_900),
    false,
  );
  assert.equal(
    isMatchingCapturedPayment(
      { ...payment, currency: "USD" },
      "order_test",
      119_900,
    ),
    false,
  );
  assert.equal(
    isMatchingCapturedPayment(
      { ...payment, status: "authorized" },
      "order_test",
      119_900,
    ),
    false,
  );
  assert.equal(
    isMatchingCapturedPayment(payment, "order_other", 119_900),
    false,
  );
});

const bottle = (qty: number, size = "100ml", unitPricePaise = 119_900) => ({
  size,
  packSize: 1,
  qty,
  unitPricePaise,
});

test("a pre-made 4 x 100ml pack never counts as a bundle bottle", () => {
  // Stored with size "100ml"; without the packSize check two packs
  // (Rs 8,598) would price as "2 for Rs 1,599".
  const pack = { size: "100ml", packSize: 4, qty: 2, unitPricePaise: 429_900 };
  assert.equal(comboDiscountPaise([pack]).discountPaise, 0);
  // Nor does a pack plus one single unlock the 2-bottle price.
  assert.equal(comboDiscountPaise([pack, bottle(1)]).discountPaise, 0);
});

test("bundles are 1199 / 1699 / 2299 / 2899, packed beyond that", () => {
  assert.equal(comboBundlePaise(1), 119_900);
  assert.equal(comboBundlePaise(2), 169_900);
  assert.equal(comboBundlePaise(3), 229_900);
  assert.equal(comboBundlePaise(4), 289_900);
  assert.equal(comboBundlePaise(5), 229_900 + 169_900);
  assert.equal(comboBundlePaise(6), 289_900 + 169_900);
  assert.equal(comboBundlePaise(8), 2 * 289_900);
  // Nearest whole percent: 29.15, 36.08, 39.55 -> 29, 36, 40.
  assert.deepEqual(
    COMBO_TIERS.map((tier) => tier.percent),
    [40, 36, 29],
  );
});

test("only 100ml bottles count toward the combo tier", () => {
  // Two 20ml decants are not a combo, and earn nothing.
  const decants = comboDiscountPaise([bottle(2, "20ml", 19_900)]);
  assert.equal(decants.percent, 0);
  assert.equal(decants.discountPaise, 0);

  // A 20ml alongside two 100ml neither blocks the tier nor is discounted:
  // the saving is 10% of the 100ml lines only.
  const mixed = comboDiscountPaise([bottle(2), bottle(1, "20ml", 19_900)]);
  assert.equal(mixed.discountPaise, 2 * 119_900 - 169_900);
});

test("the same bottle twice earns the tier, like two different ones", () => {
  const twoOfOne = comboDiscountPaise([bottle(2)]);
  const oneEach = comboDiscountPaise([bottle(1), bottle(1)]);
  assert.equal(twoOfOne.percent, 29);
  assert.deepEqual(twoOfOne, oneEach);
});

test("four bottles cost exactly Rs 2,899", () => {
  const set = comboDiscountPaise([bottle(4)]);
  assert.equal(4 * 119_900 - set.discountPaise, 289_900);
  assert.equal(set.percent, 40);
  // One bottle is full price.
  assert.equal(comboDiscountPaise([bottle(1)]).discountPaise, 0);
});

test("ordinary coupons skip combo lines; special ones see the bundle price", () => {
  const decant = bottle(1, "20ml", 19_900);
  const pack = { size: "100ml", packSize: 4, qty: 1, unitPricePaise: 289_900 };
  // A lone 100ml is not a combo: coupons apply as normal.
  assert.equal(couponBasePaise([bottle(1)], false), 119_900);
  // Two 100ml form a bundle: an ordinary coupon only sees the decant.
  assert.equal(couponBasePaise([bottle(2), decant], false), 19_900);
  // An all-combo cart leaves an ordinary coupon nothing to discount.
  assert.equal(couponBasePaise([bottle(3)], false), 0);
  assert.equal(couponBasePaise([pack], false), 0);
  // A special coupon applies to the bundle price, never the list price.
  assert.equal(couponBasePaise([bottle(4)], true), 289_900);
  assert.equal(couponBasePaise([bottle(2), decant], true), 169_900 + 19_900);
});

test("the next-tier prompt names how many more bottles are needed", () => {
  assert.equal(nextComboTier(0)?.addQty, 2);
  assert.equal(nextComboTier(1)?.totalPaise, 169_900);
  assert.equal(nextComboTier(2)?.totalPaise, 229_900);
  assert.equal(nextComboTier(3)?.addQty, 1);
  assert.equal(nextComboTier(3)?.totalPaise, 289_900);
  // Nothing left to unlock at the top tier.
  assert.equal(nextComboTier(4), null);
});
