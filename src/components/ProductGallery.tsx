"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Photo from "@/components/Photo";
import Certifications from "@/components/Certifications";

/** How long each frame holds before the rail advances on its own. */
const AUTOPLAY_MS = 4500;

/**
 * The product gallery beside the buy rail: every frame the product has, both
 * the studio bottle shots and the campaign photography, in one swipeable rail.
 *
 * Built on native scroll-snap rather than a carousel library or a transform
 * track. Swiping, momentum, and the trackpad all come from the platform, and
 * the frames stay real scrollable content — so keyboard scrolling and screen
 * readers work with no extra wiring. The arrows just call scrollTo.
 *
 * The active dot follows an IntersectionObserver on the frames themselves, so
 * it stays honest during a half-finished swipe instead of tracking an index we
 * incremented optimistically.
 *
 * The rail also advances on its own. That stops for good the moment the
 * visitor takes over — a swipe, an arrow, a dot, or the pointer resting on the
 * gallery — because an autoplay that resumes and yanks the frame out from
 * under someone reading it is worse than no autoplay at all.
 */
export default function ProductGallery({
  images,
  name,
  concentration,
}: {
  images: string[];
  name: string;
  concentration: string;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const frames = [...rail.querySelectorAll<HTMLElement>("[data-frame]")];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIndex(Number((entry.target as HTMLElement).dataset.frame));
          }
        }
      },
      // Only the frame filling most of the viewport counts as current.
      { root: rail, threshold: 0.6 },
    );
    for (const frame of frames) observer.observe(frame);
    return () => observer.disconnect();
  }, [images]);

  const scrollTo = useCallback((target: number, wrap = false) => {
    const rail = railRef.current;
    if (!rail) return;
    const last = rail.children.length - 1;
    const clamped = wrap
      ? (target + last + 1) % (last + 1)
      : Math.max(0, Math.min(last, target));
    rail.scrollTo({ left: clamped * rail.clientWidth, behavior: "smooth" });
  }, []);

  const single = images.length < 2;

  // Advance on a timer until the visitor interacts, then never again.
  useEffect(() => {
    if (single || stopped) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      // Skip a beat while the tab is hidden rather than racing through frames
      // nobody is looking at.
      if (document.hidden) return;
      setIndex((current) => {
        const next = (current + 1) % images.length;
        scrollTo(next, true);
        return next;
      });
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [single, stopped, images.length, scrollTo]);

  // Any real interaction ends the autoplay. Pointer/touch/wheel are captured
  // on the rail; the controls call stop() directly.
  const stop = useCallback(() => setStopped(true), []);

  return (
    <div className="pdp-gallery">
      {/* Keyed on the image set: swapping size remounts the rail, which resets
          both the scroll position and the active dot without an effect. */}
      <div
        className="pdp-gallery-rail"
        key={images[0]}
        ref={railRef}
        onPointerDown={stop}
        onTouchStart={stop}
        onWheel={stop}
        onMouseEnter={stop}
        onFocusCapture={stop}
      >
        {images.map((src, position) => (
          <div className="pdp-gallery-frame" data-frame={position} key={src}>
            <Photo
              src={src}
              alt={`${name} ${concentration} — view ${position + 1} of ${images.length}`}
              fill
              // The first frame is the one the card morphs into, so it must not
              // wait for lazy loading.
              priority={position === 0}
              sizes="(max-width: 900px) 100vw, 52vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Applied over the frames, so the marks travel with the product shot. */}
      <Certifications variant="overlay" />

      {!single && (
        <>
          <button
            type="button"
            className="pdp-gallery-arrow prev"
            aria-label="Previous image"
            onClick={() => {
              stop();
              scrollTo(index - 1);
            }}
            disabled={index === 0}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="pdp-gallery-arrow next"
            aria-label="Next image"
            onClick={() => {
              stop();
              scrollTo(index + 1);
            }}
            disabled={index === images.length - 1}
          >
            <ChevronRight size={18} />
          </button>
          <div className="pdp-gallery-dots">
            {images.map((src, position) => (
              <button
                type="button"
                key={src}
                className={position === index ? "active" : ""}
                aria-label={`Go to image ${position + 1}`}
                aria-current={position === index}
                onClick={() => {
                  stop();
                  scrollTo(position);
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
