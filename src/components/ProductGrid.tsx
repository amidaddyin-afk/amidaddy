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
              Signature fragrances.
              <br />
              Choose your feeling.
            </h2>
          </div>
          <p>
            Mood, key notes and performance at a glance. Open a fragrance to
            discover its full story and the moments it suits best.
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
