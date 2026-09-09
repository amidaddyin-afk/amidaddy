-- First-party funnel + geo telemetry. Append-only, no PII: one row per tracked
-- interaction (page view, add-to-cart, begin-checkout, purchase). The admin
-- Traffic panel and the cart-abandonment metric both read from here, so the
-- store owns this data regardless of what happens in GA4.
--
-- `region` / `country` come from the edge (Vercel's x-vercel-ip-* headers or
-- Cloudflare's cf-ipcountry) — the raw IP is never stored. `session_id` is an
-- opaque client-generated id (sessionStorage), used only to count unique
-- sessions and to link add_to_cart -> purchase within one visit.
--
-- Pruned to 90 days by the daily maintenance cron (src/app/api/maintenance).

create table if not exists public.analytics_events (
  id          bigserial primary key,
  type        text not null
                check (type in (
                  'page_view',
                  'view_item',
                  'add_to_cart',
                  'begin_checkout',
                  'purchase'
                )),
  session_id  text not null,
  path        text,
  region      text,               -- ISO-3166-2 subdivision, e.g. 'MH', 'DL'
  country     text,               -- ISO-3166-1 alpha-2, e.g. 'IN'
  product_ref text,               -- product slug for item/cart/purchase events
  value_paise integer,            -- order value on purchase events
  order_id    text,               -- purchase events only; dedupes retries
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- Time-ordered scans for the rolling-window aggregates.
create index if not exists analytics_events_created_idx
  on public.analytics_events (created_at desc);

-- Geo rollup: "visits by region over the last N days".
create index if not exists analytics_events_geo_idx
  on public.analytics_events (type, created_at desc, region);

-- Funnel: add_to_cart vs purchase sessions.
create index if not exists analytics_events_funnel_idx
  on public.analytics_events (type, session_id);

-- A purchase is recorded at most once per order, so a payment retry or a
-- refreshed confirmation page cannot double-count revenue or conversions.
create unique index if not exists analytics_events_purchase_order_idx
  on public.analytics_events (order_id)
  where type = 'purchase' and order_id is not null;
