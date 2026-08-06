import { PRODUCTS, type Product } from "@/lib/data";

export const CURATED_PRODUCTS: Product[] = PRODUCTS.slice(0, 4).map((product) => ({
  ...product,
  price: 1199,
  originalPrice: undefined,
  image: `/curated/${product.id === "coldwar" ? "cold-war" : product.id}.JPG`,
}));

export const CURATED_GALLERIES: Record<string, string[]> = {
  billionaire: ["/curated/billionaire.JPG", "/curated/products/billionaire/detail.JPG"],
  coldwar: ["/curated/cold-war.JPG", "/curated/products/coldwar/detail.JPG"],
  heavenly: ["/curated/heavenly.JPG", "/curated/products/heavenly/detail.JPG"],
  "old-love": ["/curated/old-love.JPG", "/curated/products/old-love/detail.JPG"],
};

export function getCuratedProduct(slug: string) {
  return CURATED_PRODUCTS.find((product) => product.id === slug) ?? null;
}
