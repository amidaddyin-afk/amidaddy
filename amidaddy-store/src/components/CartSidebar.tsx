'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

export default function CartSidebar() {
  const { isOpen, closeCart, items, removeItem, updateQty, subtotal, discount, total, totalQty } = useCart();

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
            className="fixed inset-0 cart-overlay z-[60]"
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[420px] bg-[#0e0e0e] border-l border-white/8 z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-[#D4AF37]" />
                <span className="font-cinzel text-white tracking-widest text-sm uppercase">
                  Cart ({totalQty})
                </span>
              </div>
              <button onClick={closeCart} className="text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* BOGO Banner */}
            {items.length > 0 && (
              <div className="mx-4 mt-4 px-4 py-3 glass-gold text-center">
                <p className="text-[#D4AF37] text-xs tracking-[0.15em] uppercase font-medium">
                  ✦ Buy One Get One Free Applied ✦
                </p>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              <AnimatePresence>
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-60 text-white/20"
                  >
                    <ShoppingBag size={40} className="mb-4" />
                    <p className="text-sm tracking-widest uppercase">Your cart is empty</p>
                  </motion.div>
                ) : (
                  items.map(item => (
                    <motion.div
                      key={`${item.product.id}-${item.size}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      layout
                      className="flex gap-4 p-3 bg-white/3 border border-white/5"
                    >
                      <div className="w-20 h-24 bg-[#0d0d0d] flex-shrink-0 overflow-hidden">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          width={80}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate mb-1">{item.product.name}</p>
                        <p className="text-white/30 text-xs tracking-wider mb-3">{item.size}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 border border-white/10">
                            <button
                              onClick={() => updateQty(item.product.id, item.size, item.qty - 1)}
                              className="px-2 py-1 text-white/40 hover:text-white transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-white text-sm w-5 text-center">{item.qty}</span>
                            <button
                              onClick={() => updateQty(item.product.id, item.size, item.qty + 1)}
                              className="px-2 py-1 text-white/40 hover:text-white transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-white text-sm">₹{(item.unitPrice * item.qty).toLocaleString()}</span>
                            <button
                              onClick={() => removeItem(item.product.id, item.size)}
                              className="text-white/20 hover:text-[#8e1f2f] transition-colors"
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
              <div className="border-t border-white/5 p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 tracking-wider">Subtotal</span>
                  <span className="text-white">₹{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#D4AF37] tracking-wider">BOGO Discount</span>
                    <span className="text-[#D4AF37]">−₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold pt-3 border-t border-white/5">
                  <span className="text-white">Total</span>
                  <span className="text-white">₹{total.toLocaleString()}</span>
                </div>
                <button className="btn-gold w-full mt-4 py-4 text-center block">
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
