import type { Product, ProductMedia, ProductVariant } from "@/lib/data";

/** The image a shopper sees on a catalogue card for the selected size.
 * A photo saved into this size's own gallery is the most specific answer, so it
 * wins. The replaced catalogue cover only stands in for sizes with no photos of
 * their own - otherwise a 100 ml cover would front the 20 ml card. */
export const catalogCardImage = (
  product: Product,
  size: ProductVariant["name"],
) =>
  product.variantImages?.[size]?.[0] ?? product.catalogImage ?? product.image;

/**
 * The photos a product page shows for the selected size - and only those.
 *
 * A size with its own gallery gets exactly that gallery. Falling back to
 * `product.images` is what put 100 ml bottles under the 20ml tab: that list is
 * the whole shoot and is dominated by 100 ml frames. The shared gallery is only
 * reached when the size has no photos of its own, and even then the replaced
 * cover leads, because a shopper choosing a size must never be shown another
 * size's bottle.
 */
export const productGalleryImages = (
  product: Product,
  size: ProductVariant["name"],
) => {
  if (product.variantImages?.[size]?.length)
    return product.variantImages[size]!;
  return product.catalogImage
    ? [
        product.catalogImage,
        ...product.images.filter((url) => url !== product.catalogImage),
      ]
    : product.images;
};

/**
 * A product's photos are one flat list, because `position` is a single sequence
 * per product row. Each gallery ("all sizes", 20 ml, 100 ml) is a filtered view
 * of that list, so reordering within a gallery must move photos between the
 * slots that gallery already occupies and leave every other slot alone.
 */
export type Gallery = "20ml" | "100ml" | null;

/** The positions in the flat list that belong to one gallery, in order. */
export const galleryIndices = (photos: ProductMedia[], gallery: Gallery) =>
  photos
    .map((photo, index) => ({ photo, index }))
    .filter((entry) => (entry.photo.variantName ?? null) === gallery)
    .map((entry) => entry.index);

/** Swap a photo with its neighbour inside its own gallery. */
export function movePhoto(
  photos: ProductMedia[],
  gallery: Gallery,
  position: number,
  delta: number,
): ProductMedia[] {
  const indices = galleryIndices(photos, gallery);
  const target = position + delta;
  if (target < 0 || target >= indices.length) return photos;
  const next = [...photos];
  const a = indices[position];
  const b = indices[target];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

/** Promote a photo to the front of its gallery - the one shoppers see first. */
export function makeFirstPhoto(
  photos: ProductMedia[],
  gallery: Gallery,
  position: number,
): ProductMedia[] {
  const indices = galleryIndices(photos, gallery);
  if (position <= 0 || position >= indices.length) return photos;
  const next = [...photos];
  const [moved] = next.splice(indices[position], 1);
  next.splice(indices[0], 0, moved);
  return next;
}
