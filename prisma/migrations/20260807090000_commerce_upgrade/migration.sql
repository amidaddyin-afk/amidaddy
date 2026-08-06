create type public."OrderStatus" as enum ('PAYMENT_PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'EXPIRED');
create type public."PaymentStatus" as enum ('UNPAID', 'PAID', 'REFUND_PENDING', 'PARTIALLY_REFUNDED', 'REFUNDED', 'FAILED');
create type public."RefundStatus" as enum ('PENDING', 'PROCESSED', 'FAILED');
create type public."CouponType" as enum ('PERCENT', 'FIXED');

alter table public.products
  add column fragrance_family text,
  add column concentration text,
  add column gender_positioning text,
  add column top_notes text[] not null default '{}',
  add column heart_notes text[] not null default '{}',
  add column base_notes text[] not null default '{}',
  add column longevity text,
  add column mood text,
  add column occasion text,
  add column story text;

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  sku text not null unique,
  price_paise integer not null check (price_paise >= 0),
  mrp_paise integer not null check (mrp_paise >= price_paise),
  stock integer not null default 0 check (stock >= 0),
  reserved integer not null default 0 check (reserved >= 0 and reserved <= stock),
  low_stock_at integer not null default 5 check (low_stock_at >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_id, name)
);
create index product_variants_product_id_active_idx on public.product_variants(product_id, active);

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders rename column total to total_paise;
update public.orders set total_paise = total_paise * 100;
alter table public.orders
  add column customer_id uuid references public.profiles(id) on delete set null,
  add column city text,
  add column state text,
  add column postal_code text,
  add column country text not null default 'IN',
  add column subtotal_paise integer,
  add column discount_paise integer not null default 0,
  add column shipping_paise integer not null default 0,
  add column tax_paise integer not null default 0,
  add column coupon_code text,
  add column payment_id text unique,
  add column courier_name text,
  add column tracking_number text,
  add column tracking_url text,
  add column expires_at timestamptz,
  add column shipped_at timestamptz,
  add column delivered_at timestamptz,
  add column cancelled_at timestamptz,
  add column cancellation_reason text,
  add column updated_at timestamptz not null default now();
update public.orders set subtotal_paise = total_paise where subtotal_paise is null;
alter table public.orders alter column subtotal_paise set not null;
alter table public.orders alter column status drop default;
alter table public.orders alter column payment_status drop default;
alter table public.orders alter column status type public."OrderStatus" using (
  case status when 'paid' then 'CONFIRMED' when 'cancelled' then 'CANCELLED' else 'PAYMENT_PENDING' end
)::public."OrderStatus";
alter table public.orders alter column payment_status type public."PaymentStatus" using (
  case payment_status when 'paid' then 'PAID' else 'UNPAID' end
)::public."PaymentStatus";
alter table public.orders alter column status set default 'PAYMENT_PENDING';
alter table public.orders alter column payment_status set default 'UNPAID';
create index orders_customer_id_created_at_idx on public.orders(customer_id, created_at desc);
create index orders_status_created_at_idx on public.orders(status, created_at desc);

alter table public.order_items rename column product_id to product_ref;
alter table public.order_items rename column unit_price to unit_price_paise;
update public.order_items set unit_price_paise = unit_price_paise * 100;
alter table public.order_items
  add column variant_id uuid references public.product_variants(id) on delete set null,
  add column gst_rate numeric(5,2) not null default 18,
  add column tax_paise integer not null default 0,
  add column line_total_paise integer;
update public.order_items set line_total_paise = unit_price_paise * quantity;
alter table public.order_items alter column line_total_paise set not null;
create index order_items_variant_id_idx on public.order_items(variant_id);

create table public.coupons (
  id uuid primary key default gen_random_uuid(), code text not null unique, type public."CouponType" not null, value integer not null check(value > 0),
  min_subtotal_paise integer not null default 0, max_discount_paise integer, usage_limit integer, per_customer_limit integer not null default 1,
  active boolean not null default true, starts_at timestamptz, ends_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(), coupon_id uuid not null references public.coupons(id), order_id text not null references public.orders(id) on delete cascade,
  customer_id uuid references public.profiles(id) on delete set null, email text not null, amount_paise integer not null, created_at timestamptz not null default now()
);
create index coupon_redemptions_coupon_id_email_idx on public.coupon_redemptions(coupon_id, email);
create table public.refunds (
  id uuid primary key default gen_random_uuid(), order_id text not null references public.orders(id) on delete cascade, payment_refund_id text unique,
  amount_paise integer not null check(amount_paise > 0), reason text not null, status public."RefundStatus" not null default 'PENDING',
  requested_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), processed_at timestamptz
);
create index refunds_order_id_created_at_idx on public.refunds(order_id, created_at desc);
create table public.webhook_events (id text primary key, provider text not null, event text not null, payload_hash text not null, processed_at timestamptz not null default now());
create table public.notification_logs (
  id uuid primary key default gen_random_uuid(), order_id text, recipient text not null, template text not null, status text not null,
  provider_id text, attempts integer not null default 0, error text, created_at timestamptz not null default now(), sent_at timestamptz
);
create index notification_logs_status_created_at_idx on public.notification_logs(status, created_at);
create table public.store_settings (
  id integer primary key default 1 check(id = 1), support_email text not null default 'support@amidaddy.com', support_phone text,
  shipping_fee_paise integer not null default 9900, free_shipping_above_paise integer not null default 199900,
  cancellation_message text not null default 'Orders can be cancelled before processing begins.', updated_at timestamptz not null default now()
);
insert into public.store_settings(id) values (1) on conflict do nothing;

