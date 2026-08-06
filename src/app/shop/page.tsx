import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { listCatalogProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop all fragrances",
  description:
    "Explore Amidaddy unisex perfume by scent family, mood and bottle size.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const value = (key: string) =>
    typeof raw[key] === "string" ? (raw[key] as string) : undefined;
  const query = {
    page: 1,
    pageSize: 48,
    search: value("search"),
    family: value("family") as
      "Woody" | "Floral" | "Fresh" | "Amber" | undefined,
    size: value("size") as "20ml" | "100ml" | undefined,
    inStock: "true" as const,
    sort: (value("sort") ?? "newest") as
      "newest" | "price_asc" | "price_desc" | "name",
  };
  const { products, total } = await listCatalogProducts(query);
  return (
    <main className="shop-page">
      <section className="shop-hero">
        <p className="eyebrow">The olfactory wardrobe</p>
        <h1 className="display-title">
          Find the scent
          <br />
          that feels like you.
        </h1>
        <p>
          Four unisex compositions. Two considered sizes. Filter by instinct,
          family, or mood.
        </p>
      </section>
      <section className="mx-auto max-w-[1500px] px-5 pb-28 sm:px-8">
        <form className="shop-filters" action="/shop">
          <label>
            <span>Search</span>
            <input
              name="search"
              defaultValue={query.search}
              placeholder="Name, note or mood"
            />
          </label>
          <label>
            <span>Scent family</span>
            <select name="family" defaultValue={query.family ?? ""}>
              <option value="">All families</option>
              {["Woody", "Fresh", "Floral", "Amber"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Size</span>
            <select name="size" defaultValue={query.size ?? ""}>
              <option value="">All sizes</option>
              <option>20ml</option>
              <option>100ml</option>
            </select>
          </label>
          <label>
            <span>Sort</span>
            <select name="sort" defaultValue={query.sort}>
              <option value="newest">Featured</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="name">Name</option>
            </select>
          </label>
          <button className="lux-button">Refine</button>
        </form>
        <div className="mb-6 flex justify-between text-xs tracking-[.16em] text-white/40 uppercase">
          <span>{total} fragrances</span>
          {(query.search || query.family || query.size) && (
            <a href="/shop" className="text-champagne">
              Clear filters
            </a>
          )}
        </div>
        {products.length ? (
          <div className="product-grid">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="empty-results">
            <h2 className="display-title text-3xl">
              No scent matches that combination.
            </h2>
            <a href="/shop" className="lux-button mt-6">
              Reset the collection
            </a>
          </div>
        )}
      </section>
    </main>
  );
}
