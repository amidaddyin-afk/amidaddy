import Link from "next/link";

export default function ProductCard({ product }) {
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
      className="rounded-2xl border border-black/10 bg-white p-4 transition hover:border-black/30"
    >
      <div className="mb-4 h-44 overflow-hidden rounded-xl bg-sand">
        <img
          src={imageUrl || fallbackImage}
          alt={product.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold">{product.name}</h3>
        <p className="text-sm text-black/55">{product.category}</p>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="font-semibold text-ink">INR {product.price}</span>
        <span className="text-black/45">View</span>
      </div>
    </Link>
  );
}
