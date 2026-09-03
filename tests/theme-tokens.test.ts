import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const read = (path: string) => readFileSync(path, "utf8");
const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });

test("the design system is a single fixed palette - no theme switching left behind", () => {
  // Site went from a 3-theme (noir/atelier/duality) admin-switchable system to
  // one fixed monochrome look. Nothing should still reference the old
  // data-theme mechanism.
  for (const file of walk("src")) {
    if (!file.endsWith(".ts") && !file.endsWith(".tsx")) continue;
    const source = read(file);
    assert.ok(
      !/getSiteTheme|SITE_THEMES|SiteTheme\b/.test(source),
      `${file} still references the removed theme-switching system`,
    );
  }
  assert.ok(
    !/data-theme=\{/.test(read("src/app/layout.tsx")),
    "layout.tsx should no longer set a dynamic data-theme attribute",
  );
});

test("tokens.css has no per-theme selector blocks left over", () => {
  const tokens = read("src/styles/tokens.css");
  // The old system keyed whole palette blocks off data-theme="noir" /
  // "atelier" / "duality". A fixed single-look system should have no such
  // attribute-selector left (chrome/image-surface overrides key off
  // data-surface instead, which is fine and expected).
  assert.ok(
    !/\[data-theme=/.test(tokens),
    "tokens.css still contains a data-theme attribute selector",
  );
});

test("legacy aliases are re-declared per surface, not only on :root", () => {
  const tokens = read("src/styles/tokens.css");
  // A `--paper: var(--fg)` declared only at :root resolves against root's --fg
  // and inherits that resolved value, so a differently-scoped surface (e.g.
  // the always-dark chrome) would keep the wrong text color.
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
    `these files still use white utilities that bypass the token system:\n${offenders.join("\n")}`,
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
  // Arbitrary Tailwind values like bg-[#0e0e0e] and text-[#D4AF37] bypass the
  // token system - keep every color decision in tokens.css/globals.css so a
  // future palette change doesn't require hunting through components.
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

test("text on photography stays legible regardless of the surrounding page", () => {
  const tokens = read("src/styles/tokens.css");
  // A photograph is the same file everywhere, so overlay text colored from
  // --fg (near-black on the paper surface) would go invisible on a dark
  // campaign frame. These contexts re-point the tokens to light-on-photo.
  const block = tokens.slice(tokens.indexOf('[data-surface="image"]'));
  for (const sel of [
    ".school-hero",
    ".mobile-menu",
    ".search-overlay",
    ".signature-panel-copy",
    ".shop-hero-copy",
    ".product-badge",
  ]) {
    assert.ok(
      block.includes(sel),
      `${sel} sits on a dark scrim and must use the image tokens`,
    );
  }
  assert.match(block, /--fg: var\(--on-image\)/);
  assert.match(block, /--fg-muted: var\(--on-image-muted\)/);
});

test("the fixed chrome collapses while the cart is open", () => {
  // The announcement bar is z-index 80 and the header 70, both above the cart
  // panel, so the bar covered the panel's close button.
  assert.match(
    read("src/app/globals.css"),
    /body\[data-overlay="cart"\][\s\S]{0,120}\.site-header/,
  );
  assert.match(
    read("src/components/CartSidebar.tsx"),
    /document\.body\.dataset\.overlay = "cart"/,
  );
  assert.match(
    read("src/components/CartSidebar.tsx"),
    /delete document\.body\.dataset\.overlay/,
  );
});

test("border-radius is zero everywhere - the sharp-edged system constraint", () => {
  const tokens = read("src/styles/tokens.css");
  for (const token of [
    "--radius-sm: 0px",
    "--radius-md: 0px",
    "--radius-lg: 0px",
    "--radius-pill: 0px",
  ]) {
    assert.ok(
      tokens.includes(token),
      `${token} must be declared in tokens.css`,
    );
  }
});
