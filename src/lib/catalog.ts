import "server-only";

import type { Product } from "@/lib/data";
import { PRODUCTS } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { productInputSchema, productListQuerySchema } from "@/features/catalog/schemas";
import type { z } from "zod";

type ProductInput = z.infer<typeof productInputSchema>;
type ListQuery = z.infer<typeof productListQuerySchema>;

const configured = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

function mapProduct(product: Record<string, unknown>): Product {
  const images = product.product_images as Array<{ url: string }> | null;
  return {
    id: String(product.id), name: String(product.name), price: Number(product.offer_price ?? product.selling_price), originalPrice: Number(product.mrp),
    image: images?.[0]?.url ?? "/hero1.png", profile: "Woody", collection: "luxury", notes: "", longevity: "", mood: "", description: String(product.description),
    stock: Number(product.stock) - Number(product.reserved ?? 0), active: Boolean(product.active), isNew: Boolean(product.is_new), badge: Boolean(product.best_seller) ? "Bestseller" : undefined,
  };
}

export async function listCatalogProducts(query: ListQuery) {
  if (!configured()) {
    const products = PRODUCTS.filter((product) => product.active && product.stock > 0);
    return { products, total: products.length, page: 1, pageSize: products.length };
  }
  const supabase = await createClient();
  const start = (query.page - 1) * query.pageSize;
  let request = supabase.from("products").select("*, product_images(url, position), categories!products_category_id_fkey(slug), brands!products_brand_id_fkey(slug)", { count: "exact" }).eq("active", true).is("deleted_at", null);
  if (query.search) request = request.ilike("name", `%${query.search.replace(/[%,_]/g, "\\$&")}%`);
  if (query.minPrice !== undefined) request = request.gte("selling_price", query.minPrice);
  if (query.maxPrice !== undefined) request = request.lte("selling_price", query.maxPrice);
  if (query.inStock === "true") request = request.gt("stock", 0);
  if (query.sort === "price_asc") request = request.order("selling_price", { ascending: true });
  else if (query.sort === "price_desc") request = request.order("selling_price", { ascending: false });
  else if (query.sort === "name") request = request.order("name", { ascending: true });
  else request = request.order("created_at", { ascending: false });
  const { data, error, count } = await request.range(start, start + query.pageSize - 1);
  if (error) throw new Error("Unable to load the product catalog.");
  return { products: (data ?? []).map((product) => mapProduct(product as Record<string, unknown>)), total: count ?? 0, page: query.page, pageSize: query.pageSize };
}

export async function createCatalogProduct(input: ProductInput) {
  const supabase = await createClient();
  const { images, ...product } = input;
  const { data, error } = await supabase.from("products").insert({
    name: product.name, slug: product.slug, sku: product.sku, barcode: product.barcode || null, description: product.description, mrp: product.mrp,
    selling_price: product.sellingPrice, offer_price: product.offerPrice || null, gst_rate: product.gstRate, stock: product.stock, low_stock_at: product.lowStockAt,
    active: product.active, featured: product.featured, is_new: product.isNew, best_seller: product.bestSeller, seo_title: product.seoTitle || null,
    seo_description: product.seoDescription || null, brand_id: product.brandId || null, category_id: product.categoryId || null,
  }).select("id").single();
  if (error || !data) throw new Error("Unable to create the product.");
  const imageResult = await supabase.from("product_images").insert(images.map((image, position) => ({ product_id: data.id, url: image.url, alt: image.alt, position })));
  if (imageResult.error) throw new Error("Product created but images could not be saved.");
  return data.id;
}

export async function updateCatalogProduct(id: string, input: ProductInput) {
  const supabase = await createClient();
  const { images, ...product } = input;
  const { error } = await supabase.from("products").update({
    name: product.name, slug: product.slug, sku: product.sku, barcode: product.barcode || null, description: product.description, mrp: product.mrp,
    selling_price: product.sellingPrice, offer_price: product.offerPrice || null, gst_rate: product.gstRate, stock: product.stock, low_stock_at: product.lowStockAt,
    active: product.active, featured: product.featured, is_new: product.isNew, best_seller: product.bestSeller, seo_title: product.seoTitle || null,
    seo_description: product.seoDescription || null, brand_id: product.brandId || null, category_id: product.categoryId || null,
  }).eq("id", id);
  if (error) throw new Error("Unable to update the product.");
  const { error: deleteError } = await supabase.from("product_images").delete().eq("product_id", id);
  if (deleteError) throw new Error("Unable to update product images.");
  const { error: imageError } = await supabase.from("product_images").insert(images.map((image, position) => ({ product_id: id, url: image.url, alt: image.alt, position })));
  if (imageError) throw new Error("Unable to update product images.");
}

export async function softDeleteCatalogProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ deleted_at: new Date().toISOString(), active: false }).eq("id", id);
  if (error) throw new Error("Unable to delete the product.");
}

export async function restoreCatalogProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ deleted_at: null }).eq("id", id);
  if (error) throw new Error("Unable to restore the product.");
}
