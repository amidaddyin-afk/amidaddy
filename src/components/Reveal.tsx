"use client";

import { motion, useReducedMotion } from "framer-motion";
import { createElement } from "react";
import type { ElementType, ReactNode } from "react";
import {
  EASE,
  DURATION,
  revealClipVariants,
  revealLeftVariants,
  revealFadeVariants,
  revealVariants,
  revealViewport,
  staggerDelay,
} from "@/lib/motion";
import { useCoarsePointer } from "@/lib/use-coarse-pointer";

/**
 * Scroll reveal that works in every browser.
 *
 * This replaces the previous `[data-reveal]` CSS, which was wrapped in
 * `@supports (animation-timeline: view())` with no fallback branch - so it did
 * nothing at all in Safari and Firefox, and covered only two live elements.
 *
 * Respects prefers-reduced-motion by rendering the final state immediately
 * rather than animating to it.
 */
export default function Reveal({
  children,
  from = "up",
  variant = "rise",
  index = 0,
  delay = 0,
  as = "div",
  className,
  id,
}: {
  children: ReactNode;
  /** Direction the element travels in from. Ignored unless variant is "rise". */
  from?: "up" | "left";
  /**
   * How the element uncovers.
   * - "rise": short opacity + offset move (the default, uses `from`).
   * - "clip": stays in place and unwraps from a clip-path inset, for media
   *   that should reveal rather than drift.
   */
  variant?: "rise" | "clip";
  /** Position in a group, used to stagger siblings. */
  index?: number;
  /** Extra delay in seconds, added on top of the stagger. */
  delay?: number;
  as?: ElementType;
  className?: string;
  id?: string;
}) {
  const reduceMotion = useReducedMotion();
  const coarsePointer = useCoarsePointer();
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  if (reduceMotion) {
    return createElement(as, { className, id }, children);
  }

  // On touch the travel runs against a drag that is still in progress: the
  // element slides under the finger while the page scrolls, which reads as the
  // scroll springing back. The clip variant does not translate, so it is safe.
  const variants =
    variant === "clip"
      ? revealClipVariants
      : coarsePointer
        ? revealFadeVariants
        : from === "left"
          ? revealLeftVariants
          : revealVariants;

  return (
    <MotionTag
      id={id}
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
      transition={{
        duration: DURATION.slow,
        ease: EASE.premium,
        delay: staggerDelay(index) + delay,
      }}
    >
      {children}
    </MotionTag>
  );
}
