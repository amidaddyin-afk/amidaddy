# Photo, wording and type audit (28 Oct 2026)

Three changes: a more luxurious typeface, removing alcohol references, and a
full photo inventory so every photo can be replaced later.

Status:

- **Typeface:** done in code.
- **Wording:** done in code. The database still needs one SQL run (see 2.2).
- **Photos:** not started. This document is the plan.

---

## 1. Typeface

|                                                  | Before  | After                                         |
| ------------------------------------------------ | ------- | --------------------------------------------- |
| Headings (`--font-display`, and every `h1`/`h2`) | Inter   | **Cormorant Garamond** 400/500/600 (+ italic) |
| Body and UI (`--font-sans`)                      | Inter   | **Jost** 300/400/500                          |
| Logo wordmark "amidaddy™"                        | Georgia | Georgia (unchanged)                           |

Candidates tested live on the home, product and shop pages: Cormorant + Jost,
Bodoni Moda, Playfair Display, Gilda Display, Italiana and Marcellus.

- **Bodoni** and **Playfair** set wider than Inter. Product names wrapped onto
  two lines ("Cold War") and the card rows went out of line.
- **Italiana** was too thin to read at card sizes.
- **Cormorant** sets close to Inter's width, so the layout holds.

Alignment check: we measured every heading and button on 9 pages at desktop
(1440 px) and phone (390 px) widths, before and after the change.

- Nothing overflows.
- No heading gained a line.
- A few headings lost one ("Your next signature starts here." now fits on one
  line on desktop).

Supporting tweaks:

- Inter's tight letter-spacing (−0.053em) was loosened to −0.01em for headings,
  because the tight setting crushed Cormorant's letters together.
