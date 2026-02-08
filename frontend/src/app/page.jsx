import ProductCard from "../components/ProductCard.jsx";
import ProductViewer3DEnhanced from "../components/ProductViewer3DEnhanced.jsx";
import ProductShowcase3D from "../components/ProductShowcase3D.jsx";
import { getProducts } from "../services/api.js";

export const dynamic = "force-dynamic";

const collectionHighlights = [
  {
    title: "Bare Skin",
    description: "Clean musks, soft florals, and light woods.",
    accent: "Everyday"
  },
  {
    title: "Velvet Night",
    description: "Amber, cherry, and slow-burning spice.",
    accent: "After dark"
  },
  {
    title: "Salted Bloom",
    description: "Mineral citrus with airy coastal notes.",
    accent: "Seasonal"
  }
];

const discoveryPerks = [
  "6 x 2ml trial sprays",
  "Bonus travel atomizer",
  "Personalized scent map",
  "Free shipping voucher"
];

const valueProps = [
  {
    title: "Build a custom box",
    description: "Pick four fragrances and get a curated layering guide."
  },
  {
    title: "Dermatologist tested",
    description: "Clean blends with transparent sourcing."
  },
  {
    title: "Long-wear oils",
    description: "8-12 hour projection without reapplication."
  }
];

const reviews = [
  {
    name: "Kriti",
    quote: "The trial set made it so easy to find my signature scent.",
    scent: "Salted Bloom"
  },
  {
    name: "Ayaan",
    quote: "Impressive longevity and the packaging is premium.",
    scent: "Velvet Night"
  },
  {
    name: "Nisha",
    quote: "I loved layering two oils. The guide is a great touch.",
    scent: "Bare Skin"
  }
];

const faqs = [
  {
    question: "How does the discovery set work?",
    answer:
      "Choose the trial set and receive six 2ml sprays plus a travel atomizer. Use the scent map to find your perfect match."
  },
  {
    question: "Can I return full-size bottles?",
    answer:
      "Unopened full-size bottles can be returned within 14 days. Discovery kits are final sale."
  },
  {
    question: "Do you ship across India?",
    answer:
      "Yes, we ship nationwide with express delivery in metro cities."
  }
];

