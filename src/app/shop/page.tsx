import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { listCatalogProducts } from "@/lib/catalog";
import Photo from "@/components/Photo";

export const metadata: Metadata = {
  title: "Shop all fragrances",
  description:
    "Explore Amidaddy Perfumes unisex Eau de Parfum by scent family, mood and bottle size.",
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
    collection: value("collection") as "unisex" | "combos" | undefined,
    family: value("family") as
      "Woody" | "Floral" | "Fresh" | "Amber" | "Mixed" | undefined,
    inStock: "true" as const,
    sort: (value("sort") ?? "newest") as
      "newest" | "price_asc" | "price_desc" | "name",
  };
  const { products, total } = await listCatalogProducts(query);
  const hasSize = (
    product: (typeof products)[number],
    size: "20ml" | "100ml",
  ) =>
    product.variants.some(
      (variant) =>
        variant.name === size &&
        variant.active &&
        variant.stock > variant.reserved,
    );
  const singleFragrances = products.filter(
    (product) => product.collection === "unisex",
  );
  const sections: Array<{
    id: string;
    size?: "20ml" | "100ml";
    eyebrow: string;
    titleLead?: string;
    title: string;
    products: typeof products;
  }> = [
    {
      id: "100ml",
      size: "100ml",
      eyebrow: "The full ritual",
      titleLead: "100ml",
      title: "fragrances",
      products: singleFragrances.filter((product) => hasSize(product, "100ml")),
    },
    {
      id: "20ml",
      size: "20ml",
      eyebrow: "The discovery edit",
      titleLead: "20ml",
      title: "fragrances",
      products: singleFragrances.filter((product) => hasSize(product, "20ml")),
    },
    {
      id: "pack-of-4",
      eyebrow: "The complete discovery wardrobe",
      title: "Combo pack of 4",
      products: products.filter(
        (product) => product.slug === "signature-combo-20ml",
      ),
    },
  ];
  return (
    <main data-surface="commerce" className="shop-page">
      {/* Full-bleed campaign banner. The page previously opened on plain text
          with no imagery at all, which read as a catalogue rather than a
          house. The frame is one of the campaign shots that was sitting
          unreferenced in public/curated. */}
      <section className="shop-hero" data-surface="story">
        <div className="shop-hero-media">
          <Photo
            src="/curated/hero-models.webp"
            alt="Amidaddy Perfumes campaign portrait of models wearing the signature fragrances"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_22%]"
          />
          <div className="shop-hero-scrim" />
        </div>
        <div className="shop-hero-copy">
          <p className="eyebrow">The olfactory wardrobe</p>
          <h1 className="display-title">
            Find the scent
            <br />
            that feels like you.
          </h1>
          <p>
            Four unisex compositions, two considered sizes, and complete
            four-bottle combos. Filter by instinct, family, or mood.
          </p>
        </div>
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
            <span>Range</span>
            <select name="collection" defaultValue={query.collection ?? ""}>
              <option value="">All products</option>
              <option value="unisex">Single fragrances</option>
              <option value="combos">Combos</option>
            </select>
          </label>
          <label>
            <span>Scent family</span>
            <select name="family" defaultValue={query.family ?? ""}>
              <option value="">All families</option>
              {["Woody", "Fresh", "Floral", "Amber", "Mixed"].map((item) => (
                <option key={item}>{item}</option>
              ))}
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
        <div className="text-subtle mb-6 flex justify-between text-xs tracking-[.16em] uppercase">
          <span>{total} fragrances</span>
          {(query.search || query.collection || query.family) && (
            <a href="/shop" className="text-champagne">
              Clear filters
            </a>
          )}
        </div>
        {products.length ? (
          <div className="shop-size-sections">
            {sections.map(
              (section) =>
                section.products.length > 0 && (
                  <section key={section.id} className="shop-size-section">
                    <div className="shop-size-heading">
                      <p className="eyebrow">{section.eyebrow}</p>
                      <h2 className="display-title">
                        {section.titleLead && (
                          <span className="shop-size-heading-lead">
                            {section.titleLead}
                          </span>
                        )}
                        {section.title}
                      </h2>
                      <span>{section.products.length} options</span>
                    </div>
                    <div className="product-grid">
                      {section.products.map((product, index) => (
                        <ProductCard
                          key={`${section.id}-${product.id}`}
                          product={product}
                          index={index}
                          initialSize={section.size}
                          lockSize
                        />
                      ))}
                    </div>
                  </section>
                ),
            )}
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
