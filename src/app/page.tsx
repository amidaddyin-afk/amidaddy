import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Gift,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import Photo from "@/components/Photo";
import ProductCard from "@/components/ProductCard";
import CinematicSequence, {
  type CinePanel,
} from "@/components/CinematicSequence";
import ScentFinder from "@/components/ScentFinder";
import { listCatalogProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  description:
    "Amidaddy Perfumes: four unisex Eau de Parfum signatures in 20ml and 100ml, plus a complete discovery pack. Shop fragrances built around mood, memory and presence.",
  alternates: { canonical: "/" },
};

const reviews = [
  {
    quote:
      "The presentation feels premium, and Old Love stays warm and memorable for hours.",
    name: "Verified customer",
  },
  {
    quote:
      "The 20ml set made it easy to try every fragrance before choosing my full bottle.",
    name: "Verified customer",
  },
  {
    quote:
      "Billionaire has become my evening fragrance. The bottle also looks beautiful on my shelf.",
    name: "Verified customer",
  },
];

/**
 * Cinematic script for the pinned signature sequence. Fixed order and the
 * campaign line per fragrance (the lines already run on the storefront, so the
 * voice matches). `objectPosition` / `spot` bias each frame so the bottle is
 * the lit subject and the campaign faces sit back as atmosphere.
 */
const SCRIPT: Record<
  string,
  Pick<
    CinePanel,
    | "line"
    | "notes"
    | "image"
    | "objectPosition"
    | "objectPositionMobile"
    | "spot"
  >
> = {
  "old-love": {
    line: "Stay unforgettable.",
    notes: ["Saffron", "Amber", "Resin"],
    // Red-lit silhouette, the bottle glowing between the two figures.
    image: "/gallery/old-love/01.webp",
    objectPosition: "50% 46%",
    objectPositionMobile: "50% 46%",
    spot: "50% 52%",
  },
  coldwar: {
    line: "Make your move.",
    notes: ["Bright fruit", "Herbs", "Woods"],
    // Bottle held forward, filling the frame, the face behind it.
    image: "/gallery/coldwar/02.webp",
    objectPosition: "42% 40%",
    objectPositionMobile: "44% 40%",
    spot: "40% 42%",
  },
  heavenly: {
    line: "Leave a softer trace.",
    notes: ["White floral", "Vanilla", "Musk"],
    image: "/gallery/heavenly/02.webp",
    objectPosition: "46% 44%",
    objectPositionMobile: "48% 44%",
    spot: "44% 46%",
  },
  billionaire: {
    line: "Own the room.",
    notes: ["Whiskey", "Spice", "Dark woods"],
    // The pair, a black bottle held between them.
    image: "/gallery/billionaire/04.webp",
    objectPosition: "50% 56%",
    objectPositionMobile: "50% 62%",
    spot: "50% 66%",
  },
};
const SEQUENCE_ORDER = ["old-love", "coldwar", "heavenly", "billionaire"];

