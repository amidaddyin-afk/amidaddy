"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ElementType, ReactNode } from "react";
import {
  EASE,
  DURATION,
  revealLeftVariants,
  revealVariants,
  revealViewport,
  staggerDelay,
} from "@/lib/motion";

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
  index = 0,
  delay = 0,
  as = "div",
  className,
  id,
}: {
  children: ReactNode;
  /** Direction the element travels in from. */
  from?: "up" | "left";
  /** Position in a group, used to stagger siblings. */
  index?: number;
  /** Extra delay in seconds, added on top of the stagger. */
  delay?: number;
  as?: ElementType;
  className?: string;
  id?: string;
}) {
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  if (reduceMotion) {
    const Tag = as;
    return (
      <Tag className={className} id={id}>
        {children}
      </Tag>
    );
  }

  return (
    <MotionTag
      id={id}
      className={className}
      variants={from === "left" ? revealLeftVariants : revealVariants}
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
