create type public."UserRole" as enum ('CUSTOMER', 'ADMIN');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role public."UserRole" not null default 'CUSTOMER',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  event text not null check (char_length(event) between 1 and 80),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_actor_id_created_at_idx on public.audit_logs (actor_id, created_at desc);

create table public.login_attempts (
  email text primary key,
  failed_attempts integer not null default 0 check (failed_attempts >= 0),
  locked_until timestamptz,
  last_attempt_at timestamptz not null default now(),
  last_ip inet
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN');
$$;

alter table public.profiles enable row level security;
alter table public.audit_logs enable row level security;
alter table public.login_attempts enable row level security;

create policy "profiles are readable by their owner" on public.profiles for select using (auth.uid() = id);
create policy "profiles are editable by their owner" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));
create policy "users can view their own audit events" on public.audit_logs for select using (auth.uid() = actor_id);
create policy "admins can view profiles" on public.profiles for select using (public.is_admin());
create policy "admins can view audit events" on public.audit_logs for select using (public.is_admin());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''));
  insert into public.audit_logs (actor_id, event) values (new.id, 'account.created');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.login_allowed(login_email text)
returns boolean
language sql
security definer set search_path = public
as $$
  select coalesce((select locked_until is null or locked_until <= now() from public.login_attempts where email = lower(trim(login_email))), true);
$$;

create or replace function public.record_login_attempt(login_email text, succeeded boolean, source_ip inet default null)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  normalized_email text := lower(trim(login_email));
  next_failures integer;
begin
  if succeeded then
    delete from public.login_attempts where email = normalized_email;
    if auth.uid() is not null then insert into public.audit_logs (actor_id, event) values (auth.uid(), 'auth.signed_in'); end if;
    return;
  end if;
  insert into public.login_attempts (email, failed_attempts, last_attempt_at, last_ip)
  values (normalized_email, 1, now(), source_ip)
  on conflict (email) do update set failed_attempts = public.login_attempts.failed_attempts + 1, last_attempt_at = now(), last_ip = excluded.last_ip
  returning failed_attempts into next_failures;
  if next_failures >= 5 then
    update public.login_attempts set locked_until = now() + interval '15 minutes', failed_attempts = 0 where email = normalized_email;
  end if;
end;
$$;

grant execute on function public.login_allowed(text) to anon, authenticated;
grant execute on function public.record_login_attempt(text, boolean, inet) to anon, authenticated;
grant execute on function public.is_admin() to authenticated;
