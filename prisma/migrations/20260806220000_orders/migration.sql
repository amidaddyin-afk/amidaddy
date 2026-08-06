create table public.orders (
  id text primary key,
  email text not null,
  customer_name text not null,
  phone text not null,
  address text not null,
  total integer not null check (total >= 0),
  status text not null check (status in ('pending', 'paid', 'cancelled')),
  payment_status text not null check (payment_status in ('unpaid', 'paid')),
  payment_order_id text unique,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id text not null references public.orders(id) on delete cascade,
  product_id text not null,
  name text not null,
  size text not null check (size in ('20ml', '100ml')),
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0)
);

create index orders_created_at_idx on public.orders(created_at desc);
create index order_items_order_id_idx on public.order_items(order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "admins view orders" on public.orders for select using (public.is_admin());
create policy "admins view order items" on public.order_items for select using (public.is_admin());
