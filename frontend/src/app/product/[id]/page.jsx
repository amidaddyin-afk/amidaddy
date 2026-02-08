import ProductViewer3DEnhanced from "../../../components/ProductViewer3DEnhanced.jsx";
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
  
  // Construct full image URL
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const imageUrl = product.images?.[0] 
    ? `${baseURL}${product.images[0]}` 
    : null;

  return (
    <div className="container grid gap-10 py-14 lg:grid-cols-[1fr_1.1fr]">
      <ProductViewer3DEnhanced 
        modelUrl={product.model3D} 
        imageUrl={imageUrl} 
        productName={product.name}
      />
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
