import type { Metadata } from "next";
import ScentSchoolExperience from "@/components/journey/ScentSchoolExperience";
import { catalogCardImage } from "@/features/catalog/photo-order";
import { listCatalogProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Scent School",
  description:
    "From a note to a feeling: a journey through the art of fragrance, followed by an eight-chapter course.",
  alternates: { canonical: "/scent-school" },
};

export const revalidate = 300;

/**
 * Scent School hub.
 *
 * Opens with the story rather than a directory of reading assignments: seven
 * scroll-driven chapters carry a visitor from raw material to a finished
 * signature, and the written chapters sit underneath for the long version.
 * Every /scent-school/<slug> route is unchanged.
 *
 * Signatures are read from the live catalogue, so names, notes and photos
 * match the homepage grid.
 */
export default async function ScentSchoolPage() {
  // Same query and card photo as the homepage catalogue, so each bottle here
  // is exactly the one shown on the home grid (and follows admin changes).
  const { products } = await listCatalogProducts({
    page: 1,
    pageSize: 24,
    sort: "newest",
    inStock: "true",
  });
  const signatures = products
    .filter((product) => product.collection === "unisex")
    .map((product) => ({
      slug: product.slug,
      name: product.name,
      notes: product.notes,
      image: catalogCardImage(product, "100ml"),
    }));

  return (
    <div data-surface="story">
      <ScentSchoolExperience signatures={signatures} />
    </div>
  );
}
