import type { Metadata } from "next";
import { ViewTransition } from "react";
import ProductCard from "@/components/ProductCard";
import { listCatalogProducts } from "@/lib/catalog";
import ShopHero from "@/components/shop/ShopHero";
import ShopSection from "@/components/shop/ShopSection";
import ComboBuilder from "@/components/shop/ComboBuilder";

/** shop <-> product slide. Forward carries the user deeper (into a product),
 *  back returns them here; anything untyped (a browser back button, a link
 *  from elsewhere) just crossfades via the default. */
const navTransition = {
  enter: {
    "nav-forward": "nav-forward",
    "nav-back": "nav-back",
    default: "none",
  },
  exit: {
    "nav-forward": "nav-forward",
    "nav-back": "nav-back",
    default: "none",
  },
} as const;

export const metadata: Metadata = {
  title: "Shop all fragrances",
  description:
    "Explore Amidaddy Perfumes unisex Eau de Parfum by scent family, mood and bottle size.",
  // Search/filter query params (?search=, ?family=, ?collection=, ?sort=) create
  // crawlable URL variants of the same content; canonicalize them all to /shop.
  alternates: { canonical: "/shop" },
};

/** Cached render instead of a Supabase query per visitor. Admin edits clear it
 *  immediately via revalidateStorefront(); see src/app/page.tsx for the full
 *  rationale. Filtered variants (?family=, ?search=) are cached per URL. */
export const revalidate = 300;

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
  // Only 100ml singles are combo-eligible, matching COMBO_SIZE in commerce.ts.
  const comboProducts = singleFragrances.filter((product) =>
    hasSize(product, "100ml"),
  );
  const sections: Array<{
    id: string;
    size?: "20ml" | "100ml";
    eyebrow: string;
    titleLead?: string;
    title: string;
    /** Short label for the jump links above the grid. */
    jumpLabel: string;
    /** Decorative backdrop, parallaxed behind the grid. */
    backdrop: string;
    align: "left" | "right";
    products: typeof products;
  }> = [
    {
      id: "100ml",
      size: "100ml",
      backdrop: "/ref/billionaire-100ml-desktop.webp",
      align: "left",
      eyebrow: "The full ritual",
      jumpLabel: "100ml fragrances",
      titleLead: "100ml",
      title: "fragrances",
      products: singleFragrances.filter((product) => hasSize(product, "100ml")),
    },
    {
      id: "20ml",
      size: "20ml",
      backdrop: "/ref/heavenly-both-sizes-desktop.webp",
      align: "right",
      eyebrow: "The discovery edit",
      jumpLabel: "20ml fragrances",
      titleLead: "20ml",
      title: "fragrances",
      products: singleFragrances.filter((product) => hasSize(product, "20ml")),
    },
    {
      id: "pack-of-4",
      backdrop: "/ref/collection-4x100ml-mobile.webp",
      align: "left",
      eyebrow: "The complete discovery wardrobe",
      jumpLabel: "Discovery sets",
      title: "Combo pack of 4",
      products: products.filter(
        (product) => product.slug === "signature-combo-20ml",
      ),
    },
  ];
  return (
    <ViewTransition
      enter={navTransition.enter}
      exit={navTransition.exit}
      default="none"
    >
      <main data-surface="commerce" className="shop-page cinematic">
        <ShopHero />
        <section className="mx-auto max-w-[1500px] px-5 pb-28 sm:px-8">
          {/* Jump links into the size sections below. These are plain anchors,
              so they work without JavaScript and are keyboard-operable for
              free; each target carries scroll-margin-top for the header. The
              counts are read from the same filtered data as the sections, so a
              shortcut never advertises a section that is not rendered. */}
          <nav className="shop-jump" aria-label="Shop by size">
            {sections.map(
              (section) =>
                section.products.length > 0 && (
                  <a key={section.id} href={`#${section.id}`}>
                    <span>{section.jumpLabel}</span>
                    <small>
                      {section.products.length}{" "}
                      {section.products.length === 1 ? "option" : "options"}
                    </small>
                  </a>
                ),
            )}
          </nav>
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
                    <ShopSection
                      key={section.id}
                      id={section.id}
                      eyebrow={section.eyebrow}
                      titleLead={section.titleLead}
                      title={section.title}
                      count={section.products.length}
                      backdrop={section.backdrop}
                      align={section.align}
                    >
                      <div className="product-grid">
                        {section.products.map((product, index) => (
                          <ProductCard
                            key={`${section.id}-${product.id}`}
                            product={product}
                            index={index}
                            initialSize={section.size}
                            lockSize={section.id === "pack-of-4"}
                            navType={["nav-forward"]}
                          />
                        ))}
                      </div>
                    </ShopSection>
                  ),
              )}
              {comboProducts.length > 0 && (
                <ComboBuilder products={comboProducts} />
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
    </ViewTransition>
  );
}
