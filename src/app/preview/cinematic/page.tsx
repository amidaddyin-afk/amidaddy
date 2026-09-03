import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Photo from "@/components/Photo";
import CinematicSequence, {
  type CinePanel,
} from "@/components/CinematicSequence";
import { listCatalogProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Cinematic preview",
  description: "A cinematic treatment of the Amidaddy Perfumes storefront.",
  robots: { index: false, follow: false },
};

/**
 * Cinematic preview - NOT linked from anywhere, not indexed.
 *
 * A film-title treatment of the home page: near-black, letterboxed, one
 * scent per screen on a scroll-pinned sequence. It reuses the live catalogue
 * and the same imagery as the storefront; nothing here changes the store.
 * Delete the `preview` folder to remove it.
 */

// Fixed dramatic order and the campaign line per signature. The lines are the
// ones already carried on the storefront hero, so the voice matches.
const SCRIPT: Record<string, { line: string; notes: string[]; frame: string }> =
  {
    "old-love": {
      line: "Stay unforgettable.",
      notes: ["Saffron", "Amber", "Resin"],
      frame: "/gallery/old-love/05.webp",
    },
    coldwar: {
      line: "Make your move.",
      notes: ["Bright fruit", "Herbs", "Woods"],
      frame: "/gallery/coldwar/02.webp",
    },
    heavenly: {
      line: "Leave a softer trace.",
      notes: ["White floral", "Vanilla", "Musk"],
      frame: "/gallery/heavenly/05.webp",
    },
    billionaire: {
      line: "Own the room.",
      notes: ["Whiskey", "Spice", "Dark woods"],
      frame: "/gallery/billionaire/04.webp",
    },
  };
const ORDER = ["old-love", "coldwar", "heavenly", "billionaire"];

export default async function CinematicPreviewPage() {
  const { products } = await listCatalogProducts({
    page: 1,
    pageSize: 24,
    sort: "newest",
    inStock: "true",
  });
  const bySlug = new Map(products.map((product) => [product.slug, product]));

  const panels: CinePanel[] = ORDER.filter((slug) => bySlug.has(slug)).map(
    (slug) => {
      const product = bySlug.get(slug)!;
      const script = SCRIPT[slug];
      return {
        slug,
        name: product.name,
        line: script.line,
        notes: script.notes,
        image: script.frame,
        alt: `${product.name}, ${product.profile} ${product.concentration}, photographed for Amidaddy Perfumes`,
      };
    },
  );

  return (
    <main className="cine-root">
      <div className="cine-stage">
        <span className="cine-bar cine-bar-top" aria-hidden="true" />

        {/* Title card */}
        <section className="cine-hero">
          <div className="cine-hero-media">
            <Photo
              src="/curated/hero-models.webp"
              alt="Amidaddy Perfumes campaign portrait"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div className="cine-hero-veil" />
          <p className="cine-wordmark">Amidaddy</p>
          <div className="cine-hero-copy">
            <h1 className="cine-hero-title">
              Presence,
              <br />
              before words.
            </h1>
            <p className="cine-hero-sub">
              Four unisex signatures, composed around mood, memory and presence.
            </p>
          </div>
        </section>

        <CinematicSequence panels={panels} />

        <span className="cine-bar cine-bar-bottom" aria-hidden="true" />
      </div>

      {/* End card */}
      <section className="cine-end">
        <p className="cine-end-line">Four signatures. One feeling.</p>
        <Link href="/shop" className="cine-end-cta">
          Shop the collection <ArrowUpRight size={17} />
        </Link>
      </section>
    </main>
  );
}
