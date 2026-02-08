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
      {/* Hero: Product Image Carousel */}
      <section className="container py-12">
        <ProductShowcase3D products={products} baseURL={baseURL} />
      </section>

      {/* Main Hero Section */}
      <section className="container grid gap-8 pb-10 pt-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.5em] text-black/50">
            Futuristic storefront
          </p>
          <h1 className="font-display text-4xl leading-tight md:text-5xl">
            A next-gen perfume studio built for immersive commerce.
          </h1>
          <p className="max-w-xl text-black/60">
            Curated collections, instant checkout, and a premium product
            experience. Blend story, motion, and detail without losing speed.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white shadow-[0_15px_30px_rgba(15,23,42,0.25)]">
              Shop latest
            </button>
            <button className="rounded-full border border-black/20 bg-white/70 px-6 py-3 text-sm font-semibold">
              View catalog
            </button>
          </div>
          <div className="grid gap-4 text-sm text-black/60 md:grid-cols-3">
            <div>
              <p className="text-lg font-semibold text-ink">48 hr</p>
              <p>Dispatch window</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-ink">â‚¹999+</p>
              <p>Free shipping</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-ink">4.9</p>
              <p>Store rating</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-white/40 bg-white/60 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur">
          <h3 className="font-display text-xl">Signal the collection</h3>
          <p className="mt-3 text-sm text-black/60">
            Limited drops, long-lasting impressions. Keep your hero copy short
            and powerful to move buyers deeper into the catalog.
          </p>
          <div className="mt-6 grid gap-3 text-xs text-black/60">
            <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-black/40">
                Drop cycle
              </p>
              <p className="mt-2 text-lg font-semibold text-ink">Every 21 days</p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-black/40">
                Limited stock
              </p>
              <p className="mt-2 text-lg font-semibold text-ink">320 bottles</p>
            </div>
          </div>
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

      {/* 3D Rendering Lower Section */}
      <section className="container grid gap-8 pb-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.5em] text-black/50">
            3D rendering
          </p>
          <h2 className="font-display text-3xl">Drop the product into 3D.</h2>
          <p className="text-sm text-black/60">
            Keep the 3D viewer lower on the page so shoppers discover it after
            seeing the real imagery first. Drag to rotate, zoom, and explore
            the full silhouette.
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
    </div>
  );
}
