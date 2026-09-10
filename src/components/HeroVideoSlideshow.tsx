"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/** The four fragrance films, in the order they play. */
const FILMS = [
  { slug: "old-love", name: "Old Love" },
  { slug: "billionaire", name: "Billionaire" },
  { slug: "heavenly", name: "Heavenly" },
  { slug: "coldwar", name: "Cold War" },
] as const;

const subscribe = () => () => {};

/**
 * True when it is reasonable to autoplay a sequence of hero films. Mirrors the
 * gate in HeroVideo: reduced motion or a metered/slow connection means the
 * visitor keeps the still image instead.
 */
function shouldPlay() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return false;
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  if (connection?.saveData) return false;
  return (
    connection?.effectiveType !== "slow-2g" &&
    connection?.effectiveType !== "2g"
  );
}

/**
 * Hero slideshow: the four fragrance films play back to back, looping to the
 * first once Cold War finishes.
 *
 * Each film advances on `ended` rather than a timer, so a clip is never cut
 * short or left hanging on its last frame if the encodes differ in length.
 *
 * Only the current film is mounted. Swapping the `<video>` per slide (keyed by
 * slug) is what makes the browser tear down the finished decoder and start the
 * next clip clean; keeping four mounted would mean four simultaneous decoders
 * and four downloads on load. The next slug is prefetched via <link rel=
 * "prefetch"> so the cut stays tight without paying for all four up front.
 *
 * Returns null when autoplay is not appropriate, leaving the still image that
 * sits behind this element as the hero.
 */
export default function HeroVideoSlideshow() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const allowed = useSyncExternalStore(subscribe, shouldPlay, () => false);

  const film = FILMS[index];
  const nextFilm = FILMS[(index + 1) % FILMS.length];

  // Autoplay can be refused (a background tab, an iOS low-power device). If it
  // is, move on rather than stalling the slideshow on a frozen frame.
  useEffect(() => {
    if (!allowed) return;
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {
      setIndex((current) => (current + 1) % FILMS.length);
    });
  }, [allowed, index]);

  if (!allowed) return null;

  return (
    <>
      {/* Warm the next clip so the handover does not stall on a cold fetch. */}
      <link rel="prefetch" as="video" href={`/videos/${nextFilm.slug}.mp4`} />
      <video
        // Keyed so React swaps the element per slide instead of reusing one
        // whose buffered source is the previous film.
        key={film.slug}
        ref={videoRef}
        className="house-hero-video"
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        onCanPlay={() => setVisible(true)}
        onEnded={() => setIndex((current) => (current + 1) % FILMS.length)}
        // A film that errors should not end the slideshow.
        onError={() => setIndex((current) => (current + 1) % FILMS.length)}
        style={{ opacity: visible ? 1 : 0 }}
      >
        <source src={`/videos/${film.slug}.webm`} type="video/webm" />
        <source src={`/videos/${film.slug}.mp4`} type="video/mp4" />
      </video>
    </>
  );
}
