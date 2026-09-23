import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";

import {
  CHAPTERS_WITH_NUMBERS,
  TOTAL_CHAPTERS,
  NOTES_CAVEAT,
} from "../src/lib/scent-journey.ts";
import { LESSONS_WITH_NUMBERS } from "../src/lib/scent-school.ts";

const read = (path: string) => readFileSync(path, "utf8");

test("chapter numbers are derived from position, never hand-written", () => {
  CHAPTERS_WITH_NUMBERS.forEach((chapter, index) => {
    assert.equal(chapter.number, String(index + 1).padStart(2, "0"));
  });
  assert.equal(TOTAL_CHAPTERS, 7);
});

test("every chapter link points at a lesson that exists", () => {
  // A chapter linking to a dead slug would 404 mid-story, which is the one
  // navigation failure this page cannot afford.
  const slugs = new Set(LESSONS_WITH_NUMBERS.map((lesson) => lesson.slug));
  for (const chapter of CHAPTERS_WITH_NUMBERS) {
    if (!chapter.chapter) continue;
    assert.ok(
      slugs.has(chapter.chapter),
      `chapter ${chapter.number} links to missing lesson "${chapter.chapter}"`,
    );
  }
});

test("laboratory chapters carry the illustration notice", () => {
  // The brief forbids process imagery reading as documentary footage of the
  // brand's own production. Any chapter depicting perfumery equipment must
  // declare itself an illustration.
  for (const id of ["essence", "balance", "time"]) {
    const chapter = CHAPTERS_WITH_NUMBERS.find((c) => c.id === id);
    assert.ok(chapter, `chapter ${id} is missing`);
    assert.equal(
      chapter.illustrationNotice,
      true,
      `chapter ${id} shows perfumery equipment and must be labelled an illustration`,
    );
  }
  assert.match(
    read("src/components/journey/ChapterScene.tsx"),
    /illustrated introduction to perfumery/,
    "the notice text must render, not just exist as a flag",
  );
});

test("no chapter claims a fixed duration or a brand-specific process", () => {
  // Top/heart/base are overlapping perceptual stages, and the brand's own
  // maturation and extraction routes are not published. Neither may be
  // invented here.
  const prose = CHAPTERS_WITH_NUMBERS.map(
    (c) => `${c.standfirst} ${c.body}`,
  ).join(" ");
  assert.doesNotMatch(
    prose,
    /\b\d+\s*(hours?|days?|weeks?|months?)\b/i,
    "a chapter states a duration the brand has not published",
  );
  assert.doesNotMatch(
    prose,
    /\bsteam.distill|\bcold.press|\bour (factory|distillery|lab)\b/i,
    "a chapter attributes a specific production method to the brand",
  );
});

test("the note-versus-ingredient caveat is stated, not implied", () => {
  assert.match(NOTES_CAVEAT, /not what is literally in the formula/i);
  assert.match(
    read("src/components/journey/NotesExplorer.tsx"),
    /NOTES_CAVEAT/,
    "the caveat must render on the page",
  );
  assert.match(
    read("src/components/journey/NotesExplorer.tsx"),
    /Scent notes, not manufacturing ingredients/,
  );
});

test("signature notes come from the catalog rather than restated prose", () => {
  // Hardcoding note lists here is how a marketing page drifts from the
  // approved ones in data.ts. The page must read them instead - via the live
  // catalogue, which serves the approved notes and the homepage card photos.
  assert.match(read("src/app/scent-school/page.tsx"), /from "@\/lib\/catalog"/);
  assert.doesNotMatch(
    read("src/lib/scent-journey.ts"),
    /oakmoss|tonka|ambergris/i,
    "note lists belong in src/lib/data.ts, not in the journey copy",
  );
});

test("essential information never depends on hover", () => {
  // The brief forbids hover-only content. Family descriptions render up front;
  // selection only emphasises them.
  const source = read("src/components/journey/NotesExplorer.tsx");
  assert.match(
    source,
    /family\.line/,
    "family descriptions must always render",
  );
  assert.doesNotMatch(source, /onMouseEnter|onMouseOver/);
});

test("the journey never pins scrolling or traps input", () => {
  // Pinned sections and intercepted wheel/touch events are the failure mode
  // this redesign is meant to avoid.
  for (const file of [
    "src/components/journey/ScentSchoolExperience.tsx",
    "src/components/journey/ChapterScene.tsx",
  ]) {
    const source = read(file);
    assert.doesNotMatch(
      source,
      /onWheel|onTouchMove|preventDefault\(\)|position:\s*sticky/,
      `${file} must not intercept scrolling`,
    );
  }
});

