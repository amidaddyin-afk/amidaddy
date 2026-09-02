-- Lead lifecycle: one row per email address that has ever shown intent,
-- whether or not it became an account or an order. This is the table the
-- admin funnel and the marketing automations both read from.

create table if not exists public.leads (
  email            text primary key,
  full_name        text,
  phone            text,
  customer_id      uuid references public.profiles(id) on delete set null,
  source           text not null default 'SIGNUP',
  stage            text not null default 'SUBSCRIBER'
                     check (stage in ('SUBSCRIBER','SIGNED_UP','CHECKOUT_STARTED','ABANDONED','CUSTOMER','REPEAT_CUSTOMER')),
  marketing_opt_in boolean not null default true,
  unsubscribed_at  timestamptz,
  signed_up_at     timestamptz,
  first_seen_at    timestamptz not null default now(),
  last_seen_at     timestamptz not null default now(),
  last_checkout_at timestamptz,
  first_order_at   timestamptz,
  last_order_at    timestamptz,
  order_count      integer not null default 0,
  lifetime_paise   bigint not null default 0,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists leads_stage_last_seen_idx on public.leads (stage, last_seen_at desc);
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_customer_id_idx on public.leads (customer_id);

-- Append-only trail of what each lead did. Drives the timeline in the
-- admin portal and lets a report explain why a lead sits in its stage.
create table if not exists public.lead_events (
  id         bigserial primary key,
  email      text not null references public.leads(email) on delete cascade,
  type       text not null,
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists lead_events_email_created_idx on public.lead_events (email, created_at desc);

-- One row per (lead, campaign[, order]). The uniqueness is the whole point:
-- it is what stops a cron retry from mailing the same nudge twice. A plain
-- UNIQUE(email, campaign, order_id) would not do that here, because most
-- campaigns (signup-no-order, abandoned-checkout) pass a NULL order_id, and
-- Postgres treats every NULL as distinct in a unique constraint -- so we
-- enforce it with an expression index that collapses NULL to '' instead.
create table if not exists public.campaign_sends (
  id         bigserial primary key,
  email      text not null,
  campaign   text not null,
  order_id   text references public.orders(id) on delete set null,
  status     text not null default 'SENT',
  created_at timestamptz not null default now()
);

create unique index if not exists campaign_sends_unique_idx
  on public.campaign_sends (email, campaign, coalesce(order_id, ''));
create index if not exists campaign_sends_campaign_created_idx on public.campaign_sends (campaign, created_at desc);

-- notification_logs already carries order mail; widen it so lead campaigns
-- can share the same delivery log instead of inventing a second one.
alter table public.notification_logs
  add column if not exists campaign text;

-- Backfill leads from everyone already in the system, so the funnel is not
-- empty on the day this ships.
insert into public.leads (email, full_name, customer_id, source, stage, signed_up_at, first_seen_at, last_seen_at, created_at)
select lower(p.email), p.full_name, p.id, 'SIGNUP', 'SIGNED_UP', p.created_at, p.created_at, p.created_at, p.created_at
from public.profiles p
on conflict (email) do nothing;

insert into public.leads (email, full_name, phone, source, stage, first_seen_at, last_seen_at, created_at)
select lower(o.email), min(o.customer_name), min(o.phone), 'CHECKOUT', 'CHECKOUT_STARTED', min(o.created_at), max(o.created_at), min(o.created_at)
from public.orders o
group by lower(o.email)
on conflict (email) do nothing;

-- Recompute order rollups and the resulting stage for every backfilled lead.
update public.leads l
set order_count    = stats.paid_count,
    lifetime_paise = stats.lifetime_paise,
    first_order_at = stats.first_order_at,
    last_order_at  = stats.last_order_at,
    last_checkout_at = stats.last_checkout_at,
    stage = case
      when stats.paid_count > 1 then 'REPEAT_CUSTOMER'
      when stats.paid_count = 1 then 'CUSTOMER'
      when l.stage = 'SIGNED_UP' then 'SIGNED_UP'
      else 'CHECKOUT_STARTED'
    end
from (
  select lower(email) email,
         count(*) filter (where payment_status in ('PAID','PARTIALLY_REFUNDED','REFUNDED'))::int paid_count,
         coalesce(sum(total_paise) filter (where payment_status in ('PAID','PARTIALLY_REFUNDED','REFUNDED')), 0)::bigint lifetime_paise,
         min(created_at) filter (where payment_status in ('PAID','PARTIALLY_REFUNDED','REFUNDED')) first_order_at,
         max(created_at) filter (where payment_status in ('PAID','PARTIALLY_REFUNDED','REFUNDED')) last_order_at,
         max(created_at) last_checkout_at
  from public.orders
  group by lower(email)
) stats
where l.email = stats.email;
