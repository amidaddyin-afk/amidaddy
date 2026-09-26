/**
 * A same-site path to redirect to after sign-in, or `fallback`.
 *
 * `startsWith("/") && !startsWith("//")` is not enough: browsers read `/\evil.com`
 * as `//evil.com`, and the URL parser strips tabs and newlines, so `/<tab>/evil.com`
 * becomes `//evil.com` too. Resolving against a throwaway origin and requiring
 * the origin to survive catches every such form.
 */
export function safeRedirectPath(value: unknown, fallback = "/account") {
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;
  const base = "https://same-site.invalid";
  try {
    const url = new URL(value, base);
    if (url.origin !== base) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