test("motion is gated on prefers-reduced-motion in every animated component", () => {
  // Every animated component routes through useJourneyMotion, which combines
  // the OS setting, the page-level Skip toggle and a mount flag.
  for (const file of [
    "src/components/journey/ScentSchoolExperience.tsx",
    "src/components/journey/ChapterScene.tsx",
    "src/components/journey/ChapterFilm.tsx",
  ]) {
    assert.match(
      read(file),
      /useJourneyMotion\(\)/,
      `${file} animates and must respect prefers-reduced-motion`,
    );
  }
  const hook = read("src/components/journey/useJourneyMotion.ts");
  assert.match(hook, /useReducedMotion\(\)/);
  assert.match(hook, /useSkipAnimation\(\)/);
  // The mount gate is what stops SSR and the first client render disagreeing
  // on animated styles, which React reports as a hydration error.
  assert.match(hook, /useSyncExternalStore/);
  assert.match(
    read("src/styles/redesign/journey.css"),
    /@media \(prefers-reduced-motion: reduce\)/,
  );
});

test("scrubbed video never autoplays and never floods the decoder", () => {
  const film = read("src/components/journey/ChapterFilm.tsx");
  // Muted + playsInline + never played: seeking a paused element needs no
  // autoplay permission, and mixing play() with seeking fights the scrubber.
  assert.match(film, /muted/);
  assert.match(film, /playsInline/);
  assert.doesNotMatch(
    film,
    /\.play\(\)/,
    "scroll position is the only clock; nothing may call play()",
  );

  const scrub = read("src/components/journey/useScrubbedVideo.ts");
  // One seek in flight at a time, latest target wins.
  assert.match(scrub, /seeking\.current/);
  assert.match(scrub, /pending\.current/);
  // Duration is NaN until metadata arrives; seeking before then is discarded.
  assert.match(scrub, /loadedmetadata/);
  assert.match(scrub, /clamp\(/);
  // The rAF loop must be cancelled, or leaving the page leaks a frame loop.
  assert.match(scrub, /cancelAnimationFrame/);
});

test("films load lazily, one source per device, with a poster underneath", () => {
  const film = read("src/components/journey/ChapterFilm.tsx");
  // No src until the chapter is near the viewport: six films must not be
  // fetched on first paint.
  assert.match(film, /IntersectionObserver/);
  // One file per device. A hidden desktop video beside a visible mobile one
  // would double the bytes.
  assert.match(film, /matchMedia/);
  // The poster is only hidden once a real frame has painted.
  assert.match(film, /onLoadedData/);
  assert.match(film, /chapter-film-poster/);
  // A failed load falls back to the poster rather than a black box.
  assert.match(film, /onError/);
});

test("every mapped film has both encodes and both posters on disk", () => {
  // A chapter pointing at a film that was never encoded renders a permanent
  // poster with no explanation, which is invisible in review.
  for (const chapter of CHAPTERS_WITH_NUMBERS) {
    if (!chapter.film) continue;
    for (const file of [
      `${chapter.film}-desktop.mp4`,
      `${chapter.film}-desktop.jpg`,
      `${chapter.film}-mobile.mp4`,
      `${chapter.film}-mobile.jpg`,
    ]) {
      assert.ok(
        existsSync(`public/scent-school/film/${file}`),
        `missing ${file} - re-run scripts/encode-scent-school.mjs`,
      );
    }
  }
});

test("delivery encodes are seek-friendly, silent and faststart", () => {
  // These three properties are why scrubbing is smooth. Asserted against the
  // encoder settings, since the encoded files are binary.
  const script = read("scripts/encode-scent-school.mjs");
  assert.match(
    script,
    /"-g",\s+"5"/,
    "keyframe interval must stay tight, or seek cost climbs across the clip",
  );
  assert.match(script, /"-sc_threshold",\s+"0"/);
  assert.match(script, /"-an"/, "delivery encodes carry no audio track");
  assert.match(script, /\+faststart/);
});

test("the story is reachable without finishing it - skip and chapter anchors", () => {
  const index = read("src/components/journey/ChapterIndex.tsx");
  assert.match(index, /#lessons/, "a skip link to the lessons must exist");
  assert.match(index, /href=\{`#\$\{chapter\.id\}`\}/);
});
