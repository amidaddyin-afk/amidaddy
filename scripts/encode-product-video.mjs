#!/usr/bin/env node
/**
 * Turn a camera master into a web hero loop.
 *
 * The masters in productPics/Videos are 1080x1920 @ 50fps, 31-49 Mbps, with
 * stereo audio — 111-163 MB each. That is 10-15x over what a web hero needs and
 * would cost a shopper on mobile data minutes of waiting. This produces a
 * short, muted, 25fps loop in both WebM (small, modern browsers) and MP4
 * (Safari fallback) at roughly 1-2.5 MB per clip.
 *
 * Requires ffmpeg. Install it just for this run, without touching package.json:
 *   npm install --no-save ffmpeg-static
 *
 * Usage:
 *   node scripts/encode-product-video.mjs <input.mp4> <slug> [startSec] [durationSec]
 *
 * Example:
 *   node scripts/encode-product-video.mjs "productPics/Videos/Old Love.mp4" old-love 10 8
 *
 * Writes public/videos/<slug>.webm and .mp4. No poster is generated: the hero
 * already renders the product photograph underneath, and HeroVideo fades the
 * loop in over it, so a poster would just be a second decode of the same frame.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";
import { dirname } from "node:path";

const [, , input, slug, startArg = "0", durArg = "8"] = process.argv;

if (!input || !slug) {
  console.error(
    "usage: node scripts/encode-product-video.mjs <input> <slug> [start] [duration]",
  );
  process.exit(1);
}

let ffmpeg;
try {
  ffmpeg = (await import("ffmpeg-static")).default;
} catch {
  console.error("ffmpeg not found. Run: npm install --no-save ffmpeg-static");
  process.exit(1);
}

const start = Number(startArg);
const duration = Number(durArg);
if (!Number.isFinite(start) || !Number.isFinite(duration) || duration <= 0) {
  console.error("start and duration must be numbers, duration > 0");
  process.exit(1);
}

const outBase = `public/videos/${slug}`;
mkdirSync(dirname(outBase), { recursive: true });

// 25fps: the masters are 50fps, which doubles the bitrate for motion no one
// perceives in a background loop. -an strips audio: a hero must be muted to
// autoplay, so the audio track is pure waste.
const common = [
  "-ss",
  String(start),
  "-t",
  String(duration),
  "-i",
  input,
  "-an",
];

const run = (args, label) => {
  process.stdout.write(`  ${label} ... `);
  execFileSync(ffmpeg, ["-y", "-hide_banner", "-loglevel", "error", ...args], {
    stdio: ["ignore", "ignore", "inherit"],
  });
  console.log("done");
};

const mb = (path) => `${(statSync(path).size / 1048576).toFixed(1)} MB`;

console.log(`\n${slug}: ${input} @ ${start}s for ${duration}s`);

// VP9. CRF 34 is visually clean for dark, grainy footage at this size; -b:v 0
// makes CRF the sole quality target. row-mt speeds up encoding on all cores.
run(
  [
    ...common,
    "-c:v",
    "libvpx-vp9",
    "-crf",
    "34",
    "-b:v",
    "0",
    "-r",
    "25",
    "-vf",
    "scale=1080:1920",
    "-row-mt",
    "1",
    "-deadline",
    "good",
    "-cpu-used",
    "2",
    `${outBase}.webm`,
  ],
  "webm",
);

// H.264 fallback for Safari. faststart moves the index to the front so playback
// can begin before the whole file arrives.
run(
  [
    ...common,
    "-c:v",
    "libx264",
    "-crf",
    "26",
    "-preset",
    "slow",
    "-profile:v",
    "main",
    "-pix_fmt",
    "yuv420p",
    "-r",
    "25",
    "-vf",
    "scale=1080:1920",
    "-movflags",
    "+faststart",
    `${outBase}.mp4`,
  ],
  "mp4",
);

const originalMb = statSync(input).size / 1048576;
console.log(
  `  webm ${mb(`${outBase}.webm`)} | mp4 ${mb(`${outBase}.mp4`)}` +
    `  (master was ${originalMb.toFixed(1)} MB)`,
);
