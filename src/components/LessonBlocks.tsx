import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LessonBlock } from "@/lib/scent-school";
import { PRODUCTS } from "@/lib/data";
import Reveal from "@/components/Reveal";

/**
 * Renders one lesson body block.
 *
 * Chapters are data, not markup, so the same handful of teaching shapes -
 * prose, a timeline, a definition list, numbered steps, a diagram - are
 * declared in `scent-school.ts` and drawn here. Adding a chapter never means
 * writing layout again.
 */

// The four signatures, read from the shared catalogue so the lesson can never
// disagree with /shop or a product page.
const SIGNATURE_SLUGS = [
  "coldwar",
  "heavenly",
  "old-love",
  "billionaire",
] as const;
const MOODS: Record<string, string> = {
  coldwar: "Cold · Clean · Controlled",
  heavenly: "Soft · Intimate · Ethereal",
  "old-love": "Nostalgic · Romantic · Warm",
  billionaire: "Powerful · Sophisticated · Magnetic",
};

export default function LessonBlocks({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => (
        <Reveal key={index} className="lesson-block" index={index}>
          {renderBlock(block)}
        </Reveal>
      ))}
    </>
  );
}

function renderBlock(block: LessonBlock) {
  switch (block.kind) {
    case "prose":
      return (
        <div className="lesson-prose">
          {block.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      );

    case "timeline":
      return (
        <ol className="lesson-timeline">
          {block.items.map(([era, copy], index) => (
            <li key={era}>
              <span className="lesson-timeline-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{era}</h3>
              <p>{copy}</p>
            </li>
          ))}
        </ol>
      );

    case "terms":
      return (
        <dl className="lesson-terms">
          {block.items.map(([term, meaning]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{meaning}</dd>
            </div>
          ))}
        </dl>
      );

    case "steps":
      return (
        <ol className="lesson-steps">
          {block.items.map(([title, body], index) => (
            <li key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ol>
      );

    case "pyramid":
      return (
        <div className="lesson-pyramid">
          {(
            [
              [
                "Top",
                "First impression",
                "The first minutes, and the part that leaves",
              ],
              ["Heart", "Main character", "What the fragrance actually is"],
              ["Base", "Deep dry-down", "What is still there hours later"],
            ] as const
          ).map(([stage, label, copy]) => (
            <div key={stage} data-stage={stage.toLowerCase()}>
              <span>{stage}</span>
              <strong>{label}</strong>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      );

    case "deg":
      return (
        <figure className="lesson-deg">
          <div className="lesson-deg-visual" aria-hidden="true">
            <span>DEG</span>
            <i />
            <span>BHAPKA</span>
          </div>
          <figcaption>
            A simplified illustration of the deg-bhapka principle — the heated
            copper vessel, the connecting pipe and the receiver. Not an
            engineering diagram.
          </figcaption>
        </figure>
      );

    case "signatures":
      return (
        <div className="lesson-signatures">
          {SIGNATURE_SLUGS.map((slug) => {
            const product = PRODUCTS.find((item) => item.slug === slug);
            if (!product) return null;
            return (
              <Link key={slug} href={`/products/${slug}`}>
                <div className="lesson-signature-image">
                  <Image
                    src={product.image}
                    alt={`${product.name} — ${product.profile} Eau de Parfum by Amidaddy Perfumes`}
                    fill
                    sizes="(max-width: 760px) 100vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <small>
                  {product.profile} · {product.longevity}
                </small>
                <h3>{product.name}</h3>
                <p>{MOODS[slug]}</p>
                <span>
                  {product.notes} <ArrowRight size={14} />
                </span>
              </Link>
            );
          })}
        </div>
      );

    case "note":
      return (
        <aside className="lesson-note">
          <h3>{block.title}</h3>
          <p>{block.body}</p>
        </aside>
      );
  }
}
