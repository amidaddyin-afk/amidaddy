import { test } from "node:test";
import assert from "node:assert/strict";
import {
  publicAuthorName,
  reviewSchema,
} from "../src/features/reviews/schemas.ts";

const productId = "a1000000-0000-4000-8000-000000000020";

test("reviews show first name and last initial only", () => {
  assert.equal(publicAuthorName("Raghvendra Kumar Verma"), "Raghvendra V.");
  assert.equal(publicAuthorName("  Asha  "), "Asha");
  assert.equal(publicAuthorName(""), "Amidaddy customer");
  assert.equal(publicAuthorName(null), "Amidaddy customer");
});

test("review input is validated", () => {
  const ok = reviewSchema.parse({
    productId,
    rating: "5",
    title: "",
    body: "  Lasts all day on me.  ",
  });
  assert.equal(ok.rating, 5);
  assert.equal(ok.title, null);
  assert.equal(ok.body, "Lasts all day on me.");

  for (const bad of [
    { productId, rating: "0", body: "Long enough body" },
    { productId, rating: "6", body: "Long enough body" },
    { productId, rating: "4", body: "short" },
    { productId: "not-a-uuid", rating: "4", body: "Long enough body" },
    { productId, rating: "4", body: "x".repeat(2001) },
  ])
    assert.equal(reviewSchema.safeParse(bad).success, false);
});
