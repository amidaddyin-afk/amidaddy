import type { Product } from "@/lib/data";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <section className="collection-section" id="collection-grid">
      <div className="mx-auto max-w-[1500px]">
        <div className="section-heading" data-reveal>
          <div>
            <p className="eyebrow">The signature collection</p>
            <h2 className="display-title">
              Four moods.
              <br />
              Two ways to collect.
            </h2>
          </div>
          <p>
            Choose one signature in 20 ml or 100 ml, or meet the complete house
            in a four-bottle combo.
          </p>
        </div>
        <div className="product-grid">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
