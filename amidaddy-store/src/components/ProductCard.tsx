'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ShoppingBag, Eye } from 'lucide-react';
import { Product } from '@/lib/data';
import { useCart } from '@/context/CartContext';
import ProductModal from './ProductModal';

interface Props {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: Props) {
  const [selectedSize, setSelectedSize] = useState<'50ml' | '100ml'>('50ml');
  const [modalOpen, setModalOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const price = selectedSize === '100ml' ? Math.round(product.price * 1.6) : product.price;

  const handleAdd = () => {
    addItem(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const BADGE_COLORS: Record<string, string> = {
    Bestseller: 'bg-[#D4AF37] text-black',
    Limited: 'bg-[#8e1f2f] text-white',
    Exclusive: 'bg-white/10 text-white border border-white/20',
    Bundle: 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30',
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, delay: index * 0.08 }}
        className="group relative bg-[#111] border border-white/5 overflow-hidden card-shine"
      >
        {/* Image */}
        <div className="relative h-72 overflow-hidden bg-[#0d0d0d]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
          />
          {/* Brand Overlay */}
          <div className="bottle-branding">AMIDADDY</div>
          
          {/* Dark overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />

          {/* Badge */}
          {(product.badge || product.isNew) && (
            <span className={`absolute top-4 left-4 text-[10px] font-bold tracking-[0.12em] uppercase px-3 py-1.5 ${
              product.isNew ? 'bg-emerald-500/80 text-white' : BADGE_COLORS[product.badge!] ?? 'bg-white/10 text-white'
            }`}>
              {product.isNew ? 'New' : product.badge}
            </span>
          )}

          {/* Quick actions (slide up on hover) */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out flex gap-0">
            <button
              onClick={handleAdd}
              className={`flex-1 py-3 text-xs font-bold tracking-[0.12em] uppercase transition-colors duration-200 flex items-center justify-center gap-2 ${
                added ? 'bg-emerald-600 text-white' : 'bg-[#D4AF37] text-black hover:bg-[#c9a02e]'
              }`}
            >
              <ShoppingBag size={14} />
              {added ? 'Added!' : 'Quick Add'}
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-3 bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-colors border-l border-white/10"
            >
              <Eye size={16} />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[#D4AF37] text-[10px] tracking-[0.2em] uppercase mb-1">{product.profile}</p>
              <h3 className="font-cinzel text-white text-lg tracking-wide leading-tight">{product.name}</h3>
            </div>
            {/* Size selector */}
            <div className="flex gap-3">
              {(['50ml', '100ml'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-3.5 py-1.5 text-[10px] tracking-wider border transition-colors duration-200 ${
                    selectedSize === s
                      ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10'
                      : 'border-white/10 text-white/40 hover:border-white/30'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-white font-semibold text-lg">₹{price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-white/30 text-sm line-through">
                  ₹{(selectedSize === '100ml' ? Math.round(product.originalPrice * 1.6) : product.originalPrice).toLocaleString()}
                </span>
              )}
            </div>
            <span className="text-white/30 text-xs">{product.longevity}</span>
          </div>
        </div>
      </motion.article>

      <ProductModal
        product={product}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
