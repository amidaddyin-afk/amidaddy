import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Truck, ShieldCheck } from "lucide-react";
import Photo from "@/components/Photo";
import ProductCard from "@/components/ProductCard";
import HeroVideoSlideshow from "@/components/HeroVideoSlideshow";
import Certifications from "@/components/Certifications";
import ScentFinder from "@/components/ScentFinder";
import Reveal from "@/components/Reveal";
import TrackedLink from "@/components/TrackedLink";
import ViewItemList from "@/components/ViewItemList";
import { listCatalogProducts } from "@/lib/catalog";
import { formatInr } from "@/lib/money";
import {
  DEFAULT_FREE_SHIPPING_PAISE,
  DEFAULT_SHIPPING_FEE_PAISE,
} from "@/lib/commerce";

export const metadata: Metadata = {
  description:
    "Find your signature. Try all four Amidaddy Eau de Parfums in 20ml — fresh, floral, amber and woody — then buy the 100ml of the one you love.",
  alternates: { canonical: "/" },
};

/**
 * Serve a cached render rather than querying Supabase per visitor — the
 * catalogue is six products that change rarely, so a burst of traffic should
 * not become a burst of identical queries. Admin edits do not wait for this
 * window: every catalogue mutation calls revalidateStorefront()
 * (src/lib/revalidate-storefront.ts), which clears this page immediately.
 * Cart and checkout still read live data, so nothing can be bought at a stale
 * price regardless.
 */
export const revalidate = 300;

/**
 * Per-fragrance mood line and story image for the homepage editorial rail.
 * Each uses a frame from that fragrance's own campaign shoot, so the rail and
 * the product page show the same photography.
 */
const STORY: Record<string, { mood: string; desktop: string; mobile: string }> =
  {
    billionaire: {
      mood: "Quiet confidence.",
      desktop: "/ref/billionaire-4038.webp",
      mobile: "/ref/billionaire-4023.webp",
    },
    coldwar: {
      mood: "Keep your cool.",
      desktop: "/ref/cold-war-3545.webp",
      mobile: "/ref/cold-war-3527.webp",
    },
    "old-love": {
      mood: "Stay a little closer.",
      desktop: "/ref/old-love-3956.webp",
      mobile: "/ref/old-love-3926.webp",
    },
    heavenly: {
      mood: "Leave a softer impression.",
      desktop: "/ref/heavenly-3763.webp",
      mobile: "/ref/heavenly-3705.webp",
    },
  };

