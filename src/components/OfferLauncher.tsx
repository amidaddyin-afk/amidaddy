"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Gift, X } from "lucide-react";
import { formatInr } from "@/lib/money";
import { COMBO_LIST_PAISE, COMBO_TIERS } from "@/lib/commerce";

/**
 * Bundle offer: a floating button, bottom LEFT, plus the popover it opens.
 *
 * The announcement bar carries the offer at the top of the page (its button
 * opens the same popover), so the floating button only appears once the bar
 * has scrolled away: it never sits on the hero's own CTA. Bottom left mirrors
 * the fragrance switcher on the right, at the same height, so the two never
 * meet and both clear the product page's sticky buy bar.
 *
 * Native popover API: Esc, click-outside and focus return come from the
 * browser. The popover always renders so the bar's button works everywhere;
 * only the floating button is kept off checkout and admin.
 */
const NO_LAUNCHER_ON = ["/checkout", "/admin"];
/** Roughly the announcement bar + header, after which the bar is gone. */
const SHOW_AFTER_PX = 120;

export default function OfferLauncher() {
  const pathname = usePathname();
  const popRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Remember which button opened the popover and point the card's grow/shrink
  // animation at it (see .offer-pop in globals.css). Measured at each toggle,
  // not once, since the bar's button scrolls with the page.
  useEffect(() => {
    const pop = popRef.current;
    if (!pop) return;
    let opener: Element | null = null;
    const onClick = (event: MouseEvent) => {
      const button = (event.target as Element).closest?.(
        '[popovertarget="offer-pop"]',
      );
      if (button && !pop.contains(button)) opener = button;
    };
    const onToggle = () => {
      if (!opener?.isConnected) return;
      const rect = opener.getBoundingClientRect();
      pop.style.setProperty(
        "--from-x",
        `${rect.left + rect.width / 2 - window.innerWidth / 2}px`,
      );
      pop.style.setProperty(
        "--from-y",
        `${rect.top + rect.height / 2 - window.innerHeight / 2}px`,
      );
    };
    document.addEventListener("click", onClick, true);
    pop.addEventListener("beforetoggle", onToggle);
    return () => {
      document.removeEventListener("click", onClick, true);
      pop.removeEventListener("beforetoggle", onToggle);
    };
  }, []);

  const rows = [
    { minQty: 1, totalPaise: COMBO_LIST_PAISE, percent: 0 },
    ...[...COMBO_TIERS].reverse(),
  ];

  return (
    <>
      {!NO_LAUNCHER_ON.some((prefix) => pathname.startsWith(prefix)) && (
        <button
          type="button"
          popoverTarget="offer-pop"
          className="offer-launcher"
          data-shown={scrolled || undefined}
          tabIndex={scrolled ? undefined : -1}
          aria-hidden={scrolled ? undefined : true}
          aria-label="See the bundle offer"
        >
          <Gift size={18} aria-hidden="true" />
          <span>Offer</span>
          <b>-{COMBO_TIERS[0].percent}%</b>
        </button>
      )}

      <div
        id="offer-pop"
        ref={popRef}
        popover="auto"
        className="offer-pop"
        aria-labelledby="offer-pop-title"
      >
        <button
          type="button"
          popoverTarget="offer-pop"
          popoverTargetAction="hide"
          className="offer-pop-close"
          aria-label="Close"
        >
          <X size={16} aria-hidden="true" />
        </button>
        <p className="eyebrow">Bundle offer · 100ml</p>
        <h2 id="offer-pop-title" className="offer-pop-title">
          Buy more, pay less.
        </h2>
        <ul className="offer-pop-rows">
          {rows.map((row) => (
            <li
              key={row.minQty}
              data-best={row.minQty === COMBO_TIERS[0].minQty || undefined}
            >
              <span className="offer-pop-qty">
                Buy {row.minQty}
                {row.minQty === COMBO_TIERS[0].minQty && <em>Best value</em>}
              </span>
              <span className="offer-pop-price">
                <strong>{formatInr(row.totalPaise)}</strong>
                {row.percent > 0 && (
                  <>
                    <s>{formatInr(COMBO_LIST_PAISE * row.minQty)}</s>
                    <b>{row.percent}% off</b>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
        <p className="offer-pop-note">
          Mix any of the four scents. Applied automatically in your bag; coupons
          do not apply to combo offers.
        </p>
        <Link
          href="/shop#combo"
          className="lux-button offer-pop-cta"
          onClick={() => popRef.current?.hidePopover()}
        >
          Build your set
        </Link>
      </div>
    </>
  );
}
