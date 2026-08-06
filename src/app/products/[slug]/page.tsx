import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import { CURATED_GALLERIES, getCuratedProduct } from "@/lib/curated-products";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getCuratedProduct(slug);
  const images = CURATED_GALLERIES[slug];

  if (!product || !images) notFound();
  return <ProductDetail product={product} images={images} />;
}