export default async function Home() {
  const { products } = await listCatalogProducts({
    page: 1,
    pageSize: 24,
    sort: "newest",
    inStock: "true",
  });
  const signatures = products.filter((p) => p.collection === "unisex");
  const combo = products.find((p) => p.slug === "signature-combo-20ml");
  const comboVariant = combo?.variants.find((v) => v.name === "20ml");
  // Headline prices for the value strip, read off the live catalogue rather
  // than hardcoded, so an admin price change moves them too.
  const variantPrice = (size: "100ml" | "20ml") =>
    signatures
      .flatMap((product) => product.variants)
      .find((variant) => variant.name === size)?.pricePaise;
  const full100Paise = variantPrice("100ml") ?? 119_900;
  const pocket20Paise = variantPrice("20ml") ?? 19_900;
  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://amidaddy.in";
  /* Bottle photography for the three shopping cards, taken from the variant
     images rather than a product's lead `image` - several leads are lifestyle
     frames where a model, not the bottle, is the subject, which reads wrong at
     thumbnail size. Falls back to a known bottle shot if the field is absent. */
  const entryShot = (size: "100ml" | "20ml", fallback: string) =>
    signatures.find((product) => product.variantImages?.[size]?.[0])
      ?.variantImages?.[size]?.[0] ?? fallback;
  const shippingFee = Math.round(DEFAULT_SHIPPING_FEE_PAISE / 100);
  const freeShippingThreshold = Math.round(DEFAULT_FREE_SHIPPING_PAISE / 100);

  // One source for the visible FAQ and the FAQPage structured data below, so a
  // crawler and a customer never see different answers.
  const faqs: Array<[string, string]> = [
    [
      "Are these original fragrances?",
      "Amidaddy™ creates its own scent identities. Explore each composition's notes to find the one that feels right for you.",
    ],
    ["Are they unisex?", "Yes. Choose by the notes and mood you enjoy."],
    [
      "Is 20ml the same fragrance as 100ml?",
      "Yes. Both sizes carry the same composition; choose the format that fits your routine.",
    ],
    [
      "How long will it last?",
      "Wear varies with skin, weather and application. Check the individual fragrance page for its verified wear information.",
    ],
    [
      "What comes in the discovery combo?",
      "Four 20ml fragrances — Billionaire, Cold War, Heavenly and Old Love. It is a paid four-bottle set, not free samples.",
    ],
    [
      "What does delivery cost?",
      `Delivery is ₹${shippingFee}, with complimentary delivery on orders of ₹${freeShippingThreshold} or more. See our shipping policy for details.`,
    ],
    [
      "Can I return it?",
      "Read our returns policy for eligibility, time limits and how to request help.",
    ],
  ];
  return (
    <main data-surface="story" className="storefront-home house-home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Amidaddy Perfumes",
              url: siteUrl,
              logo: `${siteUrl}/og.png`,
              email: "support@amidaddy.in",
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map(([question, answer]) => ({
                "@type": "Question",
                name: question,
                acceptedAnswer: { "@type": "Answer", text: answer },
              })),
            },
          ]).replace(/</g, "\\u003c"),
        }}
      />

      <ViewItemList
        listId="home_signatures"
        products={signatures}
        size="100ml"
      />

      {/* Hero: copy panel left, the fragrance films playing on the right. The
          still stays underneath as the poster and as the fallback for
          reduced-motion, blocked autoplay and metered connections, so the
          panel is never blank. */}
      <section className="house-hero">
        <div className="house-hero-copy">
          <p className="eyebrow">Eau de Parfum. Every side of you.</p>
          <h1>
            Leave an
            <br />
            <span>impression.</span>
          </h1>
          <p>Four unisex fragrances. Find the one that feels like you.</p>
          <div className="house-hero-actions">
            <a className="house-hero-cta" href="#shop-100ml">
              Shop fragrances <ArrowUpRight size={18} />
            </a>
            <Link
              className="house-hero-link"
              href="/products/signature-combo-20ml"
            >
              Explore the discovery set
            </Link>
          </div>
        </div>
        <div className="house-hero-image">
          <Photo
            src="/ref/old-love-3926.webp"
            alt="The Amidaddy collection, photographed for the launch"
            fill
            priority
            sizes="(max-width: 767px) 100vw, 60vw"
            className="object-cover"
          />
          <HeroVideoSlideshow />
          {/* Mobile-only: the primary action sits over the foot of the film
              so shopping is reachable without scrolling past it. The headline
              itself is not repeated here - it reads immediately below in the
              copy band, and printing it twice looked like a bug. */}
          <div className="house-hero-overlay">
            <a className="house-hero-overlay-cta" href="#shop-100ml">
              Shop fragrances <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Three ways in, directly under the hero, so the first thing after the
          film is something to buy rather than another banner. Prices,
          availability and destinations all come from the live catalogue - see
          full100Paise / pocket20Paise / comboVariant above - so an admin price
          change moves these too and nothing here is hardcoded. */}
      <section className="house-entry" aria-label="Shop by format">
        <Link className="house-entry-card" href="/shop#100ml">
          <span className="house-entry-shot">
            <Photo
              src={entryShot("100ml", "/ref/billionaire-100ml-mobile.webp")}
              alt="A 100ml Amidaddy Eau de Parfum"
              fill
              sizes="(max-width: 767px) 33vw, 30vw"
              className="object-cover"
            />
          </span>
          <span className="house-entry-body">
            <span className="house-entry-name">Full size</span>
            <span className="house-entry-meta">100ml</span>
            <span className="house-entry-price">{formatInr(full100Paise)}</span>
          </span>
        </Link>
        <Link className="house-entry-card" href="/shop#20ml">
          <span className="house-entry-shot">
            <Photo
              src={entryShot("20ml", "/ref/heavenly-20ml.webp")}
              alt="A 20ml Amidaddy Eau de Parfum"
              fill
              sizes="(max-width: 767px) 33vw, 30vw"
              className="object-cover"
            />
          </span>
          <span className="house-entry-body">
            <span className="house-entry-name">Travel size</span>
            <span className="house-entry-meta">20ml</span>
            <span className="house-entry-price">
              {formatInr(pocket20Paise)}
            </span>
          </span>
        </Link>
        {comboVariant && (
          <Link
            className="house-entry-card"
            href="/products/signature-combo-20ml"
          >
            <span className="house-entry-shot">
              <Photo
                src={combo?.image ?? "/products/combos/20ml-combo-of-4.webp"}
                alt="The four-fragrance Amidaddy discovery set"
                fill
                sizes="(max-width: 767px) 33vw, 30vw"
                className="object-cover"
              />
            </span>
            <span className="house-entry-body">
              <span className="house-entry-name">Discovery set</span>
              <span className="house-entry-meta">Four x 20ml</span>
              <span className="house-entry-price">
                {formatInr(comboVariant.pricePaise)}
              </span>
            </span>
          </Link>
        )}
      </section>

      {/* One compact reassurance row near the opening. The full certification
          band moves below the products, where it informs rather than delays. */}
      <div className="house-benefits">
        <span>Four unisex signatures</span>
        <span>
          <Truck size={16} /> Free delivery from Rs {freeShippingThreshold}
        </span>
        <span>
          <ShieldCheck size={16} /> Secure payments
        </span>
      </div>

      {/* 1. The four fragrances, comparable at a glance, each with a route to
            its own 100ml. */}
      <section className="home-collection" id="shop-100ml">
        <div className="house-heading">
          <h2>Four signatures. Find yours.</h2>
          <p>
            Every one is unisex. Pick the mood that fits, choose 20ml or 100ml,
            and add it here.
          </p>
        </div>
        <div className="product-grid home-product-grid">
          {signatures.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              initialSize="100ml"
            />
          ))}
        </div>
        {!signatures.length && (
          <p>Our collection is being refreshed. Please check back shortly.</p>
        )}
      </section>

      {/* 2. Discovery offer — the four-bottle set, after the singles so a
            visitor meets the fragrances before the way to try all of them. */}
      {combo && (
        <section className="house-discovery" id="discovery-set">
          <div className="house-discovery-copy">
            <h2>
              Meet all four.
              <br />
              Let your skin decide.
            </h2>
            <p>
              Billionaire, Cold War, Heavenly and Old Love — four 20ml
              fragrances, {combo.packSize ?? 4} bottles in one set. Try each on
              its own, let it develop over a few wears, then buy the 100ml of
              your favourite.
            </p>
            <TrackedLink
              href={`/products/${combo.slug}`}
              event="discovery_cta_click"
              params={{ location: "discovery_section" }}
              className="text-link"
            >
              See what is included <ArrowUpRight size={16} />
            </TrackedLink>
          </div>
          <ProductCard product={combo} initialSize="20ml" />
        </section>
      )}

      {/* Certification marks. Moved below the products and the discovery set:
          as a full band directly under the hero it pushed the first buyable
          thing off the fold. It informs a considering visitor, so it belongs
          after they have seen what is for sale. */}
      <section className="house-certifications" aria-label="Certifications">
        <p>Made to standard. Verified, not claimed.</p>
        <Certifications variant="strip" />
      </section>

      {/* Four signature stories: mood, notes and a route back to the SKU. */}
      <section className="house-stories" aria-labelledby="house-stories-title">
        <h2 id="house-stories-title" className="house-stories-title">
          A closer look at each one.
        </h2>
        <div className="house-stories-rail">
          {signatures.map((product, index) => {
            const story = STORY[product.slug];
            if (!story) return null;
            return (
              <Reveal
                key={product.id}
                as="article"
                index={index}
                className="house-story"
              >
                <div className="house-story-media">
                  <Photo
                    src={story.desktop}
                    alt={`${product.name} ${product.concentration}`}
                    fill
                    sizes="(max-width: 900px) 92vw, 46vw"
                    className="house-story-photo house-story-photo--desktop object-cover"
                  />
                  <Photo
                    src={story.mobile}
                    alt={`${product.name} ${product.concentration}`}
                    fill
                    sizes="(max-width: 900px) 92vw, 46vw"
                    className="house-story-photo house-story-photo--mobile object-cover"
                  />
                </div>
                <div className="house-story-copy">
                  <p className="house-story-mood">{story.mood}</p>
                  <h3>{product.name}</h3>
                  <p className="house-story-notes">{product.notes}</p>
                  <p className="house-story-line">
                    Best for {product.occasion.toLowerCase()}.
                  </p>
                  <Link
                    href={`/products/${product.slug}?size=100ml`}
                    className="text-link"
                  >
                    Explore {product.name} <ArrowUpRight size={16} />
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 6. Brand/process evidence. */}
      <section className="house-composition" id="story">
        <div className="house-composition-media">
          <Photo
            src="/ref/heavenly-3682.webp"
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            className="house-composition-photo house-composition-photo--desktop object-cover"
          />
          <Photo
            src="/ref/heavenly-3620.webp"
            alt=""
            fill
            sizes="100vw"
            className="house-composition-photo house-composition-photo--mobile object-cover"
          />
        </div>
        <div className="house-composition-copy">
          <h2>Every detail, considered.</h2>
          <p>
            Our attention goes to what is in the bottle and how it develops on
            skin, from the first spray to the trail it leaves.
          </p>
          <p>
            Amidaddy™ is built around original scent identities. Explore the
            notes, wear them, and decide what feels like you.
          </p>
          <Link className="text-link" href="/our-approach">
            Inside the composition <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      {/* 5. Individual fragrance shopping — sizes. */}
      <section className="house-format" id="shop-20ml">
        <div className="house-format-media">
          <Photo
            src="/ref/heavenly-both-sizes-desktop.webp"
            alt="A 100ml bottle and its 20ml counterpart side by side"
            fill
            sizes="(max-width: 760px) 100vw, 52vw"
            className="house-format-photo house-format-photo--desktop object-cover"
          />
          <Photo
            src="/ref/billionaire-20ml-desktop.webp"
            alt="A 100ml bottle and its 20ml counterpart side by side"
            fill
            sizes="100vw"
            className="house-format-photo house-format-photo--mobile object-cover"
          />
        </div>
        <div className="house-format-copy">
          <h2>At home. On the move.</h2>
          <p>
            The same composition in two sizes. Keep 20ml close when you travel;
            make 100ml part of the everyday.
          </p>
          <Link href="/shop#20ml" className="lux-button">
            Shop travel sizes <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      <ScentFinder products={signatures} />

      {/* 8. FAQs. */}
      <section className="home-faq house-faq">
        <h2>Before it becomes yours.</h2>
        <div>
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span>+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 9. Final purchase CTA. */}
      <section className="house-close">
        <div className="house-close-media">
          <Photo
            src="/ref/old-love-3958.webp"
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            className="house-close-photo house-close-photo--desktop object-cover"
          />
          <Photo
            src="/ref/old-love-3903.webp"
            alt=""
            fill
            sizes="100vw"
            className="house-close-photo house-close-photo--mobile object-cover"
          />
        </div>
        <div className="house-close-copy">
          <h2>Your next signature starts here.</h2>
          <TrackedLink
            href={combo ? `/products/${combo.slug}` : "#shop-100ml"}
            event="discovery_cta_click"
            params={{ location: "footer_cta" }}
            className="lux-button"
          >
            Shop the discovery combo <ArrowUpRight size={18} />
          </TrackedLink>
        </div>
      </section>
    </main>
  );
}
