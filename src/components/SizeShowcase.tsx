"use client";

import { useEffect, useRef, useState } from "react";
import Photo from "@/components/Photo";

/** Every fragrance in both sizes, 100ml then its 20ml, played in order. */
const SLIDES = [
  {
    name: "Old Love",
    size: "100ml",
    src: "/fragrances/old-love/100ml/bottle.webp",
  },
  {
    name: "Old Love",
    size: "20ml",
    src: "/fragrances/old-love/20ml/studio.webp",
  },
  {
    name: "Billionaire",
    size: "100ml",
    src: "/fragrances/billionaire/100ml/bottle.webp",
  },
  {
    name: "Billionaire",
    size: "20ml",
    src: "/fragrances/billionaire/20ml/studio.webp",
  },
  {
    name: "Heavenly",
    size: "100ml",
    src: "/fragrances/heavenly/100ml/bottle.webp",
  },
  {
    name: "Heavenly",
    size: "20ml",
    src: "/fragrances/heavenly/20ml/studio.webp",
  },
  {
    name: "Cold War",
    size: "100ml",
    src: "/fragrances/coldwar/100ml/bottle.webp",
  },
  {
    name: "Cold War",
    size: "20ml",
    src: "/fragrances/coldwar/20ml/studio.webp",
  },
] as const;
const NAMES = [...new Set(SLIDES.map((slide) => slide.name))];
const HOLD_MS = 3200;
const SIZES = "(max-width: 900px) 100vw, 62vw";

/**
 * The size story's photo band: the four fragrances in both sizes, crossfading
 * with a slow settle-in zoom. Renders both band layers (the blurred backdrop
 * and the sharp media), so the backdrop always matches the shot on show. Both
 * layers use the same `sizes`, so each photo downloads once.
 *
 * Advances only while on screen and the tab is visible; reduced motion keeps
 * it still, with the chips still switching fragrance by hand.
 */
export default function SizeShowcase() {
  const [active, setActive] = useState(0);
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const node = mediaRef.current;
    if (!node) return;
    let onScreen = false;
    let timer: number | undefined;
    const sync = () => {
      window.clearInterval(timer);
      timer = undefined;
      if (onScreen && !document.hidden)
        timer = window.setInterval(
          () => setActive((current) => (current + 1) % SLIDES.length),
          HOLD_MS,
        );
    };
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    observer.observe(node);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  const current = SLIDES[active];
  const layer = (sharp: boolean) =>
    SLIDES.map((slide, index) => (
      <div
        key={slide.src}
        className="size-showcase-slide"
        data-active={index === active || undefined}
      >
        <Photo
          src={slide.src}
          alt={sharp ? `${slide.name} Eau de Parfum, ${slide.size}` : ""}
          fill
          sizes={SIZES}
          quality={90}
          className="object-cover"
        />
      </div>
    ));

  return (
    <>
      <div className="house-band-backdrop" aria-hidden="true">
        {layer(false)}
      </div>
      <div ref={mediaRef} className="house-format-media house-band-media">
        {layer(true)}
        <div className="size-showcase-controls">
          <p className="size-showcase-now" aria-live="polite">
            <span>{current.name}</span>
            <b key={active}>{current.size}</b>
          </p>
          <div className="size-showcase-chips">
            {NAMES.map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={current.name === name}
                onClick={() =>
                  setActive(SLIDES.findIndex((slide) => slide.name === name))
                }
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
