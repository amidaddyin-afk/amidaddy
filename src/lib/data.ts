export type FragranceFamily = "Woody" | "Floral" | "Fresh" | "Amber" | "Mixed";

export interface ProductVariant {
  id: string;
  name: "20ml" | "100ml";
  sku: string;
  pricePaise: number;
  mrpPaise: number;
  stock: number;
  reserved: number;
  lowStockAt: number;
  active: boolean;
}

export interface ProductMedia {
  url: string;
  alt: string;
  /** null means the photo shows in every size's gallery. */
  variantName: ProductVariant["name"] | null;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  image: string;
  /** Admin-selected image for catalogue cards, when one has been uploaded. */
  catalogImage?: string;
  images: string[];
  variantImages?: Partial<Record<ProductVariant["name"], string[]>>;
  /**
   * The admin-managed photo rows exactly as stored, in `position` order. Only
   * the admin portal reads this; storefront surfaces use `image`/`images`/
   * `variantImages`, which are derived from it. Empty for the hardcoded
   * catalog fallback, which has no database rows behind it.
   */
  mediaLibrary?: ProductMedia[];
  profile: FragranceFamily;
  concentration: string;
  genderPositioning: string;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  notes: string;
  longevity: string;
  mood: string;
  occasion: string;
  /** Overall strength, 1–5, shown as a star rating on the product page. */
  intensity?: number;
  description: string;
  story: string;
  badge?: string;
  isNew?: boolean;
  featured?: boolean;
  active: boolean;
  variants: ProductVariant[];
  /** Compatibility fields used by a few presentational components. */
  price: number;
  originalPrice?: number;
  stock: number;
  collection: "unisex" | "combos";
  packSize?: number;
}

const makeVariants = (
  slug: string,
  stock20: number,
  stock100: number,
): ProductVariant[] => [
  {
    id: `${slug}-20ml`,
    name: "20ml",
    sku: `AMI-${slug.toUpperCase()}-20`,
    pricePaise: 19_900,
    mrpPaise: 24_900,
    stock: stock20,
    reserved: 0,
    lowStockAt: 5,
    active: true,
  },
  {
    id: `${slug}-100ml`,
    name: "100ml",
    sku: `AMI-${slug.toUpperCase()}-100`,
    pricePaise: 119_900,
    mrpPaise: 149_900,
    stock: stock100,
    reserved: 0,
    lowStockAt: 5,
    active: true,
  },
];

/**
 * Campaign photography lives in public/fragrances/<slug>/campaign/, named by
 * the photographer's frame number. Each fragrance keeps its own frame list
 * rather than a padded index range, because the frames are the photographer's
 * numbering, not a sequence we control.
 */
const CAMPAIGN_FRAMES: Record<string, number[]> = {
  billionaire: [3987, 3994, 4004, 4014, 4023, 4038, 4055],
  coldwar: [3487, 3527, 3536, 3545, 3577],
  heavenly: [3620, 3682, 3695, 3705, 3763],
  "old-love": [3804, 3810, 3903, 3926, 3956, 3958, 4096],
};

const galleryImages = (slug: string) =>
  (CAMPAIGN_FRAMES[slug] ?? []).map(
    (frame) => `/fragrances/${slug}/campaign/${frame}.webp`,
  );

const singleVariant = (
  slug: string,
  name: ProductVariant["name"],
  pricePaise: number,
  mrpPaise: number,
  stock: number,
): ProductVariant[] => [
  {
    id: `${slug}-${name}`,
    name,
    sku: `AMI-${slug.toUpperCase()}-${name.replace("ml", "")}`,
    pricePaise,
    mrpPaise,
    stock,
    reserved: 0,
    lowStockAt: 3,
    active: true,
  },
];

/**
 * Single source of truth for the summary "notes" line.
 *
 * The homepage listing, the /shop listing and the /products/[slug] page must
 * always show identical notes for a product. Rather than let each surface hand
 * its own short string, every surface reads `product.notes`, and `product.notes`
 * is always the first note of each tier (top · heart · base) derived from the
 * authoritative note pyramid below. Change a note in one place, every surface
 * updates together.
 */
export function deriveNotes(
  topNotes: readonly string[],
  heartNotes: readonly string[],
  baseNotes: readonly string[],
): string {
  return [topNotes[0], heartNotes[0], baseNotes[0]]
    .filter((note): note is string => Boolean(note && note.trim()))
    .join(" · ");
}

