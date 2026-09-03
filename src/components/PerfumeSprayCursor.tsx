"use client";

import { useEffect, useRef } from "react";

/**
 * Click atomiser.
 *
 * A restrained version of the old effect. That one drew a literal gold perfume
 * bottle at the cursor and fired nine bright droplets out of it, which read as
 * a game effect rather than a house. This is the breath instead of the object:
 * a hairline ring, a soft champagne haze, and a few fine particles drifting
 * off. Nothing is illustrated, so nothing can look cartoonish.
 *
 * It now fires only on the primary actions - the gold CTAs and the add-to-bag
 * controls - rather than on every click anywhere on the page. A mist that
 * answered an idle click on empty background was decoration; tied to "add to
 * bag" it reads as the product being applied.
 */
const TRIGGER_SELECTOR =
  ".lux-button, .btn-gold, .sticky-buy-add, .icon-add:not(:disabled)";

const MIST_DROPS = Array.from({ length: 6 });

/** Total life of one burst; kept just above the longest animation. */
const BURST_MS = 1150;

export default function PerfumeSprayCursor() {
  const templateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const spray = (event: PointerEvent) => {
      if (
        !event.isPrimary ||
        event.button !== 0 ||
        reducedMotion.matches ||
        !templateRef.current
      )
        return;

      const target = event.target as Element | null;
      if (!target?.closest(TRIGGER_SELECTOR)) return;

      const burst = templateRef.current.cloneNode(true) as HTMLDivElement;
      burst.removeAttribute("id");
      burst.classList.remove("perfume-spray-template");
      burst.style.left = `${event.clientX}px`;
      burst.style.top = `${event.clientY}px`;

      // Each particle gets its own direction and reach, so repeated clicks
      // never trace the same fixed starburst.
      const drift = burst.querySelectorAll<HTMLElement>(
        ".perfume-spray-mist i",
      );
      const base = Math.random() * Math.PI * 2;
      drift.forEach((particle, index) => {
        const angle =
          base + (index / drift.length) * Math.PI * 2 + Math.random() * 0.5;
        const reach = 26 + Math.random() * 26;
        particle.style.setProperty("--mist-x", `${Math.cos(angle) * reach}px`);
        // Biased upward: mist rises as it disperses.
        particle.style.setProperty(
          "--mist-y",
          `${Math.sin(angle) * reach - 12}px`,
        );
        particle.style.animationDelay = `${index * 0.035}s`;
      });

      document.body.appendChild(burst);
      window.setTimeout(() => burst.remove(), BURST_MS);
    };

    window.addEventListener("pointerdown", spray, { passive: true });
    return () => window.removeEventListener("pointerdown", spray);
  }, []);

  return (
    <div
      ref={templateRef}
      id="perfume-spray-template"
      className="perfume-spray-burst perfume-spray-template"
      aria-hidden="true"
    >
      <span className="perfume-spray-ring" />
      <span className="perfume-spray-ring perfume-spray-ring-wide" />
      <span className="perfume-spray-haze" />
      <span className="perfume-spray-mist">
        {MIST_DROPS.map((_, index) => (
          <i key={index} />
        ))}
      </span>
    </div>
  );
}
