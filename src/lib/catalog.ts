import "server-only";

import type { Product } from "@/lib/data";
import { deriveNotes, PRODUCTS } from "@/lib/data";
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

/**
 * The photography under public/ is now WebP; the camera originals live outside
 * public/ in assets-source/. A deployed database that has not yet run the
 * webp_image_urls migration still holds .JPG paths, which would 404, so legacy
 * extensions are normalised on read as well as fixed by the migration.
 */
const toWebpPath = (url: string) =>
  url.startsWith("/") ? url.replace(/\.(jpe?g)$/i, ".webp") : url;

function mapProduct(product: Record<string, unknown>): Product {
  const images = (
    (product.product_images as Array<{
      url: string;
      position?: number;
      variant_name?: "20ml" | "100ml" | null;
    }> | null) ?? []
  )
    .map((item) => ({ ...item, url: toWebpPath(item.url) }))
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
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
  const slug = String(product.slug);
  const fallback = PRODUCTS.find((item) => item.slug === slug);
  // The approved signature compositions in the catalog are authoritative.
  // This also prevents stale deployed database rows from reaching product pages.
  const useApprovedSignatureNotes = fallback?.collection === "unisex";
  const topNotes = useApprovedSignatureNotes
    ? fallback.topNotes
    : ((product.top_notes as string[] | null) ?? fallback?.topNotes ?? []);
  const heartNotes = useApprovedSignatureNotes
    ? fallback.heartNotes
    : ((product.heart_notes as string[] | null) ?? fallback?.heartNotes ?? []);
  const baseNotes = useApprovedSignatureNotes
    ? fallback.baseNotes
    : ((product.base_notes as string[] | null) ?? fallback?.baseNotes ?? []);
  const generalImages = images
    .filter((item) => !item.variant_name)
    .map((item) => item.url);
  const productImages = Array.from(
    new Set([
      ...generalImages,
      ...images.map((item) => item.url),
      ...(fallback?.images ?? []),
    ]),
  );
  const variantImages = Object.fromEntries(
    (["20ml", "100ml"] as const).map((name) => {
      const explicit = images
        .filter((item) => item.variant_name === name)
        .map((item) => item.url);
      const fallbackImages = fallback?.variantImages?.[name] ?? [];
      const selected =
        name === "20ml" && fallbackImages.length
          ? fallbackImages
          : fallback?.collection === "combos"
            ? fallbackImages.length
              ? fallbackImages
              : explicit
            : explicit.length
              ? explicit
              : fallbackImages.length
                ? fallbackImages
                : name === "100ml"
                  ? productImages
                  : [];
      return [name, Array.from(new Set(selected))];
    }),
  ) as Product["variantImages"];
  const defaultImages =
    (defaultVariant && variantImages?.[defaultVariant.name]) ?? productImages;
  return {
    id: String(product.id),
    slug,
    name: String(product.name),
    image: defaultImages[0] ?? fallback?.image ?? "/curated/billionaire.webp",
    images: productImages,
    variantImages,
    profile: (product.fragrance_family ??
      fallback?.profile ??
      "Woody") as Product["profile"],
    concentration: String(product.concentration ?? "Eau de Parfum"),
    genderPositioning: String(product.gender_positioning ?? "Unisex"),
    topNotes,
    heartNotes,
    baseNotes,
    // Always derive the summary line from the same note pyramid every surface
    // renders, so the homepage, /shop and the product page cannot disagree.
    notes: useApprovedSignatureNotes
      ? deriveNotes(topNotes, heartNotes, baseNotes)
      : (fallback?.notes ?? deriveNotes(topNotes, heartNotes, baseNotes)),
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
    collection:
      String(product.collection ?? fallback?.collection) === "combos"
        ? "combos"
        : "unisex",
    packSize: Number(product.pack_size ?? fallback?.packSize ?? 1),
  };
}

