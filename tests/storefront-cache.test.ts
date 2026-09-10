import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

/** Source with comments removed, so an assertion cannot match a comment that
 *  merely *mentions* the thing it is forbidding. */
const readCode = (path: string) =>
  read(path)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

/**
 * The storefront cache fails silently. If a page regains a dynamic dependency
 * — cookies(), headers(), or searchParams in a server component — Next drops
 * it back to per-request rendering with no error and no warning, and every
 * visitor hits Supabase again. These tests pin the conditions that keep the
 * homepage and product pages cacheable.
 */

test("storefront pages declare a revalidate window", () => {
  for (const page of ["src/app/page.tsx", "src/app/products/[slug]/page.tsx"]) {
    assert.match(
      read(page),
      /export const revalidate = \d+/,
      `${page} must export a revalidate window or it renders per request`,
    );
  }
});

test("public catalogue reads do not use the cookie-bearing Supabase client", () => {
  const catalog = readCode("src/lib/catalog.ts");
  // The two functions the storefront calls must use the anonymous client;
  // createClient() reads cookies, which opts every calling page out of cache.
  for (const fn of ["listCatalogProducts", "getCatalogProductBySlug"]) {
    const start = catalog.indexOf(`export async function ${fn}`);
    assert.ok(start > -1, `${fn} not found in catalog.ts`);
    // Body runs until the next top-level export.
    const rest = catalog.slice(start + 1);
    const end = rest.indexOf("\nexport ");
    const body = end === -1 ? rest : rest.slice(0, end);
    assert.ok(
      body.includes("createPublicClient()"),
      `${fn} must use createPublicClient() — createClient() reads cookies and kills the page cache`,
    );
    assert.ok(
      !/await createClient\(\)/.test(body),
      `${fn} must not call createClient() — it reads cookies and kills the page cache`,
    );
  }
});

test("the product page prerenders its slugs", () => {
  // Without generateStaticParams, Next cannot know which products exist, so it
  // renders each on demand and the revalidate window never applies.
  assert.match(
    read("src/app/products/[slug]/page.tsx"),
    /export async function generateStaticParams/,
    "product page needs generateStaticParams to be prerendered",
  );
});

test("cached storefront pages do not read searchParams on the server", () => {
  for (const page of ["src/app/page.tsx", "src/app/products/[slug]/page.tsx"]) {
    assert.ok(
      !/searchParams/.test(readCode(page)),
      `${page} must not read searchParams — it forces dynamic rendering. Read the param client-side instead.`,
    );
  }
});

test("ProductDetail reads ?size= without suspending", () => {
  const detail = readCode("src/components/ProductDetail.tsx");
  // useSearchParams() on a prerendered page forces a Suspense boundary whose
  // fallback ships an empty product page to crawlers.
  assert.ok(
    !/useSearchParams/.test(detail),
    "ProductDetail must not use useSearchParams — its Suspense fallback would empty the prerendered HTML",
  );
  assert.match(
    detail,
    /window\.location\.search/,
    "ProductDetail should read ?size= from window.location in an effect",
  );
});

test("every catalogue mutation clears the storefront cache", () => {
  // Admin edits must appear immediately rather than waiting out the window.
  const productsRoute = read("src/app/api/admin/products/route.ts");
  const created = productsRoute.match(/revalidateStorefront\(\)/g) ?? [];
  assert.ok(
    created.length >= 4,
    `admin products route should revalidate after create, update, delete and restore (found ${created.length})`,
  );

  const adminActions = read("src/features/admin/actions.ts");
  assert.ok(
    (adminActions.match(/revalidateStorefront\(\)/g) ?? []).length >= 2,
    "stock adjustment and store settings must both revalidate the storefront",
  );

  // A paid order decrements stock; the storefront would otherwise keep showing
  // a sold-out variant as available until the window expired.
  assert.match(
    read("src/lib/orders.ts"),
    /revalidateStorefront\(\)/,
    "markOrderPaid must revalidate the storefront after stock is decremented",
  );
});
