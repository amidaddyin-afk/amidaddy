import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { EASE, DURATION, staggerDelay } from "../src/lib/motion.ts";

const read = (path: string) => readFileSync(path, "utf8");
const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });

test("easing curves are valid cubic-bezier control points", () => {
  for (const [name, curve] of Object.entries(EASE)) {
    assert.equal(curve.length, 4, `${name} needs four control points`);
    // x components must stay in [0,1] or the curve is not a valid timing function.
    assert.ok(curve[0] >= 0 && curve[0] <= 1, `${name} x1 out of range`);
    assert.ok(curve[2] >= 0 && curve[2] <= 1, `${name} x2 out of range`);
  }
});

test("stagger is capped so long grids do not tail off", () => {
  assert.equal(staggerDelay(0), 0);
  // Beyond the cap every later item shares the last delay.
  assert.equal(staggerDelay(5), staggerDelay(50));
  assert.ok(staggerDelay(50) < DURATION.slow, "stagger must not exceed a beat");
});

test("the Chromium-only scroll reveal is gone", () => {
  const css = read("src/app/globals.css");
  // The old system lived behind @supports (animation-timeline: view()) with no
  // fallback, so it silently did nothing in Safari and Firefox.
  assert.ok(
    !/\[data-reveal\]/.test(css),
    "data-reveal CSS should be replaced by the Reveal component",
  );
  for (const file of walk("src").filter((f) => f.endsWith(".tsx"))) {
    const source = read(file);
    if (file.endsWith("Reveal.tsx")) continue; // its doc comment names the old API
    assert.ok(
      !/data-reveal/.test(source),
      `${file} still uses the removed data-reveal attribute`,
    );
  }
});

test("shared-element morph names cannot collide across sizes", () => {
  const card = read("src/components/ProductCard.tsx");
  const detail = read("src/components/ProductDetail.tsx");
  // /shop and the homepage each render every product twice, once per size.
  // Two mounted ViewTransitions with one name break the transition outright.
  assert.match(card, /name=\{`product-\$\{product\.slug\}-\$\{size\}`\}/);
  assert.match(detail, /`product-\$\{product\.slug\}-\$\{size\}`/);
});

test("hero dwell time matches its Ken Burns transform", () => {
  const hero = read("src/components/CuratedHero.tsx");
  const css = read("src/app/globals.css");
  const dwell = hero.match(/HERO_SLIDE_MS = (\d+)/);
  assert.ok(dwell, "hero must declare its dwell time");
  const seconds = Number(dwell[1]) / 1000;
  // The slide advanced at 5.5s while the transform ran 6.5s, so the push-in
  // never completed. They must agree.
  assert.match(
    css,
    new RegExp(`transform ${seconds}s`),
    `hero transform should run ${seconds}s to match the dwell time`,
  );
});

test("reduced motion is honoured by the new motion primitives", () => {
  assert.match(read("src/components/Reveal.tsx"), /useReducedMotion/);
  assert.match(read("src/components/CuratedHero.tsx"), /useReducedMotion/);
  const css = read("src/app/globals.css");
  // The story reveal and its parallax are the motion that has to stand down.
  assert.match(css, /prefers-reduced-motion[\s\S]*?\.story-media/);
});

test("Photo holds no state, so a cached image cannot update it before mount", () => {
  const photo = read("src/components/Photo.tsx");
  // onLoad fires before mount for an already-cached image, which React reports
  // as a state update on an unmounted component and which broke hydration on
  // image-heavy pages. next/image cross-fades the blur placeholder natively.
  // Match call/prop syntax, not the prose in the doc comment above.
  assert.ok(!/useState\(/.test(photo), "Photo must not hold load state");
  assert.ok(!/onLoad=/.test(photo), "Photo must not bind onLoad");
  assert.ok(
    !/"use client"/.test(photo),
    "Photo should stay a Server Component",
  );
  assert.match(photo, /placeholder: "blur"/);
});

test("the PDP carousel is gone and the vertical story replaces it", () => {
  const detail = read("src/components/ProductDetail.tsx");
  for (const gone of [
    "ChevronLeft",
    "ChevronRight",
    "gallery-controls",
    "product-thumbnail-rail",
    "finishSwipe",
    "selectedImageIndex",
  ]) {
    assert.ok(
      !detail.includes(gone),
      `${gone} is carousel machinery and should be removed`,
    );
  }
  assert.match(detail, /<ProductStory tiles=\{storyTiles\} \/>/);
  // Four images per product, not the ten to fifteen the catalogue holds.
  assert.match(
    detail,
    /STORY_COPY\.slice\(0, Math\.min\(4, images\.length\)\)/,
  );
});

test("story tiles reserve space and never alternate on mobile", () => {
  const css = read("src/app/globals.css");
  // aspect-ratio holds the box before the image decodes, so no layout shift.
  assert.match(css, /\.story-media \{[^}]*aspect-ratio: 4 \/ 5/);
  // The flip only exists inside the >=768px block.
  const tabletBlock = css.slice(css.indexOf("@media (min-width: 768px)"));
  assert.ok(
    tabletBlock.includes("is-flipped"),
    "alternation must be defined inside a min-width query, never on mobile",
  );
});

test("page-enter leaves no transform that would trap fixed children", () => {
  const css = read("src/app/globals.css");
  // With fill-mode: both the final transform keeps applying, making <main> a
  // containing block and pinning the floating buy bar into the page flow.
  assert.match(
    css,
    /animation: page-enter [^;]*backwards;/,
    "page-enter must not use fill-mode both",
  );
});

test("the floating buy bar meets the touch target minimum", () => {
  const css = read("src/app/globals.css");
  assert.match(css, /\.sticky-buy-add \{[^}]*min-height: 2\.75rem/); // 44px
  assert.match(css, /\.sticky-buy-checkout \{[^}]*min-height: 2\.75rem/);
  assert.match(read("src/components/StickyBuyBar.tsx"), /IntersectionObserver/);
});
