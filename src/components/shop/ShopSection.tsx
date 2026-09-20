"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Photo from "@/components/Photo";
import { useJourneyMotion } from "@/components/journey/useJourneyMotion";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * One size section of /shop, framed as a chapter.
 *
 * Mirrors ChapterScene: a heading over a backdrop
 * photograph on a short parallax. The travel is deliberately small - a long
 * parallax reads as a gimmick, a short one as depth - and the backdrop sits
 * behind a veil so the product grid keeps its contrast.
 *
 * The heading markup is unchanged from the server-rendered version it
 * replaced, so the existing .shop-size-heading rules still apply.
 */
export default function ShopSection({
  id,
  eyebrow,
  titleLead,
  title,
  count,
  backdrop,
  align = "left",
  children,
}: {
  id: string;
  eyebrow: string;
  titleLead?: string;
  title: string;
  count: number;
  /** Backdrop photograph. Decorative - the grid below carries the meaning. */
  backdrop: string;
  align?: "left" | "right";
  children: React.ReactNode;
}) {
  const { animate } = useJourneyMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const mediaScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1.06, 1, 1.06],
  );

  return (
    <section
      ref={ref}
      id={id}
      className="shop-size-section"
      data-align={align}
      aria-labelledby={`${id}-heading`}
    >
      <div className="shop-section-media" aria-hidden="true">
        <motion.div
          className="shop-section-media-inner"
          style={animate ? { y: mediaY, scale: mediaScale } : undefined}
        >
          <Photo src={backdrop} alt="" fill sizes="100vw" />
        </motion.div>
        <div className="shop-section-veil" />
      </div>

      <motion.div
        className="shop-size-heading"
        initial={animate ? { opacity: 0, y: 28 } : false}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.9, ease }}
      >
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={`${id}-heading`} className="display-title">
          {titleLead && (
            <span className="shop-size-heading-lead">{titleLead}</span>
          )}
          {title}
        </h2>
        <span>{count} options</span>
      </motion.div>
      {children}
    </section>
  );
}
