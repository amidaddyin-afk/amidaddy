alter table public.products
  add column collection text not null default 'unisex' check (collection in ('unisex', 'combos')),
  add column pack_size integer not null default 1 check (pack_size > 0 and pack_size <= 100);

alter table public.product_images
  add column variant_name text check (variant_name is null or variant_name in ('20ml', '100ml'));

create index product_images_product_variant_idx
  on public.product_images(product_id, variant_name, position);

insert into public.categories(name, slug)
values ('Combo Sets', 'combos')
on conflict(slug) do nothing;

insert into public.products(
  id, name, slug, sku, description, mrp, selling_price, gst_rate, stock,
  active, featured, is_new, best_seller, fragrance_family, concentration,
  gender_positioning, top_notes, heart_notes, base_notes, longevity, mood,
  occasion, story, collection, pack_size, brand_id, category_id
)
select
  seed.id, seed.name, seed.slug, seed.sku, seed.description, seed.mrp,
  seed.price, 18, seed.stock, true, true, true, false, 'Mixed',
  'Eau de Parfum', 'Unisex', seed.top_notes, seed.heart_notes,
  seed.base_notes, '6–10 hours', seed.mood, seed.occasion, seed.story,
  'combos', 4, b.id, c.id
from (values
  (
    'a1000000-0000-4000-8000-000000000020'::uuid,
    'Signature Discovery Combo',
    'signature-combo-20ml',
    'AMI-COMBO-20',
    'All four Amidaddy fragrances together in travel-ready 20 ml bottles.',
    996::numeric,
    699::numeric,
    20,
    array['Four signature openings'],
    array['Floral, fresh, woody and amber'],
    array['The complete Amidaddy wardrobe'],
    'Discover every signature',
    'Discovery, travel and gifting',
    'A complete introduction to the house: four moods, four bottles, one considered set.'
  ),
  (
    'a1000000-0000-4000-8000-000000000100'::uuid,
    'Signature Collection Combo',
    'signature-combo-100ml',
    'AMI-COMBO-100',
    'The complete Amidaddy collection with all four fragrances in 100 ml bottles.',
    5996::numeric,
    4299::numeric,
    12,
    array['Four signature openings'],
    array['Floral, fresh, woody and amber'],
    array['The complete Amidaddy wardrobe'],
    'The complete collection',
    'Daily rotation and gifting',
    'Four full-size signatures composed for every side of your presence.'
  )
) as seed(
  id, name, slug, sku, description, mrp, price, stock, top_notes,
  heart_notes, base_notes, mood, occasion, story
)
cross join public.brands b
cross join public.categories c
where b.slug = 'amidaddy' and c.slug = 'combos'
on conflict(slug) do update set
  name = excluded.name,
  description = excluded.description,
  mrp = excluded.mrp,
  selling_price = excluded.selling_price,
  stock = excluded.stock,
  active = true,
  featured = true,
  is_new = true,
  fragrance_family = excluded.fragrance_family,
  top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes,
  base_notes = excluded.base_notes,
  longevity = excluded.longevity,
  mood = excluded.mood,
  occasion = excluded.occasion,
  story = excluded.story,
  collection = 'combos',
  pack_size = 4,
  category_id = excluded.category_id;

insert into public.product_variants(
  product_id, name, sku, price_paise, mrp_paise, stock, low_stock_at, active
)
select p.id, seed.name, seed.sku, seed.price, seed.mrp, seed.stock, 3, true
from (values
  ('signature-combo-20ml', '20ml', 'AMI-COMBO-20-20', 69900, 99600, 20),
  ('signature-combo-100ml', '100ml', 'AMI-COMBO-100-100', 429900, 599600, 12)
) as seed(slug, name, sku, price, mrp, stock)
join public.products p on p.slug = seed.slug
on conflict(sku) do update set
  price_paise = excluded.price_paise,
  mrp_paise = excluded.mrp_paise,
  stock = excluded.stock,
  active = true,
  updated_at = now();

insert into public.product_images(product_id, url, alt, position, variant_name)
select p.id, seed.url, seed.alt, seed.position, seed.variant_name
from (values
  ('billionaire', '/products/20ml/billionaire.webp', 'Billionaire 20 ml bottle', 100, '20ml'),
  ('coldwar', '/products/20ml/cold-war.webp', 'Cold War 20 ml bottle', 100, '20ml'),
  ('heavenly', '/products/20ml/heavenly.webp', 'Heavenly 20 ml bottle', 100, '20ml'),
  ('old-love', '/products/20ml/old-love.webp', 'Old Love 20 ml bottle', 100, '20ml'),
  ('signature-combo-20ml', '/products/combos/20ml/01.webp', 'Four fragrance 20 ml combo', 0, '20ml'),
  ('signature-combo-20ml', '/products/combos/20ml/02.webp', 'Four fragrance 20 ml combo detail', 1, '20ml'),
  ('signature-combo-20ml', '/products/combos/20ml/03.webp', 'Four fragrance 20 ml combo arrangement', 2, '20ml'),
  ('signature-combo-20ml', '/products/combos/20ml/04.webp', 'Four fragrance 20 ml combo lifestyle photo 1', 3, '20ml'),
  ('signature-combo-20ml', '/products/combos/20ml/05.webp', 'Four fragrance 20 ml combo lifestyle photo 2', 4, '20ml'),
  ('signature-combo-20ml', '/products/combos/20ml/06.webp', 'Four fragrance 20 ml combo lifestyle photo 3', 5, '20ml'),
  ('signature-combo-20ml', '/products/combos/20ml/07.webp', 'Four fragrance 20 ml combo lifestyle photo 4', 6, '20ml'),
  ('signature-combo-20ml', '/products/combos/20ml/08.webp', 'Four fragrance 20 ml combo lifestyle photo 5', 7, '20ml'),
  ('signature-combo-20ml', '/products/combos/20ml/09.webp', 'Four fragrance 20 ml combo lifestyle photo 6', 8, '20ml'),
  ('signature-combo-100ml', '/products/combos/100ml/01.webp', 'Four fragrance 100 ml combo', 0, '100ml'),
  ('signature-combo-100ml', '/products/combos/100ml/02.webp', 'Four fragrance 100 ml combo detail', 1, '100ml'),
  ('signature-combo-100ml', '/products/combos/100ml/03.webp', 'Four fragrance 100 ml combo arrangement', 2, '100ml'),
  ('signature-combo-100ml', '/products/combos/100ml/04.webp', 'Complete four fragrance 100 ml set', 3, '100ml')
) as seed(slug, url, alt, position, variant_name)
join public.products p on p.slug = seed.slug
on conflict(product_id, position) do update set
  url = excluded.url,
  alt = excluded.alt,
  variant_name = excluded.variant_name;
