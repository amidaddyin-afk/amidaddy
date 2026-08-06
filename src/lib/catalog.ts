import "server-only";

import type { Product } from "@/lib/data";
import { PRODUCTS } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type {
  productInputSchema,
  productListQuerySchema,
} from "@/features/catalog/schemas";
import type { z } from "zod";

type ProductInput = z.infer<typeof productInputSchema>;
type ListQuery = z.infer<typeof productListQuerySchema>;

const configured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

function mapProduct(product: Record<string, unknown>): Product {
  const images = (
    (product.product_images as Array<{
      url: string;
      position?: number;
    }> | null) ?? []
  ).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const variants = (
    (product.product_variants as Array<Record<string, unknown>> | null) ?? []
  ).map((variant) => ({
    id: String(variant.id),
    name: String(variant.name) as "20ml" | "100ml",
    sku: String(variant.sku),
    pricePaise: Number(variant.price_paise),
    mrpPaise: Number(variant.mrp_paise),
    stock: Number(variant.stock),
    reserved: Number(variant.reserved),
    lowStockAt: Number(variant.low_stock_at),
    active: Boolean(variant.active),
  }));
  const defaultVariant =
    variants.find((variant) => variant.name === "100ml") ?? variants[0];
  const topNotes = (product.top_notes as string[] | null) ?? [];
  const heartNotes = (product.heart_notes as string[] | null) ?? [];
  const baseNotes = (product.base_notes as string[] | null) ?? [];
  const slug = String(product.slug);
  const fallback = PRODUCTS.find((item) => item.slug === slug);
  return {
    id: String(product.id),
    slug,
    name: String(product.name),
    image: images[0]?.url ?? fallback?.image ?? "/curated/billionaire.JPG",
    images: images.length
      ? images.map((item) => item.url)
      : (fallback?.images ?? []),
    profile: (product.fragrance_family ??
      fallback?.profile ??
      "Woody") as Product["profile"],
    concentration: String(product.concentration ?? "Eau de Parfum"),
    genderPositioning: String(product.gender_positioning ?? "Unisex"),
    topNotes,
    heartNotes,
    baseNotes,
    notes: [...topNotes, ...heartNotes, ...baseNotes].slice(0, 3).join(" · "),
    longevity: String(product.longevity ?? ""),
    mood: String(product.mood ?? ""),
    occasion: String(product.occasion ?? ""),
    description: String(product.description),
    story: String(product.story ?? product.description),
    badge: Boolean(product.best_seller) ? "Bestseller" : undefined,
    isNew: Boolean(product.is_new),
    featured: Boolean(product.featured),
    active: Boolean(product.active),
    variants,
    price: Math.round(
      (defaultVariant?.pricePaise ?? Number(product.selling_price) * 100) / 100,
    ),
    originalPrice: Math.round(
      (defaultVariant?.mrpPaise ?? Number(product.mrp) * 100) / 100,
    ),
    stock: variants.reduce(
      (sum, variant) => sum + Math.max(0, variant.stock - variant.reserved),
      0,
    ),
    collection: "unisex",
  };
}

function fallbackProducts(query: ListQuery) {
  let products = PRODUCTS.filter((product) => product.active);
  if (query.search) {
    const needle = query.search.toLowerCase();
    products = products.filter((product) =>
      `${product.name} ${product.notes} ${product.mood}`
        .toLowerCase()
        .includes(needle),
    );
  }
  if (query.family)
    products = products.filter((product) => product.profile === query.family);
  if (query.size)
    products = products.filter((product) =>
      product.variants.some(
        (variant) =>
          variant.name === query.size &&
          variant.active &&
          variant.stock > variant.reserved,
      ),
    );
  if (query.inStock === "true")
    products = products.filter((product) => product.stock > 0);
  if (query.minPrice !== undefined)
    products = products.filter((product) => product.price >= query.minPrice!);
  if (query.maxPrice !== undefined)
    products = products.filter((product) => product.price <= query.maxPrice!);
  products = [...products].sort(
    query.sort === "price_asc"
      ? (a, b) => a.price - b.price
      : query.sort === "price_desc"
        ? (a, b) => b.price - a.price
        : query.sort === "name"
          ? (a, b) => a.name.localeCompare(b.name)
          : () => 0,
  );
  const start = (query.page - 1) * query.pageSize;
  return {
    products: products.slice(start, start + query.pageSize),
    total: products.length,
    page: query.page,
    pageSize: query.pageSize,
  };
}

