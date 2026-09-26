import type { Metadata } from "next";
import Link from "next/link";
import Photo from "@/components/Photo";
import Reveal from "@/components/Reveal";
import { listCatalogProducts, getCatalogProductBySlug } from "@/lib/catalog";
import { formatInr } from "@/lib/money";

export const metadata: Metadata = {
  title: "The Amidaddy Way",
  description:
    "We don't follow the mood. We set it. Why Amidaddy makes fragrance on its own terms, and how to find the signature that fits you.",
  alternates: { canonical: "/our-approach" },
};

/** Cached render rather than a Supabase read per visitor, matching /shop and
 *  the homepage. Admin edits clear it through revalidateStorefront(). */
export const revalidate = 300;

/**
 * Editorial order for the four signatures.
 *
 * Only the presentation lives here - copy lines that are a point of view, and
 * the accent colour sampled from each bottle's own glass. Everything factual
 * (name, scent family, notes, price, destination) is read from the catalog at
 * render time, so this never drifts from what the shop sells.
 */
const VOICE: Record<
  string,
  { line: string; accent: string; shot: string; alt: string }
> = {
  coldwar: {
    line: "Keep your cool.",
    accent: "#4ec3e0",
    shot: "/site/our-approach/20ml-coldwar.webp",
    alt: "The Cold War 20ml bottle, pale blue glass with a black cap",
  },
  heavenly: {
    line: "Make softness a statement.",
    accent: "#e8c98a",
    shot: "/site/our-approach/20ml-heavenly.webp",
    alt: "The Heavenly 20ml bottle, warm cream glass with a black cap",
  },
  "old-love": {
    line: "Leave a little mystery.",
    accent: "#c8102e",
    shot: "/site/our-approach/20ml-old-love.webp",
    alt: "The Old Love 20ml bottle, deep red glass with a black cap",
  },
  billionaire: {
    line: "Carry your confidence.",
    accent: "#8a8f98",
    shot: "/site/our-approach/20ml-billionaire.webp",
    alt: "The Billionaire 20ml bottle, black glass with a black cap",
  },
};

/** Reading order for section 4. Catalog order is sales-driven and would put
 *  the bestseller first; this is an editorial sequence, cool to warm. */
const ORDER = ["coldwar", "heavenly", "old-love", "billionaire"];

