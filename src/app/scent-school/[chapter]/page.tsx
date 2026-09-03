import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import {
  LESSONS_WITH_NUMBERS,
  getLesson,
  getLessonNeighbours,
} from "@/lib/scent-school";
import LessonBlocks from "@/components/LessonBlocks";
import ReadingProgress from "@/components/ReadingProgress";
import Reveal from "@/components/Reveal";

export function generateStaticParams() {
  return LESSONS_WITH_NUMBERS.map((lesson) => ({ chapter: lesson.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapter: string }>;
}): Promise<Metadata> {
  const { chapter } = await params;
  const lesson = getLesson(chapter);
  if (!lesson) return { title: "Scent School" };
  return {
    title: `${lesson.title} · Scent School`,
    description: lesson.summary,
    alternates: { canonical: `/scent-school/${lesson.slug}` },
  };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter } = await params;
  const lesson = getLesson(chapter);
  if (!lesson) notFound();

  const { previous, next } = getLessonNeighbours(lesson.slug);
  const position = LESSONS_WITH_NUMBERS.indexOf(lesson) + 1;

  return (
    <main data-surface="story" className="lesson-page cinematic">
      {/* Reading progress for this chapter, kept visible the whole way down. */}
      <ReadingProgress />

      <header className="lesson-hero">
        <div className="lesson-hero-media">
          <Image
            src={lesson.image}
            alt={lesson.imageAlt}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 46vw"
            className="object-cover"
          />
        </div>
        <div className="lesson-hero-copy">
          <Link href="/scent-school" className="lesson-back">
            <ArrowLeft size={14} /> Scent School
          </Link>
          <p className="lesson-kicker">
            Chapter {lesson.number}
            <i aria-hidden="true" />
            {lesson.title}
          </p>
          <h1>{lesson.heading}</h1>
          <p className="lesson-lede">{lesson.lede}</p>
          <p className="lesson-meta">
            <Clock3 size={14} aria-hidden="true" />
            {lesson.minutes} min read
            <span aria-hidden="true">·</span>
            Lesson {position} of {LESSONS_WITH_NUMBERS.length}
          </p>
        </div>
      </header>

      <article className="lesson-body">
        <LessonBlocks blocks={lesson.blocks} />

        <Reveal className="lesson-takeaway">
          <p className="eyebrow">Remember this</p>
          <p>{lesson.takeaway}</p>
        </Reveal>

        {lesson.sources && (
          <div className="lesson-sources">
            <h2>Sources</h2>
            <ul>
              {lesson.sources.map((source) => (
                <li key={source}>{source}</li>
              ))}
            </ul>
          </div>
        )}
      </article>

      <nav className="lesson-nav" aria-label="Course navigation">
        {previous ? (
          <Link href={`/scent-school/${previous.slug}`} data-direction="prev">
            <span>
              <ArrowLeft size={14} aria-hidden="true" /> Previous
            </span>
            <strong>{previous.title}</strong>
          </Link>
        ) : (
          <Link href="/scent-school" data-direction="prev">
            <span>
              <ArrowLeft size={14} aria-hidden="true" /> Back
            </span>
            <strong>All chapters</strong>
          </Link>
        )}
        {next ? (
          <Link href={`/scent-school/${next.slug}`} data-direction="next">
            <span>
              Next lesson <ArrowRight size={14} aria-hidden="true" />
            </span>
            <strong>{next.title}</strong>
          </Link>
        ) : (
          <Link href="/#scent-finder" data-direction="next">
            <span>
              You have finished the course{" "}
              <ArrowRight size={14} aria-hidden="true" />
            </span>
            <strong>Find your scent</strong>
          </Link>
        )}
      </nav>

      {/* The whole curriculum stays one click away from every lesson. */}
      <section className="lesson-index" aria-label="All chapters">
        <p className="eyebrow">The curriculum</p>
        <ol>
          {LESSONS_WITH_NUMBERS.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/scent-school/${item.slug}`}
                aria-current={item.slug === lesson.slug ? "page" : undefined}
              >
                <span>{item.number}</span>
                {item.title}
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
