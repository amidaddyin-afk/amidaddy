import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const css = readFileSync(
  new URL("../src/app/globals.css", import.meta.url),
  "utf8",
);

/**
 * Two layout bugs that were visible on every phone and reported from the live
 * site. Neither produced an error — they just looked broken — so they are
 * pinned here.
 */

test("the product story has no negative margin to overflow the page", () => {
  // ProductStory renders only inside .pdp-unfolds, which has no horizontal
  // padding. A negative margin-inline there has nothing to cancel and makes
  // the document wider than the viewport: a blank stripe down the right edge
  // and a horizontal scroll.
  const rule = /\.product-story\s*\{[^}]*margin-inline:\s*calc\(\s*-1/;
  assert.ok(
    !rule.test(css),
    "a negative margin-inline on .product-story overflows the page — it has no page padding to escape",
  );
});

test("the hero Buy it now button is light on the dark hero", () => {
  // .pdp-buy-now paints itself with --cine-paper, which `body .cinematic`
  // redefines to dark ink for the light page body. The hero sits on dark
  // video/photography, so its instance needs an explicit light colour or the
  // button is invisible.
  const block = css.match(
    /body \.pdp-hero-copy \.pdp-hero-buy-now\s*\{([^}]*)\}/,
  );
  assert.ok(block, "no base rule for .pdp-hero-buy-now in the hero");
  const colour = block[1].match(/(?:^|[;{\s])color:\s*([^;]+)/);
  assert.ok(colour, "the hero Buy it now rule must set a colour");
  // Must be light. The bug was it inheriting dark ink (#171b19) from the
  // page-body token override.
  const hex = colour[1].trim().toLowerCase();
  assert.match(
    hex,
    /^#(f|e|d)/,
    `hero Buy it now colour is ${hex} — it must be light, or it renders dark-on-dark`,
  );
});
