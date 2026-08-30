import assert from "node:assert/strict";
import test from "node:test";
import { PRODUCTS } from "../src/lib/data.ts";

test("signature products keep 20 ml photography separate", () => {
  const signatures = PRODUCTS.filter(
    (product) => product.collection === "unisex",
  );
  assert.equal(signatures.length, 4);
  for (const product of signatures) {
    const twentyMlImages = product.variantImages?.["20ml"] ?? [];
    assert.ok(twentyMlImages.length > 0);
    assert.ok(twentyMlImages.every((image) => image.includes("/20ml/")));
    assert.ok(twentyMlImages.every((image) => !product.images.includes(image)));
  }
});

test("20 ml and 100 ml combos have separate products and galleries", () => {
  const combos = PRODUCTS.filter((product) => product.collection === "combos");
  assert.equal(combos.length, 2);

  const twentyMl = combos.find((product) => product.slug.endsWith("20ml"));
  const hundredMl = combos.find((product) => product.slug.endsWith("100ml"));
  assert.ok(twentyMl);
  assert.ok(hundredMl);
  assert.equal(twentyMl.packSize, 4);
  assert.equal(hundredMl.packSize, 4);
  assert.deepEqual(
    twentyMl.variants.map((variant) => variant.name),
    ["20ml"],
  );
  assert.deepEqual(
    hundredMl.variants.map((variant) => variant.name),
    ["100ml"],
  );
  assert.ok(twentyMl.images.every((image) => image.includes("/combos/20ml/")));
  assert.equal(twentyMl.images.length, 9);
  assert.ok(
    hundredMl.images.every((image) => image.includes("/combos/100ml/")),
  );
  assert.equal(
    twentyMl.images.some((image) => hundredMl.images.includes(image)),
    false,
  );
});

test("signature fragrance notes match the approved note chart", () => {
  const bySlug = Object.fromEntries(
    PRODUCTS.filter((product) => product.collection === "unisex").map(
      (product) => [product.slug, product],
    ),
  );

  assert.deepEqual(bySlug["old-love"].topNotes, [
    "Saffron",
    "Mango",
    "Jasmine",
  ]);
  assert.deepEqual(bySlug["old-love"].heartNotes, [
    "Amber",
    "Sugar",
    "Ambergris",
  ]);
  assert.deepEqual(bySlug["old-love"].baseNotes, [
    "Fir resin",
    "Ambroxan",
    "Cedarwood",
    "Oakmoss",
  ]);
  assert.deepEqual(bySlug.coldwar.topNotes, [
    "Plum",
    "Bergamot",
    "Mandarin orange",
  ]);
  assert.deepEqual(bySlug.coldwar.heartNotes, [
    "Plum",
    "Juniper",
    "Thyme",
    "Tarragon",
  ]);
  assert.deepEqual(bySlug.coldwar.baseNotes, [
    "Oakmoss",
    "Cedar",
    "Sandalwood",
  ]);
  assert.deepEqual(bySlug.heavenly.topNotes, [
    "Madagascar vanilla orchid",
    "Jasmine",
  ]);
  assert.deepEqual(bySlug.heavenly.heartNotes, [
    "Brazilian tonka bean",
    "Vanilla",
    "Vanilla absolute",
  ]);
  assert.deepEqual(bySlug.heavenly.baseNotes, [
    "Brown sugar",
    "Tonka bean absolute",
    "Vanilla orchid",
    "Amberwood",
    "Musk",
    "Patchouli",
  ]);
  assert.deepEqual(bySlug.billionaire.topNotes, ["Whiskey"]);
  assert.deepEqual(bySlug.billionaire.heartNotes, [
    "Spicy notes",
    "Cinnamon",
    "Coriander",
  ]);
  assert.deepEqual(bySlug.billionaire.baseNotes, [
    "Tobacco",
    "Agarwood (oud)",
    "Incense",
    "Sandalwood",
    "Patchouli",
    "Benzoin",
    "Vanilla",
    "Cedar",
  ]);
});
