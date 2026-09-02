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

/**
 * Reads the active storefront theme from store_settings. Cached and tagged so a
 * one-click change in the admin portal can invalidate it via updateTag.
 *
 * Any failure - no DATABASE_URL, the theme column not yet migrated, a
 * connection error - resolves to DEFAULT_THEME so the site never fails to
 * render over a settings lookup.
 */
export const getSiteTheme = unstable_cache(
  async (): Promise<SiteTheme> => {
    if (!process.env.DATABASE_URL) return DEFAULT_THEME;
    try {
      const { rows } = await db().query<{ theme: string | null }>(
        "select theme from public.store_settings where id = 1",
      );
      const value = rows[0]?.theme;
      return isSiteTheme(value) ? value : DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  },
  ["site-theme"],
  { tags: [SITE_THEME_TAG], revalidate: 3600 },
);
