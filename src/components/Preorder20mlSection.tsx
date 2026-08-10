"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/data";
import { formatInr } from "@/lib/money";

export default function Preorder20mlSection({
  products,
}: {
  products: Product[];
}) {
  const { addItem } = useCart();
  const preorderProducts = products
    .map((product) => ({
      product,
      variant: product.variants.find((variant) => variant.name === "20ml"),
    }))
    .filter(
      (
        item,
      ): item is {
        product: Product;
        variant: Product["variants"][number];
      } => Boolean(item.variant?.active),
    );

  if (!preorderProducts.length) return null;

  return (
    <section className="preorder-section" id="preorder-20ml">
      <div className="mx-auto max-w-[1500px]">
        <div className="preorder-heading" data-reveal>
          <div>
            <p className="eyebrow">Pre-order · 20 ml singles</p>
            <h2 className="display-title">
              Meet every scent.
              <br />
              One bottle at a time.
            </h2>
          </div>
          <p>
            Pre-order any 20 ml fragrance individually. Each signature is shown
            with its own bottle, notes and current price.
          </p>
        </div>

        <div className="preorder-grid">
          {preorderProducts.map(({ product, variant }) => {
            const available = variant.stock > variant.reserved;
            return (
              <article className="preorder-card" key={variant.id} data-reveal>
                <div className="preorder-visual">
                  <Link
                    href={`/products/${product.slug}`}
                    aria-label={`View ${product.name}`}
                    className="absolute inset-0 z-10"
                  />
                  <Image
                    src={product.image}
                    alt={`${product.name} 20 ml perfume bottle`}
                    fill
                    sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 25vw"
                    className="object-cover"
                  />
                  <span className="preorder-pill">20 ml · Pre-order</span>
                  <Link
                    href={`/products/${product.slug}`}
                    className="preorder-discover"
                  >
                    Details <ArrowUpRight size={14} />
                  </Link>
                </div>

                <div className="preorder-copy">
                  <p className="eyebrow">{product.profile} Eau de Parfum</p>
                  <h3 className="display-title">{product.name}</h3>
                  <p className="preorder-notes">
                    {product.topNotes[0]} · {product.heartNotes[0]} ·{" "}
                    {product.baseNotes[0]}
                  </p>
                  <div className="preorder-buy-row">
                    <div>
                      <strong>{formatInr(variant.pricePaise)}</strong>
                      {variant.mrpPaise > variant.pricePaise && (
                        <span>{formatInr(variant.mrpPaise)}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={!available}
                      onClick={() => addItem(product, "20ml")}
                      aria-label={`Pre-order ${product.name} 20 ml`}
                    >
                      <ShoppingBag size={16} />
                      {available ? "Pre-order" : "Unavailable"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
