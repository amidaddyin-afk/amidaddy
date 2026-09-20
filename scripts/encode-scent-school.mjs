/**
 * Encodes the Scent School scroll-scrubbing films for web delivery.
 *
 * The supplied masters are generated exports and are NOT usable for scrubbing
 * as delivered. Measured with a probe harness in the browser:
 *
 *   - 240 frames over 10s, with ONE keyframe (two in a few clips). Seeking to
 *     t=9.9s costs ~97ms because the decoder must walk almost the whole GOP
 *     from the single keyframe. Cheap near t=0, expensive at the end, which is
 *     exactly the uneven feel you get when scrubbing an unprocessed export.
 *   - `moov` sits AFTER `mdat`, so there is no faststart: a player must fetch
 *     to the end of the file before it knows the duration.
 *   - Every clip carries an AAC audio track nothing will ever play.
 *
 * This script fixes all three. The important knob is `-g 5`: a keyframe every
 * five frames caps how far the decoder ever walks to reach a target time, so
 * seek cost stays flat across the clip instead of climbing toward the end.
 * That costs file size, which is why resolution and CRF are pulled down to
 * compensate - a scrubbed backdrop behind text does not need visual
 * transparency, it needs even seek latency.
 *
 * Masters in productPics/ScentSchool are never modified.
 *
 * Requires ffmpeg, installed just for this run without touching package.json:
 *   npm install --no-save ffmpeg-static
 *
 * Usage:
 *   node scripts/encode-scent-school.mjs
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";

let ffmpeg;
try {
  ffmpeg = (await import("ffmpeg-static")).default;
} catch {
  console.error("ffmpeg not found. Run: npm install --no-save ffmpeg-static");
  process.exit(1);
}

const SRC = "productPics/ScentSchool";
const OUT = "public/scent-school/film";

/**
 * Chapter -> master clip. Identified by extracting a frame from each master
 * and looking at it; the generated filenames describe the subject but not
 * which orientation, and several clips share a subject.
 *
 * `wide` is 1920x1080, `tall` is 1080x1920. Where a chapter has no portrait
 * master, `tall` is null and the player falls back to a focal crop of the
 * landscape clip (see ChapterFilm).
 */
const SCENES = [
  {
    id: "opening",
    wide: "Botanical_elements_surrounding_a…_1080p_20260918204922.mp4",
    tall: "Botanical_elements_drift_near_am…_20260918204923.mp4",
    note: "Botanicals suspended around a single amber droplet.",
  },
  {
    id: "notes",
    wide: "Bergamot_rind,_jasmine,_and_ceda…_20260918204918.mp4",
    tall: "Camera_moving_past_fragrance_ing…_20260918204850.mp4",
    note: "Bergamot rind, jasmine and cedar in macro.",
  },
  {
    id: "extraction",
    wide: "Droplet_falling_into_amber_liquid_20260918204918.mp4",
    tall: "Droplet_falling_in_laboratory_gl…_20260918204841.mp4",
    note: "A droplet forming on laboratory glassware.",
  },
  {
    id: "blending",
    wide: "Amber_liquid_in_glass_vessel_20260918204834.mp4",
    tall: "Pipette_dropping_liquid_into_beaker_20260918204830.mp4",
    note: "A pipette releasing a drop into a beaker.",
  },
  {
    id: "resting",
    wide: "Amber_liquid_in_glass_vessel_20260918204834.mp4",
    tall: "Glass_vessel_containing_amber_li…_20260918204818.mp4",
    note: "Amber liquid at rest in a glass vessel.",
  },
  {
    id: "skin",
    wide: "Forearm_moves_in_soft_light_20260918204834.mp4",
    tall: "Macro_close-up_of_forearm_skin_20260918204814.mp4",
    note: "A forearm in soft natural light.",
  },
];

mkdirSync(OUT, { recursive: true });

const mb = (p) => `${(statSync(p).size / 1048576).toFixed(2)} MB`;

function run(args, label) {
  try {
    execFileSync(
      ffmpeg,
      ["-y", "-hide_banner", "-loglevel", "error", ...args],
      {
        stdio: ["ignore", "inherit", "inherit"],
      },
    );
  } catch (error) {
    console.error(`  ${label} failed: ${error.message}`);
    process.exitCode = 1;
  }
}

/**
 * One delivery encode.
 *
 * -an            no audio track at all; nothing plays it and it is dead weight
 * -g 5 -keyint_min 5 -sc_threshold 0
 *                a keyframe every 5 frames, with scene-change detection off so
 *                the spacing is actually uniform. This is what makes seek cost
 *                flat instead of climbing across the clip.
 * +faststart     moves the index to the front, so duration is known early
 * yuv420p        broadest decoder compatibility, including older Safari
 */
function encode(input, output, scale, crf) {
  run(
    [
      "-i",
      input,
      "-an",
      "-c:v",
      "libx264",
      "-profile:v",
      "main",
      "-pix_fmt",
      "yuv420p",
      "-crf",
      String(crf),
      "-preset",
      "slow",
      "-r",
      "24",
      "-g",
      "5",
      "-keyint_min",
      "5",
      "-sc_threshold",
      "0",
      "-vf",
      `scale=${scale}`,
      "-movflags",
      "+faststart",
      output,
    ],
    output,
  );
}

/** First frame, as the poster shown until a video frame is ready. */
function poster(input, output, scale) {
  run(
    [
      "-i",
      input,
      "-frames:v",
      "1",
      "-vf",
      `scale=${scale}`,
      "-q:v",
      "6",
      output,
    ],
    output,
  );
}

for (const scene of SCENES) {
  console.log(`\n${scene.id}  ${scene.note}`);
  const wide = join(SRC, scene.wide);
  if (!existsSync(wide)) {
    console.error(`  MISSING master: ${wide}`);
    continue;
  }
  // 1280x720 for desktop: this sits behind text at partial opacity, so the
  // extra bytes of 1080p buy nothing a viewer can see while making every seek
  // more expensive to decode.
  encode(wide, join(OUT, `${scene.id}-desktop.mp4`), "1280:720", 26);
  poster(wide, join(OUT, `${scene.id}-desktop.jpg`), "1280:720");
  console.log(
    `  desktop ${mb(join(OUT, `${scene.id}-desktop.mp4`))} + poster ${mb(join(OUT, `${scene.id}-desktop.jpg`))}`,
  );

  if (scene.tall) {
    const tall = join(SRC, scene.tall);
    if (existsSync(tall)) {
      // 720x1280 for phones: smaller frames decode faster on mobile silicon,
      // which is where seek latency actually hurts.
      encode(tall, join(OUT, `${scene.id}-mobile.mp4`), "720:1280", 28);
      poster(tall, join(OUT, `${scene.id}-mobile.jpg`), "720:1280");
      console.log(
        `  mobile  ${mb(join(OUT, `${scene.id}-mobile.mp4`))} + poster ${mb(join(OUT, `${scene.id}-mobile.jpg`))}`,
      );
    } else {
      console.error(`  MISSING portrait master: ${tall}`);
    }
  }
}

console.log("\nDone. Masters in productPics/ScentSchool are unchanged.");