insert into public.brands(name, slug) values ('Amidaddy', 'amidaddy') on conflict(slug) do nothing;
insert into public.categories(name, slug) values ('Eau de Parfum', 'eau-de-parfum') on conflict(slug) do nothing;
insert into public.products(id, name, slug, sku, description, mrp, selling_price, gst_rate, stock, active, featured, best_seller, fragrance_family, concentration, gender_positioning, top_notes, heart_notes, base_notes, longevity, mood, occasion, story, brand_id, category_id)
select seed.id, seed.name, seed.slug, seed.sku, seed.description, seed.mrp, seed.price, 18, seed.stock, true, seed.featured, seed.best_seller, seed.family, 'Eau de Parfum', 'Unisex', seed.top_notes, seed.heart_notes, seed.base_notes, seed.longevity, seed.mood, seed.occasion, seed.story, b.id, c.id
from (values
  ('a1000000-0000-4000-8000-000000000001'::uuid,'Billionaire Noir','billionaire','AMI-BN','A commanding woody amber built for memorable entrances.',1699,1199,40,true,true,'Woody',array['Bergamot','Black pepper'],array['Cedarwood','Patchouli'],array['Amber','Musk'],'8–10 hours','Bold and magnetic','Evening and occasions','A study in ambition, polished woods and warm amber.'),
  ('a1000000-0000-4000-8000-000000000002'::uuid,'Cold War','coldwar','AMI-CW','Icy freshness and clean musk with a precise, energetic finish.',1399,1199,40,true,false,'Fresh',array['Mint','Bergamot'],array['Pepper','Lavender'],array['Clean musk','Cedar'],'6–8 hours','Cool and focused','Day and office','A bright collision of cool air, mineral spice and clean woods.'),
  ('a1000000-0000-4000-8000-000000000003'::uuid,'Heavenly','heavenly','AMI-HV','A luminous floral musk that moves softly from day into evening.',1399,1199,40,true,false,'Floral',array['Pear','Neroli'],array['White florals','Iris'],array['Soft musk','Sandalwood'],'7–9 hours','Soft and elegant','Everyday and celebrations','Weightless florals settle into a graceful skin-like musk.'),
  ('a1000000-0000-4000-8000-000000000004'::uuid,'Old Love','old-love','AMI-OL','Warm vanilla, saffron and resin composed with nostalgic depth.',1499,1199,40,true,false,'Amber',array['Saffron','Pink pepper'],array['Rose','Warm resin'],array['Vanilla','Amber woods'],'8–9 hours','Warm and intimate','Date night and cool weather','A familiar warmth reimagined as amber light on skin.')
) as seed(id,name,slug,sku,description,mrp,price,stock,featured,best_seller,family,top_notes,heart_notes,base_notes,longevity,mood,occasion,story)
cross join public.brands b cross join public.categories c where b.slug='amidaddy' and c.slug='eau-de-parfum'
on conflict(slug) do update set fragrance_family=excluded.fragrance_family, concentration=excluded.concentration, gender_positioning=excluded.gender_positioning, top_notes=excluded.top_notes, heart_notes=excluded.heart_notes, base_notes=excluded.base_notes, longevity=excluded.longevity, mood=excluded.mood, occasion=excluded.occasion, story=excluded.story;

insert into public.product_variants(id, product_id, name, sku, price_paise, mrp_paise, stock, low_stock_at)
select gen_random_uuid(), p.id, v.name, p.sku || '-' || upper(replace(v.name,'ml','')), v.price, v.mrp, case when v.name='20ml' then 40 else 20 end, 5
from public.products p cross join (values ('20ml',19900,24900),('100ml',119900,149900)) v(name,price,mrp)
where p.slug in ('billionaire','coldwar','heavenly','old-love') on conflict(sku) do nothing;
update public.order_items oi set variant_id = pv.id from public.products p, public.product_variants pv where p.slug=oi.product_ref and pv.product_id=p.id and pv.name=oi.size and oi.variant_id is null;

alter table public.product_variants enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.refunds enable row level security;
alter table public.webhook_events enable row level security;
alter table public.notification_logs enable row level security;
alter table public.store_settings enable row level security;
create policy "active variants are public" on public.product_variants for select using (active and exists(select 1 from public.products p where p.id=product_id and p.active and p.deleted_at is null) or public.is_admin());
create policy "admins manage variants" on public.product_variants for all using(public.is_admin()) with check(public.is_admin());
create policy "admins manage coupons" on public.coupons for all using(public.is_admin()) with check(public.is_admin());
create policy "customers view own orders" on public.orders for select using(auth.uid()=customer_id);
create policy "customers view own order items" on public.order_items for select using(exists(select 1 from public.orders o where o.id=order_id and o.customer_id=auth.uid()));
create policy "customers view own refunds" on public.refunds for select using(exists(select 1 from public.orders o where o.id=order_id and o.customer_id=auth.uid()));
create policy "admins manage refunds" on public.refunds for all using(public.is_admin()) with check(public.is_admin());
create policy "admins view coupon redemptions" on public.coupon_redemptions for select using(public.is_admin());
create policy "admins view notifications" on public.notification_logs for select using(public.is_admin());
create policy "admins manage settings" on public.store_settings for all using(public.is_admin()) with check(public.is_admin());
create policy "settings are publicly readable" on public.store_settings for select using(true);

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('product-media', 'product-media', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=true, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;
create policy "public reads product media" on storage.objects for select using(bucket_id='product-media');
create policy "admins insert product media" on storage.objects for insert with check(bucket_id='product-media' and public.is_admin());
create policy "admins update product media" on storage.objects for update using(bucket_id='product-media' and public.is_admin()) with check(bucket_id='product-media' and public.is_admin());
create policy "admins delete product media" on storage.objects for delete using(bucket_id='product-media' and public.is_admin());
