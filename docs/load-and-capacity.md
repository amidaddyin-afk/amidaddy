# Load & capacity

Can the store handle a lot of people browsing and checking out at once?

**Short answer: correctness yes, throughput not yet.** Nothing will oversell or
double-charge under concurrency — that part is genuinely well built. But the
storefront currently queries the database on _every single page view_, and on
the free tiers you will feel that somewhere around a few hundred concurrent
visitors. The fixes are small and listed at the end.

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

### 1. Every page view hits the database (the real bottleneck)

`/`, `/shop` and `/products/[slug]` have **no caching directive**. Each render
calls `listCatalogProducts()` / `getCatalogProductBySlug()`, which is a live
Supabase query. 1,000 people loading the homepage = 1,000 identical database
queries returning identical data.

The product catalogue is four fragrances and two combos. It changes maybe
weekly. There is no reason to query it per visitor.

**Impact:** this is what saturates the connection pool and drives up p95 under
load. Everything else on this list is downstream of it.

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

### 1. Cache the catalogue pages (biggest win, small change)

Add revalidation to the storefront pages so Next serves a cached render instead
of querying Supabase per visitor:

```ts
// src/app/page.tsx, src/app/shop/page.tsx, src/app/products/[slug]/page.tsx
export const revalidate = 300; // re-fetch from the DB at most once every 5 min
```

Effect: 1,000 homepage views become ~1 database query per 5 minutes instead of
1,000. This alone moves the ceiling by roughly an order of magnitude.

Trade-off: a price or stock edit in `/admin` takes up to 5 minutes to appear on
the storefront. The _cart and checkout_ still read live data, so nothing can be
bought at a stale price — server-side validation recomputes everything. If you
want instant updates, use `revalidateTag`/`revalidatePath` from the admin
save action instead of a time window.

**Not yet applied** — it changes how fresh the storefront is, which is a
business call. Say the word and I will wire it, including admin-triggered
revalidation so edits still appear immediately.

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

- **Dozens of concurrent shoppers:** fine today, no changes needed.
- **Hundreds concurrent (an ad or a reel landing):** you will see slow pages
  and possibly errors. Fix #1 and #2 before you spend on ads.
- **Correctness at any volume:** already sound. You will not oversell stock or
  double-charge a customer.

Do not take these as measured numbers — they are informed estimates from the
code and configuration. Run `scripts/loadtest.mjs` against a preview deploy to
get real ones for your setup.
