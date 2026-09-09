import assert from "node:assert/strict";
import test from "node:test";
import { toItem } from "../src/lib/analytics.ts";

const combo = {
  slug: "signature-combo-20ml",
  name: "Signature Discovery Combo",
  collection: "combos",
  variants: [{ name: "20ml", pricePaise: 69_900 }],
};

const single = {
  slug: "billionaire",
  name: "Billionaire",
  collection: "unisex",
  variants: [
    { name: "20ml", pricePaise: 19_900 },
    { name: "100ml", pricePaise: 119_900 },
  ],
};

test("toItem converts paise to rupees and picks the chosen variant", () => {
  assert.deepEqual(toItem(combo, "20ml"), {
    item_id: "signature-combo-20ml",
    item_name: "Signature Discovery Combo",
    item_variant: "20ml",
    item_category: "combos",
    price: 699,
    quantity: 1,
  });
  assert.equal(toItem(single, "100ml").price, 1199);
  assert.equal(toItem(single, "100ml", 2).quantity, 2);
});

test("toItem falls back to the first variant when size is unknown", () => {
  assert.equal(toItem(single, undefined).item_variant, "20ml");
  assert.equal(toItem(single, "50ml").price, 199);
});
