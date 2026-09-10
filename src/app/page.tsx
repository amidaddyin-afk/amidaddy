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
  const comboFreeShipping =
    !!comboVariant && comboVariant.pricePaise >= DEFAULT_FREE_SHIPPING_PAISE;
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
  const shippingFee = Math.round(DEFAULT_SHIPPING_FEE_PAISE / 100);
  const freeShippingThreshold = Math.round(DEFAULT_FREE_SHIPPING_PAISE / 100);

  // One source for the visible FAQ and the FAQPage structured data below, so a
  // crawler and a customer never see different answers.
  const faqs: Array<[string, string]> = [
    [
      "Are these original fragrances?",
      "Amidaddy creates its own scent identities. Explore each composition's notes to find the one that feels right for you.",
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

      {/* Hero: copy panel left, the four fragrance films playing back to back
          on the right. The still stays underneath as the poster and as the
          fallback for reduced-motion and metered connections. */}
      <section className="house-hero">
        <div className="house-hero-copy">
          <p className="eyebrow">EAU DE PERFUME. EVERY SIDE OF YOU.</p>
          <h1>
            Leave an
            <br />
            <span>impression.</span>
          </h1>
          <p>
            Four fragrances. Endless versions of you.
            <br />
            Find the one that feels like yours.
          </p>
          <Link className="lux-button house-hero-cta" href="/shop">
            Find your fragrance <ArrowUpRight size={20} />
          </Link>
          <p className="house-hero-tagline">Unbottle the Vibe</p>
        </div>
        <div className="house-hero-image">
          <Photo
            src="/ref/old-love-3926.webp"
            alt="The Amidaddy collection, photographed for the launch"
            fill
            priority
            sizes="(max-width: 767px) 100vw, 51vw"
            className="object-cover"
          />
          <HeroVideoSlideshow />
          {/* Mobile-only: the copy panel is hidden on a phone, so the hero
              still needs a way into the catalogue. Sits over the scrim at the
              foot of the film. */}
          <Link className="house-hero-overlay-cta" href="/shop">
            Find your fragrance <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>

      {/* Value strip: the three prices, above the fold on the way down. */}
      <div className="house-value-strip">
        <span>
          100 ml. Full expression. <b>{formatInr(full100Paise)}</b>
        </span>
        <span>
          20 ml. Take it anywhere. <b>{formatInr(pocket20Paise)}</b>
        </span>
        {comboVariant && (
          <span>
            Four fragrances. One discovery.{" "}
            <b>{formatInr(comboVariant.pricePaise)}</b>
            {comboFreeShipping ? " · Free delivery" : ""}
          </span>
        )}
      </div>

      <div className="house-benefits">
        <span>Four unisex signatures</span>
        <span>
          <Truck size={16} /> Free delivery from ₹{freeShippingThreshold}
        </span>
        <span>
          <ShieldCheck size={16} /> Secure payments
        </span>
      </div>

      {/* Certification marks: the full set, captioned, as its own band. */}
      <section className="house-certifications" aria-label="Certifications">
        <p>Made to standard. Verified, not claimed.</p>
        <Certifications variant="strip" />
      </section>

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
            Amidaddy is built around original scent identities. Explore the
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
