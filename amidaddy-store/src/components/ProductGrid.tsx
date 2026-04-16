'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { PRODUCTS } from '@/lib/data';
import ProductCard from './ProductCard';

const PROFILES = ['All', 'Woody', 'Floral', 'Fresh', 'Oriental'] as const;
const PRICE_RANGES = [
  { label: 'All', min: 0, max: Infinity },
  { label: 'Under ₹1000', min: 0, max: 999 },
  { label: '₹1000–₹1500', min: 1000, max: 1500 },
  { label: 'Above ₹1500', min: 1501, max: Infinity },
];

export default function ProductGrid() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [activeProfile, setActiveProfile] = useState<string>('All');
  const [activePriceIdx, setActivePriceIdx] = useState(0);

  const priceRange = PRICE_RANGES[activePriceIdx];

  const filtered = PRODUCTS.filter(p => {
    const profileMatch = activeProfile === 'All' || p.profile === activeProfile;
    const priceMatch = p.price >= priceRange.min && p.price <= priceRange.max;
    return profileMatch && priceMatch;
  });

  return (
    <section ref={ref} className="py-28 px-6 bg-black" id="collection-grid">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase mb-4">Exclusive Fragrances</p>
          <h2 className="font-cinzel text-[clamp(30px,5vw,52px)] text-white tracking-wide mb-5">
            The Full Collection
          </h2>
          <div className="divider-gold mb-4" />
          <p className="text-white/40 text-sm max-w-lg mx-auto mt-6">
            Buy One Get One Free on all perfumes. Add 2 or more — the savings apply automatically at checkout.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-8 mb-12"
        >
          {/* Scent type filter */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {PROFILES.map(p => (
              <button
                key={p}
                onClick={() => setActiveProfile(p)}
                className={`px-4 py-2 text-xs tracking-[0.12em] uppercase border transition-all duration-300 ${
                  activeProfile === p
                    ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10'
                    : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white/60'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Price filter */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {PRICE_RANGES.map((r, i) => (
              <button
                key={r.label}
                onClick={() => setActivePriceIdx(i)}
                className={`px-4 py-2 text-xs tracking-[0.12em] uppercase border transition-all duration-300 ${
                  activePriceIdx === i
                    ? 'border-white/60 text-white bg-white/5'
                    : 'border-white/10 text-white/30 hover:border-white/25 hover:text-white/50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 text-white/30 text-sm tracking-wider"
          >
            No perfumes match these filters. Try a different combination.
          </motion.div>
        )}
      </div>
    </section>
  );
}
