# Photos and videos: where everything lives

Every image and video the site shows is in `public/`, grouped by what it shows:

- `public/fragrances/<fragrance>/`: one folder per fragrance (`old-love`, `billionaire`, `heavenly`, `coldwar`), split by size.
- `public/combos/`: the two four-bottle sets.
- `public/site/`: photos that belong to one page or section.

## How to replace a photo

1. Find the photo in the tables below.
2. Save your new photo **over the old file, with exactly the same name and format** (`.webp`, `.mp4`, and so on).
3. Commit and deploy. The site picks it up; no code changes are needed.

Tips:

- **Format.** Export as `.webp` at 2400 px on the longest side or smaller. [Squoosh](https://squoosh.app) converts a JPG or PNG to WebP in the browser.
- **Match the shape.** Portrait slots need portrait photos, wide slots need wide ones, or the photo gets cropped.
- **`.avif` twins.** The Shop and Our Approach heroes each have a `.webp` _and_ an `.avif`, and browsers show the `.avif` first. Replace both, or delete the `.avif`, or the old photo keeps showing.
- **Blur placeholder.** While a photo loads, a tiny blurred preview of the _old_ photo flashes briefly. Run `node scripts/optimize-images.mjs` to refresh it (optional).
- **Old version still showing after deploy?** That is the image cache. Give the file a new name and update the path in the code, or ask a developer.

Product galleries can also be changed **without touching files**. In Admin, open a fragrance and choose **Photos**. Anything uploaded there overrides the built-in photos below for that gallery, and each photo shows its file path.

## Fragrances: `public/fragrances/<fragrance>/`

| File                                             | What it is                                            | Where it shows                                                                                                                 |
| ------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `100ml/bottle.webp`                              | The 100 ml bottle                                     | 100 ml product gallery (first photo), product cards at 100 ml, homepage size showcase, 4 × 100 ml collection gallery           |
| `100ml/bottle-wide.webp`                         | Wide 100 ml shot (Billionaire, Heavenly)              | 100 ml product gallery. Billionaire's is also the Shop page "100ml fragrances" band                                            |
| `20ml/studio.webp`                               | The 20 ml studio shot                                 | 20 ml product gallery (first photo), product cards at 20 ml, homepage size showcase, Scent Finder                              |
| `20ml/bottle.webp`                               | The 20 ml bottle                                      | 20 ml product gallery, discovery set gallery                                                                                   |
| `20ml/bottle-tall.webp`, `20ml/bottle-wide.webp` | Extra 20 ml shots (Heavenly, Billionaire)             | 20 ml product gallery. Heavenly's wide one is also the homepage "Pocket signature" card                                        |
| `20ml/catalog.webp`                              | Older 20 ml catalogue shot                            | Only if the database still points at it                                                                                        |
| `campaign/<number>.webp`                         | Model shoot, named by the photographer's frame number | Product page gallery (all sizes). Admin Photos lists the ones in use                                                           |
| `notes/top.webp`, `heart.webp`, `base.webp`      | Note ingredients                                      | Product page "The notes." section                                                                                              |
| `film.mp4` + `film.webm`                         | The fragrance film                                    | Product page hero and homepage hero slideshow. Re-encode with `node scripts/encode-product-video.mjs`, which writes both files |
| `heavenly/both-sizes-wide.webp`                  | Heavenly in 100 ml and 20 ml side by side             | Heavenly gallery, Shop page "20ml fragrances" band                                                                             |

## Combos: `public/combos/`

| File                                | Where it shows                                                          |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `discovery-4x20ml/pack.webp`        | Discovery set (4 × 20 ml): product photo, homepage "Meet all four" card |
| `discovery-4x20ml/gallery-*.webp`   | Discovery set gallery, only if the database points at them              |
| `collection-4x100ml/pack.webp`      | Collection (4 × 100 ml): product photo, Shop page "pack of 4" band      |
| `collection-4x100ml/pack-wide.webp` | Collection gallery, homepage "Own the collection" card                  |
| `collection-4x100ml/gallery-*.webp` | Collection gallery, only if the database points at them                 |

## Site sections: `public/site/`

The homepage has its **own copies** of its editorial photos, so replacing one changes only the homepage, not the product pages.

| Folder / file                                                            | Where it shows                                                                   |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `home/hero-poster.webp`                                                  | Homepage hero, behind the film (and instead of it on slow connections)           |
| `home/story-<fragrance>.webp` + `-mobile.webp`                           | Homepage "A closer look at each one" bands (desktop / phone)                     |
| `home/composition.webp` + `-mobile.webp`                                 | Homepage "Every detail, considered."                                             |
| `home/closing.webp` + `-mobile.webp`                                     | Homepage final "Your next signature starts here."                                |
| `shop/hero-desktop`, `hero-mobile`, `hero-narrow` (`.webp` + `.avif`)    | Shop page hero                                                                   |
| `our-approach/*` (`.webp` + `.avif`)                                     | Our Approach page: `hero`, `macro`, `sizes`, `discovery-set`, `20ml-<fragrance>` |
| `scent-school/*.webp`                                                    | Scent School lesson photos                                                       |
| `scent-school/film/<chapter>-desktop / -mobile` (`.mp4` + `.jpg` poster) | Scent School scroll films. Re-encode with `node scripts/encode-scent-school.mjs` |
| `account/sign-in.webp`                                                   | Sign-in, sign-up and verify-email pages                                          |
| `not-found/photo.webp`                                                   | The 404 page                                                                     |
| `brand/*`                                                                | Monogram and signature mark used in the header                                   |
| `certifications/*.png`                                                   | Certification badges. Rebuilt by `node scripts/build-certification-badges.mjs`   |
| `preview-cinematic/*`                                                    | Internal `/preview/cinematic` design page only                                   |

`public/og.png` (the link-preview image for social media) and `public/llms.txt` stay at the top level, where crawlers expect them.

## Not on the site

`assets-source/archive-public/` holds files that used to be in `public/` but nothing referenced. They keep their old paths, are not deployed, and can be deleted. Camera originals are in the rest of `assets-source/`.
