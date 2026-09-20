import assert from "node:assert/strict";
import test from "node:test";
import {
  comboDiscountPaise,
  comboPercentFor,
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
  qty,
  unitPricePaise,
});

test("combo tiers start at two bottles and cap at twenty percent", () => {
  assert.equal(comboPercentFor(1), 0);
  assert.equal(comboPercentFor(2), 10);
  assert.equal(comboPercentFor(3), 15);
  assert.equal(comboPercentFor(4), 20);
  // Beyond the top tier the rate holds rather than climbing.
  assert.equal(comboPercentFor(9), 20);
});

test("only 100ml bottles count toward the combo tier", () => {
  // Two 20ml decants are not a combo, and earn nothing.
  const decants = comboDiscountPaise([bottle(2, "20ml", 19_900)]);
  assert.equal(decants.percent, 0);
  assert.equal(decants.discountPaise, 0);

  // A 20ml alongside two 100ml neither blocks the tier nor is discounted:
  // the saving is 10% of the 100ml lines only.
  const mixed = comboDiscountPaise([bottle(2), bottle(1, "20ml", 19_900)]);
  assert.equal(mixed.percent, 10);
  assert.equal(mixed.discountPaise, Math.round((2 * 119_900 * 10) / 100));
});

test("the same bottle twice earns the tier, like two different ones", () => {
  const twoOfOne = comboDiscountPaise([bottle(2)]);
  const oneEach = comboDiscountPaise([bottle(1), bottle(1)]);
  assert.equal(twoOfOne.percent, 10);
  assert.deepEqual(twoOfOne, oneEach);
});

test("a four-bottle set is priced off the selling price, not MRP", () => {
  // Four at Rs 1,199 is Rs 4,796; 20% off leaves Rs 3,836.80 -> 383_680 paise.
  const set = comboDiscountPaise([bottle(4)]);
  assert.equal(set.percent, 20);
  assert.equal(set.discountPaise, 95_920);
  assert.equal(4 * 119_900 - set.discountPaise, 383_680);
});

test("the next-tier prompt names how many more bottles are needed", () => {
  assert.deepEqual(nextComboTier(0), { minQty: 2, percent: 10, addQty: 2 });
  assert.deepEqual(nextComboTier(2), { minQty: 3, percent: 15, addQty: 1 });
  assert.deepEqual(nextComboTier(3), { minQty: 4, percent: 20, addQty: 1 });
  // Nothing left to unlock at the top tier.
  assert.equal(nextComboTier(4), null);
});
