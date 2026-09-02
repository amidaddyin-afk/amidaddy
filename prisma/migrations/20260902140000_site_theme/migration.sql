-- Storefront art direction, switchable from the admin portal.
--   noir     every surface dark
--   atelier  every surface light
--   duality  dark story + chrome, light commerce (the original intended look)
alter table public.store_settings
  add column if not exists theme text not null default 'duality'
  check (theme in ('noir', 'atelier', 'duality'));
