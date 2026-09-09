import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Truck, ShieldCheck } from "lucide-react";
import Photo from "@/components/Photo";
import ProductCard from "@/components/ProductCard";
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
 * Per-fragrance mood line and story image for the homepage editorial rail.
 * Billionaire, Cold War and Old Love use the launch campaign artwork. Heavenly
 * has no campaign art yet, so it stays on its own product photograph.
 */
const STORY: Record<string, { mood: string; desktop: string; mobile: string }> =
  {
    billionaire: {
      mood: "Quiet confidence.",
      desktop: "/campaign/billionaire-story-desktop.png",
      mobile: "/campaign/billionaire-story-mobile.webp",
    },
    coldwar: {
      mood: "Keep your cool.",
      desktop: "/campaign/cold-war-story-desktop.png",
      mobile: "/campaign/cold-war-story-mobile.webp",
    },
    "old-love": {
      mood: "Stay a little closer.",
      desktop: "/campaign/old-love-story-desktop.webp",
      mobile: "/campaign/old-love-story-desktop.webp",
    },
    heavenly: {
      mood: "Leave a softer impression.",
      desktop: "/products/detail/heavenly/hero.webp",
      mobile: "/products/detail/heavenly/hero.webp",
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

      {/* Hero: discovery-combo-led. Offer, price and both CTAs sit above the
          fold on a typical phone. */}
      <section className="house-hero">
        <div className="house-hero-image">
          <Photo
            src="/campaign/hero-desktop.png"
            alt="The four Amidaddy Eau de Parfums held by the models"
            width={1672}
            height={941}
            priority
            sizes="100vw"
            className="house-hero-photo house-hero-photo--desktop"
          />
          <Photo
            src="/campaign/hero-mobile.png"
            alt="The four Amidaddy Eau de Parfums held by the models"
            width={941}
            height={1672}
            priority
            sizes="100vw"
            className="house-hero-photo house-hero-photo--mobile"
          />
        </div>
        <div className="house-hero-copy">
          <h1>Find your signature. Try all four.</h1>
          <p>
            Four unisex Eau de Parfums in 20ml bottles — fresh, floral, amber
            and woody.
          </p>
          {comboVariant && (
            <p className="house-hero-offer">
              4 × 20ml · {formatInr(comboVariant.pricePaise)}
              {comboFreeShipping ? " · Free delivery" : ""}
            </p>
          )}
          <div className="house-hero-actions">
            <TrackedLink
              href={combo ? `/products/${combo.slug}` : "#shop-100ml"}
              event="discovery_cta_click"
              params={{ location: "hero" }}
              className="lux-button"
            >
              Shop the discovery combo <ArrowUpRight size={18} />
            </TrackedLink>
            <Link
              href="#scent-finder"
              className="text-link house-hero-secondary"
            >
              Help me choose a scent <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <div className="house-benefits">
        <span>Four unisex signatures</span>
        <span>
          <Truck size={16} /> Free delivery from ₹{freeShippingThreshold}
        </span>
        <span>
          <ShieldCheck size={16} /> Secure payments
        </span>
      </div>

      {/* 1. Discovery offer — the primary first-time-buyer product, right after
            the hero. */}
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

      {/* 2 + 3. The four fragrances, comparable at a glance, each with a route
            to its own 100ml. */}
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
            src="/campaign/composition-desktop.webp"
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            className="house-composition-photo house-composition-photo--desktop object-cover"
          />
          <Photo
            src="/campaign/composition-mobile.webp"
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
            src="/campaign/billionaire-duo-desktop.webp"
            alt="Billionaire 100ml and 20ml side by side"
            fill
            sizes="(max-width: 760px) 100vw, 52vw"
            className="house-format-photo house-format-photo--desktop object-cover"
          />
          <Photo
            src="/campaign/billionaire-duo-mobile.png"
            alt="Billionaire 100ml and 20ml side by side"
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
            src="/campaign/cta-desktop.webp"
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            className="house-close-photo house-close-photo--desktop object-cover"
          />
          <Photo
            src="/campaign/cta-mobile.webp"
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
