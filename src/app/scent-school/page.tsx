import type { Metadata } from "next";
import ScentSchoolExperience from "@/components/journey/ScentSchoolExperience";
import { PRODUCTS } from "@/lib/data";

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
 * Signature notes are read from the catalog rather than restated here, so the
 * page cannot drift from the approved note lists in src/lib/data.ts.
 */
export default function ScentSchoolPage() {
  const signatures = PRODUCTS.filter(
    (product) => product.collection === "unisex",
  ).map((product) => ({
    slug: product.slug,
    name: product.name,
    notes: product.notes,
    // The original, unretouched product photograph. Never regenerated,
    // recoloured or reframed - it is passed through to next/image as-is.
    image: product.image,
  }));

  return (
    <div data-surface="story">
      <ScentSchoolExperience signatures={signatures} />
    </div>
  );
}
