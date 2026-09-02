"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ShoppingBag } from "lucide-react";
import { formatInr } from "@/lib/money";
import { useCart } from "@/context/CartContext";

/**
 * Floating purchase bar.
 *
 * The product page is long - hero, then four story tiles, then description,
 * notes, application and FAQ. Once the main buy panel scrolls away the visitor
 * has to hunt back up for it. This keeps price and the add action within reach
 * for the whole scroll.
 *
 * Shown only once the primary Add to bag button has left the viewport, so it
 * never competes with the real one. Fixed positioning means it cannot shift
 * the page layout.
 */
export default function StickyBuyBar({
  name,
  size,
  pricePaise,
  disabled,
  onAdd,
  added,
  /** The primary button; the bar appears when this scrolls out of view. */
  anchorRef,
}: {
  name: string;
  size: string;
  pricePaise?: number;
  disabled: boolean;
  onAdd: () => void;
  added: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
}) {
  const [shown, setShown] = useState(false);
  const { totalQty } = useCart();
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only once the primary button is above the viewport, not when it is
        // still below the fold on first paint.
        setShown(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );
    observer.observe(anchor);
    return () => observer.disconnect();
  }, [anchorRef]);

  if (pricePaise === undefined) return null;

  return (
    <div
      ref={barRef}
      className={`sticky-buy ${shown ? "is-shown" : ""}`}
      // Hidden from assistive tech while off-screen: the real controls are
      // still in the document and this would otherwise duplicate them.
      aria-hidden={!shown}
    >
      <div className="sticky-buy-meta">
        <strong>{name}</strong>
        <span>
          {size} · {formatInr(pricePaise)}
        </span>
      </div>
      <div className="sticky-buy-actions">
        <button
          type="button"
          onClick={onAdd}
          disabled={disabled}
          tabIndex={shown ? 0 : -1}
          className="lux-button sticky-buy-add"
        >
          {added ? <Check size={16} /> : <ShoppingBag size={16} />}
          {added ? "Added" : "Add to bag"}
        </button>
        {totalQty > 0 && (
          <Link
            href="/checkout"
            tabIndex={shown ? 0 : -1}
            className="sticky-buy-checkout"
          >
            Checkout ({totalQty})
          </Link>
        )}
      </div>
    </div>
  );
}
