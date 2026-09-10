# Scaling & tier switching

The store runs on four managed services. **Every one of them upgrades from its
free/entry tier to a paid tier in the provider dashboard with no code change**
— the app talks to the same URLs and keys either way. This doc lists the
current tier, the ceiling that forces an upgrade, and the exact switch.

Keep this the single place that answers "are we about to hit a limit, and what
do we press."

---

## At a glance

| Service      | Job                                        | Current tier    | First hard limit you hit                                       | Upgrade =                                                        |
| ------------ | ------------------------------------------ | --------------- | -------------------------------------------------------------- | ---------------------------------------------------------------- |
| **Vercel**   | Hosting, functions, cron, edge geo headers | Hobby           | Daily-only cron; no commercial use terms; 100 GB-hrs functions | Dashboard → upgrade to **Pro** (~$20/user/mo)                    |
| **Supabase** | Postgres, Auth                             | Free            | 500 MB DB, 50k MAU, project pauses after 7 days idle           | Dashboard → **Pro** ($25/mo): 8 GB DB, no pausing, daily backups |
| **Razorpay** | Payments                                   | Standard (live) | None for volume; per-txn fee only                              | Already "paid" — negotiate rate at volume, nothing to switch     |
| **Resend**   | Transactional email                        | Free            | 100 emails/day, 3,000/mo, 1 domain                             | Dashboard → **Pro** ($20/mo): 50k/mo                             |

Nothing here needs a migration. There is no self-hosted component to scale.

---

## Vercel

**What it does for us now:** serves the Next.js app, runs `/api/*` as functions,
runs the daily `/api/maintenance` cron (`vercel.ts`), and — importantly for the
new traffic map — injects `x-vercel-ip-country` / `x-vercel-ip-country-region`
on every request for free. `src/app/api/track/route.ts` reads those.

**Ceilings on Hobby:**

- **Cron is daily-only.** `vercel.ts` runs maintenance at 03:00 UTC. Order
  expiry and abandoned-cart nurture therefore have up to 24h latency.
- Hobby is non-commercial per Vercel's terms — a live store should be on Pro.
- 100 GB-hours of function execution / month, 1 M edge requests. A small store
  is nowhere near this; watch it in the Vercel dashboard → Usage.

**Switch to Pro:** Vercel dashboard → the team → Settings → Billing → Upgrade.
No redeploy. Then, if you want tighter maintenance timing, edit `vercel.ts`:

```ts
// Hobby: "0 3 * * *" (daily). Pro: run hourly so expiry/nurture are near-real-time.
crons: [{ path: "/api/maintenance", schedule: "0 * * * *" }],
```

Commit that and redeploy. Nothing else changes — the route already guards on
`CRON_SECRET` and is idempotent.

**If you outgrow Pro:** Vercel Enterprise, or move the Next.js app to any Node
host (it's a standard `next build` / `next start`). The only Vercel-specific
code is the geo header names in the two `/api/track` routes, which already fall
back to Cloudflare's `cf-ipcountry` / `cf-region-code`, so fronting a different
host with Cloudflare keeps the map working.

## Supabase

**What it does for us now:** the Postgres database (all app data, via the `pg`
pool in `src/lib/db.ts` and Prisma migrations) and Supabase Auth (customer +
admin accounts, `src/lib/supabase/*`, `src/proxy.ts`).

**Ceilings on Free:**

- **500 MB database.** The new `analytics_events` table is the fastest-growing
  one. It's pruned to 90 days by the daily cron (`pruneAnalyticsEvents`), and
  each row is ~150 bytes, so ~1 M events ≈ 150 MB. If page views run high,
  shorten retention in `src/app/api/maintenance/route.ts` (the `pruneAnalyticsEvents()`
  call takes a day count) or upgrade.
- **Project pauses after 7 days with no requests** on Free — fine once there's
  live traffic, painful for a staging project.
- 50,000 monthly active auth users. Not a near-term concern.
- No daily backups on Free.

**Switch to Pro:** Supabase dashboard → project → Settings → Billing → upgrade
to Pro. Instant, same connection string, same keys. 8 GB DB, no pausing, 7-day
PITR backups, then usage-based above that.

**If you outgrow Pro:** Supabase scales to 8XL compute in-dashboard. A move off
Supabase means (a) point `DATABASE_URL` / `DIRECT_URL` at the new Postgres and
run `prisma migrate deploy`, and (b) replace Supabase Auth — that's the real
work, since `src/lib/supabase`, `src/proxy.ts`, and the auth actions assume it.
Not something to do casually; Supabase Pro covers a long runway.

## Razorpay

Already a paid, live integration — there is no free→paid switch. Costs are
per-transaction (~2% + GST, lower with negotiation at volume). At scale, contact
Razorpay for a custom rate; no code change. `RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET`
stay the same.

Do **not** enable COD without an owner decision on RTO economics — it is off by
design.

## Resend

**What it does for us now:** order-confirmation and lifecycle emails
(`src/lib/mailer.ts`, `src/lib/campaigns.ts`). `RESEND_API_KEY`,
`RESEND_FROM_EMAIL`.

**Ceiling on Free:** 100 emails/day and 3,000/month, one verified domain. At
~2 emails per order plus nurture, that's roughly 30–40 orders/day before the
cap bites.

**Switch to Pro:** Resend dashboard → Billing → Pro ($20/mo, 50,000/mo). Same
API key. No code change. If email volume is bursty, also raise the daily send
in the dashboard.

---

## What is already built for scale

- **DB access** is a pooled `pg` client (`src/lib/db.ts`, `max: 8`) using
  Supabase's transaction pooler — safe for serverless concurrency.
- **Payments** verify server-side (HMAC + live capture check) and dedupe on
  unique `payment_id` / webhook event id — retries can't double-charge or
  double-count.
- **Analytics** is append-only with time-ordered indexes and a retention prune;
  it will not grow without bound.
- **Rate limiting** on `/api/checkout`, `/api/track`, auth — DB-backed, pruned
  daily.
- **Images** are `next/image` (AVIF/WebP, sized to real breakpoints, 30-day CDN
  cache) — see `next.config.ts`.
- **Static/ISR**: policy pages and scent-school chapters are prerendered;
  product and shop pages are dynamic but cache-friendly.

## What to watch as traffic grows

| Signal                                                 | Where                                 | Action                                                                                            |
| ------------------------------------------------------ | ------------------------------------- | ------------------------------------------------------------------------------------------------- |
| DB size approaching 500 MB / 8 GB                      | Supabase dashboard → Database → Usage | Shorten `analytics_events` retention, then upgrade tier                                           |
| Function GB-hours climbing                             | Vercel dashboard → Usage              | Upgrade to Pro; check for an accidental hot loop                                                  |
| Email cap warnings                                     | Resend dashboard                      | Upgrade to Pro                                                                                    |
| Maintenance latency matters (expiry/nurture feel slow) | —                                     | Pro cron → hourly schedule in `vercel.ts`                                                         |
| `/api/track` write volume high                         | `analytics_events` row count          | Sample page views client-side (e.g. beacon 1 in N) before considering a dedicated analytics store |
