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

export interface Product {
  id: string;
  slug: string;
  name: string;
  image: string;
  images: string[];
  variantImages?: Partial<Record<ProductVariant["name"], string[]>>;
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
 * Studio photography lives flat in /ref, named `<slug>-<frame>.webp`. Each
 * fragrance keeps its own frame list rather than a padded index range, because
 * the frames are the photographer's numbering, not a sequence we control.
 */
const REF_FRAMES: Record<string, number[]> = {
  billionaire: [3987, 3994, 4004, 4014, 4023, 4038, 4055],
  coldwar: [3487, 3527, 3536, 3545, 3577],
  heavenly: [3620, 3682, 3695, 3705, 3763],
  "old-love": [3804, 3810, 3903, 3926, 3956, 3958, 4096],
};

/** File prefix in /ref, which spells Cold War with a hyphen. */
const refSlug = (slug: string) => (slug === "coldwar" ? "cold-war" : slug);

const galleryImages = (slug: string) =>
  (REF_FRAMES[slug] ?? []).map(
    (frame) => `/ref/${refSlug(slug)}-${frame}.webp`,
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
    image: "/ref/billionaire-100ml-mobile.webp",
    images: [
      "/ref/billionaire-100ml-mobile.webp",
      "/ref/billionaire-100ml-desktop.webp",
      ...galleryImages("billionaire"),
    ],
    variantImages: {
      "100ml": ["/ref/billionaire-100ml-mobile.webp"],
      "20ml": [
        "/ref/billionaire-20ml.webp",
        "/ref/billionaire-20ml-desktop.webp",
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
    image: "/ref/cold-war-100ml-mobile.webp",
    images: ["/ref/cold-war-100ml-mobile.webp", ...galleryImages("coldwar")],
    variantImages: {
      "100ml": ["/ref/cold-war-100ml-mobile.webp"],
      "20ml": ["/ref/cold-war-20ml.webp"],
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
    image: "/ref/heavenly-100ml-mobile.webp",
    images: [
      "/ref/heavenly-100ml-mobile.webp",
      "/ref/heavenly-100ml-desktop.webp",
      "/ref/heavenly-both-sizes-desktop.webp",
      ...galleryImages("heavenly"),
    ],
    variantImages: {
      "100ml": ["/ref/heavenly-100ml-mobile.webp"],
      "20ml": [
        "/ref/heavenly-20ml.webp",
        "/ref/heavenly-20ml-mobile.webp",
        "/ref/heavenly-20ml-desktop.webp",
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
    image: "/ref/old-love-100ml.webp",
    images: ["/ref/old-love-100ml.webp", ...galleryImages("old-love")],
    variantImages: {
      "100ml": ["/ref/old-love-100ml.webp"],
      "20ml": ["/ref/old-love-20ml.webp"],
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
    image: "/products/combos/20ml-combo-of-4.jpg",
    images: [
      "/products/combos/20ml-combo-of-4.jpg",
      "/ref/heavenly-20ml.webp",
      "/ref/old-love-20ml.webp",
      "/ref/billionaire-20ml.webp",
      "/ref/cold-war-20ml.webp",
      "/ref/heavenly-20ml-desktop.webp",
    ],
    variantImages: {
      "20ml": [
        "/products/combos/20ml-combo-of-4.jpg",
        "/ref/heavenly-20ml.webp",
        "/ref/old-love-20ml.webp",
        "/ref/billionaire-20ml.webp",
        "/ref/cold-war-20ml.webp",
      ],
    },
    profile: "Mixed",
    concentration: "Eau de Parfum",
    genderPositioning: "Unisex",
    topNotes: ["Four signature openings"],
    heartNotes: ["Floral, fresh, woody and amber"],
    baseNotes: ["The complete Amidaddy wardrobe"],
    notes: "Cold War · Heavenly · Old Love · Billionaire",
    longevity: "6–10 hours",
    mood: "Discover every signature",
    occasion: "Discovery, travel and gifting",
    description:
      "All four Amidaddy fragrances together in travel-ready 20 ml bottles.",
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
    image: "/ref/collection-4x100ml-mobile.webp",
    images: [
      "/ref/collection-4x100ml-mobile.webp",
      "/ref/collection-4x100ml-desktop.webp",
      "/ref/old-love-100ml.webp",
      "/ref/heavenly-100ml-mobile.webp",
      "/ref/billionaire-100ml-mobile.webp",
      "/ref/cold-war-100ml-mobile.webp",
    ],
    variantImages: {
      "100ml": [
        "/ref/collection-4x100ml-mobile.webp",
        "/ref/collection-4x100ml-desktop.webp",
      ],
    },
    profile: "Mixed",
    concentration: "Eau de Parfum",
    genderPositioning: "Unisex",
    topNotes: ["Four signature openings"],
    heartNotes: ["Floral, fresh, woody and amber"],
    baseNotes: ["The complete Amidaddy wardrobe"],
    notes: "Cold War · Heavenly · Old Love · Billionaire",
    longevity: "6–10 hours",
    mood: "The complete collection",
    occasion: "Daily rotation and gifting",
    description:
      "The complete Amidaddy collection with all four fragrances in 100 ml bottles.",
    story:
      "Four full-size signatures composed for every side of your presence.",
    badge: "Combo",
    isNew: true,
    featured: true,
    active: true,
    variants: singleVariant("combo-100", "100ml", 429_900, 599_600, 12),
    price: 4299,
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
