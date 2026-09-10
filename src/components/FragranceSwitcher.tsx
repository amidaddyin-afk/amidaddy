"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

/**
 * The four signatures, in catalogue order, with the colour of each bottle.
 * The colour is what makes a dot readable at a glance before the label is.
 */
const FRAGRANCES = [
  { slug: "old-love", name: "Old Love", color: "#b3202f" },
  { slug: "heavenly", name: "Heavenly", color: "#e8d9b8" },
  { slug: "billionaire", name: "Billionaire", color: "#141414" },
  { slug: "coldwar", name: "Cold War", color: "#3fa8d8" },
] as const;

/**
 * Where each pill lands when the widget opens: a column stepping up from the
 * trigger, each one nudged further left so the stack fans rather than sitting
 * in a rigid line.
 *
 * These are offsets for the pill's centre, and a pill is ~115px wide, so the
 * x values stay small — pushing them out to a true arc ran the labels off the
 * right edge of the screen.
 */
const ARC = [
  { x: -30, y: -252 },
  { x: -20, y: -190 },
  { x: -10, y: -128 },
  { x: 0, y: -66 },
] as const;

/**
 * A floating switcher that jumps between the four fragrance pages.
 *
 * Closed it is a single dot in the bottom-right corner; open it fans the four
 * fragrances out on an arc around that dot, each in its own bottle colour with
 * its name attached. Same behaviour on desktop and phone — the arc is sized so
 * every dot stays a comfortable tap target.
 *
 * The fragrance whose page is currently open is marked and not linked, so the
 * widget always says where you are as well as where you can go.
 */
export default function FragranceSwitcher() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const current = FRAGRANCES.find(
    (item) => pathname === `/products/${item.slug}`,
  );

  // Close on Escape and on any click outside the widget.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div
      className={["fragrance-switcher", open && "is-open"]
        .filter(Boolean)
        .join(" ")}
      ref={rootRef}
    >
      <ul className="fragrance-switcher-arc">
        {FRAGRANCES.map((item, index) => {
          const isCurrent = item.slug === current?.slug;
          return (
            <li
              key={item.slug}
              style={
                {
                  "--x": `${ARC[index].x}px`,
                  "--y": `${ARC[index].y}px`,
                  "--dot": item.color,
                  // Stagger so the dots fan out rather than appearing at once.
                  "--delay": `${open ? index * 45 : 0}ms`,
                } as React.CSSProperties
              }
            >
              <Link
                href={`/products/${item.slug}`}
                className={isCurrent ? "is-current" : ""}
                aria-current={isCurrent ? "page" : undefined}
                tabIndex={open ? 0 : -1}
                aria-hidden={!open}
                onClick={() => setOpen(false)}
              >
                <span className="fragrance-switcher-dot" />
                <span className="fragrance-switcher-label">{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        className="fragrance-switcher-trigger"
        aria-expanded={open}
        aria-label={open ? "Close fragrance switcher" : "Switch fragrance"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? (
          <X size={20} />
        ) : (
          <span className="fragrance-switcher-trigger-face">
            <span className="fragrance-switcher-pips" aria-hidden="true">
              {FRAGRANCES.map((item) => (
                <i key={item.slug} style={{ background: item.color }} />
              ))}
            </span>
          </span>
        )}
      </button>
    </div>
  );
}
