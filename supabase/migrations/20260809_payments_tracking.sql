-- Apply this migration to an existing Stop Shop Supabase project.
create table if not exists public.checkout_orders (
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

create table if not exists public.tracking_events (
  id bigint generated always as identity primary key,
  order_reference text not null references public.checkout_orders(reference) on delete cascade,
  status text not null,
  title text not null,
  description text,
  location text,
  created_at timestamptz not null default now()
);

alter table public.checkout_orders enable row level security;
alter table public.tracking_events enable row level security;

-- No public policies are intentional. Payment/order writes go through the
-- server-only service role after Paystack verification.
