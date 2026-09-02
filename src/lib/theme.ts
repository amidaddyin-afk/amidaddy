import "server-only";

import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import {
  DEFAULT_THEME,
  isSiteTheme,
  SITE_THEME_TAG,
  type SiteTheme,
} from "@/lib/theme-config";

export {
  DEFAULT_THEME,
  SITE_THEMES,
  SITE_THEME_TAG,
  THEME_LABELS,
  type SiteTheme,
} from "@/lib/theme-config";

/** Hard ceiling on the settings lookup.
 *
 * This runs in the ROOT LAYOUT, so it is on the render path of every page
 * including the homepage - somewhere the database was never touched before.
 * On a serverless platform a hung pooler connection would otherwise hold the
 * whole response open. Losing the race costs the default theme, not the page. */
const THEME_QUERY_TIMEOUT_MS = 1_500;

const withTimeout = <T>(work: Promise<T>, fallback: T): Promise<T> =>
  new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), THEME_QUERY_TIMEOUT_MS);
    work
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(fallback);
      });
  });

/**
 * Reads the active storefront theme from store_settings.
 *
 * Cached and tagged so the admin picker can invalidate it through updateTag.
 * With `revalidate` set, the database is read roughly once an hour rather than
 * per request, which keeps this off the hot path for homepage traffic.
 *
 * An override exists mainly as a deploy-time escape hatch: if the settings read
 * is ever the thing breaking the site, SITE_THEME in the environment bypasses
 * the database entirely and needs only a redeploy to take effect.
 *
 * Any failure - no DATABASE_URL, the theme column not yet migrated, a
 * connection error, a slow pooler - resolves to DEFAULT_THEME so the site never
 * fails to render over a settings lookup.
 */
const readThemeFromDatabase = unstable_cache(
  async (): Promise<SiteTheme> => {
    if (!process.env.DATABASE_URL) return DEFAULT_THEME;
    return withTimeout(
      (async () => {
        const { rows } = await db().query<{ theme: string | null }>(
          "select theme from public.store_settings where id = 1",
        );
        const value = rows[0]?.theme;
        return isSiteTheme(value) ? value : DEFAULT_THEME;
      })(),
      DEFAULT_THEME,
    );
  },
  ["site-theme"],
  { tags: [SITE_THEME_TAG], revalidate: 3600 },
);

export async function getSiteTheme(): Promise<SiteTheme> {
  // Checked OUTSIDE the cache on purpose. Inside it, a cache entry written
  // before the variable was set would keep being served, so the escape hatch
  // would not actually take effect until the tag expired.
  const override = process.env.SITE_THEME;
  if (isSiteTheme(override)) return override;
  return readThemeFromDatabase();
}
