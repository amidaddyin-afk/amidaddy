/**
 * Theme constants shared by server and client.
 *
 * Kept separate from theme.ts because that module is "server-only" (it reads
 * the database), and the admin theme picker is a Client Component.
 */
export const SITE_THEMES = ["noir", "atelier", "duality"] as const;
export type SiteTheme = (typeof SITE_THEMES)[number];

export const DEFAULT_THEME: SiteTheme = "duality";
export const SITE_THEME_TAG = "site-theme";

export const THEME_LABELS: Record<SiteTheme, { name: string; blurb: string }> =
  {
    duality: {
      name: "Duality",
      blurb: "Dark story and chrome, light commerce. The house signature.",
    },
    noir: {
      name: "Noir",
      blurb: "Every surface dark. Full cinematic, highest contrast.",
    },
    atelier: {
      name: "Atelier",
      blurb: "Every surface warm paper. Quiet editorial luxury.",
    },
  };

export const isSiteTheme = (value: unknown): value is SiteTheme =>
  typeof value === "string" &&
  (SITE_THEMES as readonly string[]).includes(value);
