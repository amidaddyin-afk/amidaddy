import assert from "node:assert/strict";
import test from "node:test";
import {
  couponDiscountPaise,
  isCustomerCancellationAllowed,
  isFulfillmentTransitionAllowed,
  refundablePaise,
  shippingPaise,
} from "../src/lib/commerce.ts";
import { includedGstPaise } from "../src/lib/money.ts";

test("shipping is charged below the post-discount threshold", () => {
  assert.equal(shippingPaise(199_899), 9_900);
  assert.equal(shippingPaise(199_900), 0);
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
