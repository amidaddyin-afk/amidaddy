import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import type { Metadata } from "next";
import ProductDetail from "@/components/ProductDetail";
import { getCatalogProductBySlug } from "@/lib/catalog";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://amidaddy.in";

const toAbsolute = (path: string) =>
  path.startsWith("http") ? path : `${SITE_URL}${path}`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) return {};

  // Unique, per-product title and description so no two product pages inherit
  // the site-wide default. The "· Amidaddy Perfumes" suffix comes from the
  // title template in the root layout.
  const title = `${product.name} · ${product.profile} ${product.concentration}`;
  const description =
    `${product.name}: ${product.profile} ${product.concentration} with notes of ${product.notes}. ` +
    `${product.mood}. Longevity ${product.longevity}. Unisex fragrance from Amidaddy Perfumes.`;
  const canonical = `${SITE_URL}/products/${product.slug}`;
  const ogImage = {
    url: toAbsolute(product.image),
    alt: `${product.name} ${product.concentration} by Amidaddy Perfumes`,
  };

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "Amidaddy Perfumes",
      title: `${title} · Amidaddy Perfumes`,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · Amidaddy Perfumes`,
      description,
      images: [ogImage.url],
    },
  };
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
  const siteUrl = SITE_URL;
  const image = toAbsolute(product.image);
  const jsonLd = JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      image: product.images.map((item) => toAbsolute(item)),
      brand: { "@type": "Brand", name: "Amidaddy Perfumes" },
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
      {/* Pairs with the wrapper on /shop: shop -> product slides forward,
          the "All fragrances" link back slides in reverse. Untyped arrivals
          (home, a shared link) fall through to default="none" and just get
          the shared-element image morph. */}
      <ViewTransition
        enter={{
          "nav-forward": "nav-forward",
          "nav-back": "nav-back",
          default: "none",
        }}
        exit={{
          "nav-forward": "nav-forward",
          "nav-back": "nav-back",
          default: "none",
        }}
        default="none"
      >
        <ProductDetail product={product} initialSize={initialSize} />
      </ViewTransition>
    </>
  );
}
