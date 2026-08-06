create type public."InventoryMovementType" as enum ('ADJUSTMENT', 'RESERVATION', 'RELEASE', 'SALE', 'RETURN');

create table public.brands (id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique, created_at timestamptz not null default now());
create table public.categories (id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique, created_at timestamptz not null default now());
create table public.products (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, sku text not null unique, barcode text unique, description text not null,
  mrp numeric(12,2) not null check (mrp >= 0), selling_price numeric(12,2) not null check (selling_price >= 0), offer_price numeric(12,2) check (offer_price is null or offer_price >= 0),
  gst_rate numeric(5,2) not null default 18 check (gst_rate >= 0), stock integer not null default 0 check (stock >= 0), reserved integer not null default 0 check (reserved >= 0 and reserved <= stock),
  low_stock_at integer not null default 5 check (low_stock_at >= 0), active boolean not null default false, featured boolean not null default false, is_new boolean not null default false, best_seller boolean not null default false,
  seo_title text, seo_description text, deleted_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  brand_id uuid references public.brands(id) on delete set null, category_id uuid references public.categories(id) on delete set null
);
create table public.product_images (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade, url text not null, alt text not null, position integer not null default 0 check (position >= 0), created_at timestamptz not null default now(), unique(product_id, position));
create table public.inventory_movements (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete restrict, type public."InventoryMovementType" not null, quantity integer not null check (quantity <> 0), reason text, actor_id uuid references auth.users(id) on delete set null, created_at timestamptz not null default now());
create index products_active_deleted_at_idx on public.products(active, deleted_at);
create index products_category_id_idx on public.products(category_id);
create index products_brand_id_idx on public.products(brand_id);
create index inventory_movements_product_id_created_at_idx on public.inventory_movements(product_id, created_at desc);

alter table public.brands enable row level security; alter table public.categories enable row level security; alter table public.products enable row level security; alter table public.product_images enable row level security; alter table public.inventory_movements enable row level security;
create policy "catalog is publicly readable" on public.products for select using (active and deleted_at is null or public.is_admin());
create policy "product images are publicly readable" on public.product_images for select using (exists (select 1 from public.products where id = product_id and (active and deleted_at is null or public.is_admin())));
create policy "brands are publicly readable" on public.brands for select using (true);
create policy "categories are publicly readable" on public.categories for select using (true);
create policy "admins manage catalog" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage product images" on public.product_images for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage brands" on public.brands for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "admins view inventory" on public.inventory_movements for select using (public.is_admin());
