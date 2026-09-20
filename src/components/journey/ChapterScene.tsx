"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Chapter } from "@/lib/scent-journey";
import ChapterFilm from "./ChapterFilm";
import { useJourneyMotion } from "./useJourneyMotion";

/**
 * One chapter of the scroll journey.
 *
 * Chapters with a film (`chapter.film`) get a scroll-scrubbed backdrop: the
 * clip's own timeline is mapped to this section's scroll progress, so holding
 * position holds a frame and reversing plays it back. Chapters without one
 * fall back to a still image, and to a composed gradient if that is missing
 * too, so no chapter can render as bare background.
 *
 * Nothing is pinned. The section is an ordinary block in flow and the scroll
 * link is read-only, so wheel and touch input are never intercepted and the
 * page cannot trap a visitor mid-chapter.
 */
export default function ChapterScene({
  chapter,
  children,
  align = "left",
}: {
  chapter: Chapter;
  /** Chapter-specific content rendered under the body copy. */
  children?: React.ReactNode;
  /** Which side the copy sits on at desktop widths. */
  align?: "left" | "right";
}) {
  const { animate } = useJourneyMotion();
  const ref = useRef<HTMLElement>(null);
  const [hasImage, setHasImage] = useState(true);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Small travel: a long parallax reads as a gimmick, a short one as depth.
  // Applied to the still-image path only; a scrubbed film already carries its
  // own motion and would fight a transform on top.
  const mediaY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const mediaScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1.06, 1, 1.06],
  );

  return (
    <section
      ref={ref}
      id={chapter.id}
      className="chapter"
      data-align={align}
      aria-labelledby={`${chapter.id}-heading`}
    >
      <div className="chapter-media" aria-hidden="true">
        {chapter.film ? (
          <ChapterFilm
            id={chapter.film}
            progress={scrollYProgress}
            alt={chapter.imageAlt}
          />
        ) : (
          <motion.div
            className="chapter-media-inner"
            style={animate ? { y: mediaY, scale: mediaScale } : undefined}
          >
            {chapter.image && hasImage ? (
              <Image
                src={chapter.image}
                alt=""
                fill
                sizes="100vw"
                onError={() => setHasImage(false)}
              />
            ) : (
              <div className="chapter-media-fallback" data-scene={chapter.id} />
            )}
          </motion.div>
        )}
        <div className="chapter-media-veil" />
      </div>

      <motion.div
        className="chapter-copy"
        initial={animate ? { opacity: 0, y: 28 } : false}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="chapter-number">
          <span>{chapter.number}</span> /
        </p>
        <h2 id={`${chapter.id}-heading`} className="chapter-heading">
          {chapter.heading}
        </h2>
        <p className="chapter-standfirst">{chapter.standfirst}</p>
        <p className="chapter-body">{chapter.body}</p>
        {chapter.illustrationNotice && (
          <p className="chapter-notice">
            An illustrated introduction to perfumery — educational imagery, not
            a depiction of our own production.
          </p>
        )}
        {children}
      </motion.div>
    </section>
  );
}
