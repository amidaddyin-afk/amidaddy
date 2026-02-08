import { getProduct } from "../../../services/api.js";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }) {
  let product = null;
  try {
    product = await getProduct(params.id);
  } catch (error) {
    console.error("Failed to load product:", error);
  }

  if (!product) {
    return (
      <div className="container py-16">
        <h1 className="font-display text-2xl">Product unavailable</h1>
        <p className="mt-2 text-black/60">
          We could not load this product right now. Please try again later.
        </p>
      </div>
    );
  }

  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const productImages =
    product.images?.length > 0
      ? product.images.map((img) => (img.startsWith("http") ? img : `${baseURL}${img}`))
      : [
          "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1506917728037-b6af01a7d403?q=80&w=1200&auto=format&fit=crop"
        ];
  const heroImage = productImages[0];

  return (
    <div className="container grid gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <div className="overflow-hidden rounded-3xl border border-white/40 bg-white/70 shadow-soft">
          <img src={heroImage} alt={product.name} className="h-[420px] w-full object-cover" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {productImages.slice(0, 3).map((img, index) => (
            <div
              key={`${img}-${index}`}
              className="overflow-hidden rounded-2xl border border-white/40 bg-white/70"
            >
              <img src={img} alt={`${product.name} ${index + 1}`} className="h-28 w-full object-cover" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-black/40">
            Eau de parfum
          </p>
          <h1 className="font-display text-3xl">{product.name}</h1>
          <p className="text-black/60">{product.description}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-soft">
          <p className="text-2xl font-semibold text-clay">₹{product.price}</p>
          <p className="text-sm text-black/50">Inclusive of all taxes</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="rounded-full bg-clay px-6 py-3 text-sm font-semibold text-white">
              Add to cart
            </button>
            <button className="rounded-full border border-black/20 px-6 py-3 text-sm font-semibold">
              Buy now
            </button>
          </div>
        </div>
        <div className="grid gap-3 text-sm text-black/60 md:grid-cols-2">
          <div className="rounded-2xl bg-sand/70 p-4">
            <p className="font-semibold text-ink">Category</p>
            <p>{product.category}</p>
          </div>
          <div className="rounded-2xl bg-sand/70 p-4">
            <p className="font-semibold text-ink">Stock</p>
            <p>{product.stock} units</p>
          </div>
        </div>
      </div>
    </div>
  );
}
