import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Gift, ShieldCheck, Sparkles, Truck } from "lucide-react";
import CuratedHero from "@/components/CuratedHero";
import ProductGrid from "@/components/ProductGrid";
import ScentFinder from "@/components/ScentFinder";
import Footer from "@/components/Footer";
import { listCatalogProducts } from "@/lib/catalog";

export default async function Home() {
  const { products } = await listCatalogProducts({
    page: 1,
    pageSize: 12,
    sort: "newest",
    inStock: "true",
  });
  const signatures = products.filter(
    (product) => product.collection === "unisex",
  );
  const completeWardrobe = products.find(
    (product) => product.slug === "signature-combo-20ml",
  );
  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://amidaddy.com";
  const organizationJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Amidaddy",
    url: siteUrl,
    logo: `${siteUrl}/og.png`,
  }).replace(/</g, "\\u003c");
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: organizationJsonLd }}
      />
      <CuratedHero />
      <section className="signal-strip" aria-label="Store services" data-reveal>
        <span>
          <Sparkles size={15} />
          20 ml discovery bottles from ₹199
        </span>
        <span>
          <Truck size={15} />
          Complimentary shipping above ₹1,999
        </span>
        <span>
          <ShieldCheck size={15} />
          Secure Razorpay checkout
        </span>
      </section>
      <section className="four-worlds" aria-labelledby="four-worlds-title">
        <div className="section-heading" data-reveal>
          <div>
            <p className="eyebrow">Four worlds</p>
            <h2 className="display-title" id="four-worlds-title">
              Four fragrances.
              <br />
              Four versions of you.
            </h2>
          </div>
          <p>Choose by feeling first. The notes will tell you why it works.</p>
        </div>
        <div className="world-grid">
          {signatures.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className={`world-card world-${product.slug}`}
            >
              <Image
                src={product.image}
                alt={`${product.name} fragrance world`}
                fill
                sizes="(max-width: 760px) 100vw, 25vw"
                className="object-cover"
              />
              <span className="world-card-shade" />
              <span className="world-card-copy">
                <small>{product.profile}</small>
                <strong>{product.name}</strong>
                <em>{product.mood}</em>
                <span>
                  {product.story} <ArrowUpRight size={15} />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
      <ScentFinder products={signatures} />
      <ProductGrid products={signatures} />
      <section className="editorial-story" id="story">
        <div className="story-image" data-reveal="left">
          <Image
            src="/curated/product-detail-1.jpg"
            alt="Amidaddy fragrance bottles arranged in warm cinematic light"
            fill
            sizes="(max-width:1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="story-copy" data-reveal>
          <p className="eyebrow">Made for a feeling</p>
          <h2 className="display-title">
            Perfume should not introduce you. It should reveal you.
          </h2>
          <p>
            Amidaddy composes familiar materials—woods, florals, amber and clean
            musks—into signatures that feel immediate, personal and difficult to
            forget.
          </p>
          <Link href="/shop" className="text-link">
            Explore every composition <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
      {completeWardrobe && (
        <section className="wardrobe-banner">
          <div data-reveal="left">
            <p className="eyebrow">The complete wardrobe</p>
            <h2 className="display-title">Four moods. One collection.</h2>
            <p>
              Cold War for clarity. Heavenly for closeness. Old Love for memory.
              Billionaire for presence. Meet the whole house in travel-ready 20
              ml bottles.
            </p>
            <Link
              href={`/products/${completeWardrobe.slug}`}
              className="lux-button"
            >
              Explore the complete wardrobe <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="wardrobe-image" data-reveal>
            <Image
              src={completeWardrobe.image}
              alt="The four Amidaddy fragrance signatures together"
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </section>
      )}
      <section className="discovery-banner">
        <div data-reveal="left">
          <p className="eyebrow">The discovery ritual</p>
          <h2 className="display-title">
            Begin small.
            <br />
            Choose slowly.
          </h2>
          <p>
            Try a 20 ml bottle for ₹199 before making a fragrance part of your
            everyday.
          </p>
          <Link href="/shop?size=20ml" className="lux-button">
            Shop 20 ml
          </Link>
        </div>
        <div className="relative min-h-[480px]" data-reveal>
          <Image
            src="/curated/product-detail-2.JPG"
            alt="Amidaddy discovery fragrances"
            fill
            sizes="(max-width:900px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </section>
      <section className="service-grid">
        <article data-reveal>
          <Gift />
          <h3>Made to gift</h3>
          <p>
            Considered fragrances and clean presentation for moments worth
            remembering.
          </p>
        </article>
        <article data-reveal>
          <Truck />
          <h3>India-wide delivery</h3>
          <p>
            ₹99 flat delivery, complimentary when your order reaches ₹1,999.
          </p>
        </article>
        <article data-reveal>
          <ShieldCheck />
          <h3>Purchase with clarity</h3>
          <p>
            GST-inclusive pricing, secure payment, live order status and
            cancellation before processing.
          </p>
        </article>
      </section>
      <section className="faq-section" id="faq">
        <div data-reveal="left">
          <p className="eyebrow">A little clarity</p>
          <h2 className="display-title">Before it becomes yours.</h2>
        </div>
        <div data-reveal>
          {[
            [
              "Are the fragrances unisex?",
              "Yes. Every Amidaddy composition is presented by character and mood rather than gender.",
            ],
            [
              "What is the difference between 20 ml and 100 ml?",
              "The fragrance concentration is the same. The 20 ml format is ideal for discovery and travel; 100 ml is the full ritual.",
            ],
            [
              "Can I cancel my order?",
              "You can cancel from your account while an order is payment-pending or confirmed. Once preparation begins, contact support.",
            ],
            [
              "How do I track delivery?",
              "When your order ships, its courier, tracking number and tracking link appear in your account and arrive by email.",
            ],
            [
              "How much fragrance should I apply?",
              "Start with 2-4 sprays and adjust for the fragrance, setting, weather and your preference. More is not automatically better.",
            ],
            [
              "How should I store perfume?",
              "Keep the bottle closed and away from direct sunlight, high heat and large temperature swings.",
            ],
          ].map(([q, a]) => (
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
      <Footer />
    </main>
  );
}
