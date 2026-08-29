-- Browser-authenticated users must not be able to mutate inventory by calling
-- SECURITY DEFINER functions directly through the Supabase API.
revoke all on function public.reserve_inventory(uuid, integer, text) from public, anon, authenticated;
revoke all on function public.release_inventory(uuid, integer, text) from public, anon, authenticated;
revoke all on function public.commit_inventory_sale(uuid, integer, text) from public, anon, authenticated;
revoke all on function public.adjust_inventory(uuid, integer, text) from public, anon, authenticated;

-- Persist the same monetary and promotion invariants enforced by application code.
alter table public.coupons
  add constraint coupons_min_subtotal_nonnegative check (min_subtotal_paise >= 0),
  add constraint coupons_max_discount_positive check (max_discount_paise is null or max_discount_paise > 0),
  add constraint coupons_usage_limit_positive check (usage_limit is null or usage_limit > 0),
  add constraint coupons_per_customer_limit_positive check (per_customer_limit > 0),
  add constraint coupons_percent_at_most_100 check (type <> 'PERCENT' or value <= 100),
  add constraint coupons_valid_window check (starts_at is null or ends_at is null or starts_at < ends_at);

alter table public.orders
  add constraint orders_money_nonnegative check (
    subtotal_paise >= 0 and discount_paise >= 0 and shipping_paise >= 0 and
    tax_paise >= 0 and total_paise >= 0 and discount_paise <= subtotal_paise
  );

alter table public.order_items
  add constraint order_items_money_nonnegative check (
    quantity > 0 and unit_price_paise >= 0 and tax_paise >= 0 and line_total_paise >= 0
  );

alter table public.store_settings
  add constraint store_settings_shipping_nonnegative check (
    shipping_fee_paise >= 0 and free_shipping_above_paise >= 0
  );
