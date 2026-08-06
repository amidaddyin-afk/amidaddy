create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN');
$$;

create policy "admins can view profiles" on public.profiles for select using (public.is_admin());
create policy "admins can view audit events" on public.audit_logs for select using (public.is_admin());

grant execute on function public.is_admin() to authenticated;