function withRandomTileImage(product: Product): Product {
  const candidates = product.images.length ? product.images : [product.image];
  return {
    ...product,
    image: candidates[Math.floor(Math.random() * candidates.length)],
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
  if (query.collection)
    products = products.filter(
      (product) => product.collection === query.collection,
    );
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
    products: products
      .slice(start, start + query.pageSize)
      .map(withRandomTileImage),
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
    .select(
      // Keep storefront reads compatible with databases that have not yet
      // applied the optional combo/variant-image catalog migration.
      "*, product_images(url, position), product_variants(*)",
      {
        count: "exact",
      },
    )
    .eq("active", true)
    .is("deleted_at", null);
  if (query.search) {
    // PostgREST's .or() filter string treats `,`, `.`, `(`, `)` as syntax
    // (clause separator, operator separator, grouping) and ilike treats `%`/`_`
    // as wildcards — strip all of them so search input can't distort or break
    // out of the intended two-clause filter.
    const term = query.search.replace(/[%,._()]/g, "").slice(0, 200);
    if (term)
      request = request.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
  }
  if (query.family) request = request.eq("fragrance_family", query.family);
  if (query.collection) request = request.eq("collection", query.collection);
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
  // Keep the advertised 20ml discovery set available even when an older
  // Supabase catalogue has not been seeded with the combo row yet.
  const discoveryCombo = PRODUCTS.find(
    (product) => product.slug === "signature-combo-20ml",
  );
  const searchNeedle = query.search?.toLowerCase();
  const comboMatchesQuery =
    discoveryCombo &&
    (!query.collection || query.collection === discoveryCombo.collection) &&
    (!query.family || query.family === discoveryCombo.profile) &&
    (!query.size ||
      discoveryCombo.variants.some(
        (variant) => variant.name === query.size && variant.active,
      )) &&
    (query.inStock !== "true" || discoveryCombo.stock > 0) &&
    (query.minPrice === undefined || discoveryCombo.price >= query.minPrice) &&
    (query.maxPrice === undefined || discoveryCombo.price <= query.maxPrice) &&
    (!searchNeedle ||
      `${discoveryCombo.name} ${discoveryCombo.notes} ${discoveryCombo.mood}`
        .toLowerCase()
        .includes(searchNeedle));
  if (
    query.page === 1 &&
    comboMatchesQuery &&
    !products.some((product) => product.slug === discoveryCombo.slug)
  ) {
    products.push(discoveryCombo);
  }
  if (query.size)
    products = products.filter((product) =>
      product.variants.some(
        (variant) => variant.name === query.size && variant.active,
      ),
    );
  if (query.inStock === "true")
    products = products.filter((product) => product.stock > 0);
  return {
    products: products.map(withRandomTileImage),
    total:
      (count ?? products.length) +
      (discoveryCombo &&
      comboMatchesQuery &&
      !(data ?? []).some(
        (item) =>
          String((item as Record<string, unknown>).slug) ===
          discoveryCombo.slug,
      )
        ? 1
        : 0),
    page: query.page,
    pageSize: query.pageSize,
  };
}

export async function getCatalogProductBySlug(slug: string) {
  if (!configured()) {
    const fallback = PRODUCTS.find((product) => product.slug === slug);
    return process.env.NODE_ENV === "production" || !fallback ? null : fallback;
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(url, position), product_variants(*)")
    .eq("slug", slug)
    .eq("active", true)
    .is("deleted_at", null)
    .maybeSingle();
  if (error || !data) {
    const fallback = PRODUCTS.find((product) => product.slug === slug);
    const isRequiredDiscoveryCombo = slug === "signature-combo-20ml";
    return !fallback ||
      (process.env.NODE_ENV === "production" && !isRequiredDiscoveryCombo)
      ? null
      : fallback;
  }
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
    .select(
      "*, product_images(url, position, variant_name), product_variants(*)",
    )
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
      collection: product.collection,
      pack_size: product.packSize,
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
        variant_name: image.variantName ?? null,
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
      collection: product.collection,
      pack_size: product.packSize,
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
      variant_name: image.variantName ?? null,
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
