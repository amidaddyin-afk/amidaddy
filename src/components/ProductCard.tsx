"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { formatInr } from "@/lib/money";

export default function ProductCard({
  product,
  index = 0,
  initialSize,
  lockSize = false,
}: {
  product: Product;
  index?: number;
  initialSize?: "20ml" | "100ml";
  lockSize?: boolean;
}) {
  const available = product.variants.filter(
    (variant) => variant.active && variant.stock > variant.reserved,
  );
  const [size, setSize] = useState<"20ml" | "100ml">(
    available.find((item) => item.name === initialSize)?.name ??
      available.find((item) => item.name === "100ml")?.name ??
      available[0]?.name ??
      "100ml",
  );
  const [added, setAdded] = useState(false);
  const reduceMotion = useReducedMotion();
  const { addItem } = useCart();
  const variant =
    product.variants.find((item) => item.name === size) ?? product.variants[0];
  const cardImage = product.variantImages?.[size]?.[0] ?? product.image;
  const productHref = `/products/${product.slug}?size=${size}`;
  const add = () => {
    addItem(product, size);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };
  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              duration: 0.55,
              delay: Math.min(index, 3) * 0.06,
              ease: [0.16, 1, 0.3, 1],
            }
      }
      className="product-card"
    >
      <div className="product-visual">
        <Link
          href={productHref}
          aria-label={`View ${product.name} ${size}`}
          className="absolute inset-0 z-10"
        />
        <Image
          key={cardImage}
          src={cardImage}
          alt={`${product.name} ${product.packSize && product.packSize > 1 ? `${product.packSize} pack ` : ""}${size}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.025]"
        />
        <div className="product-glow" />
        {(product.badge || product.isNew) && (
          <span className="product-badge">
            {product.isNew ? "New composition" : product.badge}
          </span>
        )}
        <Link href={productHref} className="product-view">
          Discover <ArrowUpRight size={14} />
        </Link>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">
              {product.profile} · {product.concentration}
            </p>
            <h3 className="display-title mt-2 text-2xl">{product.name}</h3>
          </div>
          <span className="text-sm text-white/45">{product.longevity}</span>
        </div>
        <p className="mt-4 text-sm leading-6 text-white/52">
          {product.topNotes[0]} · {product.heartNotes[0]} ·{" "}
          {product.baseNotes[0]}
        </p>
        {!lockSize && (
          <div className="mt-5 flex gap-2" aria-label="Choose bottle size">
            {product.variants.map((item) => (
              <button
                key={item.id}
                disabled={!item.active || item.stock <= item.reserved}
                onClick={() => setSize(item.name)}
                className={`size-chip ${size === item.name ? "active" : ""}`}
              >
                {product.packSize && product.packSize > 1
                  ? `${product.packSize} × ${item.name}`
                  : item.name}
              </button>
            ))}
          </div>
        )}
        {lockSize && (
          <p className="text-champagne mt-5 text-xs tracking-[.16em] uppercase">
            {product.packSize && product.packSize > 1
              ? `${product.packSize} × ${size}`
              : size}
          </p>
        )}
        <div className="mt-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-lg">
              {variant ? formatInr(variant.pricePaise) : "Unavailable"}
            </p>
            {variant && variant.mrpPaise > variant.pricePaise && (
              <p className="text-xs text-white/35 line-through">
                {formatInr(variant.mrpPaise)}
              </p>
            )}
          </div>
          <button
            onClick={add}
            disabled={!variant || variant.stock <= variant.reserved}
            className="icon-add"
            aria-label={`Add ${product.name} ${size} to bag`}
          >
            <ShoppingBag size={17} />
            <span>{added ? "Added" : "Add"}</span>
          </button>
        </div>
      </div>
    </motion.article>
  );
}
