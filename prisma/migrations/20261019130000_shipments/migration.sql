-- Courier shipments and their tracking history, provider-neutral. Each row
-- names the courier that booked it (shadowfax today), so switching couriers
-- later leaves existing shipments tracking through the one that has them.
--
-- Idempotent: safe to run more than once.

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  provider text not null,
  awb text not null,
  stage text not null default 'BOOKED' check (stage in (
    'BOOKED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED',
    'RETURNING', 'RETURNED', 'CANCELLED', 'LOST'
  )),
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, awb)
);

-- One live booking per order; a cancelled one may be followed by a new one.
create unique index if not exists shipments_one_active_per_order
  on public.shipments (order_id) where stage <> 'CANCELLED';

create index if not exists shipments_open_idx
  on public.shipments (synced_at) where stage not in ('DELIVERED', 'RETURNED', 'CANCELLED', 'LOST');

create table if not exists public.shipment_events (
  id bigint generated always as identity primary key,
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  occurred_at timestamptz not null,
  code text not null,
  label text not null,
  remarks text,
  location text,
  stage text,
  -- Every sync re-reads the courier's full history; this makes it a no-op.
  unique (shipment_id, code, occurred_at)
);

-- The app reads and writes through the server's database connection. RLS with
-- no policies keeps both tables closed to the public Supabase API.
alter table public.shipments enable row level security;
alter table public.shipment_events enable row level security;
