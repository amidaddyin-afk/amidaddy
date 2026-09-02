"use client";

import { useEffect, useRef, useState } from "react";
import Photo from "@/components/Photo";

export type StoryTile = {
  image: string;
  heading: string;
  copy: string;
  alt: string;
};

/** Travel of the parallax drift, as a share of the tile height. Desktop only. */
const PARALLAX_TRAVEL = 0.08;
/** Text lands after the image so the pair does not arrive on the same frame. */
const TEXT_OFFSET_MS = 80;

/**
 * Vertical, alternating image + copy sequence that replaces the old carousel.
 *
 * Alternation is done by flipping the grid order on odd tiles rather than by
 * rendering two markup variants, so there is one DOM shape to reason about.
 * Mobile never alternates - flipping sides on a narrow column reads as a bug.
 */
export default function ProductStory({ tiles }: { tiles: StoryTile[] }) {
  return (
    <section className="product-story" aria-label="Product gallery">
      {tiles.map((tile, index) => (
        <StoryRow key={tile.image} tile={tile} index={index} />
      ))}
    </section>
  );
}

function StoryRow({ tile, index }: { tile: StoryTile; index: number }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Reveal: one-shot IntersectionObserver rather than a scroll listener, so
  // there is no work on the main thread once a tile has appeared.
  useEffect(() => {
    const node = rowRef.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Settle asynchronously so this is not a synchronous setState in an
      // effect body, which triggers a cascading render.
      queueMicrotask(() => setVisible(true));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Parallax: desktop only, and skipped entirely under reduced motion. Below
  // 1024px the jank costs more than the effect is worth.
  useEffect(() => {
    const media = window.matchMedia(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
    );
    let frame = 0;
    let active = false;

    const update = () => {
      frame = 0;
      const row = rowRef.current;
      const art = mediaRef.current;
      if (!row || !art) return;
      const rect = row.getBoundingClientRect();
      const viewport = window.innerHeight;
      if (rect.bottom < 0 || rect.top > viewport) return;
      // -1 above the fold, 0 centred, 1 below: keeps travel symmetric.
      const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport;
      const shift = Math.max(-1, Math.min(1, progress)) * PARALLAX_TRAVEL * 100;
      art.style.setProperty("--parallax", `${shift.toFixed(2)}%`);
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const enable = () => {
      if (active) return;
      active = true;
      window.addEventListener("scroll", onScroll, { passive: true });
      update();
    };
    const disable = () => {
      if (!active) return;
      active = false;
      window.removeEventListener("scroll", onScroll);
      mediaRef.current?.style.removeProperty("--parallax");
    };

    const sync = () => (media.matches ? enable() : disable());
    sync();
    media.addEventListener("change", sync);
    return () => {
      media.removeEventListener("change", sync);
      disable();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={rowRef}
      className={`story-row ${index % 2 === 1 ? "is-flipped" : ""} ${
        visible ? "is-visible" : ""
      }`}
    >
      <div className="story-media" ref={mediaRef}>
        <Photo
          src={tile.image}
          alt={tile.alt}
          fill
          /* First image is the LCP candidate on this page. */
          priority={index === 0}
          loading={index === 0 ? undefined : "lazy"}
          fadeIn={false}
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 58vw"
          className="object-cover"
        />
      </div>
      <div
        className="story-copy"
        style={{ transitionDelay: visible ? `${TEXT_OFFSET_MS}ms` : "0ms" }}
      >
        <h3>{tile.heading}</h3>
        <p>{tile.copy}</p>
      </div>
    </div>
  );
}
