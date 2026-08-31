alter table public.store_settings
  alter column free_shipping_above_paise set default 59900;

update public.store_settings
set free_shipping_above_paise = 59900,
    shipping_fee_paise = 9900,
    updated_at = now()
where id = 1;
