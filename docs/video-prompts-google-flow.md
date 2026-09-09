# Google Flow prompts — Amidaddy campaign videos

Image-to-video prompts for the assets you already have. Copy one block per clip,
upload the named image, generate.

## Before you start

**Format.** Generate **9:16 vertical, 1080×1920**. That is what the product-page
heroes and Reels/Shorts both need, and it matches the four campaign films
already on the site.

**Length.** Ask for **5–8 seconds**. Anything longer gets trimmed anyway — the
site loops 8s clips.

**Motion.** Keep it slow. These are perfume films: a slow push-in or a gentle
parallax reads premium, fast moves read like a discount ad. Every prompt below
says so explicitly.

**Audio.** Ignore it. The site strips audio, because a hero video must be muted
to autoplay. If Flow generates sound it is only useful for the Reels cut.

**After generating**, encode for the site with the existing script:

```bash
npm install --no-save ffmpeg-static
node scripts/encode-product-video.mjs <downloaded.mp4> <slug> 0 8
```

---

## What NOT to put in a prompt

The rules the site follows apply to generated footage too. Do not ask for:

- Text overlays making claims — "long lasting", "24 hours", "India's best",
  "non-toxic". Longevity varies with skin and weather and the product pages say
  so; do not let a video contradict them.
- Invented awards, ratings, star counts, or "trusted by N customers".
- Liquid poured, splashed or dripped from the bottle — it implies a volume and
  viscosity that is not what ships.
- A different bottle shape, cap or label than your photographs. If the model
  drifts off your product, regenerate rather than ship it.
- Prices. They change; a price rendered into a video cannot be edited.

Offer and price text belongs in the caption, or an overlay you add afterwards
where you can change it.

---

# A. Discovery combo — the priority films

This is the four-bottle 20ml set, your main first-purchase offer. These matter
most.

## A1 — The four, revealed

**Image:** `public/products/combos/20ml/latest-pack-of-4.webp`

```
Slow cinematic push-in on four perfume bottles standing in a row with their
boxes, on a clean neutral studio backdrop. The camera drifts forward almost
imperceptibly over five seconds. Soft studio light moves gently across the
glass, picking up the blue, cream, black and red of the four bottles in turn.
Shallow depth of field, the row staying sharp. Photoreal, luxury fragrance
advertising. No text, no captions, no added logos. 9:16 vertical.
```

## A2 — Colour sweep

**Image:** `public/products/20ml/studio/pack-of-4.webp`

```
A slow horizontal camera glide from left to right across four perfume bottles
standing with their boxes on a pale seamless backdrop. Each bottle passes
through a pool of soft light as the camera moves - blue, then cream, then
black, then red. Subtle depth of field so the bottle at centre frame is
sharpest. Calm and unhurried, six seconds. Photoreal product cinematography.
No text overlays. 9:16 vertical.
```

## A3 — Set in hand

**Image:** `public/products/combos/20ml/01.webp`

```
Gentle handheld motion, as if someone has just picked up the set and is
turning it slowly toward the light. Very slight camera sway, no shake. The
bottles catch a soft highlight as they rotate a few degrees. Warm, intimate,
premium. Five seconds. Photoreal. No text. 9:16 vertical.
```

---

# B. Individual fragrances

One per scent. Each keeps its own colour world — that consistency is doing real
work on the product pages.

## B1 — Cold War (blue, fresh)

**Image:** `public/products/20ml/studio/cold-war.webp`

```
Slow push-in on a pale blue perfume bottle against a cool, desaturated
backdrop. Crisp directional light from the side, sharp shadows, a still and
composed mood. The camera moves forward slowly for six seconds and stops. Cool
colour grade, blues and greys, nothing warm. Photoreal luxury fragrance film.
No text. 9:16 vertical.
```

## B2 — Heavenly (cream, soft floral)

**Image:** `public/products/20ml/studio/heavenly.webp`

```
Soft slow push-in on a cream-white perfume bottle in diffused daylight. Gentle,
airy, low contrast, a faint glow around the edges of the glass. The light
shifts very slightly, as if a curtain moved nearby. Six seconds, calm. Warm
neutral grade, no harsh shadows. Photoreal. No text. 9:16 vertical.
```

## B3 — Billionaire (black, woody)

**Image:** `public/products/20ml/studio/billionaire.webp`

```
Slow push-in on a black perfume bottle in low-key light against a dark
backdrop. A single hard light source rakes across the glass, catching one
bright edge and leaving the rest in shadow. Moody, restrained, powerful. Six
seconds, camera barely moving. Deep blacks, minimal colour. Photoreal luxury
fragrance advertising. No text. 9:16 vertical.
```

## B4 — Old Love (red, amber)

**Image:** `public/products/20ml/studio/old-love.webp`

```
Slow push-in on a deep red perfume bottle in warm, dim light. Rich amber and
crimson tones, soft falloff into shadow at the edges of frame. A gentle flicker
of warm light, as if from a candle just out of frame. Nostalgic and intimate.
Six seconds. Photoreal. No text. 9:16 vertical.
```

---

# C. Campaign and brand

Use the existing campaign photography, which already has models and styling.

## C1 — Hero motion

**Image:** `public/campaign/hero-mobile.png`

```
Bring this photograph to life with the smallest possible motion: a very subtle
parallax as the camera drifts a few centimetres, hair and fabric moving
slightly, natural blinking. Everything else still. The subjects hold their
pose. Cinematic editorial fashion film, not a moving-portrait effect. Six
seconds. Preserve the original colour grade exactly. No text. 9:16 vertical.
```

## C2 — Two sizes

**Image:** `public/campaign/billionaire-duo-mobile.png`

```
Slow orbit of a few degrees around two perfume bottles of different sizes
standing side by side, so the size difference reads clearly as the camera
moves. Soft studio light, shallow depth of field. Five seconds, smooth and
slow. Photoreal product cinematography. No text. 9:16 vertical.
```

---

# D. If Flow gives you something wrong

Common failures and the line to add:

| Problem                      | Add to the prompt                                                                                                     |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Bottle shape or label morphs | "The bottle must not change shape, label or proportions at any point. The camera moves; the product stays identical." |
| Motion too fast              | "Extremely slow, almost static. The camera should move less than you expect."                                         |
| Invented text appears        | "No text, no letters, no logos, no captions anywhere in frame."                                                       |
| Adds liquid or spray         | "No liquid, no spray, no mist, no pouring."                                                                           |
| Colour grade drifts          | "Preserve the exact colours of the source image."                                                                     |
| Extra bottles appear         | "Exactly four bottles, no more." (or "Exactly one bottle.")                                                           |

Generate two or three takes of the ones that matter (A1, A2) and pick. First
takes are rarely the best.

---

# E. What to do with the finished clips

1. **Product page heroes** — encode with `scripts/encode-product-video.mjs`,
   which trims, mutes, drops to 25fps and writes WebM + MP4 at roughly 1–2 MB.
   Only B1–B4 map to product pages, and those four already have live campaign
   films — swap only if a generated one is genuinely better.
2. **Reels and Shorts** — use the Flow output directly at full quality. Add the
   offer text as an overlay there rather than baking it into the generation, so
   you can change it without regenerating.
3. **Ads** — A1 and A2 are the discovery-combo films. They show four bottles and
   the 20ml size clearly, which is exactly what a first-time buyer needs to
   understand. Pair them with the real offer copy in the ad text.
