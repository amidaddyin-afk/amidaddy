import "server-only";

import { db } from "@/lib/db";

/**
 * First-party funnel + geo telemetry, stored in public.analytics_events.
 *
 * This is deliberately small: it exists so the store owns its traffic and
 * funnel data (and can draw its own India map / abandonment number in /admin)
 * without depending on the GA4 UI or a third-party service. GA4 still runs in
 * parallel for the richer reporting.
 *
 * No PII is written here — no IP, no email, no name. `region`/`country` come
 * from the CDN edge headers; `sessionId` is an opaque client id.
 */

export type AnalyticsEventType =
  "page_view" | "view_item" | "add_to_cart" | "begin_checkout" | "purchase";

const EVENT_TYPES = new Set<AnalyticsEventType>([
  "page_view",
  "view_item",
  "add_to_cart",
  "begin_checkout",
  "purchase",
]);

export function isAnalyticsEventType(v: string): v is AnalyticsEventType {
  return EVENT_TYPES.has(v as AnalyticsEventType);
}

/** ISO-3166-2 subdivision code as sent by the edge, e.g. "MH". Kept short and
 *  uppercased; anything unexpected is dropped rather than stored. */
export function cleanRegion(v: string | null | undefined) {
  if (!v) return null;
  const code = v.trim().toUpperCase().slice(0, 8);
  return /^[A-Z0-9-]{1,8}$/.test(code) ? code : null;
}

export function cleanCountry(v: string | null | undefined) {
  if (!v) return null;
  const code = v.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

/** Pure helper for the abandonment metric, extracted so it is testable without
 *  a database. `getCartAbandonment` gets the two counts from SQL and calls this. */
export function abandonmentFrom(
  cartSessions: number,
  purchasedSessions: number,
) {
  const abandonedSessions = Math.max(0, cartSessions - purchasedSessions);
  return {
    cartSessions,
    purchasedSessions,
    abandonedSessions,
    abandonmentRate: cartSessions ? abandonedSessions / cartSessions : 0,
  };
}

export async function recordAnalyticsEvent(input: {
  type: AnalyticsEventType;
  sessionId: string;
  path?: string | null;
  region?: string | null;
  country?: string | null;
  productRef?: string | null;
  valuePaise?: number | null;
  orderId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const sessionId = input.sessionId.trim().slice(0, 64);
  if (!sessionId) return;
  await db().query(
    `insert into public.analytics_events
       (type, session_id, path, region, country, product_ref, value_paise, order_id, metadata)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ${input.type === "purchase" && input.orderId ? "on conflict do nothing" : ""}`,
    [
      input.type,
      sessionId,
      input.path?.slice(0, 512) ?? null,
      cleanRegion(input.region),
      cleanCountry(input.country),
      input.productRef?.slice(0, 128) ?? null,
      Number.isFinite(input.valuePaise) ? input.valuePaise : null,
      input.orderId?.slice(0, 64) ?? null,
      JSON.stringify(input.metadata ?? {}),
    ],
  );
}

// ---- aggregates for the admin Traffic panel --------------------------------

export type RegionTraffic = {
  region: string | null;
  visits: number;
  sessions: number;
};

/** Page-view rollup by region over the last `days` days. `region` null means
 *  the edge did not report a subdivision (common for desktop ISPs). */
export async function getTrafficByRegion(days = 30): Promise<RegionTraffic[]> {
  const { rows } = await db().query(
    `select region,
            count(*)::int                       as visits,
            count(distinct session_id)::int     as sessions
       from public.analytics_events
      where type = 'page_view'
        and created_at >= now() - ($1 || ' days')::interval
      group by region
      order by visits desc`,
    [String(days)],
  );
  return rows.map((r) => ({
    region: r.region,
    visits: Number(r.visits),
    sessions: Number(r.sessions),
  }));
}

export type CartAbandonment = {
  days: number;
  cartSessions: number;
  purchasedSessions: number;
  abandonedSessions: number;
  abandonmentRate: number; // 0..1
};

/**
 * Sessions that fired add_to_cart but never fired purchase, over the last
 * `days` days. Denominator is *sessions with an add_to_cart*, not all sessions.
 */
export async function getCartAbandonment(days = 30): Promise<CartAbandonment> {
  const { rows } = await db().query(
    `with cart as (
       select distinct session_id
         from public.analytics_events
        where type = 'add_to_cart'
          and created_at >= now() - ($1 || ' days')::interval
     ),
     bought as (
       select distinct session_id
         from public.analytics_events
        where type = 'purchase'
          and created_at >= now() - ($1 || ' days')::interval
     )
     select (select count(*) from cart)::int as cart_sessions,
            (select count(*) from cart c where exists
               (select 1 from bought b where b.session_id = c.session_id))::int
              as purchased_sessions`,
    [String(days)],
  );
  return {
    days,
    ...abandonmentFrom(
      Number(rows[0]?.cart_sessions ?? 0),
      Number(rows[0]?.purchased_sessions ?? 0),
    ),
  };
}

/** Delete events older than the retention window. Called by the daily cron. */
export async function pruneAnalyticsEvents(retentionDays = 90) {
  const { rowCount } = await db().query(
    `delete from public.analytics_events
      where created_at < now() - ($1 || ' days')::interval`,
    [String(retentionDays)],
  );
  return rowCount ?? 0;
}
