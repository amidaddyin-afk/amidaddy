import type { Product } from "@/lib/data";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <section className="collection-section" id="collection-grid">
      <div className="mx-auto max-w-[1500px]">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The signature collection</p>
            <h2 className="display-title">
              Four moods.
              <br />
              One instinct.
            </h2>
          </div>
          <p>
            Compositions designed around feeling—not convention. Begin with 20
            ml, or make it your daily signature in 100 ml.
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
