import Link from "next/link";
export default function ProductCard({ product }) {
  // Construct full image URL
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const rawImage = product.images?.[0] ?? null;
  const imageUrl = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${baseURL}${rawImage}`
    : null;
  const fallbackImages = [
    "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506917728037-b6af01a7d403?q=80&w=1200&auto=format&fit=crop"
  ];
  const fallbackImage = fallbackImages[product?._id?.length % fallbackImages.length] ?? fallbackImages[0];

  return (
    <Link
      href={`/product/${product._id}`}
      className="group rounded-3xl border border-white/40 bg-white/70 p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(14,165,164,0.18)]"
    >
      <div className="mb-4 h-44 overflow-hidden rounded-2xl bg-sand/70">
        <img
          src={imageUrl || fallbackImage}
          alt={product.name}
          className="h-full w-full rounded-2xl object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg">{product.name}</h3>
          <p className="text-sm text-black/50">{product.category}</p>
        </div>
        <span className="rounded-full bg-ink px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white">
          Best seller
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="font-semibold text-clay">₹{product.price}</span>
        <span className="text-xs text-black/40">View</span>
      </div>
    </Link>
  );
}
