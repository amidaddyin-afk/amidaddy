import { test } from "node:test";
import assert from "node:assert/strict";
import { safeRedirectPath } from "../src/lib/safe-redirect.ts";

test("post-login redirects stay on this site", () => {
  const bs = String.fromCharCode(92);
  for (const hostile of [
    "//evil.com",
    `/${bs}evil.com`,
    `/${bs}/evil.com`,
    "/\t/evil.com",
    "/\n/evil.com",
    "https://evil.com",
    "evil.com",
    "",
    null,
    undefined,
  ])
    assert.equal(safeRedirectPath(hostile), "/account", String(hostile));
  assert.equal(safeRedirectPath("/admin"), "/admin");
  assert.equal(
    safeRedirectPath("/products/old-love?size=20ml#notes"),
    "/products/old-love?size=20ml#notes",
  );
  assert.equal(safeRedirectPath("//evil.com", "/"), "/");
});
