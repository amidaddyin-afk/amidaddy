/**
 * Turns the supplied certification artwork into transparent, web-sized PNGs.
 *
 * The originals are 1024px JPEGs of dark line art on a solid white field. A
 * JPEG cannot carry transparency, so overlaying one on photography would show
 * a white tile around every badge. This keys the white out into an alpha
 * channel and writes a normalised, kebab-case name per badge.
 *
 * Run: node scripts/build-certification-badges.mjs
 */
import { readdirSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "public/certifications";
const OUT = "public/certifications/web";

/** Source filename fragment -> output slug. */
const NAMES = [
  ["IFRA", "ifra-certified"],
  ["FDA", "fda-approved"],
  ["Cruelty-free", "cruelty-free"],
  ["Phthalate", "phthalate-free"],
  ["Silicone", "silicone-free"],
  ["Recyclable", "recyclable"],
  ["Flammable", "flammable"],
  ["map_silh", "made-in-india"],
];

/** Pixels at least this bright become transparent. */
const WHITE_CUTOFF = 238;

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

for (const file of readdirSync(SRC)) {
  if (!/\.(jpe?g|png)$/i.test(file)) continue;
  const match = NAMES.find(([fragment]) => file.includes(fragment));
  if (!match) {
    console.warn(`skipped (no name mapping): ${file}`);
    continue;
  }
  const slug = match[1];

  const { data, info } = await sharp(path.join(SRC, file))
    .resize(256, 256, { fit: "contain", background: "#ffffff" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Key out the white field. Near-white pixels fade rather than hard-clip, so
  // the anti-aliased edge of the line art does not turn into a jagged outline.
  for (let i = 0; i < data.length; i += info.channels) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    const luma = (r + g + b) / 3;
    if (luma >= WHITE_CUTOFF) {
      data[i + 3] = 0;
    } else if (luma > WHITE_CUTOFF - 26) {
      data[i + 3] = Math.round(((WHITE_CUTOFF - luma) / 26) * 255);
    }
  }

  await sharp(data, { raw: info })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, `${slug}.png`));
  console.log(`${file}  ->  web/${slug}.png`);
}
