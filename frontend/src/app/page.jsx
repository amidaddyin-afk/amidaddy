import ProductCard from "../components/ProductCard.jsx";
import ProductShowcase3D from "../components/ProductShowcase3D.jsx";
import { getProducts } from "../services/api.js";

export const dynamic = "force-dynamic";

const collectionCards = [
  {
    title: "Trial Set",
    description: "Start with small sizes before you commit."
  },
  {
    title: "Daily Wear",
    description: "Clean scents for everyday use."
  },
  {
    title: "Gift Box",
    description: "Minimal packaging, ready to gift."
  }
];

const fallbackProducts = [
  {
    _id: "fallback-1",
    name: "Velvet Nectar",
    category: "Amber - Vanilla",
    price: 1299,
    images: [
      "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    _id: "fallback-2",
    name: "Citrus Veil",
    category: "Neroli - Bergamot",
    price: 1099,
    images: [
      "https://images.unsplash.com/photo-1506917728037-b6af01a7d403?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    _id: "fallback-3",
    name: "Midnight Oud",
    category: "Oud - Saffron",
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
    <div className="pb-16">
      <section className="container grid gap-8 py-12 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.25em] text-black/45">Minimal Perfume Store</p>
          <h1 className="font-display text-4xl leading-tight md:text-5xl">
            Everyday scents.
            <br />
            Clean look. No clutter.
          </h1>
          <p className="max-w-lg text-black/60">
            Discover lasting fragrances and trial sets with free shipping above INR 699.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white">
              Shop now
            </button>
            <button className="rounded-full border border-black/15 px-6 py-3 text-sm font-semibold">
              View trial set
            </button>
          </div>
        </div>
        <ProductShowcase3D products={products} baseURL={baseURL} />
      </section>

      <section id="collection" className="container py-10">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Collection</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {collectionCards.map((card) => (
            <div key={card.title} className="rounded-2xl border border-black/10 bg-white p-6">
              <h3 className="text-lg font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm text-black/60">{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="featured" className="container py-10">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Best Sellers</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {displayProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      <section className="container pt-10">
        <div className="grid gap-4 rounded-2xl border border-black/10 bg-white p-6 text-sm text-black/70 md:grid-cols-3">
          <p>Long-lasting blends</p>
          <p>Free shipping over INR 699</p>
          <p>Easy returns on unopened bottles</p>
        </div>
      </section>
    </div>
  );
}
