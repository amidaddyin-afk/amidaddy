import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getCatalogProductBySlug } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) notFound();
  return <main className="min-h-screen bg-black px-6 pt-32"><div className="mx-auto max-w-md"><ProductCard product={product} index={0} /></div></main>;
}
