import Link from "next/link";
import type { Product } from "@/lib/data";
import Photo from "@/components/Photo";
import Reveal from "@/components/Reveal";

/**
 * Full-bleed signature panels.
 *
 * One edge-to-edge frame per fragrance, stacked vertically, each carrying the
 * name, a short character line and a single text link. The homepage previously
 * went straight from the hero into a card grid, which reads as a catalogue;
 * this gives each composition a screen of its own before any pricing appears.
 *
 * Server component - it is static content with no interaction of its own, so
 * none of this needs to reach the client bundle.
 */

/**
 * Art-directed panel frames per signature.
 *
 * The galleries are all 4:5 portraits, and picking one by index landed on
 * frames where the bottle sits low — fine in a portrait phone panel, but the
 * wide desktop panel cropped straight through it and left only the model.
 * `hero` is the frame where the bottle carries the composition on its own;
 * `inset` is the second frame, shown only on desktop, where the copy column
 * would otherwise leave a large empty field.
 */
const PANEL_FRAMES: Record<string, { hero: string; inset: string }> = {
  billionaire: {
    hero: "/gallery/billionaire/04.webp",
    inset: "/gallery/billionaire/02.webp",
  },
  coldwar: {
    hero: "/gallery/coldwar/02.webp",
    inset: "/gallery/coldwar/05.webp",
  },
  heavenly: {
    hero: "/gallery/heavenly/05.webp",
    inset: "/gallery/heavenly/03.webp",
  },
  "old-love": {
    hero: "/gallery/old-love/05.webp",
    inset: "/gallery/old-love/02.webp",
  },
};

/**
 * Campaign line and wearing occasion per signature.
 *
 * Taken from the brand blueprint's copy direction and its "when should I wear
 * this?" table (the five-star uses). The catalogue's own `story` field has
 * since been rewritten into a scent description, so it no longer carries these
 * lines; anything not listed here falls back to that field.
 */
const PANEL_COPY: Record<string, { line: string; bestFor: string }> = {
  billionaire: {
    line: "Power without explanation.",
    bestFor: "After dark · Events",
  },
  coldwar: {
    line: "Freshness with an edge.",
    bestFor: "Daylight · Office",
  },
  heavenly: {
    line: "Soft enough to draw someone closer.",
    bestFor: "Dates · Close quarters",
  },
  "old-love": {
    line: "A memory you never completely forgot.",
    bestFor: "Dates · After dark",
  },
};

export default function SignaturePanels({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <section className="signature-panels" aria-label="The signature collection">
      {products.map((product, index) => {
        // The mood field is already written as a short character phrase
        // ("Cool and focused"), so it renders as a spaced set of traits
        // without needing separate copy.
        const character = product.mood
          .split(/,| and /)
          .map((part) => part.trim())
          .filter(Boolean);
        // Skip the packshot and detail frames: the gallery images are the
        // lifestyle photography and carry a full-bleed panel far better.
        const frames = PANEL_FRAMES[product.slug];
        const panelImage = frames?.hero ?? product.images[2] ?? product.image;
        const insetImage = frames?.inset ?? product.images[4];
        const copy = PANEL_COPY[product.slug];

        return (
          <article
            key={product.id}
            className="signature-panel"
            // Alternates which side the photograph sits on from 901px up, so
            // four stacked panels read as a spread instead of a slideshow.
            data-side={index % 2 === 0 ? "right" : "left"}
          >
            <div className="signature-panel-media">
              <Photo
                src={panelImage}
                alt={`${product.name} — ${product.profile} ${product.concentration} by Amidaddy Perfumes`}
                fill
                sizes="(max-width: 900px) 100vw, 46vw"
                loading={index === 0 ? undefined : "lazy"}
                priority={index === 0}
                fadeIn={false}
                className="object-cover"
              />
              <div className="signature-panel-scrim" />
            </div>
            <Reveal className="signature-panel-copy" delay={0.05}>
              <p className="signature-panel-story">
                &ldquo;{copy?.line ?? product.story}&rdquo;
              </p>
              <h2>{product.name}</h2>
              <p className="signature-panel-character">
                {character.join(" · ")}
              </p>
              {/* Family, notes and longevity come from the live catalogue, so
                  they cannot drift from the product page. */}
              <dl className="signature-panel-facts">
                <div>
                  <dt>Family</dt>
                  <dd>{product.profile}</dd>
                </div>
                <div>
                  <dt>Notes</dt>
                  <dd>{product.notes}</dd>
                </div>
                <div>
                  <dt>Wears</dt>
                  <dd>{product.longevity}</dd>
                </div>
                {copy && (
                  <div>
                    <dt>Best for</dt>
                    <dd>{copy.bestFor}</dd>
                  </div>
                )}
              </dl>
              <Link href={`/products/${product.slug}`}>
                Explore {product.name}
              </Link>
            </Reveal>
            {insetImage && (
              <div className="signature-panel-inset" aria-hidden="true">
                <Photo
                  src={insetImage}
                  alt=""
                  fill
                  sizes="20vw"
                  loading="lazy"
                  fadeIn={false}
                  className="object-cover"
                />
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
}
