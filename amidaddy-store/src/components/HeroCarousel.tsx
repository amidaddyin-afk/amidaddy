'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HERO_SLIDES } from '@/lib/data';
import ParticleCanvas from './ParticleCanvas';

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback((idx: number, dir: number) => {
    setDirection(dir);
    setCurrent((idx + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  const next = useCallback(() => goTo(current + 1, 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1, -1), [current, goTo]);

  useEffect(() => {
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [next]);

  const slide = HERO_SLIDES[current];

  const variants = {
    enter: (dir: number) => ({
      opacity: 0,
      scale: 1.08,
      x: dir > 0 ? 60 : -60,
    }),
    center: { opacity: 1, scale: 1, x: 0 },
    exit: (dir: number) => ({
      opacity: 0,
      scale: 0.95,
      x: dir > 0 ? -60 : 60,
    }),
  };

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black" id="collection">
      {/* Slides */}
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={slide.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 1.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt={slide.heading}
            fill
            priority
            className="object-cover object-center"
            style={{ filter: 'brightness(0.55)' }}
          />
          {/* Brand Overlay */}
          <div className="bottle-branding opacity-50 scale-150">AMIDADDY</div>
          
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Floating Particles */}
      <ParticleCanvas />

      {/* Mist / glow at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />

      {/* Gold glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#D4AF37]/5 blur-[80px] pointer-events-none z-[1]" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        {/* Offer strip */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6 px-4 py-2 glass-gold text-[#D4AF37] text-[11px] tracking-[0.25em] uppercase font-medium"
        >
          ✦ Buy One Get One Free — Limited Time ✦
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div key={slide.id + '-text'} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.8 }}>
            <h1 className="font-cinzel text-[clamp(32px,10vw,120px)] font-bold text-white leading-none tracking-[0.1em] mb-4 text-gold-gradient">
              {slide.heading}
            </h1>
            <p className="font-playfair italic text-white/70 text-[clamp(16px,2.5vw,26px)] mb-10 tracking-wide">
              {slide.subheading}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a href="#collection-grid" className="btn-gold inline-block">
                {slide.cta}
              </a>
              <a href="#find-your-scent" className="btn-ghost inline-block">
                Find Your Scent
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Arrow Controls */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 glass w-12 h-12 flex items-center justify-center text-white/60 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 border border-white/10 transition-all duration-300"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 glass w-12 h-12 flex items-center justify-center text-white/60 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 border border-white/10 transition-all duration-300"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? 1 : -1)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-[2px] rounded-full transition-all duration-500 ${
              i === current ? 'w-12 bg-[#D4AF37]' : 'w-6 bg-white/25'
            }`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-12 right-8 z-20 font-cinzel text-white/30 text-sm tracking-widest">
        {String(current + 1).padStart(2, '0')} / {String(HERO_SLIDES.length).padStart(2, '0')}
      </div>
    </section>
  );
}
