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
  assert.match(css, /prefers-reduced-motion[\s\S]*?photo-fade/);
});
