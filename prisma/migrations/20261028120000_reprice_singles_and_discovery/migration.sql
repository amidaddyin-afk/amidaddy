-- Reprice away from the 99 endings: 20ml Rs 199 -> 197, 100ml Rs 1,199 -> 1,196,
-- 4 x 20ml discovery combo Rs 699 -> 695, and the 4 x 100ml pack Rs 2,899 ->
-- 2,876 to match the "any 4" bundle (39.88% off 4 x 1,196, shown as 40%).
-- MRPs, the 2- and 3-bottle tiers (1,699 / 2,299) and the Rs 599
-- free-shipping threshold are unchanged:
-- three 20ml (Rs 591) still fall short of free delivery, the discovery set clears it.
--
-- Matched on the old price so it is idempotent and never touches a price set
-- by hand in the admin portal. Keep in step with src/lib/data.ts and
-- COMBO_LIST_PAISE in src/lib/commerce.ts.

update public.product_variants
set price_paise = 19700,
    updated_at = now()
where name = '20ml'
  and price_paise = 19900
  and sku <> 'AMI-COMBO-20-20';

update public.product_variants
set price_paise = 119600,
    updated_at = now()
where name = '100ml'
  and price_paise = 119900;

update public.product_variants
set price_paise = 69500,
    updated_at = now()
where sku = 'AMI-COMBO-20-20'
  and price_paise = 69900;

update public.product_variants
set price_paise = 287600,
    updated_at = now()
where sku = 'AMI-COMBO-100-100'
  and price_paise = 289900;

update public.products
set selling_price = 2876,
    updated_at = now()
where slug = 'signature-combo-100ml'
  and selling_price = 2899;

update public.products
set selling_price = 1196,
    updated_at = now()
where collection = 'unisex'
  and selling_price = 1199;

update public.products
set selling_price = 695,
    updated_at = now()
where slug = 'signature-combo-20ml'
  and selling_price = 699;
