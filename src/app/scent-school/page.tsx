import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, Compass, Ear, GraduationCap } from "lucide-react";
import { LESSONS_WITH_NUMBERS, TOTAL_MINUTES } from "@/lib/scent-school";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Scent School",
  description:
    "An eight-chapter course in fragrance: how perfume works, India's attar heritage, how to wear it, and how to find the signature that is yours.",
  alternates: { canonical: "/scent-school" },
};

/**
 * Scent School hub.
 *
 * Previously the entire school was one scrolling page with anchor links, so
 * nothing could be started, finished, bookmarked or shared on its own. This is
 * now a course index: each chapter is a real route, and this page exists to
 * make someone want to begin one.
 */
export default function ScentSchoolPage() {
  const first = LESSONS_WITH_NUMBERS[0];

  return (
    <main data-surface="story" className="school-hub">
      <section className="school-hero">
        <Image
          src="/curated/hero-models-3.webp"
          alt="Amidaddy Perfumes models photographed together for a fragrance campaign"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="school-hero-shade" />
        <div className="school-hero-copy">
          <p className="eyebrow">Amidaddy Perfumes Scent School</p>
          <h1>
            Understand fragrance.
            <br />
            Wear it better.
          </h1>
          <p>
            An eight-chapter course in how perfume works — from the history of
            the craft and India&apos;s attar heritage to the ten minutes that
            will teach you your own nose.
          </p>
          <div className="school-hero-actions">
            <Link href={`/scent-school/${first.slug}`} className="lux-button">
              Begin chapter one <ArrowRight size={16} />
            </Link>
            <a href="#curriculum" className="btn-ghost">
              See the curriculum
            </a>
          </div>
          <p className="school-hero-meta">
            {LESSONS_WITH_NUMBERS.length} chapters · about {TOTAL_MINUTES}{" "}
            minutes · free, and no sign-up
          </p>
        </div>
      </section>

      <section className="school-promise" aria-label="What you will learn">
        <article>
          <GraduationCap size={20} />
          <h2>Start from nothing</h2>
          <p>
            No vocabulary assumed. Every term is explained the first time it
            appears.
          </p>
        </article>
        <article>
          <Ear size={20} />
          <h2>Train your nose</h2>
          <p>
            A ten-minute exercise you can do at home with one spray and a piece
            of paper.
          </p>
        </article>
        <article>
          <Compass size={20} />
          <h2>Find what is yours</h2>
          <p>
            Finish the course able to read any fragrance — including the four in
            our house.
          </p>
        </article>
      </section>

      <section className="school-curriculum" id="curriculum">
        <div className="commerce-heading">
          <div>
            <p className="eyebrow">The curriculum</p>
            <h2 className="display-title">Eight chapters.</h2>
          </div>
          <p>
            Take them in order, or go straight to the one you came for. Each
            stands on its own.
          </p>
        </div>

        <ol className="school-chapter-cards">
          {LESSONS_WITH_NUMBERS.map((lesson, index) => (
            <Reveal
              as="li"
              key={lesson.slug}
              index={index}
              className="school-chapter-card"
            >
              <Link href={`/scent-school/${lesson.slug}`}>
                <div className="school-chapter-image">
                  <Image
                    src={lesson.image}
                    alt=""
                    fill
                    sizes="(max-width: 760px) 100vw, 33vw"
                    className="object-cover"
                    loading={index < 3 ? undefined : "lazy"}
                  />
                  <span className="school-chapter-number">{lesson.number}</span>
                </div>
                <div className="school-chapter-copy">
                  <h3>{lesson.title}</h3>
                  <p>{lesson.summary}</p>
                  <span className="school-chapter-meta">
                    <Clock3 size={13} aria-hidden="true" />
                    {lesson.minutes} min
                    <i aria-hidden="true" />
                    Read chapter <ArrowRight size={14} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="school-final">
        <p className="eyebrow">Your next lesson is personal</p>
        <h2 className="display-title">Which feeling will you wear today?</h2>
        <div>
          <Link href="/#scent-finder" className="lux-button">
            Find your scent <ArrowRight size={16} />
          </Link>
          <Link href="/shop" className="btn-ghost">
            Explore all fragrances <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
