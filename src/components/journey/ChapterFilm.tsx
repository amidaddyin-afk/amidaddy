"use client";

import { useEffect, useRef, useState } from "react";
import type { MotionValue } from "framer-motion";
import { useJourneyMotion } from "./useJourneyMotion";
import { useScrubbedVideo } from "./useScrubbedVideo";

/**
 * The scroll-scrubbed backdrop for one chapter.
 *
 * Loading: the <video> gets no `src` until the chapter is close to the
 * viewport, so opening the page does not fetch six films. Once attached it
 * stays attached - detaching on exit would re-download on the way back up.
 *
 * Poster: the encoded first frame sits under the video and is only hidden once
 * a real frame has been painted (`loadeddata`). That kills the black flash
 * between "element exists" and "element has a picture", which is what makes a
 * crossfade look broken.
 *
 * Source choice: one file per device, decided by a media query, never both. A
 * hidden desktop video alongside a visible mobile one doubles the bytes.
 *
 * Reduced motion and load failure both land on the same path: the poster
 * stays, nothing seeks, and the chapter reads as an ordinary editorial section.
 */
export default function ChapterFilm({
  id,
  progress,
  alt,
  hasMobile = true,
}: {
  /** Basename under /scent-school/film, e.g. "opening". */
  id: string;
  /** 0..1 scroll progress for this chapter. */
  progress: MotionValue<number>;
  /**
   * Description of the footage. The element is aria-hidden - it is decorative,
   * and the chapter's meaning lives in its real HTML - but this is kept for
   * the poster's alt and for anyone reading the markup.
   */
  alt: string;
  /** False when no portrait master exists and the wide crop is used instead. */
  hasMobile?: boolean;
}) {
  // Either the OS setting or the page toggle is enough to fall back to the
  // poster; the hook also holds motion off until mount, so SSR and the first
  // client render agree.
  const { reduce, mounted } = useJourneyMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [variant, setVariant] = useState<"desktop" | "mobile" | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [painted, setPainted] = useState(false);
  const [failed, setFailed] = useState(false);

  // Pick one source per device. Re-evaluated on orientation change, but only
  // before a source is attached: swapping mid-scroll would drop the frame.
  useEffect(() => {
    const query = window.matchMedia("(max-width: 63.999rem)");
    const pick = () =>
      setVariant(query.matches && hasMobile ? "mobile" : "desktop");
    pick();
    query.addEventListener("change", pick);
    return () => query.removeEventListener("change", pick);
  }, [hasMobile]);

  // Attach the source shortly before the chapter arrives, not on mount.
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !mounted || reduce || !variant || src) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSrc(`/scent-school/film/${id}-${variant}.mp4`);
          observer.disconnect();
        }
      },
      // One viewport of lead time: enough to fetch and decode a first frame
      // before the chapter is on screen.
      { rootMargin: "100% 0px" },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [id, variant, src, reduce, mounted]);

  // Skipping releases the video: a paused element still holds decoded frames,
  // and stopping that work is the point of skipping. Derived during render
  // rather than set from an effect - React unmounts the <video> on the same
  // pass, and an effect would cost an extra render to reach the same state.
  // `src` is deliberately kept, so turning animation back on re-attaches
  // without waiting for the observer again.
  const activeSrc = reduce ? null : src;

  useScrubbedVideo(videoRef, progress, {
    enabled: !reduce && !!activeSrc && !failed,
  });

  const poster = `/scent-school/film/${id}-${variant ?? "desktop"}.jpg`;

  return (
    <div ref={hostRef} className="chapter-film" aria-hidden="true">
      {/* Poster underneath: covers the gap before the first painted frame and
          is the permanent picture under reduced motion or on failure. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt=""
        className="chapter-film-poster"
        data-hidden={painted && activeSrc ? "true" : undefined}
        loading="lazy"
        decoding="async"
      />
      {activeSrc && !failed && (
        <video
          ref={videoRef}
          src={activeSrc}
          muted
          playsInline
          // Never played: scroll position is the only clock.
          preload="auto"
          poster={poster}
          aria-label={alt}
          className="chapter-film-video"
          data-ready={painted ? "true" : undefined}
          onLoadedData={() => setPainted(true)}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
