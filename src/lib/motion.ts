/**
 * Shared motion language.
 *
 * Before this, the codebase had exactly two easing curves and no duration
 * scale: every component invented its own timing, so nothing felt like it
 * belonged to the same system. Everything animated should pull from here.
 *
 * The house style is heavy and decelerating - things arrive quickly and settle
 * slowly, which reads as weight rather than bounce. Nothing overshoots.
 */
import type { Transition, Variants } from "framer-motion";

/** Matches --ease-* in src/styles/tokens.css so CSS and JS stay in step. */
export const EASE = {
  /** Expo-out. The default for anything entering or moving. */
  premium: [0.16, 1, 0.3, 1],
  /** Slightly softer entrance for large surfaces. */
  entrance: [0.22, 1, 0.36, 1],
  /** Symmetric in-out, for things leaving or reversing. */
  exit: [0.55, 0, 0.45, 1],
} as const;

export const DURATION = {
  fast: 0.18,
  base: 0.32,
  slow: 0.55,
  slower: 0.9,
  /** Ken Burns and other ambient drifts. */
  ambient: 7,
} as const;

export const transition = {
  fast: { duration: DURATION.fast, ease: EASE.premium },
  base: { duration: DURATION.base, ease: EASE.premium },
  slow: { duration: DURATION.slow, ease: EASE.premium },
  panel: { duration: DURATION.slow, ease: EASE.premium },
} satisfies Record<string, Transition>;

/**
 * Reveal-on-scroll. Distance is deliberately small: a long travel reads as a
 * webpage animating, a short one reads as a camera settling.
 */
export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const revealLeftVariants: Variants = {
  hidden: { opacity: 0, x: -28 },
  visible: { opacity: 1, x: 0 },
};

/**
 * Stagger for grids. Capped so the last card in a long row is not left waiting
 * a visibly different amount of time from the first.
 */
export const staggerDelay = (index: number, step = 0.06, cap = 5) =>
  Math.min(index, cap) * step;

/** Viewport config shared by every scroll reveal, so thresholds do not drift. */
export const revealViewport = { once: true, margin: "-60px" } as const;
