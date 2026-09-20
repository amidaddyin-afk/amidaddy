"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight, Clock3 } from "lucide-react";
import { LESSONS_WITH_NUMBERS, TOTAL_MINUTES } from "@/lib/scent-school";
import {
  CHAPTERS_WITH_NUMBERS,
  PYRAMID,
  WEAR_TIMELINE,
} from "@/lib/scent-journey";
import ChapterFilm from "./ChapterFilm";
import { useJourneyMotion } from "./useJourneyMotion";
import ChapterIndex from "./ChapterIndex";
import ChapterScene from "./ChapterScene";
import NotesExplorer from "./NotesExplorer";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Scent School - "From a note to a feeling."
 *
 * A scroll-directed story in seven chapters, with the eight written lessons
 * kept underneath it. Nothing is pinned and no wheel or touch input is
 * intercepted: each chapter is an ordinary section whose imagery is linked to
 * its own scroll progress, so reading never waits on an animation and reverse
 * scrolling simply plays the transforms backwards.
 *
 * Under prefers-reduced-motion every transform is dropped and the same content
 * renders as a static editorial page. The story is semantic HTML in all cases.
 */
export default function ScentSchoolExperience({
  signatures,
}: {
  signatures: { slug: string; name: string; notes: string; image: string }[];
}) {
  const { animate } = useJourneyMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  // The opening film is scrubbed across the whole hero, so the botanicals
  // settle around the droplet as the headline leaves.
  const heroFilm = scrollYProgress;
  // The camera drifts toward the droplet as the opening leaves.
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.14]);
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "-6%"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const veilOpacity = useTransform(scrollYProgress, [0, 0.9], [0.5, 0.86]);

  const [notes, essence, balance, time, skin, curiosity, signature] =
    CHAPTERS_WITH_NUMBERS;

  return (
    <main className="school-journey">
      <ChapterIndex />

      {/* ---- 00 Opening ---- */}
      <section ref={heroRef} className="journey-hero">
        <motion.div
          className="journey-hero-media"
          style={animate ? { scale: mediaScale, y: mediaY } : undefined}
        >
          <ChapterFilm
            id="opening"
            progress={heroFilm}
            alt="Bergamot peel, jasmine petals and cedar fragments suspended around a single amber droplet"
          />
        </motion.div>
        <motion.div
          className="journey-hero-veil"
          style={animate ? { opacity: veilOpacity } : undefined}
        />

        <motion.div
          className="journey-hero-copy"
          style={animate ? { y: copyY, opacity: copyOpacity } : undefined}
          initial={animate ? "hidden" : false}
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.12, delayChildren: 0.15 },
            },
          }}
        >
          <motion.p
            className="journey-hero-eyebrow"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, ease },
              },
            }}
          >
            Scent School
          </motion.p>
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 28 },
              visible: { opacity: 1, y: 0, transition: { duration: 1, ease } },
            }}
          >
            From a note to a feeling.
          </motion.h1>
          <motion.p
            className="journey-hero-lede"
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.9, ease },
              },
            }}
          >
            A journey through the art of fragrance.
          </motion.p>
          <motion.div
            className="journey-hero-actions"
            variants={{
              hidden: { opacity: 0, y: 14 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.9, ease },
              },
            }}
          >
            <a href={`#${notes.id}`} className="journey-cta">
              Begin the journey <ArrowRight size={15} aria-hidden="true" />
            </a>
            <a href="#lessons" className="journey-cta-quiet">
              Browse the lessons
            </a>
          </motion.div>
        </motion.div>

        {/* Decorative marginalia, mirroring the printed-page feel. */}
        <p className="journey-hero-margin" data-side="left" aria-hidden="true">
          Nature
          <span />
          Curiosity
          <span />
          Craft
          <span />A deeper you
        </p>
        <p className="journey-hero-margin" data-side="right" aria-hidden="true">
          More than a scent
          <span />A richer world
        </p>
        <a className="journey-hero-scroll" href={`#${notes.id}`}>
          Scroll to explore
          <ArrowDown size={14} aria-hidden="true" />
        </a>
      </section>

      {/* ---- 01 Meet the notes ---- */}
      <ChapterScene chapter={notes}>
        <NotesExplorer
          signatures={signatures.map(({ name, notes: n }) => ({
            name,
            notes: n,
          }))}
        />
      </ChapterScene>

      {/* ---- 02 Capture the essence ---- */}
      <ChapterScene chapter={essence} align="left">
        <p className="chapter-margin-note">Same nature, new perspective.</p>
      </ChapterScene>

      {/* ---- 03 Compose the balance ---- */}
      <ChapterScene chapter={balance}>
        <ol className="pyramid-list">
          {PYRAMID.map((stage) => (
            <li key={stage.id}>
              <strong>{stage.name}</strong>
              <span>{stage.line}</span>
            </li>
          ))}
        </ol>
        <p className="chapter-margin-note">
          These stages overlap rather than take turns. A perfume is a sequence,
          not a timetable.
        </p>
      </ChapterScene>

      {/* ---- 04 Give it time ---- */}
      <ChapterScene chapter={time} align="left" />

      {/* ---- 05 Let it unfold ---- */}
      <ChapterScene chapter={skin}>
        <ol className="wear-timeline">
          {WEAR_TIMELINE.map((point) => (
            <li key={point.id}>
              <strong>{point.name}</strong>
              <span>{point.line}</span>
            </li>
          ))}
        </ol>
        <p className="chapter-links">
          <Link href="/scent-school/how-to-wear">How to wear fragrance</Link>
          <Link href="/scent-school/make-it-last">Make it last</Link>
        </p>
      </ChapterScene>

      {/* ---- 06 Follow your curiosity ---- */}
      <ChapterScene chapter={curiosity} align="left">
        <ul className="curiosity-links">
          {LESSONS_WITH_NUMBERS.slice(0, 4).map((lesson) => (
            <li key={lesson.slug}>
              <Link href={`/scent-school/${lesson.slug}`}>
                <span>{lesson.title}</span>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </ChapterScene>

      {/* ---- 07 Find your signature ---- */}
      <ChapterScene chapter={signature}>
        {/* Original product photography, unchanged. Consistent frames, full
            bottle visible, no crop that clips a cap or label. */}
        <ul className="signature-grid">
          {signatures.map((item) => (
            <li key={item.slug}>
              <Link href={`/products/${item.slug}`}>
                <span className="signature-shot">
                  <Image
                    src={item.image}
                    alt={`Amidaddy ${item.name} Eau de Parfum`}
                    fill
                    sizes="(max-width: 48rem) 45vw, 220px"
                  />
                </span>
                <strong>{item.name}</strong>
                <span className="signature-notes">{item.notes}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="chapter-links">
          <Link href="/shop" className="journey-cta">
            Explore the collection <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <Link href="/products/signature-combo-20ml">
            Try the discovery set
          </Link>
        </p>
      </ChapterScene>

      {/* ---- The written course ---- */}
      <section id="lessons" className="journey-lessons">
        <motion.div
          className="journey-lessons-head"
          initial={animate ? { opacity: 0, y: 24 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.85, ease }}
        >
          <p className="chapter-number">
            <span>08</span> /
          </p>
          <h2 className="chapter-heading">The lessons</h2>
          <p className="chapter-body">
            Eight focused chapters, {TOTAL_MINUTES} minutes in total. Free, and
            without sign-up.
          </p>
        </motion.div>

        <ol className="lesson-rows">
          {LESSONS_WITH_NUMBERS.map((lesson) => (
            <li key={lesson.slug}>
              <Link href={`/scent-school/${lesson.slug}`}>
                <span className="lesson-number">{lesson.number}</span>
                <span className="lesson-text">
                  <strong>{lesson.title}</strong>
                  <span>{lesson.summary}</span>
                </span>
                <span className="lesson-time">
                  <Clock3 size={13} aria-hidden="true" />
                  {lesson.minutes} min
                </span>
                <ArrowRight
                  size={16}
                  aria-hidden="true"
                  className="lesson-arrow"
                />
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
