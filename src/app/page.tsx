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
import CuratedHero from "@/components/CuratedHero";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { listCatalogProducts } from "@/lib/catalog";

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
  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://amidaddy.in";
  const organizationJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Amidaddy",
    url: siteUrl,
    logo: `${siteUrl}/og.png`,
  }).replace(/</g, "\\u003c");

  return (
    <main className="storefront-home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: organizationJsonLd }}
      />
      <CuratedHero />

      <section className="home-trust-strip" aria-label="Shopping benefits">
        <span>
          <Truck size={15} /> Free shipping above &#8377;599
        </span>
        <span>
          <Sparkles size={15} /> Four unisex signatures
        </span>
        <span>
          <ShieldCheck size={15} /> Secure Razorpay checkout
        </span>
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
              alt="Amidaddy Pack of 4 with four 20ml fragrances"
              fill
              sizes="(max-width: 900px) 100vw, 58vw"
              className="object-contain"
            />
          </div>
          <div className="home-combo-copy">
            <p className="eyebrow">The complete discovery wardrobe</p>
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
            <p className="eyebrow">Begin with discovery</p>
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
            src="/curated/product-detail-1.jpg"
            alt="Amidaddy fragrances in warm studio light"
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

      <section className="home-reviews">
        <div className="commerce-heading">
          <div>
            <p className="eyebrow">Worn and remembered</p>
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
          <p className="eyebrow">A little clarity</p>
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

      <Footer />
    </main>
  );
}
