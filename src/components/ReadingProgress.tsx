"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

/**
 * Reading-progress rail for a long chapter.
 *
 * Replaces the old static bar, which showed the chapter's fixed position in the
 * course (3 of 8) and never moved. That number is still in the lesson meta line;
 * this rail now tracks how far down the page you actually are, which is what a
 * bar pinned to the top of the viewport reads as.
 *
 * Uses scaleX rather than width so the update stays on the compositor. Reduced
 * motion keeps the indicator - it is information, not decoration - but drops the
 * spring smoothing so it tracks the scroll position exactly.
 */
export default function ReadingProgress() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothed = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="lesson-progress" aria-hidden="true">
      <motion.span
        style={{ scaleX: reduceMotion ? scrollYProgress : smoothed }}
      />
    </div>
  );
}
