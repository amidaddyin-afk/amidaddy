export type FragranceFamily = "Woody" | "Floral" | "Fresh" | "Amber";

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
  collection: "unisex";
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

export const PRODUCTS: Product[] = [
  {
    id: "billionaire",
    slug: "billionaire",
    name: "Billionaire Noir",
    image: "/curated/billionaire.JPG",
    images: [
      "/curated/billionaire.JPG",
      "/curated/products/billionaire/detail.JPG",
      ...galleryImages("billionaire", 11),
    ],
    profile: "Woody",
    concentration: "Eau de Parfum",
    genderPositioning: "Unisex",
    topNotes: ["Bergamot", "Black pepper"],
    heartNotes: ["Cedarwood", "Patchouli"],
    baseNotes: ["Amber", "Musk"],
    notes: "Bergamot · Cedarwood · Amber",
    longevity: "8–10 hours",
    mood: "Bold and magnetic",
    occasion: "Evening and occasions",
    description: "A commanding woody amber built for memorable entrances.",
    story: "A study in ambition, polished woods and warm amber.",
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
    profile: "Fresh",
    concentration: "Eau de Parfum",
    genderPositioning: "Unisex",
    topNotes: ["Mint", "Bergamot"],
    heartNotes: ["Pepper", "Lavender"],
    baseNotes: ["Clean musk", "Cedar"],
    notes: "Mint · Pepper · Clean musk",
    longevity: "6–8 hours",
    mood: "Cool and focused",
    occasion: "Day and office",
    description:
      "Icy freshness and clean musk with a precise, energetic finish.",
    story: "A bright collision of cool air, mineral spice and clean woods.",
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
    profile: "Floral",
    concentration: "Eau de Parfum",
    genderPositioning: "Unisex",
    topNotes: ["Pear", "Neroli"],
    heartNotes: ["White florals", "Iris"],
    baseNotes: ["Soft musk", "Sandalwood"],
    notes: "Pear · White florals · Soft musk",
    longevity: "7–9 hours",
    mood: "Soft and elegant",
    occasion: "Everyday and celebrations",
    description:
      "A luminous floral musk that moves softly from day into evening.",
    story: "Weightless florals settle into a graceful skin-like musk.",
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
    image: "/curated/old-love.JPG",
    images: [
      "/curated/old-love.JPG",
      "/curated/products/old-love/detail.JPG",
      ...galleryImages("old-love", 14),
    ],
    profile: "Amber",
    concentration: "Eau de Parfum",
    genderPositioning: "Unisex",
    topNotes: ["Saffron", "Pink pepper"],
    heartNotes: ["Rose", "Warm resin"],
    baseNotes: ["Vanilla", "Amber woods"],
    notes: "Saffron · Warm resin · Vanilla",
    longevity: "8–9 hours",
    mood: "Warm and intimate",
    occasion: "Date night and cool weather",
    description:
      "Warm vanilla, saffron and resin composed with nostalgic depth.",
    story: "A familiar warmth reimagined as amber light on skin.",
    badge: "Limited",
    featured: true,
    active: true,
    variants: makeVariants("old-love", 40, 20),
    price: 1199,
    originalPrice: 1499,
    stock: 60,
    collection: "unisex",
  },
];

export const TESTIMONIALS: never[] = [];
