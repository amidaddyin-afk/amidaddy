"use client";

import { useRef } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Photo from "@/components/Photo";

export type CinePanel = {
  slug: string;
  name: string;
  line: string;
  notes: string[];
  image: string;
  alt: string;
  /** Crop focus for the frame, `x y`. Keeps the bottle in view. */
  objectPosition?: string;
  /** Same on phones, where the shot is cropped to portrait. */
  objectPositionMobile?: string;
  /** Where the spotlight and the vignette open up, `x y`. */
  spot?: string;
};

/**
 * Scroll-pinned signature sequence.
 *
 * Each fragrance gets a taller-than-viewport track with a sticky inner frame,
 * so it holds the screen for one screen of scrolling before the next slides up
 * over it. The outgoing frame recedes (a small scale and dim) as it is covered.
 * `position: sticky` does the pinning; one `useScroll` per panel drives the
 * recede. The campaign photo sits behind a spotlight and vignette so the bottle
 * reads as the subject and the faces stay atmospheric.
 *
 * Reduced motion: the CSS drops the sticky positioning and the panels simply
 * stack full-height with no transforms.
 */
export default function CinematicSequence({ panels }: { panels: CinePanel[] }) {
  return (
    <div className="cine-seq">
      {panels.map((panel, index) => (
        <Frame
          key={panel.slug}
          panel={panel}
          index={index}
          total={panels.length}
        />
      ))}
    </div>
  );
}

function Frame({
  panel,
  index,
  total,
}: {
  panel: CinePanel;
  index: number;
  total: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.66, 1], [1, 1, 0.93]);
  const opacity = useTransform(scrollYProgress, [0, 0.66, 1], [1, 1, 0.32]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  const frameVars = {
    "--cine-obj": panel.objectPosition ?? "50% 52%",
    "--cine-obj-m":
      panel.objectPositionMobile ?? panel.objectPosition ?? "50% 44%",
    "--cine-spot": panel.spot ?? "60% 62%",
  } as CSSProperties;

  const isLast = index === total - 1;

  return (
    <div ref={trackRef} className="cine-frame-track">
      <motion.div
        className="cine-frame"
        style={reduce ? frameVars : { ...frameVars, scale, opacity }}
      >
        <motion.div
          className="cine-frame-media"
          style={reduce ? undefined : { y: imageY }}
        >
          <Photo
            src={panel.image}
            alt={panel.alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
        <div className="cine-frame-spot" />
        <div className="cine-frame-veil" />

        <div className="cine-frame-copy">
          <h2 className="cine-frame-name">{panel.name}</h2>
          <p className="cine-frame-line">{panel.line}</p>
          <p className="cine-frame-notes">{panel.notes.join("  ·  ")}</p>
          <Link href={`/products/${panel.slug}`} className="cine-frame-link">
            Discover {panel.name} <ArrowUpRight size={15} />
          </Link>
        </div>

        {!isLast && <span className="cine-frame-rule" aria-hidden="true" />}
      </motion.div>
    </div>
  );
}
