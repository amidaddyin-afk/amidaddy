-- Customer reviews on product pages. Any signed-in customer with a verified
-- email can post one review per product (posting again edits it). Reviews go
-- live immediately; admins hide spam and can feature a review so it leads the
-- panel. verified_purchase is stamped at write time from a paid order line.
--
-- Idempotent: safe to run more than once.

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 80),
  rating smallint not null check (rating between 1 and 5),
  title text check (title is null or char_length(title) <= 100),
  body text not null check (char_length(body) between 10 and 2000),
  verified_purchase boolean not null default false,
  status text not null default 'PUBLISHED' check (status in ('PUBLISHED', 'HIDDEN')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, customer_id)
);

create index if not exists product_reviews_listing_idx
  on public.product_reviews (product_id, status, featured desc, created_at desc);

-- The app reads and writes through the server's database connection. RLS with
-- no policies keeps the table closed to the public Supabase API.
alter table public.product_reviews enable row level security;
