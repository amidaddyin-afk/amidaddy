import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import {
  SITE_THEMES,
  DEFAULT_THEME,
  THEME_LABELS,
} from "../src/lib/theme-config.ts";

const read = (path: string) => readFileSync(path, "utf8");
const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });

test("every theme has a label and the default is a real theme", () => {
  assert.ok(SITE_THEMES.includes(DEFAULT_THEME));
  for (const theme of SITE_THEMES) {
    assert.ok(THEME_LABELS[theme]?.name, `${theme} needs a name`);
    assert.ok(THEME_LABELS[theme]?.blurb, `${theme} needs a blurb`);
  }
});

test("each theme resolves both a dark and a light surface rule", () => {
  const tokens = read("src/styles/tokens.css");
  for (const theme of SITE_THEMES) {
    assert.ok(
      tokens.includes(`data-theme="${theme}"`),
      `${theme} is never referenced in tokens.css`,
    );
  }
  // The two palette blocks must each define the full semantic set, otherwise a
  // surface can inherit a half-applied palette.
  for (const token of [
    "--bg:",
    "--fg:",
    "--line:",
    "--accent:",
    "--bg-band:",
  ]) {
    const count = tokens.split(token).length - 1;
    assert.ok(count >= 3, `${token} should be declared in every palette block`);
  }
});

test("legacy aliases are re-declared per surface, not only on :root", () => {
  const tokens = read("src/styles/tokens.css");
  // A `--paper: var(--fg)` declared only at :root resolves against root's --fg
  // and inherits that resolved value, so dark surfaces would keep light text.
  assert.match(
    tokens,
    /:root,\s*\n\[data-surface\]\s*\{[^}]*--paper:\s*var\(--fg\)/,
    "legacy aliases must be declared on [data-surface] too",
  );
});

test("JSX no longer hard-codes theme-blind white utilities", () => {
  const offenders: string[] = [];
  for (const file of walk("src").filter((f) => f.endsWith(".tsx"))) {
    const source = read(file);
    if (/\b(text|border|bg)-white(\/\d+)?\b/.test(source)) offenders.push(file);
  }
  assert.deepEqual(
    offenders,
    [],
    `these files still use white utilities that break under the light theme:\n${offenders.join("\n")}`,
  );
});

test("every page shell declares a data-surface", () => {
  const shells = [
    ["src/app/page.tsx", "story"],
    ["src/app/scent-school/page.tsx", "story"],
    ["src/components/ProductDetail.tsx", "story"],
    ["src/app/shop/page.tsx", "commerce"],
    ["src/app/account/page.tsx", "commerce"],
    ["src/components/CheckoutClient.tsx", "commerce"],
    ["src/components/AdminPortal.tsx", "commerce"],
    ["src/app/policies/[slug]/page.tsx", "commerce"],
  ] as const;
  for (const [file, surface] of shells) {
    assert.match(
      read(file),
      new RegExp(`data-surface="${surface}"`),
      `${file} must declare data-surface="${surface}"`,
    );
  }
});

test("footer account links are client-resolved, not server-rendered", () => {
  const footer = read("src/components/Footer.tsx");
  const links = read("src/components/FooterAccountLinks.tsx");

  // Reading the session in the footer would call cookies() from the root
  // layout and turn every statically prerendered route into a per-request
  // render, so the footer must not import the server auth helpers.
  assert.ok(
    !/getCurrentUser|@\/lib\/auth|lib\/supabase\/server/.test(footer),
    "Footer must not read auth on the server - it would de-optimise every static route",
  );
  assert.match(footer, /<FooterAccountLinks \/>/);

  // Both branches must exist: signed-out offers sign in / create account,
  // signed-in replaces them with account links.
  assert.match(links, /"use client"/);
  assert.match(links, /signed-in/);
  assert.match(links, /href="\/account"/);
  assert.match(links, /href="\/login"/);
  assert.match(links, /href="\/signup"/);
});

test("footer offers an admin sign-in without advertising the admin route", () => {
  const footer = read("src/components/Footer.tsx");
  assert.match(
    footer,
    /href="\/login\?next=\/admin"/,
    "admin entry point should go through the login page",
  );
  assert.ok(
    !/href="\/admin"/.test(footer),
    "footer should not link straight to /admin",
  );
});

test("JSX carries no hard-coded hex colours", () => {
  // Arbitrary Tailwind values like bg-[#0e0e0e] and text-[#D4AF37] are
  // theme-blind: they looked right on the old dark-only design and become
  // invisible under the light theme.
  const offenders: string[] = [];
  for (const file of walk("src").filter((f) => f.endsWith(".tsx"))) {
    if (/\[#[0-9a-fA-F]{3,8}\]/.test(read(file))) offenders.push(file);
  }
  assert.deepEqual(offenders, [], `hard-coded hex in: ${offenders.join(", ")}`);
});

test("fill images always have a positioned parent", () => {
  // next/image with `fill` needs position: relative|absolute|fixed on its
  // parent. Setting it only inside a media query leaves the image unanchored
  // at every other width.
  const css = read("src/app/globals.css");
  assert.match(
    css,
    /\.auth-aside \{\s*position: relative;/,
    ".auth-aside must be positioned at every width, not only in a media query",
  );
});
