"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";

/** The fragrance films, in the order they play. */
const FILMS = [
  { slug: "old-love", name: "Old Love" },
  { slug: "billionaire", name: "Billionaire" },
  { slug: "heavenly", name: "Heavenly" },
  { slug: "coldwar", name: "Cold War" },
] as const;

/** Crossfade length. Must match the opacity transition on .house-hero-video. */
const FADE_MS = 1000;

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
 * Each film hands over FADE_MS before its own end (read from the clip, not a
 * timer, so encodes of different lengths all work): the next film starts on
 * top and fades in while the outgoing one plays out its last second beneath
 * it. There is never a gap where the still photograph shows through.
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
  // The slug each slot has decoded data for. The incoming slot stays
  // transparent until its own film is ready, and the outgoing slot keeps its
  // film until then, so the handover never exposes the still underneath.
  const [ready, setReady] = useState<(string | null)[]>([null, null]);
  // Set once the current film has begun handing over, so the several
  // timeupdate events in its last second trigger one advance, not several.
  const advancing = useRef(false);
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
  const visible = ready[slot] === film.slug;

  // Point each element at its film and play the visible one.
  //
  // The sources are assigned here rather than rendered as <source> children:
  // swapping a <source> tag on a mounted <video> does nothing until load() is
  // called, so React's reconciliation alone left the idle element still
  // holding - and replaying - its previous film. Two of the clips never
  // appeared. Setting .src and calling load() is what actually rebinds it.
  useEffect(() => {
    if (!allowed || !afterLoad) return;

    // H.264 MP4 everywhere, never the VP9 WebM: Safari on macOS reports VP9
    // support but decodes it in software on many Macs, which is what made the
    // film stutter there. H.264 is hardware-decoded on every platform.
    const ext = "mp4";
    const bind = (video: HTMLVideoElement | null, slug: string) => {
      const url = `/fragrances/${slug}/film.${ext}`;
      if (video && !video.src.endsWith(url)) {
        video.src = url;
        // Tagged here rather than parsed back out of the src, which stopped
        // matching when every film was renamed film.mp4.
        video.dataset.slug = slug;
        video.load();
      }
    };

    advancing.current = false;
    const active = refs[slot].current;
    if (!active) return;
    // Normally already buffered by the idle slot; bound here on first load.
    bind(active, film.slug);
    // Reused across slides, so rewind: without this a returning element
    // resumes at the end of its last showing.
    if (active.currentTime > 0) active.currentTime = 0;
    if (!paused)
      active.play().then(
        () => setBlocked(false),
        // A rejected play() is usually the browser's autoplay policy, not a
        // broken file. Surface a Play control rather than skipping the film;
        // the poster underneath stays visible either way.
        () => setBlocked(true),
      );

    // Rebind the idle slot to the next film only once the current one is on
    // screen and fully faded in. Doing it at the cut blanked the outgoing
    // film mid-fade, which is the "pause on a photo" the handover showed.
    if (!visible) return;
    const idle = refs[slot === 0 ? 1 : 0].current;
    const timer = window.setTimeout(() => bind(idle, nextFilm.slug), FADE_MS);
    return () => window.clearTimeout(timer);
    // refs is a stable pair of ref objects; slot and index drive the change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed, afterLoad, index, slot, paused, visible]);

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
    if (advancing.current) return;
    advancing.current = true;
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
            // Both slots report, so the idle one is known ready before its
            // turn. The slug is the one bind() tagged the element with.
            onCanPlay={(e) => {
              const slug = e.currentTarget.dataset.slug;
              setReady((r) =>
                r[n] === slug
                  ? r
                  : r.map((s, i) => (i === n ? (slug ?? null) : s)),
              );
            }}
            // Hand over just before the end so the two films overlap.
            onTimeUpdate={
              showing
                ? (e) => {
                    const v = e.currentTarget;
                    if (v.duration - v.currentTime <= FADE_MS / 1000) advance();
                  }
                : undefined
            }
            // Fallback for a clip shorter than the fade, or a missed tick.
            onEnded={showing ? advance : undefined}
            // A film that errors should not end the slideshow.
            onError={showing ? advance : undefined}
            style={{
              // The incoming film fades in on top; the outgoing one stays
              // fully opaque beneath until it is covered. Once the idle slot
              // is rebound to the next film it drops to 0, ready to fade in.
              opacity: showing
                ? visible
                  ? 1
                  : 0
                : ready[n] === nextFilm.slug
                  ? 0
                  : 1,
              zIndex: showing ? 1 : 0,
            }}
          />
        );
      })}
    </div>
  );
}
