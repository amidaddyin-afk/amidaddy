import Link from "next/link";
import ProductPreview3D from "./ProductPreview3D.jsx";

export default function ProductCard({ product }) {
  // Construct full image URL
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const imageUrl = product.images?.[0] 
    ? `${baseURL}${product.images[0]}` 
    : null;

  return (
    <Link
      href={`/product/${product._id}`}
      className="group rounded-3xl bg-white p-5 shadow-soft transition hover:-translate-y-1"
    >
      <div className="mb-4 h-44 overflow-hidden rounded-2xl bg-sand/70">
        {product.model3D ? (
          <ProductPreview3D modelUrl={product.model3D} />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-black/40">
            No image
          </div>
        )}
      </div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg">{product.name}</h3>
          <p className="text-sm text-black/50">{product.category}</p>
        </div>
        {product.model3D && (
          <span className="rounded-full bg-black px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white">
            3D
          </span>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="font-semibold text-clay">₹{product.price}</span>
        <span className="text-xs text-black/40">View</span>
      </div>
    </Link>
  );
}