function unavailableProducts(query: ListQuery) {
  return process.env.NODE_ENV === "production"
    ? { products: [], total: 0, page: query.page, pageSize: query.pageSize }
    : fallbackProducts(query);
}

export async function listCatalogProducts(query: ListQuery) {
  if (!configured()) return unavailableProducts(query);
  const supabase = await createClient();
  const start = (query.page - 1) * query.pageSize;
  let request = supabase
    .from("products")
    .select("*, product_images(url, position), product_variants(*)", {
      count: "exact",
    })
    .eq("active", true)
    .is("deleted_at", null);
  if (query.search)
    request = request.or(
      `name.ilike.%${query.search.replace(/[%,_]/g, "")}%,description.ilike.%${query.search.replace(/[%,_]/g, "")}%`,
    );
  if (query.family) request = request.eq("fragrance_family", query.family);
  if (query.minPrice !== undefined)
    request = request.gte("selling_price", query.minPrice);
  if (query.maxPrice !== undefined)
    request = request.lte("selling_price", query.maxPrice);
  if (query.sort === "price_asc")
    request = request.order("selling_price", { ascending: true });
  else if (query.sort === "price_desc")
    request = request.order("selling_price", { ascending: false });
  else if (query.sort === "name")
    request = request.order("name", { ascending: true });
  else request = request.order("created_at", { ascending: false });
  const { data, error, count } = await request.range(
    start,
    start + query.pageSize - 1,
  );
  if (error) return unavailableProducts(query);
  let products = (data ?? []).map((item) =>
    mapProduct(item as Record<string, unknown>),
  );
  if (query.size)
    products = products.filter((product) =>
      product.variants.some(
        (variant) => variant.name === query.size && variant.active,
      ),
    );
  if (query.inStock === "true")
    products = products.filter((product) => product.stock > 0);
  return {
    products,
    total: count ?? products.length,
    page: query.page,
    pageSize: query.pageSize,
  };
}

export async function getCatalogProductBySlug(slug: string) {
  if (!configured())
    return process.env.NODE_ENV === "production"
      ? null
      : (PRODUCTS.find((product) => product.slug === slug) ?? null);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(url, position), product_variants(*)")
    .eq("slug", slug)
    .eq("active", true)
    .is("deleted_at", null)
    .maybeSingle();
  if (error || !data)
    return process.env.NODE_ENV === "production"
      ? null
      : (PRODUCTS.find((product) => product.slug === slug) ?? null);
  return mapProduct(data as Record<string, unknown>);
}

