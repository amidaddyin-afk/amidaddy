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

/** A replaced catalogue image also leads the product page for either size. */
export const productGalleryImages = (
  product: Product,
  size: ProductVariant["name"],
) => {
  // A size with its own gallery leads with its own first photo; the replaced
  // cover only leads for sizes falling back to the shared gallery.
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
