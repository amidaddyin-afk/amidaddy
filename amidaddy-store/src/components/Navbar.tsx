'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, Search } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openCart, totalQty } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = ['Collection', 'For Him', 'For Her', 'Luxury', 'Find Your Scent'];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'glass border-b border-white/5 py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="font-cinzel text-lg sm:text-xl tracking-[0.15em] sm:tracking-[0.25em] text-white hover:text-[#D4AF37] transition-colors duration-300">
            AMIDADDY
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/ /g, '-')}`}
                className="text-xs text-white/70 hover:text-[#D4AF37] tracking-[0.12em] uppercase transition-colors duration-300 relative group"
              >
                {link}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#D4AF37] group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <button className="hidden lg:flex text-white/60 hover:text-white transition-colors">
              <Search size={18} />
            </button>

            <button
              onClick={openCart}
              className="relative flex items-center gap-2 text-white/80 hover:text-[#D4AF37] transition-colors duration-300"
            >
              <ShoppingBag size={20} />
              {totalQty > 0 && (
                <motion.span
                  key={totalQty}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#D4AF37] text-black text-[10px] font-bold flex items-center justify-center"
                >
                  {totalQty}
                </motion.span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden text-white/80 hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden glass border-t border-white/5"
            >
              <div className="flex flex-col px-6 py-4 gap-4">
                {navLinks.map(link => (
                  <a
                    key={link}
                    href={`#${link.toLowerCase().replace(/ /g, '-')}`}
                    onClick={() => setMobileOpen(false)}
                    className="text-sm text-white/70 hover:text-[#D4AF37] tracking-[0.12em] uppercase py-2 border-b border-white/5 transition-colors"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
