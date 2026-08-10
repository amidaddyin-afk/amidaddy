-- Login throttling is an internal server concern. These functions accepted
-- attacker-controlled input through the public Supabase REST API, allowing an
-- anonymous caller to lock arbitrary accounts without using the login form.
revoke all on function public.login_allowed(text) from public, anon, authenticated;
revoke all on function public.record_login_attempt(text, boolean, inet) from public, anon, authenticated;

create table public.request_rate_limits (
  scope text not null,
  identity_hash text not null,
  window_start timestamptz not null,
  attempts integer not null default 1 check (attempts > 0),
  primary key (scope, identity_hash, window_start)
);

alter table public.request_rate_limits enable row level security;
revoke all on table public.request_rate_limits from public, anon, authenticated;
