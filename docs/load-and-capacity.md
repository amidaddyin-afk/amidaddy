# Load & capacity

Can the store handle a lot of people browsing and checking out at once?

**Correctness: yes** — nothing will oversell or double-charge under
concurrency. **Throughput: much better now.** The storefront used to query the
database on every single page view; the homepage and product pages are now
cached, so a traffic burst no longer becomes a burst of identical queries.

The remaining ceiling is the free tiers themselves (fix #2 below).

---

## What is already safe under concurrent load

These are the things that are hard to get right, and this codebase does:

- **No overselling.** `createPendingOrder` runs inside a transaction and takes
  `SELECT ... FOR UPDATE` row locks on the variant rows before checking stock
  (`src/lib/orders.ts`). If 50 people try to buy the last bottle simultaneously,
  Postgres serialises them: one succeeds, the rest get "no longer available."
- **No double-charging, no duplicate paid orders.** `payment_order_id` and
  `payment_id` are UNIQUE; the Razorpay webhook dedupes on `webhook_events`;
  `markOrderPaid` is idempotent. A retried or duplicated payment callback
  cannot create a second paid order.
- **Coupons cannot be over-redeemed.** The coupon row is locked `FOR UPDATE`
  too, so two people racing the last use of a limited coupon cannot both win.
- **Prices/stock/shipping are recomputed server-side** at checkout from the DB.
  A client cannot manipulate totals no matter how many requests it sends.
- **Abandoned orders release their stock.** `expirePendingOrders` uses
  `FOR UPDATE SKIP LOCKED`, so the cleanup job is safe to run concurrently.
- **Rate limits** on checkout, quote, verify and tracking endpoints.

## Where it will slow down first

Ranked by which one bites soonest.

### 1. Every page view hits the database — FIXED

**Was:** `/`, `/shop` and `/products/[slug]` had no caching. Each render called
`listCatalogProducts()` / `getCatalogProductBySlug()` — a live Supabase query.
1,000 homepage views meant 1,000 identical queries for a catalogue of six
products that changes maybe weekly.

**Now:** the homepage is `○ Static` and every product page is `● SSG`, both on a
5-minute revalidate window. A burst of traffic is served from cache; the
database sees roughly one query per page per 5 minutes.

Three things were needed, and the first two were the non-obvious part:

1. **The Supabase client was reading cookies.** `createClient()` in
   `src/lib/supabase/server.ts` calls `cookies()`, and reading cookies opts a
   page out of Next's cache entirely — so `export const revalidate` was being
   silently ignored. The storefront reads now use an anonymous client
   (`src/lib/supabase/public-client.ts`). Safe because those queries already
   filter to `active = true AND deleted_at IS NULL`, exactly what the
   "catalog is publicly readable" RLS policy grants anonymous callers. Admin
   reads and all writes still use the session client — they depend on
   `is_admin()` in the RLS policies.
2. **`generateStaticParams` was missing** on `/products/[slug]`. Without it Next
   cannot know which slugs exist, so it rendered each on demand and the
   revalidate window never applied.
3. **`?size=` moved off the server.** Reading `searchParams` in a server
   component forces dynamic rendering. It only preselects a bottle size, so
   `ProductDetail` now reads it from `window.location` in a mount effect.
   Deliberately _not_ `useSearchParams()` — that forces a Suspense boundary
   whose fallback would ship an empty product page to crawlers. Verified: the
   prerendered HTML still contains the full product content and Product schema.

**`/shop` is still dynamic**, and correctly so — it reads `?family=`,
`?search=`, `?sort=` to filter server-side. Lower traffic than the homepage and
product pages, so it is not worth contorting.

**Cache invalidation:** `revalidateStorefront()`
(`src/lib/revalidate-storefront.ts`) clears all three page groups. It is called
from every path that changes what a shopper sees — product create/update/
delete/restore, stock adjustments, store settings, and `markOrderPaid` (a sale
decrements stock). So admin edits appear immediately; the 5-minute window is
only a backstop.

### 2. Database connection pool: `max: 8` per serverless instance

`src/lib/db.ts` sets `max: 8`. That is per warm Vercel function instance, and
Vercel spins up many instances under load. 20 instances × 8 = 160 connections
aimed at Postgres.

You are on Supabase's **transaction pooler** (port `6543`, `?pgbouncer=true`),
which is the correct choice and absorbs most of this. But the pooler itself has
a ceiling that scales with your Supabase plan — the free tier's is low. When it
is exhausted, requests queue and then time out.

### 3. Free-tier ceilings

| Limit                       | Tier  | What happens when you hit it                      |
| --------------------------- | ----- | ------------------------------------------------- |
| Vercel function GB-hours    | Hobby | Throttling, then the deployment stops serving     |
| Supabase pooler connections | Free  | Requests queue, then error                        |
| Supabase compute (shared)   | Free  | Every query gets slower for everyone              |
| Vercel Hobby terms          | Hobby | Non-commercial — a live store should not be on it |

### 4. Checkout is the slowest path by design

`POST /api/checkout` does: a locked transaction, stock reservation, an outbound
HTTPS call to Razorpay's API, then a DB write. Typically 500ms–1.5s, and the
Razorpay round-trip is outside your control.

This is fine — checkout is low-volume relative to browsing (a 3% conversion rate
means ~1 checkout per 33 page views). But it holds a DB connection for its whole
duration, so it competes with browsing traffic for the pool. Fixing #1 protects
checkout by freeing the pool for it.

### 5. `analytics_events` write on every page view

The new tracking beacons one INSERT per page view. Small and non-blocking (it
returns 204 and never errors out to the visitor), but it is still a write per
view. At very high traffic, sample it — see "If traffic gets big" below.

---

## How to actually measure it

A script is included: `scripts/loadtest.mjs`. It simulates concurrent shoppers
walking the real journey (homepage → shop → product → combo) and reports
latency percentiles per page.

**It is read-only.** GET requests to public pages only. It never posts to
checkout, never creates an order, never touches payment.

```bash
# Point it at a PREVIEW deploy, not production.
node scripts/loadtest.mjs https://your-preview.vercel.app 10 30
```

Arguments: `<base-url> [concurrency] [seconds]`.

**Method — step it up:**

1. Run at concurrency **10**. Note p95.
2. Run at **25**. Then **50**. Then **100**.
3. Watch for the point where p95 more than doubles when you double concurrency,
   or where errors appear. That is your ceiling.

**Reading the output:**

| Signal      | Meaning                                      |
| ----------- | -------------------------------------------- |
| p95 < 800ms | Comfortable                                  |
| p95 1.5–3s  | Visitors notice; add caching                 |
| p95 > 3s    | People are leaving                           |
| errors > 0  | Something saturated — usually DB connections |

While it runs, watch **Supabase dashboard → Database → Connection pooler** and
**Vercel dashboard → Usage**. If pooler connections flatline at a ceiling while
latency climbs, that confirms bottleneck #2.

### What this script cannot test

- **Checkout throughput.** Testing that for real means creating real orders and
  hitting Razorpay's API. Use Razorpay **test mode** keys on a preview
  deployment and drive it manually, or with a script you write deliberately —
  never against production, never with live keys.
- **Real-world geography and network.** Everything runs from one machine on one
  connection. For realistic numbers use a hosted tool (k6 Cloud, Loader.io) that
  generates traffic from multiple regions.
- **The Vercel CDN's benefit.** Repeated requests from one IP get cached
  aggressively; real users spread across many IPs behave differently.

---

## Fixes, in order of impact

### 1. Cache the catalogue pages — DONE

See bottleneck #1 above for what was changed and why. Verify it after any
future change to those pages by checking the build output:

```
Route (app)                    Revalidate  Expire
┌ ○ /                                 5m      1y     <- Static, good
│ ├ ● /products/coldwar               5m      1y     <- SSG, good
├ ƒ /shop                                            <- Dynamic, expected
```

If `/` or a product page shows `ƒ`, something reintroduced a dynamic
dependency — usually `cookies()`, `headers()`, or reading `searchParams` in a
server component. Find it before shipping; the cache is silently gone
otherwise, with no error to warn you.

### 2. Get off the free tiers

- **Vercel → Pro** (~$20/mo). Hobby is non-commercial anyway.
- **Supabase → Pro** ($25/mo). Dedicated compute, a much larger pooler ceiling,
  no project pausing, daily backups.

Both are dashboard clicks, no code. See `docs/scaling-and-tiers.md`.

### 3. Raise the pool only after upgrading Supabase

`max: 8` in `src/lib/db.ts` is deliberately conservative for the free tier.
Once on Supabase Pro, 15–20 is reasonable. Raising it _before_ upgrading makes
things worse, not better — you will exhaust the pooler faster.

### 4. If traffic gets big

- Sample page-view tracking client-side (beacon 1 in N) to cut analytics writes.
- Move `analytics_events` aggregates to a materialised view refreshed by the
  daily cron, so the `/admin` Traffic panel does not scan the raw table.
- Consider Vercel's Runtime Cache or Edge Config for the catalogue.

---

## Honest bottom line

- **Dozens of concurrent shoppers:** comfortable.
- **Hundreds concurrent (an ad or a reel landing):** the caching fix removed the
  database from that path for the homepage and product pages, which was the
  binding constraint. Get off the free tiers (#2) before spending on ads, and
  run the load test to confirm on your own numbers.
- **Correctness at any volume:** sound. You will not oversell stock or
  double-charge a customer.

Do not take these as measured numbers — they are informed estimates from the
code and configuration. Run `scripts/loadtest.mjs` against a preview deploy to
get real ones for your setup.
