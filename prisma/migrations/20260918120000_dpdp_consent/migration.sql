-- DPDP Act 2023: marketing consent must be opt-in, never a default.
-- New leads start opted out; consent is recorded only when a visitor ticks
-- the box at signup or checkout.
alter table public.leads alter column marketing_opt_in set default false;

-- When the consent was given, so a request under s.11 can be answered.
alter table public.leads
  add column if not exists marketing_opt_in_at timestamptz;

-- Backfill: rows that predate this migration were defaulted to true without
-- an affirmative act, so they carry no provable consent. Treat them as
-- opted out rather than assume it.
update public.leads
   set marketing_opt_in = false
 where marketing_opt_in = true
   and marketing_opt_in_at is null;
