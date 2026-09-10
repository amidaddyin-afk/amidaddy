"use client";

import { useRef, useState, useSyncExternalStore } from "react";

/**
 * True when it is reasonable to download an autoplaying background loop.
 * Evaluated on the client only — `useSyncExternalStore` returns the server
 * snapshot (false) during SSR and hydration, so the markup matches and the
 * video is added on the client pass.
 */
const subscribe = () => () => {};

function shouldLoadVideo() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return false;
  // navigator.connection is non-standard and absent on Safari; treat missing
  // as "fine to load" rather than blocking everyone.
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
 * Campaign video for the product hero, layered behind the existing poster
 * image.
 *
 * The still stays in the DOM and keeps its ViewTransition morph from the
 * product card; this fades in over it once the video can actually play. So the
 * hero is never empty, the shared-element transition is unaffected, and a
 * visitor who never gets the video simply keeps the photograph.
 *
 * Deliberately conservative about when it loads at all:
 *  - `prefers-reduced-motion` — never load, never play.
 *  - Save-Data header or a 2g/slow-2g connection — never load. An autoplaying
 *    loop is not worth someone's data pack.
 *  - `preload="none"` until we decide to play, so it costs nothing otherwise.
 *
 * Muted + playsInline + autoPlay is the only combination browsers will
 * autoplay; the audio track is stripped at encode time anyway.
 */
export default function HeroVideo({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const allowed = useSyncExternalStore(subscribe, shouldLoadVideo, () => false);

  if (!allowed) return null;

  return (
    <video
      ref={videoRef}
      className={className}
      // Poster is omitted on purpose: the still image behind this element is
      // already showing, so a poster would just be a second decode of the same
      // frame.
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      onCanPlay={() => setVisible(true)}
      style={{ opacity: visible ? 1 : 0 }}
    >
      <source src={`/videos/${slug}.webm`} type="video/webm" />
      <source src={`/videos/${slug}.mp4`} type="video/mp4" />
    </video>
  );
}
