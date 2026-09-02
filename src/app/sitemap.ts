import type { MetadataRoute } from "next";
import { listCatalogProducts } from "@/lib/catalog";
import { policyLinks } from "@/lib/policies";
import { LESSONS_WITH_NUMBERS } from "@/lib/scent-school";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { products } = await listCatalogProducts({
    page: 1,
    pageSize: 48,
    sort: "newest",
  });
  return [
    "",
    "/shop",
    "/scent-school",
    ...LESSONS_WITH_NUMBERS.map((lesson) => `/scent-school/${lesson.slug}`),
    ...policyLinks.map(({ slug }) => `/policies/${slug}`),
    ...products.map((product) => `/products/${product.slug}`),
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
