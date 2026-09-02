"use client";

import { useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { formatInr } from "@/lib/money";
import { DEFAULT_FREE_SHIPPING_PAISE } from "@/lib/commerce";
import { PRODUCTS } from "@/lib/data";

export default function CartSidebar() {
  const {
    isOpen,
    closeCart,
    items,
    removeItem,
    updateQty,
    subtotalPaise,
    estimatedShippingPaise,
    estimatedTotalPaise,
    totalQty,
    addItem,
  } = useCart();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const freeShippingRemainingPaise = Math.max(
    0,
    DEFAULT_FREE_SHIPPING_PAISE - subtotalPaise,
  );
  const shippingProgress = Math.min(
    100,
    (subtotalPaise / DEFAULT_FREE_SHIPPING_PAISE) * 100,
  );
  const cartProductIds = new Set(items.map((item) => item.product.id));
  const suggestions = PRODUCTS.filter(
    (product) =>
      product.collection === "unisex" &&
      product.active &&
      !cartProductIds.has(product.id) &&
      product.variants.some(
        (variant) =>
          variant.name === "20ml" &&
          variant.active &&
          variant.stock > variant.reserved,
      ),
  ).slice(0, 3);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    document.body.style.overflow = "hidden";
    // The announcement bar sits at z-index 80, above the cart panel, so it
    // covered the close button. Collapsing the fixed chrome while the cart is
    // open keeps the panel's own controls reachable at every width.
    document.body.dataset.overlay = "cart";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      delete document.body.dataset.overlay;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [closeCart, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="cart-overlay fixed inset-0 z-[60]"
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={reduceMotion ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              duration: reduceMotion ? 0 : 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="cart-panel border-line bg-raised fixed top-0 right-0 bottom-0 z-[70] flex w-full max-w-[420px] flex-col border-l"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
          >
            {/* Header */}
            <div className="border-line flex items-center justify-between border-b p-6">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-accent" />
                <span className="font-cinzel text-fg text-sm tracking-widest uppercase">
                  Cart ({totalQty})
                </span>
              </div>
              <button
                autoFocus
                onClick={closeCart}
                aria-label="Close shopping bag"
                className="text-subtle hover:text-fg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              <AnimatePresence>
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-subtle flex h-60 flex-col items-center justify-center"
                  >
                    <ShoppingBag size={40} className="mb-4" />
                    <p className="text-sm tracking-widest uppercase">
                      Your cart is empty
                    </p>
                  </motion.div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={`${item.product.id}-${item.size}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      layout
                      className="cart-item border-line bg-raised flex gap-4 border p-3"
                    >
                      <div className="bg-raised h-24 w-20 flex-shrink-0 overflow-hidden">
                        <Image
                          src={
                            item.product.variantImages?.[item.size]?.[0] ??
                            item.product.image
                          }
                          alt={item.product.name}
                          width={80}
                          height={96}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-fg mb-1 truncate text-sm font-medium">
                          {item.product.name}
                        </p>
                        <p className="text-subtle mb-3 text-xs tracking-wider">
                          {item.product.packSize && item.product.packSize > 1
                            ? `${item.product.packSize} × ${item.size}`
                            : item.size}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="border-line flex items-center gap-2 border">
                            <button
                              onClick={() =>
                                updateQty(
                                  item.product.id,
                                  item.size,
                                  item.qty - 1,
                                )
                              }
                              className="text-subtle hover:text-fg px-2 py-1 transition-colors"
                              aria-label={`Decrease ${item.product.name} quantity`}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-fg w-5 text-center text-sm">
                              {item.qty}
                            </span>
                            <button
                              onClick={() =>
                                updateQty(
                                  item.product.id,
                                  item.size,
                                  item.qty + 1,
                                )
                              }
                              disabled={item.qty >= 10}
                              className="text-subtle hover:text-fg px-2 py-1 transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label={`Increase ${item.product.name} quantity`}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-fg text-sm">
                              {formatInr(item.unitPricePaise * item.qty)}
                            </span>
                            <button
                              onClick={() =>
                                removeItem(item.product.id, item.size)
                              }
                              className="text-subtle transition-colors hover:text-[color:var(--danger)]"
                              aria-label={`Remove ${item.product.name} from bag`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Summary */}
            {items.length > 0 && (
              <div className="border-line space-y-3 border-t p-6">
                <div className="cart-shipping-progress">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-muted">
                      {freeShippingRemainingPaise > 0
                        ? `Add ${formatInr(freeShippingRemainingPaise)} more for free delivery`
                        : "You unlocked free delivery"}
                    </span>
                    <span className="text-accent">₹599</span>
                  </div>
                  <div className="bg-raised mt-2 h-1 overflow-hidden rounded-full">
                    <div
                      className="bg-accent h-full rounded-full transition-[width] duration-500"
                      style={{ width: `${shippingProgress}%` }}
                    />
                  </div>
                </div>
                {suggestions.length > 0 && (
                  <div className="cart-quick-add">
                    <p className="text-subtle mb-2 text-[10px] tracking-[0.18em] uppercase">
                      You may also like
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {suggestions.map((product) => {
                        const image =
                          product.variantImages?.["20ml"]?.[0] ?? product.image;
                        const price = product.variants.find(
                          (variant) => variant.name === "20ml",
                        )?.pricePaise;
                        return (
                          <article
                            key={product.id}
                            className="border-line bg-raised[.025] min-w-[112px] flex-1 border p-2"
                          >
                            <div className="bg-raised relative mb-2 aspect-[4/5] overflow-hidden">
                              <Image
                                src={image}
                                alt={`${product.name} 20 ml`}
                                fill
                                sizes="112px"
                                className="object-contain"
                              />
                            </div>
                            <p className="text-fg truncate text-[11px]">
                              {product.name}
                            </p>
                            <div className="mt-1.5 flex items-center justify-between gap-1">
                              <span className="text-subtle text-[10px]">
                                {price ? formatInr(price) : "20 ml"}
                              </span>
                              <button
                                type="button"
                                onClick={() => addItem(product, "20ml")}
                                className="border-accent/60 text-accent border px-2 py-1 text-[9px] uppercase"
                                aria-label={`Quick add ${product.name} 20 ml`}
                              >
                                Add
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-subtle tracking-wider">Subtotal</span>
                  <span className="text-fg">{formatInr(subtotalPaise)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-subtle tracking-wider">Shipping</span>
                  <span className="text-fg">
                    {estimatedShippingPaise
                      ? formatInr(estimatedShippingPaise)
                      : "Complimentary"}
                  </span>
                </div>
                <div className="border-line flex justify-between border-t pt-3 text-lg font-semibold">
                  <span className="text-fg">Total</span>
                  <span className="text-fg">
                    {formatInr(estimatedTotalPaise)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    closeCart();
                    router.push("/checkout");
                  }}
                  className="btn-gold mt-4 block w-full py-4 text-center"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={closeCart}
                  className="btn-ghost w-full text-center text-xs tracking-widest"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
