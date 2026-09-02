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
        const panelImage = product.images[2] ?? product.image;

        return (
          <article key={product.id} className="signature-panel">
            <div className="signature-panel-media">
              <Photo
                src={panelImage}
                alt={`${product.name} — ${product.profile} ${product.concentration} by Amidaddy Perfumes`}
                fill
                sizes="100vw"
                loading={index === 0 ? undefined : "lazy"}
                priority={index === 0}
                fadeIn={false}
                className="object-cover"
              />
              <div className="signature-panel-scrim" />
            </div>
            <Reveal className="signature-panel-copy" delay={0.05}>
              <h2>{product.name}</h2>
              <p className="signature-panel-character">
                {character.join(" · ")}
              </p>
              <Link href={`/products/${product.slug}`}>
                Explore {product.name}
              </Link>
            </Reveal>
          </article>
        );
      })}
    </section>
  );
}
