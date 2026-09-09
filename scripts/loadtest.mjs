#!/usr/bin/env node
/**
 * Read-only load test for the storefront.
 *
 * Simulates N concurrent shoppers browsing the pages a real visitor hits:
 * homepage -> shop -> a product page -> the discovery combo. Reports latency
 * percentiles and error rate per page so you can see which one degrades first.
 *
 * SAFE BY DESIGN: only GET requests to public pages. It never posts to
 * /api/checkout, never creates an order, never touches payment. Checkout
 * throughput cannot be tested this way — see docs/load-and-capacity.md.
 *
 * Usage:
 *   node scripts/loadtest.mjs <base-url> [concurrency] [seconds]
 *
 * Examples:
 *   node scripts/loadtest.mjs https://amidaddy-preview.vercel.app 20 30
 *   node scripts/loadtest.mjs http://localhost:3000 10 15
 *
 * Start small (10 concurrent) and step up. Point it at a PREVIEW deploy, not
 * production — you are paying for every function invocation it triggers.
 */

const [, , baseArg, concArg, secsArg] = process.argv;

if (!baseArg) {
  console.error(
    "usage: node scripts/loadtest.mjs <base-url> [concurrency] [seconds]",
  );
  process.exit(1);
}

const base = baseArg.replace(/\/$/, "");
const concurrency = Number(concArg ?? 10);
const seconds = Number(secsArg ?? 20);

if (!Number.isFinite(concurrency) || concurrency < 1) {
  console.error("concurrency must be a positive number");
  process.exit(1);
}
if (!Number.isFinite(seconds) || seconds < 1) {
  console.error("seconds must be a positive number");
  process.exit(1);
}

// The journey a real first-time visitor takes.
const JOURNEY = [
  "/",
  "/shop",
  "/products/signature-combo-20ml",
  "/products/billionaire?size=100ml",
];

/** @type {Map<string, {times: number[], errors: number, statuses: Map<number, number>}>} */
const stats = new Map();
for (const path of JOURNEY)
  stats.set(path, { times: [], errors: 0, statuses: new Map() });

let stop = false;

async function hit(path) {
  const started = performance.now();
  try {
    const response = await fetch(`${base}${path}`, {
      headers: { "user-agent": "amidaddy-loadtest" },
      redirect: "manual",
    });
    // Drain the body — otherwise we measure time-to-headers, not time-to-page.
    await response.arrayBuffer();
    const elapsed = performance.now() - started;
    const entry = stats.get(path);
    entry.times.push(elapsed);
    entry.statuses.set(
      response.status,
      (entry.statuses.get(response.status) ?? 0) + 1,
    );
    if (response.status >= 400) entry.errors += 1;
  } catch {
    stats.get(path).errors += 1;
  }
}

/** One simulated shopper, looping the journey until time is up. */
async function shopper() {
  while (!stop) {
    for (const path of JOURNEY) {
      if (stop) return;
      await hit(path);
    }
  }
}

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const index = Math.min(
    sorted.length - 1,
    Math.floor((p / 100) * sorted.length),
  );
  return sorted[index];
}

const ms = (n) => `${n.toFixed(0)}ms`;

console.log(
  `Load test -> ${base}\n${concurrency} concurrent shoppers for ${seconds}s\n` +
    `Read-only: GET on ${JOURNEY.length} public pages. No checkout, no orders.\n`,
);

const startedAt = Date.now();
setTimeout(() => {
  stop = true;
}, seconds * 1000);

await Promise.all(Array.from({ length: concurrency }, shopper));

const elapsedSeconds = (Date.now() - startedAt) / 1000;

console.log("─".repeat(78));
console.log(
  "PAGE".padEnd(38) +
    "n".padStart(6) +
    "p50".padStart(9) +
    "p95".padStart(9) +
    "p99".padStart(9) +
    "err".padStart(7),
);
console.log("─".repeat(78));

let totalRequests = 0;
let totalErrors = 0;

for (const [path, entry] of stats) {
  const sorted = [...entry.times].sort((a, b) => a - b);
  totalRequests += entry.times.length + entry.errors;
  totalErrors += entry.errors;
  console.log(
    path.slice(0, 37).padEnd(38) +
      String(sorted.length).padStart(6) +
      ms(percentile(sorted, 50)).padStart(9) +
      ms(percentile(sorted, 95)).padStart(9) +
      ms(percentile(sorted, 99)).padStart(9) +
      String(entry.errors).padStart(7),
  );
  const nonOk = [...entry.statuses].filter(([code]) => code !== 200);
  if (nonOk.length)
    console.log(
      "".padEnd(38) +
        `  statuses: ${nonOk.map(([c, n]) => `${c}×${n}`).join(", ")}`,
    );
}

console.log("─".repeat(78));
console.log(
  `${totalRequests} requests in ${elapsedSeconds.toFixed(1)}s  ` +
    `= ${(totalRequests / elapsedSeconds).toFixed(1)} req/s  ` +
    `| errors: ${totalErrors} (${((totalErrors / Math.max(1, totalRequests)) * 100).toFixed(1)}%)`,
);
console.log(
  `\nRough capacity: at this concurrency the store served ` +
    `~${Math.round((totalRequests / elapsedSeconds / JOURNEY.length) * 60)} full ` +
    `shopper-journeys per minute.`,
);
console.log(
  "\nWhat to look for:\n" +
    "  p95 under ~800ms  -> comfortable\n" +
    "  p95 1.5s-3s       -> visitors feel it; time to add caching\n" +
    "  errors > 0        -> something is saturating (usually DB connections)\n" +
    "  Re-run at 2x concurrency. If p95 more than doubles, you found the ceiling.",
);