export default async function OurApproachPage() {
  const { products } = await listCatalogProducts({
    page: 1,
    pageSize: 48,
    collection: "unisex",
    inStock: "true",
    sort: "newest",
  });

  // Ordered, and filtered to what the catalog actually carries - if a product
  // is delisted it drops out of the page rather than 404ing from a hard-coded
  // link.
  const signatures = ORDER.map((slug) =>
    products.find((product) => product.slug === slug),
  ).filter((product): product is NonNullable<typeof product> =>
    Boolean(product && VOICE[product.slug]),
  );

  const discovery = await getCatalogProductBySlug("signature-combo-20ml");
  const discoveryPrice = discovery?.variants?.find(
    (variant) => variant.name === "20ml",
  )?.pricePaise;

  return (
    <main data-surface="story" className="approach-page">
      {/* 1. HERO */}
      <section className="ap-hero">
        <div className="ap-hero-inner">
          <div className="ap-hero-copy">
            <p className="ap-eyebrow">The Amidaddy Way</p>
            <h1>
              We don&rsquo;t follow the mood.
              <span>We set it.</span>
            </h1>
            <p className="ap-hero-lede">
              Fragrance is personal. It should say something about you.
              We&rsquo;re building Amidaddy for people who choose their own
              direction&mdash;and make their presence felt.
            </p>
            <div className="ap-hero-actions">
              <Link href="/shop" className="ap-cta">
                Find your signature
              </Link>
              <a href="#manifesto" className="ap-link">
                Read our manifesto
              </a>
            </div>
          </div>

          <div className="ap-hero-media">
            <picture>
              <source
                media="(min-width: 900px)"
                type="image/avif"
                srcSet="/site/our-approach/hero.avif"
              />
              <source
                media="(min-width: 900px)"
                type="image/webp"
                srcSet="/site/our-approach/hero.webp"
              />
              <source
                type="image/avif"
                srcSet="/site/our-approach/hero-mobile.avif"
              />
              <source
                type="image/webp"
                srcSet="/site/our-approach/hero-mobile.webp"
              />
              {/* Plain <img>, not next/image: the two art directions both carry
                  priority, so two next/image elements would preload both and
                  download the unused one. <source media> fetches exactly one.
                  width/height reserve the box so the hero contributes no CLS. */}
              <img
                src="/site/our-approach/hero.webp"
                alt="The four Amidaddy 100ml fragrances - Old Love, Heavenly, Billionaire and Cold War - photographed together"
                width={2200}
                height={1274}
                fetchPriority="high"
                decoding="async"
                className="ap-hero-img"
              />
            </picture>
          </div>
        </div>
      </section>

      {/* 2. MANIFESTO */}
      <section className="ap-manifesto" id="manifesto">
        <div className="ap-manifesto-inner">
          <div className="ap-manifesto-head">
            <p className="ap-eyebrow">Our manifesto</p>
            <h2>The next move is ours.</h2>
          </div>
          <div className="ap-manifesto-body">
            <p>
              We didn&rsquo;t start Amidaddy to blend into the fragrance aisle.
              We started it to bring our own point of view.
            </p>
            <p>
              Our ambition is to challenge what people expect from a fragrance
              brand: how it looks, how it speaks, and how it becomes part of
              everyday life.
            </p>
            <p>
              We want to make scents people choose for their character. Scents
              that become part of someone&rsquo;s style. Scents that feel
              personal before they ever become popular.
            </p>
            <p className="ap-manifesto-close">
              Set your own mood.
              <span>Leave your own impression.</span>
            </p>
          </div>
        </div>
      </section>

      {/* 3. THE PRODUCT */}
      <section className="ap-product">
        <div className="ap-product-inner">
          <Reveal className="ap-product-media" variant="clip">
            <Photo
              src="/site/our-approach/macro.webp"
              alt="Close detail of the Billionaire bottle: the black cap, the glass shoulder and the printed AD monogram"
              width={1200}
              height={1418}
              sizes="(max-width: 899px) 100vw, 40vw"
              className="ap-product-img"
            />
          </Reveal>
          <div className="ap-product-copy">
            <p className="ap-eyebrow">Beyond the first impression</p>
            <h2>Presence starts with the details.</h2>
            <p className="ap-lede">
              A distinctive bottle catches your eye. The fragrance makes it
              personal. Explore the notes, wear the scent, and discover how it
              develops on your skin.
            </p>
            {/* Fine rules, not cards - three points that read as one thought. */}
            <dl className="ap-points">
              <div>
                <dt>Character</dt>
                <dd>Four scent identities, each with a different mood.</dd>
              </div>
              <div>
                <dt>Choice</dt>
                <dd>
                  Fresh, floral, amber and woody directions. Choose what draws
                  you in.
                </dd>
              </div>
              <div>
                <dt>Everyday presence</dt>
                <dd>Discover in 20ml. Make room for 100ml.</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* 4. THE COLLECTION */}
      <section className="ap-collection">
        <div className="ap-collection-head">
          <p className="ap-eyebrow">Four scents. Four points of view.</p>
          <h2>Which side of you shows up today?</h2>
        </div>
        <ul className="ap-grid">
          {signatures.map((product, index) => {
            const voice = VOICE[product.slug];
            return (
              <Reveal
                as="li"
                key={product.id}
                index={index}
                className="ap-card"
              >
                {/* The accent is set on the link rather than the Reveal
                    wrapper: Reveal is a shared motion component with a fixed
                    prop list, and widening it for one page's decoration is the
                    wrong trade. The custom property still cascades to the whole
                    card from here. */}
                <Link
                  href={`/products/${product.slug}`}
                  style={
                    { "--card-accent": voice.accent } as React.CSSProperties
                  }
                >
                  <span className="ap-card-media">
                    <Photo
                      src={voice.shot}
                      alt={voice.alt}
                      width={900}
                      height={1125}
                      loading="lazy"
                      sizes="(max-width: 639px) 50vw, (max-width: 1023px) 45vw, 23vw"
                      className="ap-card-img"
                    />
                  </span>
                  <span className="ap-card-body">
                    <h3>{product.name}</h3>
                    <p className="ap-card-line">{voice.line}</p>
                    <p className="ap-card-notes">
                      <span className="ap-card-family">{product.profile}</span>
                      {product.notes}
                    </p>
                    <span className="ap-card-cta">Explore {product.name}</span>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </section>

      {/* 5. THE WEARER */}
      <section className="ap-wearer">
        <div className="ap-wearer-inner">
          <div className="ap-wearer-copy">
            <h2>
              Your signature.
              <span>Your terms.</span>
            </h2>
            <p>
              There is no single way to wear Amidaddy. Choose the scent that
              fits your mood, then make it part of your day.
            </p>
            <p>
              Start small. Switch things up. Stay with a favourite. The choice
              is yours.
            </p>
            <Link href="/shop#20ml" className="ap-link ap-link--lead">
              Explore the sizes
            </Link>
          </div>
          <Reveal className="ap-wearer-media" variant="clip">
            <Photo
              src="/site/our-approach/sizes.webp"
              alt="The Heavenly 20ml bottle standing beside the 100ml bottle, showing the difference in size"
              width={1800}
              height={1013}
              loading="lazy"
              sizes="(max-width: 899px) 100vw, 55vw"
              className="ap-wearer-img"
            />
          </Reveal>
        </div>
      </section>

      {/* 6. DISCOVERY */}
      <section className="ap-discovery">
        <div className="ap-discovery-inner">
          <Reveal className="ap-discovery-media" variant="clip">
            <Photo
              src="/site/our-approach/discovery-set.webp"
              alt="The four 20ml bottles of the discovery set: Old Love, Heavenly, Billionaire and Cold War"
              width={1600}
              height={1434}
              loading="lazy"
              sizes="(max-width: 899px) 100vw, 48vw"
              className="ap-discovery-img"
            />
          </Reveal>
          <div className="ap-discovery-copy">
            <h2>
              Meet all four.
              <span>Choose your own favourite.</span>
            </h2>
            <p>
              Explore Cold War, Heavenly, Old Love and Billionaire in the four
              &times; 20ml discovery set. Give each one its moment.
            </p>
            {discovery && (
              <Link
                href={`/products/${discovery.slug}`}
                className="ap-cta ap-cta--quiet"
              >
                Explore the discovery set
                {/* Price read from the catalog, never hard-coded, and omitted
                    entirely if the variant has no price rather than guessing. */}
                {typeof discoveryPrice === "number" && (
                  <span>{formatInr(discoveryPrice)}</span>
                )}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 7. CLOSING */}
      <section className="ap-close">
        <div className="ap-close-inner">
          <h2>Make your presence felt.</h2>
          <p>Four fragrances. Your next signature.</p>
          <Link href="/shop" className="ap-cta ap-cta--invert">
            Explore Amidaddy
          </Link>
        </div>
      </section>
    </main>
  );
}
