"use client";

import { useEffect, useRef, useState, ViewTransition } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { formatInr } from "@/lib/money";
import Photo from "@/components/Photo";
import {
  EASE,
  DURATION,
  POINTER_TILT,
  SPRING,
  hoverLift,
  staggerDelay,
  revealViewport,
} from "@/lib/motion";

export default function ProductCard({
  product,
  index = 0,
  initialSize,
  lockSize = false,
  navType,
}: {
  product: Product;
  index?: number;
  initialSize?: "20ml" | "100ml";
  lockSize?: boolean;
  /** View-transition type carried on the card's links, e.g. ["nav-forward"].
   *  Set by /shop so shop -> product slides; unset elsewhere (home) so those
   *  navigations keep only the shared-element morph. */
  navType?: string[];
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

  // Pointer tilt. Only on a fine pointer (mouse/trackpad) and only when the
  // user has not asked for less motion - on touch there is no hover to track
  // and pointermove would fire mid-scroll.
  const cardRef = useRef<HTMLElement>(null);
  const [finePointer, setFinePointer] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(pointer: fine)");
    const sync = () => setFinePointer(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  const tiltEnabled = finePointer && !reduceMotion;

  // Raw pointer offset from card centre, -0.5..0.5 on each axis.
  const offsetX = useMotionValue(0);
  const offsetY = useMotionValue(0);
  const rotateX = useSpring(
    useTransform(offsetY, [-0.5, 0.5], [POINTER_TILT.max, -POINTER_TILT.max]),
    SPRING.snappy,
  );
  const rotateY = useSpring(
    useTransform(offsetX, [-0.5, 0.5], [-POINTER_TILT.max, POINTER_TILT.max]),
    SPRING.snappy,
  );
  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!tiltEnabled || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    offsetX.set((event.clientX - rect.left) / rect.width - 0.5);
    offsetY.set((event.clientY - rect.top) / rect.height - 0.5);
  };
  const resetTilt = () => {
    offsetX.set(0);
    offsetY.set(0);
  };
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
      ref={cardRef}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={
        tiltEnabled ? { ...hoverLift, transition: SPRING.snappy } : undefined
      }
      viewport={revealViewport}
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              duration: DURATION.slow,
              delay: staggerDelay(index),
              ease: EASE.premium,
            }
      }
      style={
        tiltEnabled
          ? { rotateX, rotateY, transformPerspective: POINTER_TILT.perspective }
          : undefined
      }
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      className="product-card"
    >
      <div className="product-visual">
        <Link
          href={productHref}
          aria-label={`View ${product.name} ${size}`}
          transitionTypes={navType}
          className="absolute inset-0 z-10"
        />
        {/* Paired with the hero on the product page: the browser morphs this
            image into that one during navigation. default="none" stops it
            animating during unrelated transitions.
            The size is part of the name because /shop and the homepage both
            render every product twice - once per size - and two live
            ViewTransitions sharing a name break the transition outright. */}
        <ViewTransition
          name={`product-${product.slug}-${size}`}
          share="morph"
          default="none"
        >
          <Photo
            key={cardImage}
            src={cardImage}
            alt={`${product.name} — ${product.profile} ${product.concentration}${
              product.packSize && product.packSize > 1
                ? `, pack of ${product.packSize}`
                : ""
            }, ${size} bottle`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.025]"
          />
        </ViewTransition>
        <div className="product-glow" />
        {(product.badge || product.isNew) && (
          <span className="product-badge">
            {product.isNew ? "New composition" : product.badge}
          </span>
        )}
        <Link
          href={productHref}
          transitionTypes={navType}
          className="product-view"
        >
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
          <span className="text-subtle text-sm">{product.longevity}</span>
        </div>
        <p className="text-subtle mt-4 text-sm leading-6">{product.notes}</p>
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
              <p className="text-subtle text-xs line-through">
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
