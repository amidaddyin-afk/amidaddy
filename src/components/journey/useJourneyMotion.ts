"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";
import { useSkipAnimation } from "./motion-preference";

/**
 * Whether this page may animate right now.
 *
 * Three things have to agree, and the third is the subtle one:
 *
 *  1. The OS prefers-reduced-motion setting is off.
 *  2. The page-level "Skip animation" toggle is off.
 *  3. We are on the client and mounted.
 *
 * Without (3) this hydrates with a mismatch. The server has no media query, so
 * `useReducedMotion` is false there and the markup is rendered WITH motion
 * styles (opacity: 0, transforms). A visitor who has reduced motion enabled
 * then hydrates with those styles absent, React finds server and client
 * disagreeing on every animated element, and logs a hydration error.
 *
 * Gating on a mount flag makes the first client render match the server
 * exactly; motion is enabled one render later, once the preference is known.
 */
const noop = () => () => {};
const onClient = () => true;
const onServer = () => false;

export function useJourneyMotion() {
  const mounted = useSyncExternalStore(noop, onClient, onServer);
  const systemReduce = useReducedMotion();
  const skip = useSkipAnimation();
  return {
    /** True when transforms and scrubbing should run. */
    animate: mounted && !systemReduce && !skip,
    /** True when the poster-only, no-scrub path applies. */
    reduce: mounted && (systemReduce || skip),
    mounted,
  };
}
