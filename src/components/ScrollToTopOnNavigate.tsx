"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Last scroll position per page (path + query), for back/forward. */
const positions = new Map<string, number>();
const pageKey = () => window.location.pathname + window.location.search;

/**
 * Land every new page at the very top, header included, and put back/forward
 * where the visitor left off.
 *
 * Next.js only scrolls a navigation to the top of the new Page element, and
 * the header lives in the root layout above it — so opening a fragrance from
 * a scrolled shop or home page left the header and logo just off-screen.
 * #anchor links are left to scroll to their target.
 */
export default function ScrollToTopOnNavigate() {
  const pathname = usePathname();
  const first = useRef(true);
  const popped = useRef(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        positions.set(pageKey(), window.scrollY),
      );
    };
    const onPop = () => {
      popped.current = true;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("popstate", onPop);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (popped.current) {
      popped.current = false;
      const saved = positions.get(pageKey());
      if (saved !== undefined)
        requestAnimationFrame(() =>
          window.scrollTo({ top: saved, left: 0, behavior: "instant" }),
        );
      return;
    }
    if (!window.location.hash)
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
