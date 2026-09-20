import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

import {
  readConsent,
  writeConsent,
  clearConsent,
  CONSENT_KEY,
} from "../src/lib/consent.ts";

const read = (path: string) => readFileSync(path, "utf8");

// Minimal DOM stand-ins: the consent module only needs localStorage and an
// event target, so we fake those rather than pulling in a DOM library.
function installWindow() {
  const store = new Map<string, string>();
  const win = {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    },
    dispatchEvent: () => true,
  };
  (globalThis as Record<string, unknown>).window = win;
  (globalThis as Record<string, unknown>).CustomEvent = class {};
  return store;
}

test("no consent stored means analytics is off - silence is never consent", () => {
  installWindow();
  assert.equal(readConsent(), null);
});

test("a decision round-trips, and declining is stored as an explicit false", () => {
  installWindow();
  writeConsent(true);
  assert.equal(readConsent()?.analytics, true);
  writeConsent(false);
  // Declining must persist: otherwise the banner would nag until accepted,
  // which makes refusing more costly than accepting.
  assert.equal(readConsent()?.analytics, false);
});

test("withdrawal clears the decision so the banner asks again", () => {
  installWindow();
  writeConsent(true);
  clearConsent();
  assert.equal(readConsent(), null);
});

test("corrupt or unparseable storage is treated as no consent", () => {
  const store = installWindow();
  store.set(CONSENT_KEY, "{not json");
  assert.equal(readConsent(), null);
  store.set(CONSENT_KEY, JSON.stringify({ analytics: "yes" }));
  assert.equal(readConsent(), null);
});

test("GA4 and the page beacon never fire without a consent check", () => {
  for (const file of [
    "src/components/Analytics.tsx",
    "src/components/PageViewTracker.tsx",
  ]) {
    assert.match(
      read(file),
      /readConsent\(\)/,
      `${file} must gate measurement on DPDP analytics consent`,
    );
  }
});

test("marketing consent is opt-in, never defaulted on", () => {
  assert.match(
    read("prisma/schema.prisma"),
    /marketingOptIn Boolean\s+@default\(false\)/,
    "leads.marketing_opt_in must default to false under DPDP s.6",
  );
});
