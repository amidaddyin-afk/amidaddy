"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const { openCart, totalQty } = useCart();
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 36);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  useEffect(() => {
    if (!open && !searchOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOverlay = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setSearchOpen(false);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOverlay);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOverlay);
    };
  }, [open, searchOpen]);
  return (
    <>
      <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-inner">
          <button
            className="mobile-only"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            aria-expanded={open}
          >
            <Menu />
          </button>
          <nav className="desktop-nav">
            <Link href="/shop">Shop</Link>
            <Link href="/scent-school">Scent school</Link>
            <Link href="/#scent-finder">Scent finder</Link>
            <Link href="/#story">Our story</Link>
          </nav>
          <Link href="/" className="wordmark" aria-label="Amidaddy home">
            AMIDADDY<span>PERFUMES</span>
          </Link>
          <div className="nav-actions">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              aria-expanded={searchOpen}
            >
              <Search />
            </button>
            <Link href="/account" aria-label="Account">
              <UserRound />
            </Link>
            <button
              onClick={openCart}
              aria-label={`Bag with ${totalQty} items`}
              className="bag-button"
            >
              <ShoppingBag />
              {totalQty > 0 && <span>{totalQty}</span>}
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.35 }}
          >
            <button
              autoFocus
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
            >
              <X />
            </button>
            <nav>
              {[
                ["Shop", "/shop"],
                ["Scent school", "/scent-school"],
                ["Scent finder", "/#scent-finder"],
                ["Our story", "/#story"],
                ["My account", "/account"],
              ].map(([label, href]) => (
                <Link key={href} href={href} onClick={() => setOpen(false)}>
                  {label}
                </Link>
              ))}
            </nav>
            <p>Presence, before words.</p>
          </motion.div>
        )}
        {searchOpen && (
          <motion.div
            className="search-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Search fragrances"
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.35 }}
          >
            <button
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
            >
              <X />
            </button>
            <form action="/shop">
              <label htmlFor="site-search">Search the collection</label>
              <div>
                <input
                  autoFocus
                  id="site-search"
                  name="search"
                  placeholder="Try amber, fresh, date night…"
                />
                <button aria-label="Submit search">
                  <Search />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