export async function listAdminProducts() {
  if (!configured()) {
    if (process.env.NODE_ENV === "production")
      throw new Error("The PostgreSQL catalog is not configured.");
    return PRODUCTS;
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(url, position), product_variants(*)")
    .order("created_at", { ascending: false });
  if (error) throw new Error("Unable to load products.");
  return (data ?? []).map((item) =>
    mapProduct(item as Record<string, unknown>),
  );
}

export async function createCatalogProduct(input: ProductInput) {
  const supabase = await createClient();
  const { images, variants, ...product } = input;
  const defaultVariant =
    variants.find((variant) => variant.name === "100ml") ?? variants[0];
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      barcode: product.barcode || null,
      description: product.description,
      mrp: defaultVariant.mrpPaise / 100,
      selling_price: defaultVariant.pricePaise / 100,
      gst_rate: product.gstRate,
      stock: variants.reduce((sum, item) => sum + item.stock, 0),
      active: product.active,
      featured: product.featured,
      is_new: product.isNew,
      best_seller: product.bestSeller,
      seo_title: product.seoTitle || null,
      seo_description: product.seoDescription || null,
      brand_id: product.brandId || null,
      category_id: product.categoryId || null,
      fragrance_family: product.fragranceFamily,
      concentration: product.concentration,
      gender_positioning: product.genderPositioning,
      top_notes: product.topNotes,
      heart_notes: product.heartNotes,
      base_notes: product.baseNotes,
      longevity: product.longevity,
      mood: product.mood,
      occasion: product.occasion,
      story: product.story,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error("Unable to create the product.");
  const [imageResult, variantResult] = await Promise.all([
    supabase.from("product_images").insert(
      images.map((image, position) => ({
        product_id: data.id,
        url: image.url,
        alt: image.alt,
        position,
      })),
    ),
    supabase.from("product_variants").insert(
      variants.map((variant) => ({
        product_id: data.id,
        name: variant.name,
        sku: variant.sku,
        price_paise: variant.pricePaise,
        mrp_paise: variant.mrpPaise,
        stock: variant.stock,
        low_stock_at: variant.lowStockAt,
        active: variant.active,
      })),
    ),
  ]);
  if (imageResult.error || variantResult.error)
    throw new Error(
      "Product created but its media or variants could not be saved.",
    );
  return data.id;
}

export async function updateCatalogProduct(id: string, input: ProductInput) {
  const supabase = await createClient();
  const { images, variants, ...product } = input;
  const defaultVariant =
    variants.find((variant) => variant.name === "100ml") ?? variants[0];
  const { error } = await supabase
    .from("products")
    .update({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      barcode: product.barcode || null,
      description: product.description,
      mrp: defaultVariant.mrpPaise / 100,
      selling_price: defaultVariant.pricePaise / 100,
      gst_rate: product.gstRate,
      active: product.active,
      featured: product.featured,
      is_new: product.isNew,
      best_seller: product.bestSeller,
      seo_title: product.seoTitle || null,
      seo_description: product.seoDescription || null,
      fragrance_family: product.fragranceFamily,
      concentration: product.concentration,
      gender_positioning: product.genderPositioning,
      top_notes: product.topNotes,
      heart_notes: product.heartNotes,
      base_notes: product.baseNotes,
      longevity: product.longevity,
      mood: product.mood,
      occasion: product.occasion,
      story: product.story,
    })
    .eq("id", id);
  if (error) throw new Error("Unable to update the product.");
  const imageDelete = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", id);
  if (imageDelete.error) throw new Error("Unable to update product media.");
  const imageResult = await supabase.from("product_images").insert(
    images.map((image, position) => ({
      product_id: id,
      url: image.url,
      alt: image.alt,
      position,
    })),
  );
  if (imageResult.error) throw new Error("Unable to update product media.");

  // Never delete variants while an order may reference or reserve them. Updating
  // the stable row keeps inventory reservations and historical links intact.
  for (const variant of variants) {
    const values = {
      product_id: id,
      name: variant.name,
      sku: variant.sku,
      price_paise: variant.pricePaise,
      mrp_paise: variant.mrpPaise,
      stock: variant.stock,
      low_stock_at: variant.lowStockAt,
      active: variant.active,
    };
    const result = variant.id
      ? await supabase
          .from("product_variants")
          .update(values)
          .eq("id", variant.id)
          .eq("product_id", id)
      : await supabase.from("product_variants").insert(values);
    if (result.error)
      throw new Error(
        "Unable to update a variant. Stock cannot be set below its reserved quantity.",
      );
  }
}

export async function softDeleteCatalogProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString(), active: false })
    .eq("id", id);
  if (error) throw new Error("Unable to delete the product.");
}
export async function restoreCatalogProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ deleted_at: null })
    .eq("id", id);
  if (error) throw new Error("Unable to restore the product.");
}
