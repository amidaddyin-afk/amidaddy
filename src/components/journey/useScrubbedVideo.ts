"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "framer-motion";

/**
 * Drives one <video> from a 0..1 scroll progress value.
 *
 * Why this is not just `video.currentTime = progress * duration`:
 *
 *  - Setting currentTime during an in-flight seek makes the browser queue or
 *    drop requests, and a fast scroll issues one per frame. The decoder floods
 *    and the picture lags behind the scrollbar. This keeps at most one seek in
 *    flight and remembers only the LATEST target, so intermediate positions a
 *    fast scroll flew past are skipped rather than rendered late.
 *  - duration is NaN until metadata arrives, so an early write throws it away
 *    silently. Nothing seeks before `loadedmetadata`.
 *  - A tiny amount of smoothing makes the motion feel fluid, but too much
 *    disconnects picture from scroll. The lerp below settles within ~3 frames.
 *
 * The video is never played. Scroll position is the only clock: mixing
 * `play()` with seeking fights the scrubber and behaves differently per
 * browser. Seeking a muted, paused, playsInline element needs no autoplay
 * permission.
 *
 * Returns nothing; it mutates the element passed in.
 */
export function useScrubbedVideo(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  progress: MotionValue<number>,
  { enabled = true }: { enabled?: boolean } = {},
) {
  // Latest requested time, in seconds. Null when nothing is pending.
  const pending = useRef<number | null>(null);
  const seeking = useRef(false);
  const current = useRef(0);
  const raf = useRef<number | null>(null);
  const ready = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled) return;

    const onMeta = () => {
      ready.current = Number.isFinite(video.duration) && video.duration > 0;
    };
    if (video.readyState >= 1) onMeta();
    video.addEventListener("loadedmetadata", onMeta);

    const onSeeked = () => {
      seeking.current = false;
      flush();
    };
    video.addEventListener("seeked", onSeeked);
    // A seek that errors would otherwise leave `seeking` stuck true and freeze
    // the scrubber for the rest of the session.
    video.addEventListener("error", onSeeked);

    /** Issues the latest pending seek, if the decoder is free. */
    function flush() {
      if (!video || seeking.current || pending.current === null) return;
      if (!ready.current) return;
      const target = pending.current;
      pending.current = null;
      // A seek shorter than roughly one frame is not worth a decode.
      if (Math.abs(video.currentTime - target) < 1 / 48) return;
      seeking.current = true;
      try {
        video.currentTime = target;
      } catch {
        seeking.current = false;
      }
    }

    /** Smooths toward the scroll target, then requests a seek. */
    function tick() {
      raf.current = requestAnimationFrame(tick);
      if (!video || !ready.current) return;
      const target = clamp(progress.get(), 0, 1) * video.duration;
      // Modest lerp: fluid, but still visibly tied to the scrollbar. Snap when
      // close, so holding a scroll position holds a stable frame rather than
      // creeping forever.
      const next =
        Math.abs(target - current.current) < 0.004
          ? target
          : current.current + (target - current.current) * 0.22;
      current.current = next;
      pending.current = clamp(next, 0, Math.max(0, video.duration - 0.05));
      flush();
    }
    raf.current = requestAnimationFrame(tick);

    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onSeeked);
      pending.current = null;
      seeking.current = false;
    };
  }, [videoRef, progress, enabled]);
}

function clamp(value: number, min: number, max: number) {
  return value < min ? min : value > max ? max : value;
}
