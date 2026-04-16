'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star } from 'lucide-react';
import { TESTIMONIALS } from '@/lib/data';

export default function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-28 px-6 bg-[#080808]" id="testimonials">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase mb-4">Voices of Our Community</p>
          <h2 className="font-cinzel text-[clamp(28px,4vw,46px)] text-white tracking-wide mb-5">
            What Our Customers Say
          </h2>
          <div className="divider-gold" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="glass p-8 relative group hover:border-[#D4AF37]/20 border border-white/5 transition-colors duration-500"
            >
              {/* Gold quote mark */}
              <span className="absolute top-6 right-8 font-cinzel text-6xl text-[#D4AF37]/10 leading-none select-none">&ldquo;</span>

              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} fill="#D4AF37" className="text-[#D4AF37]" />
                ))}
              </div>

              <p className="text-white/60 text-sm leading-relaxed mb-6 italic font-playfair">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] text-xs font-bold">
                  {t.name[0]}
                </div>
                <span className="text-white/80 text-sm font-medium tracking-wide">{t.name}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 pt-12 border-t border-white/5 flex flex-wrap justify-center gap-12"
        >
          {[
            { icon: '🔒', label: 'Secure Payments' },
            { icon: '🚚', label: 'Free Delivery over ₹1999' },
            { icon: '↩️', label: '7-Day Easy Returns' },
            { icon: '✦', label: '100% Authentic Fragrances' },
          ].map(b => (
            <div key={b.label} className="text-center flex flex-col items-center gap-2">
              <span className="text-2xl">{b.icon}</span>
              <span className="text-white/40 text-xs tracking-[0.12em] uppercase">{b.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
