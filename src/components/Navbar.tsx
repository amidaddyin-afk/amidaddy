"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { openCart, totalQty } = useCart();
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 36);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return (
    <>
      <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-inner">
          <button
            className="mobile-only"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </button>
          <nav className="desktop-nav">
            <Link href="/shop">Shop</Link>
            <Link href="/#scent-finder">Scent finder</Link>
            <Link href="/#story">Our story</Link>
          </nav>
          <Link href="/" className="wordmark" aria-label="Amidaddy home">
            AMIDADDY<span>PARFUMS</span>
          </Link>
          <div className="nav-actions">
            <button onClick={() => setSearchOpen(true)} aria-label="Search">
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
            >
              <X />
            </button>
            <nav>
              {[
                ["Shop", "/shop"],
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
