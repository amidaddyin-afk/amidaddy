"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Gift, Plus, Minus, Check } from "lucide-react";
import Photo from "@/components/Photo";
import type { Product } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { formatInr } from "@/lib/money";
import {
  COMBO_SIZE,
  COMBO_LIST_PAISE,
  COMBO_TIERS,
  comboDiscountPaise,
  nextComboTier,
} from "@/lib/commerce";
import { EASE, DURATION, SPRING } from "@/lib/motion";

type Picked = { product: Product; qty: number };

/**
 * Build-your-own gift combo.
 *
 * Drag a bottle into the basket, or use the Add button - drag is an
 * enhancement, never the only route. Pointer drag is unavailable on most
 * touch devices and to anyone navigating by keyboard, so every bottle carries
 * a real button and the basket is operable without a mouse.
 *
 * Pricing mirrors src/lib/commerce.ts exactly, and the server recomputes the
 * same discount from the database at checkout. This component only previews
 * the number; it never decides it.
 */
export default function ComboBuilder({ products }: { products: Product[] }) {
  const { addItem, openCart } = useCart();
  const reduceMotion = useReducedMotion();
  const [picked, setPicked] = useState<Picked[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [added, setAdded] = useState(false);
  const liveRef = useRef<HTMLParagraphElement>(null);

  const priceOf = (product: Product) =>
    product.variants.find((variant) => variant.name === COMBO_SIZE)
      ?.pricePaise ?? 0;

  const qty = picked.reduce((sum, row) => sum + row.qty, 0);
  const grossPaise = picked.reduce(
    (sum, row) => sum + priceOf(row.product) * row.qty,
    0,
  );
  const { percent, discountPaise } = comboDiscountPaise(
    picked.map((row) => ({
      size: COMBO_SIZE,
      packSize: row.product.packSize ?? 1,
      qty: row.qty,
      unitPricePaise: priceOf(row.product),
    })),
  );
  const netPaise = grossPaise - discountPaise;
  const next = nextComboTier(qty);

  const add = (product: Product) =>
    setPicked((previous) => {
      const index = previous.findIndex((row) => row.product.id === product.id);
      if (index < 0) return [...previous, { product, qty: 1 }];
      const copy = [...previous];
      copy[index] = { ...copy[index], qty: Math.min(copy[index].qty + 1, 10) };
      return copy;
    });

  const remove = (productId: string) =>
    setPicked((previous) =>
      previous.flatMap((row) =>
        row.product.id === productId
          ? row.qty > 1
            ? [{ ...row, qty: row.qty - 1 }]
            : []
          : [row],
      ),
    );

  const addBasketToCart = () => {
    picked.forEach((row) => {
      for (let n = 0; n < row.qty; n += 1) addItem(row.product, COMBO_SIZE);
    });
    setPicked([]);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
    openCart();
  };

  return (
    <section
      id="combo"
      className="combo-builder"
      aria-labelledby="combo-heading"
    >
      <div className="combo-intro">
        <p className="eyebrow">Build a gift set</p>
        <h2 id="combo-heading" className="display-title">
          Pick your combination.
        </h2>
        <p className="combo-lede">
          The more {COMBO_SIZE} bottles you pick, the less each one costs. Mix
          the four signatures however you like.
        </p>
        <ol className="combo-tiers">
          <li data-reached={qty >= 1 ? "true" : "false"}>
            <strong>1 bottle</strong>
            <span>{formatInr(COMBO_LIST_PAISE)}</span>
          </li>
          {[...COMBO_TIERS].reverse().map((tier) => (
            <li
              key={tier.minQty}
              data-reached={qty >= tier.minQty ? "true" : "false"}
            >
              <strong>
                {tier.minQty} bottles for {formatInr(tier.totalPaise)}
              </strong>
              <span>
                <s>{formatInr(COMBO_LIST_PAISE * tier.minQty)}</s>{" "}
                {tier.percent}% off
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="combo-stage">
        <ul className="combo-shelf">
          {products.map((product) => {
            const price = priceOf(product);
            return (
              <li
                key={product.id}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", product.id);
                  event.dataTransfer.effectAllowed = "copy";
                }}
                className="combo-bottle"
              >
                <span className="combo-bottle-shot">
                  <Photo
                    src={
                      product.variantImages?.[COMBO_SIZE]?.[0] ?? product.image
                    }
                    alt={`${product.name} ${COMBO_SIZE}`}
                    fill
                    sizes="(max-width: 640px) 40vw, 150px"
                    className="object-contain"
                  />
                </span>
                <span className="combo-bottle-name">{product.name}</span>
                <span className="combo-bottle-price">{formatInr(price)}</span>
                <button
                  type="button"
                  onClick={() => add(product)}
                  className="combo-bottle-add"
                  aria-label={`Add ${product.name} ${COMBO_SIZE} to the gift set`}
                >
                  <Plus size={13} aria-hidden="true" /> Add
                </button>
              </li>
            );
          })}
        </ul>

        <div
          className="combo-basket"
          data-over={dragOver ? "true" : "false"}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            const id = event.dataTransfer.getData("text/plain");
            const product = products.find((item) => item.id === id);
            if (product) add(product);
          }}
        >
          <p className="combo-basket-head">
            <Gift size={15} aria-hidden="true" />
            Your set
            <span>
              {qty} {qty === 1 ? "bottle" : "bottles"}
            </span>
          </p>

          {picked.length === 0 ? (
            <p className="combo-basket-empty">
              Drag a bottle here, or use Add.
            </p>
          ) : (
            <ul className="combo-basket-list">
              <AnimatePresence initial={false} mode="popLayout">
                {picked.map((row) => (
                  <motion.li
                    key={row.product.id}
                    layout
                    initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 12 }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : {
                            layout: SPRING.soft,
                            duration: DURATION.base,
                            ease: EASE.premium,
                          }
                    }
                  >
                    <span className="combo-basket-thumb">
                      <Photo
                        src={
                          row.product.variantImages?.[COMBO_SIZE]?.[0] ??
                          row.product.image
                        }
                        alt=""
                        fill
                        sizes="44px"
                        className="object-contain"
                      />
                    </span>
                    <span className="combo-basket-name">
                      {row.product.name}
                    </span>
                    <span className="combo-basket-qty">
                      <button
                        type="button"
                        onClick={() => remove(row.product.id)}
                        aria-label={`Remove one ${row.product.name}`}
                      >
                        <Minus size={12} aria-hidden="true" />
                      </button>
                      <b>{row.qty}</b>
                      <button
                        type="button"
                        onClick={() => add(row.product)}
                        disabled={row.qty >= 10}
                        aria-label={`Add one more ${row.product.name}`}
                      >
                        <Plus size={12} aria-hidden="true" />
                      </button>
                    </span>
                    <span className="combo-basket-price">
                      {formatInr(priceOf(row.product) * row.qty)}
                    </span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}

          <div className="combo-total">
            <p ref={liveRef} aria-live="polite" className="combo-total-live">
              {percent > 0
                ? `${percent}% off applied. You save ${formatInr(discountPaise)}.`
                : next && qty > 0
                  ? `Add ${next.addQty} more: ${next.minQty} for ${formatInr(next.totalPaise)}, ${next.percent}% off.`
                  : ""}
            </p>
            <dl>
              <div>
                <dt>Set value</dt>
                <dd>{formatInr(grossPaise)}</dd>
              </div>
              {percent > 0 && (
                <div className="combo-total-save">
                  <dt>Combo saving ({percent}%)</dt>
                  <dd>-{formatInr(discountPaise)}</dd>
                </div>
              )}
              <div className="combo-total-net">
                <dt>You pay</dt>
                <dd>{formatInr(netPaise)}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={addBasketToCart}
              disabled={qty === 0}
              className="lux-button combo-cta"
            >
              {added ? (
                <>
                  <Check size={15} aria-hidden="true" /> Added to bag
                </>
              ) : (
                "Add set to bag"
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
