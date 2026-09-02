import "server-only";

import { db } from "@/lib/db";

export type LeadStage =
  | "SUBSCRIBER"
  | "SIGNED_UP"
  | "CHECKOUT_STARTED"
  | "ABANDONED"
  | "CUSTOMER"
  | "REPEAT_CUSTOMER";

// Ordering used to decide whether an incoming lifecycle event is allowed to
// move a lead's stage. A lead never regresses from CUSTOMER back down just
// because they start another checkout; ABANDONED sits beside
// CHECKOUT_STARTED so a later real purchase still promotes past it.
const STAGE_RANK: Record<LeadStage, number> = {
  SUBSCRIBER: 0,
  SIGNED_UP: 1,
  CHECKOUT_STARTED: 2,
  ABANDONED: 2,
  CUSTOMER: 3,
  REPEAT_CUSTOMER: 4,
};

export interface LeadRecord {
  email: string;
  fullName: string | null;
  phone: string | null;
  customerId: string | null;
  source: string;
  stage: LeadStage;
  marketingOptIn: boolean;
  signedUpAt: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  lastCheckoutAt: string | null;
  firstOrderAt: string | null;
  lastOrderAt: string | null;
  orderCount: number;
  lifetimePaise: number;
  createdAt: string;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function mapLead(row: Record<string, unknown>): LeadRecord {
  return {
    email: String(row.email),
    fullName: row.full_name ? String(row.full_name) : null,
    phone: row.phone ? String(row.phone) : null,
    customerId: row.customer_id ? String(row.customer_id) : null,
    source: String(row.source),
    stage: row.stage as LeadStage,
    marketingOptIn: Boolean(row.marketing_opt_in),
    signedUpAt: row.signed_up_at
      ? new Date(row.signed_up_at as string).toISOString()
      : null,
    firstSeenAt: new Date(row.first_seen_at as string).toISOString(),
    lastSeenAt: new Date(row.last_seen_at as string).toISOString(),
    lastCheckoutAt: row.last_checkout_at
      ? new Date(row.last_checkout_at as string).toISOString()
      : null,
    firstOrderAt: row.first_order_at
      ? new Date(row.first_order_at as string).toISOString()
      : null,
    lastOrderAt: row.last_order_at
      ? new Date(row.last_order_at as string).toISOString()
      : null,
    orderCount: Number(row.order_count),
    lifetimePaise: Number(row.lifetime_paise),
    createdAt: new Date(row.created_at as string).toISOString(),
  };
}

async function upsertLead(
  email: string,
  stage: LeadStage,
  source: string,
  fields: {
    fullName?: string | null;
    phone?: string | null;
    customerId?: string | null;
    signedUpAt?: boolean;
    checkoutAt?: boolean;
  } = {},
) {
  const normalized = normalizeEmail(email);
  await db().query(
    `insert into public.leads(email, full_name, phone, customer_id, source, stage, signed_up_at, first_seen_at, last_seen_at, last_checkout_at)
     values($1,$2,$3,$4,$5,$6,case when $7 then now() else null end,now(),now(),case when $8 then now() else null end)
     on conflict (email) do update set
       full_name = coalesce(excluded.full_name, public.leads.full_name),
       phone = coalesce(excluded.phone, public.leads.phone),
       customer_id = coalesce(excluded.customer_id, public.leads.customer_id),
       stage = case when $9::int >= (case public.leads.stage
                 when 'SUBSCRIBER' then 0 when 'SIGNED_UP' then 1
                 when 'CHECKOUT_STARTED' then 2 when 'ABANDONED' then 2
                 when 'CUSTOMER' then 3 when 'REPEAT_CUSTOMER' then 4 end)
               then excluded.stage else public.leads.stage end,
       signed_up_at = coalesce(public.leads.signed_up_at, excluded.signed_up_at),
       last_seen_at = now(),
       last_checkout_at = coalesce(excluded.last_checkout_at, public.leads.last_checkout_at),
       updated_at = now()`,
    [
      normalized,
      fields.fullName ?? null,
      fields.phone ?? null,
      fields.customerId ?? null,
      source,
      stage,
      Boolean(fields.signedUpAt),
      Boolean(fields.checkoutAt),
      STAGE_RANK[stage],
    ],
  );
}

async function recordEvent(
  email: string,
  type: string,
  metadata: Record<string, unknown> = {},
) {
  await db().query(
    "insert into public.lead_events(email, type, metadata) values($1,$2,$3)",
    [normalizeEmail(email), type, JSON.stringify(metadata)],
  );
}

/** A visitor submitted the signup form (email not yet verified). Tracked
 * as SUBSCRIBER, not SIGNED_UP -- we don't have proof they own this inbox
 * yet, so nurture campaigns (which target SIGNED_UP) must not mail it. */
export async function recordLeadSignupStarted(
  email: string,
  fullName: string | null,
) {
  await upsertLead(email, "SUBSCRIBER", "SIGNUP", { fullName });
  await recordEvent(email, "signup_started", {});
}

/** The OTP code was verified, confirming the account and the email address.
 * Called from verifySignupOtpAction once Supabase confirms the code. */
export async function recordLeadSignup(
  email: string,
  fullName: string | null,
  customerId: string | null,
) {
  await upsertLead(email, "SIGNED_UP", "SIGNUP", {
    fullName,
    customerId,
    signedUpAt: true,
  });
  await recordEvent(email, "signed_up", { customerId });
}

/** A checkout was started (order row created in PAYMENT_PENDING). */
export async function recordLeadCheckoutStarted(
  email: string,
  fields: {
    fullName?: string | null;
    phone?: string | null;
    customerId?: string | null;
  },
) {
  await upsertLead(email, "CHECKOUT_STARTED", "CHECKOUT", {
    ...fields,
    checkoutAt: true,
  });
  await recordEvent(email, "checkout_started", {});
}

/** An order was paid. Promotes the lead to CUSTOMER / REPEAT_CUSTOMER and
 * rolls up their order stats. */
export async function recordLeadOrderPaid(
  email: string,
  orderId: string,
  totalPaise: number,
  customerId: string | null,
) {
  const normalized = normalizeEmail(email);
  const { rows } = await db().query(
    "select order_count from public.leads where email=$1",
    [normalized],
  );
  const nextCount = Number(rows[0]?.order_count ?? 0) + 1;
  const stage: LeadStage = nextCount > 1 ? "REPEAT_CUSTOMER" : "CUSTOMER";
  await upsertLead(email, stage, "ORDER", { customerId });
  await db().query(
    `update public.leads set
       order_count = order_count + 1,
       lifetime_paise = lifetime_paise + $2,
       first_order_at = coalesce(first_order_at, now()),
       last_order_at = now(),
       updated_at = now()
     where email=$1`,
    [normalized, totalPaise],
  );
  await recordEvent(email, "order_paid", { orderId, totalPaise });
}

/** List leads whose checkout stalled: still in CHECKOUT_STARTED, no order
 * since, and the checkout is older than `hours`. Used by the abandoned-cart
 * nudge cron. */
export async function listStalledCheckouts(hours: number) {
  const { rows } = await db().query(
    `select * from public.leads
     where stage = 'CHECKOUT_STARTED'
       and last_checkout_at < now() - ($1 || ' hours')::interval
     order by last_checkout_at asc
     limit 500`,
    [hours],
  );
  return rows.map(mapLead);
}

export async function markLeadAbandoned(email: string) {
  await db().query(
    "update public.leads set stage='ABANDONED', updated_at=now() where email=$1 and stage='CHECKOUT_STARTED'",
    [normalizeEmail(email)],
  );
}

/** Leads that signed up (or subscribed) and never started a checkout,
 * older than `hours`. Used by the "come back and shop" nudge cron. */
export async function listQuietSignups(hours: number) {
  const { rows } = await db().query(
    `select * from public.leads
     where stage = 'SIGNED_UP'
       and signed_up_at < now() - ($1 || ' hours')::interval
     order by signed_up_at asc
     limit 500`,
    [hours],
  );
  return rows.map(mapLead);
}

/** Records that a campaign was sent for (email, campaign[, order]) exactly
 * once. Returns false if it was already sent — callers should skip sending
 * mail in that case. The unique constraint on campaign_sends is what makes
 * this race-safe under concurrent cron runs. */
export async function claimCampaignSend(
  email: string,
  campaign: string,
  orderId?: string,
) {
  const result = await db().query(
    "insert into public.campaign_sends(email, campaign, order_id) values($1,$2,$3) on conflict do nothing returning id",
    [normalizeEmail(email), campaign, orderId ?? null],
  );
  return result.rowCount === 1;
}

export interface LeadFunnel {
  subscribers: number;
  signedUp: number;
  checkoutStarted: number;
  abandoned: number;
  customers: number;
  repeatCustomers: number;
  total: number;
}

export async function getLeadFunnel(): Promise<LeadFunnel> {
  const { rows } = await db().query(
    "select stage, count(*)::int n from public.leads group by stage",
  );
  const counts: Record<string, number> = {};
  for (const row of rows) counts[String(row.stage)] = Number(row.n);
  return {
    subscribers: counts.SUBSCRIBER ?? 0,
    signedUp: counts.SIGNED_UP ?? 0,
    checkoutStarted: counts.CHECKOUT_STARTED ?? 0,
    abandoned: counts.ABANDONED ?? 0,
    customers: counts.CUSTOMER ?? 0,
    repeatCustomers: counts.REPEAT_CUSTOMER ?? 0,
    total: Object.values(counts).reduce((a, b) => a + b, 0),
  };
}

export async function listLeads(filters?: {
  stage?: LeadStage;
  search?: string;
  limit?: number;
}) {
  const conditions: string[] = [];
  const params: unknown[] = [];
  if (filters?.stage) {
    params.push(filters.stage);
    conditions.push(`stage = $${params.length}`);
  }
  if (filters?.search) {
    params.push(`%${filters.search.toLowerCase()}%`);
    conditions.push(
      `(lower(email) like $${params.length} or lower(coalesce(full_name,'')) like $${params.length})`,
    );
  }
  const where = conditions.length ? `where ${conditions.join(" and ")}` : "";
  params.push(Math.min(filters?.limit ?? 500, 2000));
  const { rows } = await db().query(
    `select * from public.leads ${where} order by last_seen_at desc limit $${params.length}`,
    params,
  );
  return rows.map(mapLead);
}

/** Every lead as flat rows, for the admin CSV export. */
export async function listLeadsForExport() {
  const { rows } = await db().query(
    `select email, full_name, phone, source, stage, marketing_opt_in,
            signed_up_at, first_seen_at, last_seen_at, last_checkout_at,
            first_order_at, last_order_at, order_count, lifetime_paise
     from public.leads
     order by created_at desc`,
  );
  return rows.map(mapLead);
}

export async function setLeadMarketingOptOut(email: string) {
  await db().query(
    "update public.leads set marketing_opt_in=false, unsubscribed_at=now(), updated_at=now() where email=$1",
    [normalizeEmail(email)],
  );
}
