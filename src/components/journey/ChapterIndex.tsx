"use client";

import { useEffect, useState } from "react";
import { CHAPTERS_WITH_NUMBERS } from "@/lib/scent-journey";
import { setSkipAnimation, useSkipAnimation } from "./motion-preference";

/**
 * Persistent chapter index.
 *
 * Marks the chapter currently in view and lets a visitor jump straight to any
 * of them, or skip the whole story and land on the article library. Plain
 * anchors, so a URL like /scent-school#skin restores the right reading
 * position on load and the browser handles smooth scrolling through CSS.
 *
 * IntersectionObserver rather than a scroll handler: no listener running on
 * every frame, and it reports the chapter that actually occupies the middle
 * band of the viewport instead of one guessed from offsets.
 */
export default function ChapterIndex() {
  const [active, setActive] = useState<string>(CHAPTERS_WITH_NUMBERS[0].id);
  const skip = useSkipAnimation();

  useEffect(() => {
    const sections = CHAPTERS_WITH_NUMBERS.map((c) =>
      document.getElementById(c.id),
    ).filter((el): el is HTMLElement => el !== null);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // The entry closest to the middle of the viewport wins, so a tall
        // chapter does not hold the marker while the next one fills the screen.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="chapter-index" aria-label="Chapters">
      <ol>
        {CHAPTERS_WITH_NUMBERS.map((chapter) => (
          <li key={chapter.id}>
            <a
              href={`#${chapter.id}`}
              data-state={chapter.id === active ? "current" : "todo"}
              aria-current={chapter.id === active ? "true" : undefined}
            >
              <span aria-hidden="true">{chapter.number}</span>
              <span className="sr-only">
                Chapter {chapter.number}: {chapter.label}
              </span>
            </a>
          </li>
        ))}
      </ol>
      <button
        type="button"
        className="chapter-index-toggle"
        aria-pressed={skip}
        onClick={() => setSkipAnimation(!skip)}
      >
        {skip ? "Animation off" : "Skip animation"}
      </button>
      <a className="chapter-index-skip" href="#lessons">
        Skip to the lessons
      </a>
    </nav>
  );
}
