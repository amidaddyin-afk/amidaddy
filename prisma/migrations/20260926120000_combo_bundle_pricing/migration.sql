-- Combo lines are closed to ordinary coupons; only a coupon flagged here may
-- discount them (see couponBasePaise in src/lib/commerce.ts).
alter table public.coupons
  add column if not exists applies_to_combos boolean not null default false;

-- The pre-made 4 x 100ml pack matches the "any 4 for Rs 2,899" bundle price.
update public.product_variants
set price_paise = 289900,
    updated_at = now()
where sku = 'AMI-COMBO-100-100';