export default async function Home() {
  const { products } = await listCatalogProducts({
    page: 1,
    pageSize: 24,
    sort: "newest",
    inStock: "true",
  });
  const signatures = products.filter(
    (product) => product.collection === "unisex",
  );
  const combo = products.find(
    (product) => product.slug === "signature-combo-20ml",
  );
  const bySlug = new Map(signatures.map((product) => [product.slug, product]));
  const cinePanels: CinePanel[] = SEQUENCE_ORDER.filter((slug) =>
    bySlug.has(slug),
  ).map((slug) => {
    const product = bySlug.get(slug)!;
    const script = SCRIPT[slug];
    return {
      slug,
      name: product.name,
      alt: `${product.name}, ${product.profile} ${product.concentration}, photographed for Amidaddy Perfumes`,
      ...script,
    };
  });

  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://amidaddy.in";
  const organizationJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Amidaddy Perfumes",
    url: siteUrl,
    logo: `${siteUrl}/og.png`,
  }).replace(/</g, "\\u003c");

  return (
    <main data-surface="story" className="storefront-home cinematic-home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: organizationJsonLd }}
      />

      {/* Film stage: the letterbox bars are sticky here, so they frame the
          title card and the sequence and then scroll away above the shop. */}
      <div className="cine-stage">
        <span className="cine-bar cine-bar-top" aria-hidden="true" />

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

        <CinematicSequence panels={cinePanels} />

        <span className="cine-bar cine-bar-bottom" aria-hidden="true" />
      </div>

      <section className="home-trust-strip" aria-label="Shopping benefits">
        <article>
          <Truck size={18} />
          <div>
            <h2>Complimentary delivery</h2>
            <p>Free shipping on orders of &#8377;599 or more.</p>
          </div>
        </article>
        <article>
          <Sparkles size={18} />
          <div>
            <h2>Four unisex signatures</h2>
            <p>Composed around mood, memory and presence.</p>
          </div>
        </article>
        <article>
          <ShieldCheck size={18} />
          <div>
            <h2>Secure Razorpay checkout</h2>
            <p>Protected payments with GST-inclusive pricing.</p>
          </div>
        </article>
      </section>

      <section className="home-collection" id="shop-100ml">
        <div className="commerce-heading">
          <div>
            <p className="eyebrow">The signature collection</p>
            <h2 className="display-title">Find your signature.</h2>
          </div>
          <div>
            <p>Four moods composed for every side of your presence.</p>
            <Link href="/shop" className="text-link">
              Shop all fragrances <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
        <div className="product-grid home-product-grid">
          {signatures.map((product, index) => (
            <ProductCard
              key={`100ml-${product.id}`}
              product={product}
              index={index}
              initialSize="100ml"
              lockSize
            />
          ))}
        </div>
      </section>

      {combo && (
        <section className="home-combo" id="discovery-set">
          <div className="home-combo-media">
            <Image
              src="/products/combos/20ml/01.webp"
              alt="Amidaddy Perfumes Pack of 4 gift set with four 20 ml Eau de Parfum bottles"
              fill
              sizes="(max-width: 900px) 100vw, 58vw"
              className="object-contain"
            />
          </div>
          <div className="home-combo-copy">
            <h2 className="display-title">Four signatures. One set.</h2>
            <p className="combo-lead">
              Old Love, Heavenly, Billionaire and Cold War together in four
              travel-ready 20ml bottles.
            </p>
            <div className="combo-price">
              <strong>&#8377;699</strong>
              <span>MRP &#8377;996</span>
            </div>
            <p className="tax-copy">Inclusive of all taxes</p>
            <Link href={`/products/${combo.slug}`} className="lux-button">
              Shop the Pack of 4 <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
      )}

      <section className="home-collection home-collection-20" id="shop-20ml">
        <div className="commerce-heading">
          <div>
            <h2 className="display-title">The 20ml collection.</h2>
          </div>
          <p>Same composition. A considered format for travel and discovery.</p>
        </div>
        <div className="product-grid home-product-grid">
          {signatures.map((product, index) => (
            <ProductCard
              key={`20ml-${product.id}`}
              product={product}
              index={index}
              initialSize="20ml"
              lockSize
            />
          ))}
        </div>
      </section>

      <section className="home-story" id="story">
        <div className="home-story-media">
          <Image
            src="/curated/product-detail-1.webp"
            alt="Amidaddy Perfumes fragrance bottles arranged in warm studio light"
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="home-story-copy">
          <p className="eyebrow">The house of Amidaddy</p>
          <h2 className="display-title">
            Perfume should reveal you, not introduce you.
          </h2>
          <p>
            We compose familiar woods, florals, amber and clean musks into
            signatures shaped around mood, memory and presence.
          </p>
          <Link href="/scent-school" className="text-link">
            Discover our scent philosophy <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>

      {/* Scent School already links to #scent-finder; the quiz existed but was
          never mounted, so that link went nowhere. */}
      <ScentFinder products={signatures} />

      <section className="home-reviews">
        <div className="commerce-heading">
          <div>
            <h2 className="display-title">What customers are saying.</h2>
          </div>
        </div>
        <div className="review-grid">
          {reviews.map((review) => (
            <article key={review.quote}>
              <div className="review-stars" aria-label="Five stars">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star key={index} />
                ))}
              </div>
              <blockquote>&ldquo;{review.quote}&rdquo;</blockquote>
              <p>{review.name}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-services">
        <article>
          <Gift />
          <h3>Made to gift</h3>
          <p>Premium presentation for moments worth remembering.</p>
        </article>
        <article>
          <Truck />
          <h3>India-wide delivery</h3>
          <p>&#8377;99 delivery, complimentary above &#8377;599.</p>
        </article>
        <article>
          <ShieldCheck />
          <h3>Purchase securely</h3>
          <p>GST-inclusive prices and protected Razorpay payments.</p>
        </article>
      </section>

      <section className="home-faq">
        <div>
          <h2 className="display-title">Before it becomes yours.</h2>
        </div>
        <div>
          {[
            [
              "Are all fragrances unisex?",
              "Yes. Every composition is presented by character and mood rather than gender.",
            ],
            [
              "What is the difference between 20ml and 100ml?",
              "The fragrance is the same. Choose 20ml for discovery and travel, or 100ml for everyday wear.",
            ],
            [
              "When is delivery free?",
              "Delivery is complimentary when your cart reaches ₹599. Orders below that include a ₹99 delivery charge.",
            ],
            [
              "How can I track my order?",
              "Sign in to your account to view live order status and order history.",
            ],
          ].map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <span>+</span>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