const CATALOG: Product[] = [
  {
    id: "billionaire",
    slug: "billionaire",
    name: "Billionaire",
    image: "/fragrances/billionaire/100ml/bottle.webp",
    images: [
      "/fragrances/billionaire/100ml/bottle.webp",
      "/fragrances/billionaire/100ml/bottle-wide.webp",
      ...galleryImages("billionaire"),
    ],
    variantImages: {
      "100ml": ["/fragrances/billionaire/100ml/bottle.webp"],
      "20ml": [
        "/fragrances/billionaire/20ml/studio.webp",
        "/fragrances/billionaire/20ml/bottle.webp",
        "/fragrances/billionaire/20ml/bottle-wide.webp",
      ],
    },
    profile: "Woody",
    concentration: "Eau de Parfum",
    genderPositioning: "Unisex",
    topNotes: ["Whiskey"],
    heartNotes: ["Spicy notes", "Cinnamon", "Coriander"],
    baseNotes: [
      "Tobacco",
      "Agarwood (oud)",
      "Incense",
      "Sandalwood",
      "Patchouli",
      "Benzoin",
      "Vanilla",
      "Cedar",
    ],
    notes: "Whiskey · Spicy notes · Tobacco",
    longevity: "8–10 hours",
    mood: "Powerful, sophisticated and magnetic",
    occasion: "Night, dates, events and formal occasions",
    intensity: 4,
    description:
      "Polished cedarwood, amber and spice with a commanding warmth.",
    story: "Power without explanation.",
    badge: "Bestseller",
    featured: true,
    active: true,
    variants: makeVariants("billionaire", 40, 20),
    price: 1199,
    originalPrice: 1499,
    stock: 60,
    collection: "unisex",
  },
  {
    id: "coldwar",
    slug: "coldwar",
    name: "Cold War",
    image: "/fragrances/coldwar/100ml/bottle.webp",
    images: [
      "/fragrances/coldwar/100ml/bottle.webp",
      ...galleryImages("coldwar"),
    ],
    variantImages: {
      "100ml": ["/fragrances/coldwar/100ml/bottle.webp"],
      "20ml": [
        "/fragrances/coldwar/20ml/studio.webp",
        "/fragrances/coldwar/20ml/bottle.webp",
      ],
    },
    profile: "Fresh",
    concentration: "Eau de Parfum",
    genderPositioning: "Unisex",
    topNotes: ["Plum", "Bergamot", "Mandarin orange"],
    heartNotes: ["Pepper", "Juniper", "Thyme", "Tarragon"],
    baseNotes: ["Oakmoss", "Cedar", "Sandalwood"],
    notes: "Plum · Pepper · Oakmoss",
    longevity: "6–8 hours",
    mood: "Cold, clean and controlled",
    occasion: "Day and office",
    intensity: 3,
    description:
      "Cold plum and citrus over pepper and juniper, drying down to oakmoss and cedar. Clean, but not soft.",
    story: "Freshness with an edge.",
    isNew: true,
    featured: true,
    active: true,
    variants: makeVariants("coldwar", 40, 20),
    price: 1199,
    originalPrice: 1499,
    stock: 60,
    collection: "unisex",
  },
  {
    id: "heavenly",
    slug: "heavenly",
    name: "Heavenly",
    image: "/fragrances/heavenly/100ml/bottle.webp",
    images: [
      "/fragrances/heavenly/100ml/bottle.webp",
      "/fragrances/heavenly/100ml/bottle-wide.webp",
      "/fragrances/heavenly/both-sizes-wide.webp",
      ...galleryImages("heavenly"),
    ],
    variantImages: {
      "100ml": ["/fragrances/heavenly/100ml/bottle.webp"],
      "20ml": [
        "/fragrances/heavenly/20ml/studio.webp",
        "/fragrances/heavenly/20ml/bottle.webp",
        "/fragrances/heavenly/20ml/bottle-tall.webp",
        "/fragrances/heavenly/20ml/bottle-wide.webp",
      ],
    },
    profile: "Floral",
    concentration: "Eau de Parfum",
    genderPositioning: "Unisex",
    topNotes: ["Madagascar vanilla orchid", "Jasmine"],
    heartNotes: ["Brazilian tonka bean", "Vanilla", "Vanilla absolute"],
    baseNotes: [
      "Brown sugar",
      "Tonka bean absolute",
      "Vanilla orchid",
      "Amberwood",
      "Musk",
      "Patchouli",
    ],
    notes: "Vanilla orchid · Tonka bean · Brown sugar",
    longevity: "7–9 hours",
    mood: "Soft, intimate and ethereal",
    occasion: "Everyday and celebrations",
    intensity: 3,
    description:
      "A luminous floral musk that moves softly from day into evening.",
    story: "Soft enough to draw someone closer.",
    featured: true,
    active: true,
    variants: makeVariants("heavenly", 40, 20),
    price: 1199,
    originalPrice: 1499,
    stock: 60,
    collection: "unisex",
  },
  {
    id: "old-love",
    slug: "old-love",
    name: "Old Love",
    image: "/fragrances/old-love/100ml/bottle.webp",
    images: [
      "/fragrances/old-love/100ml/bottle.webp",
      ...galleryImages("old-love"),
    ],
    variantImages: {
      "100ml": ["/fragrances/old-love/100ml/bottle.webp"],
      "20ml": [
        "/fragrances/old-love/20ml/studio.webp",
        "/fragrances/old-love/20ml/bottle.webp",
      ],
    },
    profile: "Amber",
    concentration: "Eau de Parfum",
    genderPositioning: "Unisex",
    topNotes: ["Saffron", "Mango", "Jasmine"],
    heartNotes: ["Amber", "Sugar", "Ambergris"],
    baseNotes: ["Fir resin", "Ambroxan", "Cedarwood", "Oakmoss"],
    notes: "Saffron · Amber · Fir resin",
    longevity: "8–9 hours",
    mood: "Nostalgic, romantic and warm",
    occasion: "Date night and cool weather",
    intensity: 4,
    description:
      "Saffron and mango over amber and resin, with ambroxan and cedar in the base. Warm, nostalgic, a little dark.",
    story: "A memory you never completely forgot.",
    badge: "Limited",
    featured: true,
    active: true,
    variants: makeVariants("old-love", 40, 20),
    price: 1199,
    originalPrice: 1499,
    stock: 60,
    collection: "unisex",
  },
  {
    id: "combo-20ml",
    slug: "signature-combo-20ml",
    name: "Signature Discovery Combo",
    // The four-bottle pack shot leads: the set is what is being sold, so the
    // card should show all four rather than one bottle from it.
    image: "/combos/discovery-4x20ml/pack.webp",
    images: [
      "/combos/discovery-4x20ml/pack.webp",
      "/fragrances/heavenly/20ml/bottle.webp",
      "/fragrances/old-love/20ml/bottle.webp",
      "/fragrances/billionaire/20ml/bottle.webp",
      "/fragrances/coldwar/20ml/bottle.webp",
      "/fragrances/heavenly/20ml/bottle-wide.webp",
    ],
    variantImages: {
      "20ml": [
        "/combos/discovery-4x20ml/pack.webp",
        "/fragrances/heavenly/20ml/bottle.webp",
        "/fragrances/old-love/20ml/bottle.webp",
        "/fragrances/billionaire/20ml/bottle.webp",
        "/fragrances/coldwar/20ml/bottle.webp",
      ],
    },
    profile: "Mixed",
    concentration: "Eau de Parfum",
    genderPositioning: "Unisex",
    topNotes: ["Four signature openings"],
    heartNotes: ["Floral, fresh, woody and amber"],
    baseNotes: ["The complete Amidaddy™ wardrobe"],
    notes: "Cold War · Heavenly · Old Love · Billionaire",
    longevity: "6–10 hours",
    mood: "Discover every signature",
    occasion: "Discovery, travel and gifting",
    description:
      "All four Amidaddy™ fragrances together in travel-ready 20 ml bottles.",
    story:
      "A complete introduction to the house: four moods, four bottles, one considered set.",
    badge: "Combo",
    isNew: true,
    featured: true,
    active: true,
    variants: singleVariant("combo-20", "20ml", 69_900, 99_600, 20),
    price: 699,
    originalPrice: 996,
    stock: 20,
    collection: "combos",
    packSize: 4,
  },
  {
    id: "combo-100ml",
    slug: "signature-combo-100ml",
    name: "Signature Collection Combo",
    image: "/combos/collection-4x100ml/pack.webp",
    images: [
      "/combos/collection-4x100ml/pack.webp",
      "/combos/collection-4x100ml/pack-wide.webp",
      "/fragrances/old-love/100ml/bottle.webp",
      "/fragrances/heavenly/100ml/bottle.webp",
      "/fragrances/billionaire/100ml/bottle.webp",
      "/fragrances/coldwar/100ml/bottle.webp",
    ],
    variantImages: {
      "100ml": [
        "/combos/collection-4x100ml/pack.webp",
        "/combos/collection-4x100ml/pack-wide.webp",
      ],
    },
    profile: "Mixed",
    concentration: "Eau de Parfum",
    genderPositioning: "Unisex",
    topNotes: ["Four signature openings"],
    heartNotes: ["Floral, fresh, woody and amber"],
    baseNotes: ["The complete Amidaddy™ wardrobe"],
    notes: "Cold War · Heavenly · Old Love · Billionaire",
    longevity: "6–10 hours",
    mood: "The complete collection",
    occasion: "Daily rotation and gifting",
    description:
      "The complete Amidaddy™ collection with all four fragrances in 100 ml bottles.",
    story:
      "Four full-size signatures composed for every side of your presence.",
    badge: "Combo",
    isNew: true,
    featured: true,
    active: true,
    variants: singleVariant("combo-100", "100ml", 289_900, 599_600, 12),
    price: 2899,
    originalPrice: 5996,
    stock: 12,
    collection: "combos",
    packSize: 4,
  },
];

export const PRODUCTS: Product[] = CATALOG.map((product) =>
  product.collection === "unisex"
    ? {
        ...product,
        notes: deriveNotes(
          product.topNotes,
          product.heartNotes,
          product.baseNotes,
        ),
      }
    : product,
);

export const TESTIMONIALS: never[] = [];
