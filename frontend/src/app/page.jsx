import ProductCard from "../components/ProductCard.jsx";
import ProductShowcase3D from "../components/ProductShowcase3D.jsx";
import { getProducts } from "../services/api.js";

export const dynamic = "force-dynamic";

const trialSets = [
  {
    title: "For Her",
    description: "Soft florals, warm vanilla, and airy musk.",
    image:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "For Him",
    description: "Spice, cedarwood, and smoky amber.",
    image:
      "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Unisex",
    description: "Citrus, tea, and clean musk blends.",
    image:
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=1200&auto=format&fit=crop"
  }
];

const collectionCards = [
  {
    title: "Trial Set",
    description: "6 x 2ml sprays + travel atomizer.",
    tag: "Starter kit"
  },
  {
    title: "Build a Box",
    description: "Choose four scents and get a sleeve.",
    tag: "Custom"
  },
  {
    title: "Gift Sets",
    description: "Ready-to-gift bundles for every mood.",
    tag: "Gifting"
  },
  {
    title: "Long Wear",
    description: "10-12 hour projection, no reapply.",
    tag: "Performance"
  }
];

const reviews = [
  {
    name: "Ria",
    quote: "The trial pack made it easy to choose my signature scent."
  },
  {
    name: "Kabir",
    quote: "Strong projection and the packaging feels premium."
  },
  {
    name: "Zoya",
    quote: "Loved the buy 1 get 1 offer and the fragrances last long."
  }
];

const faqs = [
  {
    question: "What comes in the trial set?",
    answer:
      "Six 2ml sprays plus a travel atomizer and a layering guide."
  },
  {
    question: "How long does delivery take?",
    answer:
      "Metro cities receive orders in 2-4 days. Other locations in 4-6 days."
  },
  {
    question: "Is there a return policy?",
    answer:
      "Unopened full-size bottles can be returned within 14 days of delivery."
  }
];

const fallbackProducts = [
  {
    _id: "fallback-1",
    name: "Velvet Nectar",
    category: "Amber • Vanilla",
    price: 1299,
    images: [
      "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    _id: "fallback-2",
    name: "Citrus Veil",
    category: "Neroli • Bergamot",
    price: 1099,
    images: [
      "https://images.unsplash.com/photo-1506917728037-b6af01a7d403?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    _id: "fallback-3",
    name: "Midnight Oud",
    category: "Oud • Saffron",
    price: 1499,
    images: [
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1200&auto=format&fit=crop"
    ]
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

  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const displayProducts = products?.length ? products : fallbackProducts;

  return (
    <div>
      <section className="container grid gap-10 pb-10 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.5em] text-black/50">
            Buy 1 get 1 live
          </p>
          <h1 className="font-display text-4xl leading-tight md:text-5xl">
            A clean perfume wardrobe built for gifting and daily wear.
          </h1>
          <p className="max-w-xl text-black/60">
            Discover trial packs, long-lasting blends, and easy returns. Free
            shipping above ₹399 on all orders.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white shadow-[0_15px_30px_rgba(15,23,42,0.25)]">
              Shop now
            </button>
            <button className="rounded-full border border-black/20 bg-white/70 px-6 py-3 text-sm font-semibold">
              View trial set
            </button>
          </div>
          <div className="grid gap-4 text-sm text-black/60 md:grid-cols-3">
            <div>
              <p className="text-lg font-semibold text-ink">10-12 hr</p>
              <p>Long lasting wear</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-ink">₹399+</p>
              <p>Free shipping</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-ink">B1G1</p>
              <p>Limited offers</p>
            </div>
          </div>
        </div>
        <ProductShowcase3D products={products} baseURL={baseURL} />
      </section>

      <section id="trial" className="container pb-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl">Trial packs for every mood</h2>
            <p className="text-sm text-black/50">
              Choose a set for her, him, or unisex.
            </p>
          </div>
          <button className="rounded-full border border-black/20 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.2em]">
            Explore packs
          </button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {trialSets.map((set) => (
            <div
              key={set.title}
              className="overflow-hidden rounded-3xl border border-white/40 bg-white/70 shadow-soft"
            >
              <img src={set.image} alt={set.title} className="h-52 w-full object-cover" />
              <div className="p-6">
                <h3 className="font-display text-xl">{set.title}</h3>
                <p className="mt-2 text-sm text-black/60">{set.description}</p>
                <button className="mt-4 rounded-full border border-black/20 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.2em]">
                  Shop trial
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="collection" className="container pb-16">
        <div className="mb-6">
          <h2 className="font-display text-2xl">Our collection</h2>
          <p className="text-sm text-black/50">
            Curated sets, bundles, and long-wear favorites.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {collectionCards.map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-soft"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-black/40">
                {card.tag}
              </p>
              <h3 className="mt-3 font-display text-lg">{card.title}</h3>
              <p className="mt-2 text-sm text-black/60">{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="featured" className="container pb-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl">Best sellers</h2>
            <p className="text-sm text-black/50">
              Most loved by shoppers this week.
            </p>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="rounded-full border border-black/20 px-3 py-1">Fresh</span>
            <span className="rounded-full border border-black/20 px-3 py-1">Bold</span>
            <span className="rounded-full border border-black/20 px-3 py-1">Gifting</span>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {displayProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      <section id="bogo" className="container pb-16">
        <div className="grid gap-8 rounded-3xl border border-white/30 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-8 text-white shadow-[0_25px_70px_rgba(15,23,42,0.35)] lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">
              Limited offer
            </p>
            <h2 className="mt-4 font-display text-3xl">
              Buy 1 get 1 on full-size perfumes.
            </h2>
            <p className="mt-3 text-sm text-white/70">
              Mix two scents or gift one. Applies to select bundles and
              bestsellers.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-ink">
              Claim offer
            </button>
            <button className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white">
              View bundles
            </button>
          </div>
        </div>
      </section>

      <section id="reviews" className="container pb-16">
        <div className="mb-6">
          <h2 className="font-display text-2xl">Loved by a growing tribe</h2>
          <p className="text-sm text-black/50">
            Real feedback from new customers.
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
            </div>
          ))}
        </div>
      </section>

      <section id="faqs" className="container pb-16">
        <div className="grid gap-8 rounded-3xl border border-white/30 bg-white/70 p-8 shadow-soft lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-black/40">
              FAQ
            </p>
            <h2 className="mt-4 font-display text-3xl">
              Questions about scent & shipping
            </h2>
            <p className="mt-3 text-sm text-black/60">
              Everything you need to know before you order.
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
                Shop bundles
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
