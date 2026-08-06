'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { PRODUCTS, type Product } from '@/lib/data';
import ProductCard from './ProductCard';

const CURATED_PRODUCTS: Product[] = PRODUCTS.slice(0, 4).map((product) => ({
  ...product,
  price: 1199,
  originalPrice: undefined,
  image: `/curated/${product.id === 'coldwar' ? 'cold-war' : product.id}.JPG`,
}));

export default function ProductGrid() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="bg-black px-6 py-28" id="collection-grid">
      <div className="mx-auto max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-14 text-center"
        >
          <p className="mb-4 text-sm uppercase tracking-[0.18em] text-[#D4AF37]">The Amidaddy collection</p>
          <h2 className="mb-5 font-cinzel text-[clamp(38px,6vw,68px)] tracking-wide text-white">
            Four scents. Yours to choose.
          </h2>
          <div className="divider-gold mb-4" />
          <p className="mx-auto mt-6 max-w-lg text-sm text-white/40">
            Choose 20 ml for a discovery bottle or 100 ml for the full experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CURATED_PRODUCTS.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
