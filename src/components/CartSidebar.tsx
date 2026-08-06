"use client";

import { useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { formatInr } from "@/lib/money";

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
  } = useCart();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
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
            className="cart-panel fixed top-0 right-0 bottom-0 z-[70] flex w-full max-w-[420px] flex-col border-l border-white/8 bg-[#0e0e0e]"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 p-6">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-[#D4AF37]" />
                <span className="font-cinzel text-sm tracking-widest text-white uppercase">
                  Cart ({totalQty})
                </span>
              </div>
              <button
                autoFocus
                onClick={closeCart}
                aria-label="Close shopping bag"
                className="text-white/40 transition-colors hover:text-white"
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
                    className="flex h-60 flex-col items-center justify-center text-white/20"
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
                      className="cart-item flex gap-4 border border-white/5 bg-white/3 p-3"
                    >
                      <div className="h-24 w-20 flex-shrink-0 overflow-hidden bg-[#0d0d0d]">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          width={80}
                          height={96}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 truncate text-sm font-medium text-white">
                          {item.product.name}
                        </p>
                        <p className="mb-3 text-xs tracking-wider text-white/30">
                          {item.size}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 border border-white/10">
                            <button
                              onClick={() =>
                                updateQty(
                                  item.product.id,
                                  item.size,
                                  item.qty - 1,
                                )
                              }
                              className="px-2 py-1 text-white/40 transition-colors hover:text-white"
                              aria-label={`Decrease ${item.product.name} quantity`}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-5 text-center text-sm text-white">
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
                              className="px-2 py-1 text-white/40 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label={`Increase ${item.product.name} quantity`}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-white">
                              {formatInr(item.unitPricePaise * item.qty)}
                            </span>
                            <button
                              onClick={() =>
                                removeItem(item.product.id, item.size)
                              }
                              className="text-white/20 transition-colors hover:text-[#8e1f2f]"
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
              <div className="space-y-3 border-t border-white/5 p-6">
                <div className="flex justify-between text-sm">
                  <span className="tracking-wider text-white/40">Subtotal</span>
                  <span className="text-white">{formatInr(subtotalPaise)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="tracking-wider text-white/40">Shipping</span>
                  <span className="text-white">
                    {estimatedShippingPaise
                      ? formatInr(estimatedShippingPaise)
                      : "Complimentary"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-3 text-lg font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-white">
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
