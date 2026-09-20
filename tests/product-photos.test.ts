import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  catalogCardImage,
  galleryIndices,
  makeFirstPhoto,
  movePhoto,
} from "../src/features/catalog/photo-order.ts";
import type { Product } from "../src/lib/data.ts";

const read = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const photo = (url: string, variantName: "20ml" | "100ml" | null) => ({
  url,
  alt: url,
  variantName,
});

/**
 * Admin-managed photos share one flat `position` sequence, so the danger is a
 * reorder in one gallery silently shuffling another. Every case below mixes the
 * three galleries and asserts the untouched ones keep their exact order.
 */
const mixed = () => [
  photo("shared-a", null),
  photo("small-a", "20ml"),
  photo("shared-b", null),
  photo("large-a", "100ml"),
  photo("small-b", "20ml"),
  photo("large-b", "100ml"),
];

const urls = (
  photos: ReturnType<typeof mixed>,
  gallery: "20ml" | "100ml" | null,
) => galleryIndices(photos, gallery).map((index) => photos[index].url);

test("catalogue image replaces the card photo for either bottle size", () => {
  const product = {
    image: "/default.webp",
    variantImages: {
      "20ml": ["/small.webp"],
      "100ml": ["/large.webp"],
    },
  } as Product;
  assert.equal(catalogCardImage(product, "20ml"), "/small.webp");
  assert.equal(catalogCardImage(product, "100ml"), "/large.webp");
  product.catalogImage = "/uploaded.webp";
  assert.equal(catalogCardImage(product, "20ml"), "/uploaded.webp");
  assert.equal(catalogCardImage(product, "100ml"), "/uploaded.webp");
});

test("each gallery reads only its own photos, in order", () => {
  const photos = mixed();
  assert.deepEqual(urls(photos, null), ["shared-a", "shared-b"]);
  assert.deepEqual(urls(photos, "20ml"), ["small-a", "small-b"]);
  assert.deepEqual(urls(photos, "100ml"), ["large-a", "large-b"]);
});

test("moving a photo leaves the other galleries untouched", () => {
  const next = movePhoto(mixed(), "20ml", 0, 1);
  assert.deepEqual(urls(next, "20ml"), ["small-b", "small-a"]);
  assert.deepEqual(urls(next, null), ["shared-a", "shared-b"]);
  assert.deepEqual(urls(next, "100ml"), ["large-a", "large-b"]);
});

test("a move past either end of a gallery changes nothing", () => {
  const photos = mixed();
  assert.deepEqual(movePhoto(photos, "100ml", 0, -1), photos);
  assert.deepEqual(movePhoto(photos, "100ml", 1, 1), photos);
});

test("promoting a photo makes it the one shoppers see first", () => {
  const next = makeFirstPhoto(mixed(), "100ml", 1);
  assert.deepEqual(urls(next, "100ml"), ["large-b", "large-a"]);
  assert.deepEqual(urls(next, null), ["shared-a", "shared-b"]);
  assert.deepEqual(urls(next, "20ml"), ["small-a", "small-b"]);
});

test("promoting the photo already shown first changes nothing", () => {
  const photos = mixed();
  assert.deepEqual(makeFirstPhoto(photos, "20ml", 0), photos);
});

/**
 * The storefront reads photos through `mapProduct`. If it stopped selecting
 * `variant_name`, or went back to letting the hardcoded catalog override the
 * database, every photo saved in the admin portal would be silently ignored.
 */
test("catalogue queries read the columns the photo editor writes", () => {
  const catalog = read("src/lib/catalog.ts");
  const selects = catalog.match(/product_images\([^)]*\)/g) ?? [];
  assert.ok(selects.length >= 3);
  for (const select of selects) {
    // A wildcard also works against older catalogues without variant_name;
    // mapProduct treats that missing field as a shared photo.
    if (select === "product_images(*)") continue;
    for (const column of ["url", "alt", "position", "variant_name"])
      assert.ok(select.includes(column), `${select} is missing ${column}`);
  }
});

test("saved photos win over the hardcoded catalogue fallback", () => {
  const catalog = read("src/lib/catalog.ts");
  const start = catalog.indexOf("const fallbackImages =");
  const end = catalog.indexOf("return [name,", start);
  assert.ok(start > -1 && end > start);
  const selection = catalog.slice(start, end);
  // `explicit` holds the database rows for this size. It must be tested before
  // the fallback, or admin uploads for that size never reach the storefront.
  assert.ok(
    selection.indexOf("explicit.length") <
      selection.indexOf("fallbackImages.length"),
    "the database rows must be preferred over the hardcoded images",
  );
});
