import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, statSync } from "node:fs";

// Line endings are normalised because these tests match on source text with
// embedded newlines, and git checks these files out as CRLF on Windows.
const read = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8").replaceAll(
    "\r\n",
    "\n",
  );

const SLUGS = ["billionaire", "coldwar", "heavenly", "old-love"];

/**
 * The hero loops are committed binaries, so nothing at build time catches a
 * missing or accidentally re-added camera master. These tests do.
 */

test("every product with a hero video has both encodings committed", () => {
  const detail = read("src/components/ProductDetail.tsx");
  for (const slug of SLUGS) {
    assert.ok(
      detail.includes(`"${slug}"`),
      `${slug} should be listed in VIDEO_SLUGS`,
    );
    for (const ext of ["webm", "mp4"]) {
      const path = new URL(`../public/videos/${slug}.${ext}`, import.meta.url);
      assert.ok(
        statSync(path).size > 0,
        `public/videos/${slug}.${ext} is missing or empty`,
      );
    }
  }
});

test("hero loops stay small enough to ship in the repo", () => {
  // A camera master is 100+ MB. Anything over 6 MB here means someone copied a
  // master in rather than running scripts/encode-product-video.mjs.
  for (const slug of SLUGS) {
    for (const ext of ["webm", "mp4"]) {
      const path = new URL(`../public/videos/${slug}.${ext}`, import.meta.url);
      const mb = statSync(path).size / 1048576;
      assert.ok(
        mb < 6,
        `public/videos/${slug}.${ext} is ${mb.toFixed(1)} MB — re-encode it, masters must not be committed`,
      );
    }
  }
});

test("the hero video is muted, looping and autoplay-eligible", () => {
  const source = read("src/components/HeroVideo.tsx");
  // Browsers only autoplay muted + playsInline; without all three the hero is
  // silently a still frame.
  for (const attribute of ["autoPlay", "muted", "loop", "playsInline"]) {
    assert.ok(
      source.includes(`
      ${attribute}
`),
      `HeroVideo must set ${attribute} on the <video> element`,
    );
  }
});

test("the hero video respects reduced motion and metered connections", () => {
  const source = read("src/components/HeroVideo.tsx");
  assert.match(source, /prefers-reduced-motion/);
  assert.match(source, /saveData/);
});

test("the CSP allows self-hosted media", () => {
  // Without media-src the video inherits default-src; stating it explicitly
  // stops a future default-src change from silently blocking playback.
  assert.match(read("next.config.ts"), /"media-src 'self'"/);
});
