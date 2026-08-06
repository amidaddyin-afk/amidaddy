'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { COLLECTIONS } from '@/lib/data';

export default function FeaturedCollections() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-28 px-6 bg-[#0a0a0a]" id="for-him">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase mb-4">Curated for You</p>
          <h2 className="font-cinzel text-[clamp(32px,5vw,56px)] text-white tracking-wide mb-5">
            Featured Collections
          </h2>
          <div className="divider-gold" />
        </motion.div>

        {/* Asymmetric editorial grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-4 items-stretch">
          {COLLECTIONS.map((col, i) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              className={`relative overflow-hidden group cursor-pointer ${
                i === 1 ? 'lg:row-span-1 min-h-[520px]' : 'min-h-[380px]'
              }`}
            >
              <Image
                src={col.image}
                alt={col.label}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                style={{ filter: 'brightness(0.5)' }}
              />
              {/* Brand Overlay */}
              <div className="bottle-branding">AMIDADDY</div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-[#D4AF37]/0 group-hover:bg-[#D4AF37]/5 transition-colors duration-500" />

              {/* Shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'linear-gradient(135deg, transparent 0%, rgba(212,175,55,0.08) 50%, transparent 100%)' }} />

              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase mb-2">{col.description}</p>
                <h3 className="font-cinzel text-white text-2xl md:text-3xl mb-4 tracking-wider">{col.label}</h3>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-[#D4AF37] text-sm tracking-wider group-hover:opacity-100 opacity-0 transition-opacity duration-300"
                >
                  Explore <ArrowRight size={14} />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
