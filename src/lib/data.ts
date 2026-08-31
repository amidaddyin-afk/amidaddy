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

const galleryImages = (slug: string, count: number) =>
  Array.from(
    { length: count },
    (_, index) => `/gallery/${slug}/${String(index + 1).padStart(2, "0")}.webp`,
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

export const PRODUCTS: Product[] = [
  {
    id: "billionaire",
    slug: "billionaire",
    name: "Billionaire",
    image: "/curated/billionaire.JPG",
    images: [
      "/curated/billionaire.JPG",
      "/curated/products/billionaire/detail.JPG",
      ...galleryImages("billionaire", 11),
    ],
    variantImages: {
      "20ml": ["/products/20ml/studio/billionaire.webp"],
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
    image: "/curated/cold-war.JPG",
    images: [
      "/curated/cold-war.JPG",
      "/curated/products/coldwar/detail.JPG",
      ...galleryImages("coldwar", 10),
    ],
    variantImages: {
      "20ml": ["/products/20ml/studio/cold-war.webp"],
    },
    profile: "Fresh",
    concentration: "Eau de Parfum",
    genderPositioning: "Unisex",
    topNotes: ["Plum", "Bergamot", "Mandarin orange"],
    heartNotes: ["Plum", "Juniper", "Thyme", "Tarragon"],
    baseNotes: ["Oakmoss", "Cedar", "Sandalwood"],
    notes: "Plum · Juniper · Oakmoss",
    longevity: "6–8 hours",
    mood: "Cold, clean and controlled",
    occasion: "Day and office",
    description:
      "Icy freshness and clean musk with a precise, energetic finish.",
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
    image: "/curated/heavenly.JPG",
    images: [
      "/curated/heavenly.JPG",
      "/curated/products/heavenly/detail.JPG",
      ...galleryImages("heavenly", 13),
    ],
    variantImages: {
      "20ml": ["/products/20ml/studio/heavenly.webp"],
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
    image: "/curated/products/old-love/detail.JPG",
    images: [
      "/curated/products/old-love/detail.JPG",
      ...galleryImages("old-love", 14),
    ],
    variantImages: {
      "20ml": ["/products/20ml/studio/old-love.webp"],
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
    description:
      "Warm vanilla, saffron and resin composed with nostalgic depth.",
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
    image: "/products/combos/20ml/01.webp",
    images: [
      "/products/combos/20ml/01.webp",
      "/products/combos/20ml/02.webp",
      "/products/combos/20ml/03.webp",
      "/products/combos/20ml/04.webp",
      "/products/combos/20ml/05.webp",
      "/products/combos/20ml/06.webp",
      "/products/combos/20ml/07.webp",
      "/products/combos/20ml/08.webp",
      "/products/combos/20ml/09.webp",
    ],
    variantImages: {
      "20ml": [
        "/products/combos/20ml/01.webp",
        "/products/combos/20ml/02.webp",
        "/products/combos/20ml/03.webp",
        "/products/combos/20ml/04.webp",
        "/products/combos/20ml/05.webp",
        "/products/combos/20ml/06.webp",
        "/products/combos/20ml/07.webp",
        "/products/combos/20ml/08.webp",
        "/products/combos/20ml/09.webp",
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
    image: "/products/combos/100ml/01.webp",
    images: [
      "/products/combos/100ml/01.webp",
      "/products/combos/100ml/02.webp",
      "/products/combos/100ml/03.webp",
      "/products/combos/100ml/04.webp",
    ],
    variantImages: {
      "100ml": [
        "/products/combos/100ml/01.webp",
        "/products/combos/100ml/02.webp",
        "/products/combos/100ml/03.webp",
        "/products/combos/100ml/04.webp",
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

export const TESTIMONIALS: never[] = [];