- Lining figures are forced on, so prices like ₹2,876 sit on the line instead
  of dipping below it (Cormorant's default figures do that).

Files: `src/app/layout.tsx`, `src/styles/tokens.css`, `src/app/globals.css`
(body rule, plus a block at the end of the file).

---

## 2. Alcohol wording

### 2.1 Replaced in code

Billionaire's "Whiskey" top note is now **"Oak lactone"**. Oak lactone is the
compound behind the warm, toasted-oak smell, so the note stays accurate without
naming a drink.

| Where                                                        | Before                          | After                               |
| ------------------------------------------------------------ | ------------------------------- | ----------------------------------- |
| `src/lib/data.ts`: top note, card note line                  | Whiskey · Spicy notes · Tobacco | Oak lactone · Spicy notes · Tobacco |
| `src/components/ProductDetail.tsx`: Billionaire intro        | "opens on a warm whiskey note"  | "opens on warm oak lactone"         |
| `src/components/ProductDetail.tsx`: "how it unfolds" caption | "An opening of whiskey notes."  | "An opening of warm, toasted oak."  |
| `public/llms.txt` (summary for AI search tools)              | "Whiskey opening"               | "Toasted oak opening"               |
| `src/app/preview/cinematic/page.tsx` (internal page)         | Whiskey                         | Oak lactone                         |
| `tests/catalog-data.test.ts`                                 | Whiskey                         | Oak lactone                         |

Left alone on purpose:

- "Alcohol" in Scent School explains perfume carriers (oil vs alcohol).
- "Alcohol" in `src/lib/shipping/shadowfax.ts` is the dangerous-goods
  declaration for shipping. Neither refers to a drink.

### 2.2 Database: run this once

The live site reads product notes from Supabase. Run
`prisma/migrations/20261028130000_rename_whiskey_note/migration.sql` in the
Supabase SQL editor. It is safe to run more than once. It also rewrites any
"whiskey" typed into a product's description, SEO description, story or mood
in the admin portal.

Until it runs, the live product page still shows **WHISKEY** above
"Billionaire".

### 2.3 Not changed (internal only)

- `docs/redesign/AMIDADDY-CINEMATIC-REDESIGN-PLAN.md` still says whiskey. It is
  a historical plan.
- `prisma/migrations/20260830120000_align_fragrance_notes/` is an old migration
  that has already run. Do not edit it.

---

## 3. Photos showing alcohol: replace first

We reviewed all 118 site photos and sampled frames from the four fragrance
films. Billionaire is the only fragrance with alcohol in its photos.

| Priority | File                                                  | What it shows                                                                               | Where it appears                                                                               | Size to match       |
| -------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------- |
| **P0**   | `fragrances/billionaire/20ml/studio.webp`             | 20 ml bottle beside a cut-crystal glass of whisky on ice                                    | First photo in the 20 ml gallery; product cards at 20 ml; homepage size showcase; Scent Finder | 1254×1254 square    |
| **P0**   | `site/our-approach/20ml-billionaire.webp` (+ `.avif`) | Same whisky-glass shot                                                                      | Our Approach page, 20 ml row                                                                   | portrait            |
| **P0**   | `fragrances/billionaire/100ml/hero.webp`              | 100 ml bottle and box, whisky glass on the left                                             | Billionaire product page hero at 100 ml                                                        | 2400×1600 landscape |
| **P0**   | `fragrances/billionaire/notes/top.webp`               | Whisky glass splashing, with spices                                                         | Product page "The notes": top                                                                  | 2048×1758           |
| **P1**   | `fragrances/billionaire/notes/heart.webp`             | Amber liquid splash with cinnamon and coriander; reads as liquor next to the top-note photo | "The notes": heart                                                                             | 2048×1825           |
| **P1**   | `fragrances/billionaire/notes/base.webp`              | Amber liquid splash with woods and resin                                                    | "The notes": base                                                                              | 2048×1744           |
| P2       | `fragrances/{coldwar,heavenly,old-love}/notes/*.webp` | Golden liquid splashes. They read as perfume oil, not a drink                               | "The notes" on those pages                                                                     | ~2048 wide          |

Code to tidy when the Billionaire 100 ml hero is replaced:

- `src/components/ProductDetail.tsx` (around line 54) has a special crop that
  keeps the whisky glass out of frame.
- `src/app/globals.css` (around line 5852) has a matching rule.

Remove both once the new photo has no glass. Otherwise the new photo will be
cropped for no reason.

Films (`fragrances/*/film.mp4` + `.webm`): no glass appeared in 8 sampled
frames per film. Watch the Billionaire film end to end before signing off.

---

## 4. Full photo inventory (for the complete reshoot)

Every photo the site serves, with the pixel size and shape the replacement
should match. "Referenced in" names the code file that uses it. `legacy-media.ts`
and `data.ts` feed the product galleries.

How to swap a photo: see `MEDIA.md`. Keep the same file name and format. Where
a `.avif` twin exists, replace both. Admin → Photos can also override product
galleries without code.

Not listed:

- Certification badges (generated).
- Scent School film posters, which come from their videos.
- `site/preview-cinematic/*`, which only appears on an internal design page.

#### `/combos/collection-4x100ml/`

| File              | Size (px) | Shape     | Referenced in                      |
| ----------------- | --------- | --------- | ---------------------------------- |
| `gallery-01.webp` | 1800×1199 | landscape | legacy-media.ts                    |
| `gallery-02.webp` | 1800×1200 | landscape | legacy-media.ts                    |
| `gallery-03.webp` | 1800×1200 | landscape | legacy-media.ts                    |
| `gallery-04.webp` | 1800×1200 | landscape | legacy-media.ts                    |
| `pack-wide.webp`  | 1672×941  | landscape | data.ts, legacy-media.ts, page.tsx |
| `pack.webp`       | 1122×1402 | portrait  | data.ts, legacy-media.ts, page.tsx |

#### `/combos/discovery-4x20ml/`

| File              | Size (px) | Shape    | Referenced in                      |
| ----------------- | --------- | -------- | ---------------------------------- |
| `gallery-01.webp` | 1600×2000 | portrait | legacy-media.ts                    |
| `gallery-02.webp` | 1600×2000 | portrait | legacy-media.ts                    |
| `pack.webp`       | 1891×2364 | portrait | data.ts, legacy-media.ts, page.tsx |

#### `/fragrances/billionaire/100ml/`

| File               | Size (px) | Shape     | Referenced in                                          |
| ------------------ | --------- | --------- | ------------------------------------------------------ |
| `bottle-wide.webp` | 1672×941  | landscape | data.ts, legacy-media.ts, page.tsx                     |
| `bottle.webp`      | 1402×1122 | landscape | SizeShowcase.tsx, catalog.ts, data.ts, legacy-media.ts |
| `hero.webp`        | 2400×1600 | landscape | ProductDetail.tsx                                      |

#### `/fragrances/billionaire/20ml/`

| File               | Size (px) | Shape     | Referenced in                              |
| ------------------ | --------- | --------- | ------------------------------------------ |
| `bottle-wide.webp` | 1672×941  | landscape | data.ts, legacy-media.ts                   |
| `bottle.webp`      | 1086×1448 | portrait  | data.ts, legacy-media.ts                   |
| `catalog.webp`     | 1440×1800 | portrait  | legacy-media.ts                            |
| `studio.webp`      | 1254×1254 | square    | SizeShowcase.tsx, data.ts, legacy-media.ts |

#### `/fragrances/billionaire/campaign/`

| File          | Size (px) | Shape     | Referenced in   |
| ------------- | --------- | --------- | --------------- |
| `3987.webp`   | 1440×1800 | portrait  | legacy-media.ts |
| `3994.webp`   | 1440×1800 | portrait  | legacy-media.ts |
| `4004.webp`   | 1440×1800 | portrait  | legacy-media.ts |
| `4014.webp`   | 1440×1800 | portrait  | legacy-media.ts |
| `4023.webp`   | 1440×1800 | portrait  | legacy-media.ts |
| `4038.webp`   | 1440×1800 | portrait  | legacy-media.ts |
| `4055.webp`   | 1440×1800 | portrait  | legacy-media.ts |
| `detail.webp` | 2400×1600 | landscape | legacy-media.ts |

#### `/fragrances/billionaire/notes/`

| File         | Size (px) | Shape     | Referenced in                     |
| ------------ | --------- | --------- | --------------------------------- |
| `base.webp`  | 2048×1744 | landscape | ProductDetail.tsx (notes section) |
| `heart.webp` | 2048×1825 | landscape | ProductDetail.tsx (notes section) |
| `top.webp`   | 2048×1758 | landscape | ProductDetail.tsx (notes section) |

#### `/fragrances/coldwar/100ml/`

| File          | Size (px) | Shape     | Referenced in                              |
| ------------- | --------- | --------- | ------------------------------------------ |
| `bottle.webp` | 1536×1024 | landscape | SizeShowcase.tsx, data.ts, legacy-media.ts |

#### `/fragrances/coldwar/20ml/`

| File           | Size (px) | Shape     | Referenced in                              |
| -------------- | --------- | --------- | ------------------------------------------ |
| `bottle.webp`  | 1086×1448 | portrait  | data.ts, legacy-media.ts                   |
| `catalog.webp` | 1440×1800 | portrait  | legacy-media.ts                            |
| `studio.webp`  | 1280×1067 | landscape | SizeShowcase.tsx, data.ts, legacy-media.ts |

#### `/fragrances/coldwar/campaign/`

| File        | Size (px) | Shape    | Referenced in   |
| ----------- | --------- | -------- | --------------- |
| `3487.webp` | 1440×1800 | portrait | legacy-media.ts |
| `3527.webp` | 1440×1800 | portrait | legacy-media.ts |
| `3536.webp` | 1440×1800 | portrait | legacy-media.ts |
| `3545.webp` | 1440×1800 | portrait | legacy-media.ts |
| `3577.webp` | 1440×1800 | portrait | legacy-media.ts |

#### `/fragrances/coldwar/notes/`

| File         | Size (px) | Shape     | Referenced in                     |
| ------------ | --------- | --------- | --------------------------------- |
| `base.webp`  | 2048×1805 | landscape | ProductDetail.tsx (notes section) |
| `heart.webp` | 2048×1819 | landscape | ProductDetail.tsx (notes section) |
| `top.webp`   | 2048×1762 | landscape | ProductDetail.tsx (notes section) |

#### `/fragrances/heavenly/100ml/`

| File               | Size (px) | Shape     | Referenced in                              |
| ------------------ | --------- | --------- | ------------------------------------------ |
| `bottle-wide.webp` | 1672×941  | landscape | data.ts, legacy-media.ts                   |
| `bottle.webp`      | 1402×1122 | landscape | SizeShowcase.tsx, data.ts, legacy-media.ts |

#### `/fragrances/heavenly/20ml/`

| File               | Size (px) | Shape     | Referenced in                              |
| ------------------ | --------- | --------- | ------------------------------------------ |
| `bottle-tall.webp` | 1122×1402 | portrait  | data.ts, legacy-media.ts                   |
| `bottle-wide.webp` | 1672×941  | landscape | data.ts, legacy-media.ts, page.tsx         |
| `bottle.webp`      | 1086×1448 | portrait  | data.ts, legacy-media.ts                   |
| `catalog.webp`     | 1440×1800 | portrait  | legacy-media.ts                            |
| `studio.webp`      | 853×1280  | portrait  | SizeShowcase.tsx, data.ts, legacy-media.ts |

#### `/fragrances/heavenly/`

| File                   | Size (px) | Shape     | Referenced in                      |
| ---------------------- | --------- | --------- | ---------------------------------- |
| `both-sizes-wide.webp` | 1672×941  | landscape | data.ts, legacy-media.ts, page.tsx |

#### `/fragrances/heavenly/campaign/`

| File        | Size (px) | Shape    | Referenced in   |
| ----------- | --------- | -------- | --------------- |
| `3620.webp` | 1440×1800 | portrait | legacy-media.ts |
| `3682.webp` | 1440×1800 | portrait | legacy-media.ts |
| `3695.webp` | 1440×1800 | portrait | legacy-media.ts |
| `3705.webp` | 1440×1800 | portrait | legacy-media.ts |
| `3763.webp` | 1440×1800 | portrait | legacy-media.ts |

#### `/fragrances/heavenly/notes/`

| File         | Size (px) | Shape     | Referenced in                     |
| ------------ | --------- | --------- | --------------------------------- |
| `base.webp`  | 2048×1826 | landscape | ProductDetail.tsx (notes section) |
| `heart.webp` | 2048×1706 | landscape | ProductDetail.tsx (notes section) |
| `top.webp`   | 2048×1717 | landscape | ProductDetail.tsx (notes section) |

#### `/fragrances/old-love/100ml/`

| File          | Size (px) | Shape  | Referenced in                              |
| ------------- | --------- | ------ | ------------------------------------------ |
| `bottle.webp` | 1254×1254 | square | SizeShowcase.tsx, data.ts, legacy-media.ts |

#### `/fragrances/old-love/20ml/`

| File           | Size (px) | Shape    | Referenced in                              |
| -------------- | --------- | -------- | ------------------------------------------ |
| `bottle.webp`  | 1086×1448 | portrait | data.ts, legacy-media.ts                   |
| `catalog.webp` | 1440×1800 | portrait | legacy-media.ts                            |
| `studio.webp`  | 853×1280  | portrait | SizeShowcase.tsx, data.ts, legacy-media.ts |

#### `/fragrances/old-love/campaign/`

| File        | Size (px) | Shape    | Referenced in   |
| ----------- | --------- | -------- | --------------- |
| `3804.webp` | 1440×1800 | portrait | legacy-media.ts |
| `3810.webp` | 1440×1800 | portrait | legacy-media.ts |
| `3903.webp` | 1440×1800 | portrait | legacy-media.ts |
| `3926.webp` | 1440×1800 | portrait | legacy-media.ts |
| `3956.webp` | 1440×1800 | portrait | legacy-media.ts |
| `3958.webp` | 1440×1800 | portrait | legacy-media.ts |
| `4096.webp` | 1440×1800 | portrait | legacy-media.ts |

#### `/fragrances/old-love/notes/`

| File         | Size (px) | Shape     | Referenced in                     |
| ------------ | --------- | --------- | --------------------------------- |
| `base.webp`  | 2048×1798 | landscape | ProductDetail.tsx (notes section) |
| `heart.webp` | 2048×1781 | landscape | ProductDetail.tsx (notes section) |
| `top.webp`   | 2048×1797 | landscape | ProductDetail.tsx (notes section) |

#### `//`

| File     | Size (px) | Shape     | Referenced in        |
| -------- | --------- | --------- | -------------------- |
| `og.png` | 1200×800  | landscape | layout.tsx, page.tsx |

#### `/site/account/`

| File           | Size (px) | Shape    | Referenced in                        |
| -------------- | --------- | -------- | ------------------------------------ |
| `sign-in.webp` | 1920×2400 | portrait | auth-form.tsx, verify-email-form.tsx |

#### `/site/brand/`

| File                             | Size (px) | Shape  | Referenced in        |
| -------------------------------- | --------- | ------ | -------------------- |
| `amidaddy-ad-signature-mark.png` | 512×512   | square | CSS (logo, keep)     |
| `amidaddy-icon-64.png`           | 64×64     | square | CSS (tab icon, keep) |

#### `/site/home/`

| File                            | Size (px) | Shape    | Referenced in |
| ------------------------------- | --------- | -------- | ------------- |
| `closing-mobile.webp`           | 1440×1800 | portrait | page.tsx      |
| `closing.webp`                  | 1440×1800 | portrait | page.tsx      |
| `composition-mobile.webp`       | 1440×1800 | portrait | page.tsx      |
| `composition.webp`              | 1440×1800 | portrait | page.tsx      |
| `hero-poster.webp`              | 1440×1800 | portrait | page.tsx      |
| `story-billionaire-mobile.webp` | 1440×1800 | portrait | page.tsx      |
| `story-billionaire.webp`        | 1440×1800 | portrait | page.tsx      |
| `story-coldwar-mobile.webp`     | 1440×1800 | portrait | page.tsx      |
| `story-coldwar.webp`            | 1440×1800 | portrait | page.tsx      |
| `story-heavenly-mobile.webp`    | 1440×1800 | portrait | page.tsx      |
| `story-heavenly.webp`           | 1440×1800 | portrait | page.tsx      |
| `story-old-love-mobile.webp`    | 1440×1800 | portrait | page.tsx      |
| `story-old-love.webp`           | 1440×1800 | portrait | page.tsx      |

#### `/site/not-found/`

| File         | Size (px) | Shape    | Referenced in |
| ------------ | --------- | -------- | ------------- |
| `photo.webp` | 1600×2000 | portrait | not-found.tsx |

#### `/site/our-approach/`

| File                    | Size (px) | Shape     | Referenced in             |
| ----------------------- | --------- | --------- | ------------------------- |
| `20ml-billionaire.webp` | 900×1125  | portrait  | legacy-media.ts, page.tsx |
| `20ml-coldwar.webp`     | 900×1124  | portrait  | legacy-media.ts, page.tsx |
| `20ml-heavenly.webp`    | 900×1125  | portrait  | legacy-media.ts, page.tsx |
| `20ml-old-love.webp`    | 900×1125  | portrait  | legacy-media.ts, page.tsx |
| `discovery-set.webp`    | 1600×1434 | landscape | legacy-media.ts, page.tsx |
| `hero-mobile.webp`      | 1400×757  | landscape | legacy-media.ts, page.tsx |
| `hero.webp`             | 2200×1274 | landscape | legacy-media.ts, page.tsx |
| `macro.webp`            | 1200×1418 | portrait  | legacy-media.ts, page.tsx |
| `sizes.webp`            | 1800×1013 | landscape | legacy-media.ts, page.tsx |

#### `/site/scent-school/`

| File              | Size (px) | Shape     | Referenced in   |
| ----------------- | --------- | --------- | --------------- |
| `coldwar.webp`    | 1600×2000 | portrait  | scent-school.ts |
| `detail-1.webp`   | 2400×1599 | landscape | scent-school.ts |
| `detail-2.webp`   | 1920×2400 | portrait  | scent-school.ts |
| `heavenly-1.webp` | 1600×2000 | portrait  | scent-school.ts |
| `heavenly-2.webp` | 1600×2000 | portrait  | scent-school.ts |
| `models-2.webp`   | 1920×2400 | portrait  | scent-school.ts |
| `models-3.webp`   | 1920×2400 | portrait  | scent-school.ts |
| `old-love.webp`   | 1600×2000 | portrait  | scent-school.ts |

#### `/site/shop/`

| File                | Size (px) | Shape     | Referenced in                 |
| ------------------- | --------- | --------- | ----------------------------- |
| `hero-desktop.webp` | 2400×1351 | landscape | ShopHero.tsx, legacy-media.ts |
| `hero-mobile.webp`  | 1400×1073 | landscape | ShopHero.tsx, legacy-media.ts |
| `hero-narrow.webp`  | 1600×1225 | landscape | ShopHero.tsx, legacy-media.ts |
