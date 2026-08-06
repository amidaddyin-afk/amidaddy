'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { X, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { Product } from '@/lib/data';
import { useCart } from '@/context/CartContext';

interface Props {
  product: Product;
  open: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, open, onClose }: Props) {
  const [size, setSize] = useState<'50ml' | '100ml'>('50ml');
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const price = size === '100ml' ? Math.round(product.price * 1.6) : product.price;

  const handleAdd = () => {
    addItem(product, size);
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 1500);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 cart-overlay" />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
            className="relative bg-[#111] border border-white/10 max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden"
          >
            {/* Image */}
            <div className="relative h-64 md:h-auto bg-[#0d0d0d]">
              <Image src={product.image} alt={product.name} fill className="object-cover" />
              {/* Brand Overlay */}
              <div className="bottle-branding">AMIDADDY</div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            {/* Details */}
            <div className="p-8 flex flex-col justify-center">
              <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>

              <p className="text-[#D4AF37] text-[11px] tracking-[0.25em] uppercase mb-2">{product.profile}</p>
              <h2 className="font-cinzel text-white text-2xl tracking-wider mb-4">{product.name}</h2>
              <p className="text-white/50 text-sm leading-relaxed mb-6">{product.description}</p>

              <div className="space-y-3 mb-6 text-sm border-t border-white/5 pt-6">
                <div className="flex justify-between">
                  <span className="text-white/30 uppercase text-xs tracking-wider">Top Notes</span>
                  <span className="text-white/70">{product.notes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/30 uppercase text-xs tracking-wider">Longevity</span>
                  <span className="text-white/70">{product.longevity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/30 uppercase text-xs tracking-wider">Mood</span>
                  <span className="text-white/70 text-right max-w-[55%]">{product.mood}</span>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                {(['50ml', '100ml'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`flex-1 py-2.5 text-xs tracking-wider border transition-colors ${
                      size === s
                        ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10'
                        : 'border-white/10 text-white/40 hover:border-white/30'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mb-6">
                <span className="text-white text-2xl font-semibold">₹{price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-white/30 line-through text-sm">
                    ₹{(size === '100ml' ? Math.round(product.originalPrice * 1.6) : product.originalPrice).toLocaleString()}
                  </span>
                )}
              </div>

              <button
                onClick={handleAdd}
                className={`btn-gold flex items-center justify-center gap-2 w-full transition-all ${
                  added ? '!bg-emerald-600 !text-white' : ''
                }`}
              >
                <ShoppingBag size={16} />
                {added ? 'Added to Cart!' : 'Add to Cart'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
