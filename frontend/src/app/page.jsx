import ProductCard from "../components/ProductCard.jsx";
import ProductViewer3DEnhanced from "../components/ProductViewer3DEnhanced.jsx";
import ProductShowcase3D from "../components/ProductShowcase3D.jsx";
import { getProducts } from "../services/api.js";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let products = [];
  try {
    products = await getProducts();
  } catch (error) {
    console.error("Failed to load products:", error);
    products = [];
  }
  const heroProduct = products?.[0];
  
  // Construct full image URL for hero product
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const heroImageUrl = heroProduct?.images?.[0] 
    ? `${baseURL}${heroProduct.images[0]}` 
    : null;

  return (
    <div>
      {/* 3D Showcase Hero */}
      <section className="container py-8">
        <ProductShowcase3D />
      </section>

      {/* Main Hero Section */}
      <section className="container grid gap-8 py-16 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.4em] text-black/40">
            Shopify-like storefront
          </p>
          <h1 className="font-display text-4xl leading-tight md:text-5xl">
            Build your presence with an immersive 3D perfume catalog.
          </h1>
          <p className="max-w-xl text-black/60">
            Curated collections, instant checkout, and a premium 3D product
            experience. Showcase every angle with hover, drag, and zoom.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-full bg-clay px-6 py-3 text-sm font-semibold text-white">
              Shop latest
            </button>
            <button className="rounded-full border border-black/20 px-6 py-3 text-sm font-semibold">
              View 3D catalog
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
        <div className="flex items-center justify-center">
          <ProductViewer3DEnhanced
            modelUrl={heroProduct?.model3D}
            imageUrl={heroImageUrl}
            productName={heroProduct?.name}
          />
        </div>
      </section>

      {/* Featured Products */}
      <section className="container pb-16">
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
    </div>
  );
}
