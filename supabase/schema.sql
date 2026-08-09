-- White-label shop schema for Supabase PostgreSQL.
-- Run this file in the Supabase SQL editor after creating the project.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('customer', 'seller', 'admin');
create type public.seller_status as enum ('pending', 'approved', 'suspended');
create type public.order_status as enum (
  'pending',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role public.user_role not null default 'customer',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sellers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles(id) on delete cascade,
  business_name text not null,
  slug text not null unique,
  description text,
  phone text,
  location text,
  status public.seller_status not null default 'pending',
  commission_rate numeric(5,2) not null default 10.00,
  created_at timestamptz not null default now()
);

create table public.categories (
  id bigint generated always as identity primary key,
  name text not null unique,
  slug text not null unique,
  image_url text,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  category_id bigint references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price >= price),
  stock integer not null default 0 check (stock >= 0),
  image_urls text[] not null default '{}',
  is_active boolean not null default false,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id),
  status public.order_status not null default 'pending',
  subtotal numeric(12,2) not null,
  delivery_fee numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  payment_reference text unique,
  delivery_address jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  seller_id uuid not null references public.sellers(id),
  product_name text not null,
  unit_price numeric(12,2) not null,
  quantity integer not null check (quantity > 0),
  commission_amount numeric(12,2) not null default 0
);

create table public.ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  amount numeric(12,2) not null check (amount > 0),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.checkout_orders (
  reference text primary key,
  tracking_code text not null unique,
  email text not null,
  customer_name text not null,
  phone text not null,
  amount numeric(12,2) not null check (amount > 0),
  subtotal numeric(12,2) not null check (subtotal > 0),
  delivery_fee numeric(12,2) not null default 0,
  delivery_address jsonb not null,
  cart_snapshot jsonb not null,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  fulfillment_status text not null default 'awaiting_payment' check (fulfillment_status in ('awaiting_payment', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tracking_events (
  id bigint generated always as identity primary key,
  order_reference text not null references public.checkout_orders(reference) on delete cascade,
  status text not null,
  title text not null,
  description text,
  location text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.sellers enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.ad_campaigns enable row level security;
alter table public.checkout_orders enable row level security;
alter table public.tracking_events enable row level security;

create policy "Public can view approved sellers"
on public.sellers for select using (status = 'approved');

create policy "Sellers can manage their own profile"
on public.sellers for all using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Public can view categories"
on public.categories for select using (true);

create policy "Public can view active products"
on public.products for select using (is_active = true);

create policy "Sellers can manage their products"
on public.products for all
using (seller_id in (select id from public.sellers where owner_id = auth.uid()))
with check (seller_id in (select id from public.sellers where owner_id = auth.uid()));

create policy "Users can view their own profile"
on public.profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update using (auth.uid() = id);

create policy "Customers can view their orders"
on public.orders for select using (auth.uid() = customer_id);

create policy "Customers can create their orders"
on public.orders for insert with check (auth.uid() = customer_id);

create policy "Customers can view their order items"
on public.order_items for select
using (
  order_id in (select id from public.orders where customer_id = auth.uid())
);

create policy "Customers can create their order items"
on public.order_items for insert
with check (
  order_id in (select id from public.orders where customer_id = auth.uid())
);

create policy "Sellers can view their campaign data"
on public.ad_campaigns for select
using (seller_id in (select id from public.sellers where owner_id = auth.uid()));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'customer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.categories (name, slug) values
  ('Phones', 'phones'),
  ('Computing', 'computing'),
  ('Fashion', 'fashion'),
  ('Home', 'home'),
  ('Beauty', 'beauty'),
  ('Groceries', 'groceries')
on conflict (slug) do nothing;
