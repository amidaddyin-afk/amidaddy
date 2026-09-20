"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";

/** The fragrance films, in the order they play. */
const FILMS = [
  { slug: "old-love", name: "Old Love" },
  { slug: "billionaire", name: "Billionaire" },
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
  // 3g included: these clips are ~0.5-1MB each and the slideshow keeps a
  // second one buffered, so anything below 4g spends the visitor's bandwidth
  // on decoration while the hero photograph is still arriving.
  return !["slow-2g", "2g", "3g"].includes(connection?.effectiveType ?? "");
}

/**
 * Subscribe/getSnapshot pair for "the page has finished loading". Mounting the
 * hero film at hydration put a multi-hundred-KB download in contention with
 * the hero photograph, so on mid-tier mobile the LCP image lost the race and
 * the panel sat blank. The film is decoration; it waits for load.
 */
const subscribeToLoad = (onChange: () => void) => {
  if (document.readyState === "complete") return () => {};
  window.addEventListener("load", onChange);
  return () => window.removeEventListener("load", onChange);
};
const hasLoaded = () => document.readyState === "complete";

/**
 * Hero slideshow: the fragrance films play back to back, looping to the
 * first once Cold War finishes.
 *
 * Each film advances on `ended` rather than a timer, so a clip is never cut
 * short or left hanging on its last frame if the encodes differ in length.
 *
 * Two <video> elements alternate rather than one being torn down and rebuilt
 * per slide. The idle element preloads the next film while the visible one
 * plays, so the cut is a swap between two already-decoded elements instead of
 * a cold load - that is what removes the stutter at each handover. Only two
 * are ever mounted, so this costs one extra buffered clip, not the whole set.
 *
 * Returns null when autoplay is not appropriate, leaving the still image that
 * sits behind this element as the hero.
 */
export default function HeroVideoSlideshow() {
  const [index, setIndex] = useState(0);
  /** The visitor's explicit choice. Once set, offscreen/tab logic never
   *  overrides it - a deliberate pause stays paused. */
  const [paused, setPaused] = useState(false);
  /** True when the browser refused autoplay, so the control offers Play. */
  const [blocked, setBlocked] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  // Which of the two <video> slots is currently on screen. The other holds the
  // next film, buffering while this one plays.
  const [slot, setSlot] = useState(0);
  // The slug whose element has reported it can play. Compared against the
  // current film so a slide that has not buffered yet stays transparent.
  const [playableSlug, setPlayableSlug] = useState<string | null>(null);
  const refs = [
    useRef<HTMLVideoElement>(null),
    useRef<HTMLVideoElement>(null),
  ] as const;
  const allowed = useSyncExternalStore(subscribe, shouldPlay, () => false);
  const afterLoad = useSyncExternalStore(
    subscribeToLoad,
    hasLoaded,
    () => false,
  );

  const film = FILMS[index];
  const nextFilm = FILMS[(index + 1) % FILMS.length];
  const visible = playableSlug === film.slug;

  // Point each element at its film and play the visible one.
  //
  // The sources are assigned here rather than rendered as <source> children:
  // swapping a <source> tag on a mounted <video> does nothing until load() is
  // called, so React's reconciliation alone left the idle element still
  // holding - and replaying - its previous film. Two of the clips never
  // appeared. Setting .src and calling load() is what actually rebinds it.
  useEffect(() => {
    if (!allowed || !afterLoad) return;

    // WebM where supported, MP4 for Safari. Chosen once per element rather
    // than by <source> order, since we are assigning src directly now.
    const probe = document.createElement("video");
    const ext = probe.canPlayType("video/webm; codecs=vp9") ? "webm" : "mp4";
    const wanted = [film, nextFilm];

    refs.forEach((ref, n) => {
      const video = ref.current;
      if (!video) return;
      // refs[slot] shows `film`; the other buffers `nextFilm`.
      const target = n === slot ? wanted[0] : wanted[1];
      const url = `/videos/${target.slug}.${ext}`;
      if (!video.src.endsWith(url)) {
        video.src = url;
        video.load();
      }
    });

    const active = refs[slot].current;
    if (!active) return;
    // Reused across slides, so rewind: without this a returning element
    // resumes at the end of its last showing.
    active.currentTime = 0;
    if (paused) return;
    active.play().then(
      () => setBlocked(false),
      // A rejected play() is usually the browser's autoplay policy, not a
      // broken file. Surface a Play control rather than skipping the film;
      // the poster underneath stays visible either way.
      () => setBlocked(true),
    );
    // refs is a stable pair of ref objects; slot and index drive the change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed, afterLoad, index, slot, paused]);

  // Stop decoding while nobody is looking: offscreen, or the tab is hidden.
  // An explicit pause is never overridden - `paused` is checked before any
  // resume here, so a visitor who pressed Pause stays paused on return.
  useEffect(() => {
    if (!allowed || !afterLoad) return;
    const node = wrapRef.current;
    if (!node) return;
    let onScreen = true;

    const sync = () => {
      const active = refs[slot].current;
      if (!active) return;
      if (paused || !onScreen || document.hidden) active.pause();
      else void active.play().catch(() => {});
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0.1 },
    );
    observer.observe(node);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed, afterLoad, slot, paused]);

  if (!allowed || !afterLoad) return null;

  const advance = () => {
    setIndex((current) => (current + 1) % FILMS.length);
    setSlot((current) => (current === 0 ? 1 : 0));
  };

  const toggle = () => {
    const active = refs[slot].current;
    setPaused((was) => {
      const next = !was;
      if (active) {
        if (next) active.pause();
        else
          void active.play().then(
            () => setBlocked(false),
            () => setBlocked(true),
          );
      }
      return next;
    });
  };

  const showPlayIcon = paused || blocked;
  return (
    <div ref={wrapRef} className="house-hero-film">
      <button
        type="button"
        onClick={toggle}
        className="house-hero-film-toggle"
        aria-label={
          showPlayIcon ? "Play the fragrance film" : "Pause the fragrance film"
        }
      >
        {showPlayIcon ? (
          <Play size={14} aria-hidden="true" />
        ) : (
          <Pause size={14} aria-hidden="true" />
        )}
      </button>
      {[0, 1].map((n) => {
        // The on-screen slot plays the current film; the idle one holds the
        // next, preloading so the handover has nothing left to fetch.
        const showing = n === slot;
        return (
          <video
            // Keyed by slot, not slug: the element must persist across slides
            // for its buffered data to survive the cut.
            key={n}
            ref={refs[n]}
            className="house-hero-video"
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            tabIndex={-1}
            onCanPlay={showing ? () => setPlayableSlug(film.slug) : undefined}
            onEnded={showing ? advance : undefined}
            // A film that errors should not end the slideshow.
            onError={showing ? advance : undefined}
            style={{
              opacity: showing && visible ? 1 : 0,
              // The idle element is buffering the next clip and must not
              // intercept anything or paint over the live one.
              zIndex: showing ? 1 : 0,
            }}
          />
        );
      })}
    </div>
  );
}