export default async function HomePage() {
  let products = [];
  try {
    products = await getProducts();
  } catch (error) {
    console.error("Failed to load products:", error);
    products = [];
  }

  const heroProduct = products?.[0];
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const heroImageUrl = heroProduct?.images?.[0]
    ? `${baseURL}${heroProduct.images[0]}`
    : null;

  return (
    <div>
      <section className="container grid gap-10 pb-10 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.5em] text-black/50">
            Signature perfume sets
          </p>
          <h1 className="font-display text-4xl leading-tight md:text-5xl">
            Build your personal fragrance wardrobe in one clean box.
          </h1>
          <p className="max-w-xl text-black/60">
            Try on every mood. Start with a discovery set, then scale into full
            size bottles when the match is perfect.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white shadow-[0_15px_30px_rgba(15,23,42,0.25)]">
              Shop discovery set
            </button>
            <button className="rounded-full border border-black/20 bg-white/70 px-6 py-3 text-sm font-semibold">
              Build your box
            </button>
          </div>
          <div className="grid gap-4 text-sm text-black/60 md:grid-cols-3">
            <div>
              <p className="text-lg font-semibold text-ink">48 hr</p>
              <p>Dispatch window</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-ink">₹999+</p>
              <p>Free shipping</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-ink">4.9</p>
              <p>Store rating</p>
            </div>
          </div>
        </div>
        <ProductShowcase3D products={products} baseURL={baseURL} />
      </section>

      <section
        id="discovery"
        className="container grid gap-8 pb-16 pt-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"
      >
        <div className="rounded-3xl border border-white/40 bg-white/70 p-8 shadow-soft">
          <p className="text-xs uppercase tracking-[0.4em] text-black/40">
            Discovery set
          </p>
          <h2 className="mt-4 font-display text-3xl">
            6 scent trials + travel atomizer
          </h2>
          <p className="mt-4 text-sm text-black/60">
            Experience the entire library in one box. We include a scent map
            and layering recipes to find your signature.
          </p>
          <div className="mt-6 grid gap-3 text-xs text-black/60">
            {discoveryPerks.map((perk) => (
              <div
                key={perk}
                className="rounded-2xl border border-black/10 bg-white/80 px-4 py-3"
              >
                {perk}
              </div>
            ))}
          </div>
          <button className="mt-6 rounded-full bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white">
            Start trial
          </button>
        </div>
        <div className="rounded-3xl border border-white/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 p-8 text-white shadow-[0_25px_70px_rgba(15,23,42,0.35)]">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">
            Build a box
          </p>
          <h3 className="mt-4 font-display text-2xl">
            Choose four full-size perfumes and get a free sleeve.
          </h3>
          <p className="mt-4 text-sm text-white/70">
            Mix oils, sprays, and roll-ons. Create your own layering routine
            with guided pairing notes.
          </p>
          <div className="mt-6 grid gap-3 text-xs text-white/70">
            {valueProps.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3"
              >
                <p className="font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-white/60">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="collections" className="container pb-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl">Signature collections</h2>
            <p className="text-sm text-black/50">
              A drop-by-drop map of every mood.
            </p>
          </div>
          <button className="rounded-full border border-black/20 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.2em]">
            See all
          </button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {collectionHighlights.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-soft"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-black/40">
                {item.accent}
              </p>
              <h3 className="mt-3 font-display text-xl">{item.title}</h3>
              <p className="mt-2 text-sm text-black/60">{item.description}</p>
              <button className="mt-6 rounded-full border border-black/20 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.2em]">
                Explore
              </button>
            </div>
          ))}
        </div>
      </section>

      <section id="featured" className="container pb-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl">Featured products</h2>
            <p className="text-sm text-black/50">
              Sorted by newest arrivals and best sellers.
            </p>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="rounded-full border border-black/20 px-3 py-1">Fresh</span>
            <span className="rounded-full border border-black/20 px-3 py-1">Bold</span>
            <span className="rounded-full border border-black/20 px-3 py-1">Gifting</span>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {products?.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      <section className="container grid gap-8 pb-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.5em] text-black/50">
            3D rendering
          </p>
          <h2 className="font-display text-3xl">See every angle in 3D.</h2>
          <p className="text-sm text-black/60">
            Drag to rotate, zoom, and explore the silhouette before you buy.
            Perfect for premium packaging and collector drops.
          </p>
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1">
              WebGL ready
            </span>
            <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1">
              Touch controls
            </span>
          </div>
        </div>
        <ProductViewer3DEnhanced
          modelUrl={heroProduct?.model3D}
          imageUrl={heroImageUrl}
          productName={heroProduct?.name}
        />
      </section>

      <section id="reviews" className="container pb-16">
        <div className="mb-6">
          <h2 className="font-display text-2xl">Loved by scent collectors</h2>
          <p className="text-sm text-black/50">
            Real feedback from the discovery set.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-soft"
            >
              <p className="text-sm text-black/60">"{review.quote}"</p>
              <div className="mt-4 text-xs uppercase tracking-[0.3em] text-black/40">
                {review.name}
              </div>
              <div className="mt-2 text-xs text-black/50">{review.scent}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container pb-16">
        <div className="grid gap-8 rounded-3xl border border-white/30 bg-white/70 p-8 shadow-soft lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-black/40">
              FAQ
            </p>
            <h2 className="mt-4 font-display text-3xl">
              Everything you need to know
            </h2>
            <p className="mt-3 text-sm text-black/60">
              Shipping, returns, and how to choose your next scent.
            </p>
          </div>
          <div className="grid gap-4">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-black/10 bg-white/80 p-4"
              >
                <p className="text-sm font-semibold text-ink">{faq.question}</p>
                <p className="mt-2 text-sm text-black/60">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container pb-20">
        <div className="rounded-3xl border border-white/20 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-10 text-white shadow-[0_25px_70px_rgba(15,23,42,0.35)]">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                Ready to start?
              </p>
              <h2 className="mt-4 font-display text-3xl">
                Build your custom scent box today.
              </h2>
              <p className="mt-3 text-sm text-white/70">
                Choose your trial set now and get a voucher for your next full
                size bottle.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-ink">
                Start discovery
              </button>
              <button className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white">
                View bundles
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
