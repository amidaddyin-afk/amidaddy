import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetail from "@/components/ProductDetail";
import { getCatalogProductBySlug } from "@/lib/catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  return product
    ? { title: product.name, description: product.description }
    : {};
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ size?: string | string[] }>;
}) {
  const { slug } = await params;
  const requestedSize = (await searchParams).size;
  const initialSize =
    requestedSize === "20ml" || requestedSize === "100ml"
      ? requestedSize
      : undefined;
  const product = await getCatalogProductBySlug(slug);
  if (!product) notFound();
  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://amidaddy.in";
  const image = product.image.startsWith("http")
    ? product.image
    : `${siteUrl}${product.image}`;
  const jsonLd = JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      image: product.images.map((item) =>
        item.startsWith("http") ? item : `${siteUrl}${item}`,
      ),
      brand: { "@type": "Brand", name: "Amidaddy" },
      category: "Perfume",
      offers: product.variants.map((variant) => ({
        "@type": "Offer",
        url: `${siteUrl}/products/${product.slug}`,
        priceCurrency: "INR",
        price: (variant.pricePaise / 100).toFixed(2),
        availability:
          variant.active && variant.stock > variant.reserved
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        sku: variant.sku,
        image,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        {
          "@type": "ListItem",
          position: 2,
          name: "Shop",
          item: `${siteUrl}/shop`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: product.name,
          item: `${siteUrl}/products/${product.slug}`,
        },
      ],
    },
  ]).replace(/</g, "\\u003c");
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <ProductDetail product={product} initialSize={initialSize} />
    </>
  );
}
