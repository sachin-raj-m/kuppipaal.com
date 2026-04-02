-- Run this entire script in Supabase Dashboard → SQL Editor

-- 1. Profiles table (extends Supabase Auth users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  role text not null check (role in ('ADMIN', 'DELIVERY_PERSONNEL')) default 'DELIVERY_PERSONNEL',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'DELIVERY_PERSONNEL');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Routes
create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Customers
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  phone text not null,
  route_id uuid references public.routes(id) not null,
  default_milk_quantity numeric(10,2) default 0,
  default_curd_quantity numeric(10,2) default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Pricing
create table if not exists public.pricing (
  id uuid primary key default gen_random_uuid(),
  product_type text not null check (product_type in ('milk', 'curd')),
  price_per_liter numeric(10,2) not null,
  effective_from timestamptz not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 5. Deliveries
create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) not null,
  delivery_personnel_id uuid references auth.users(id) not null,
  delivery_date date not null,
  milk_quantity numeric(10,2) default 0,
  extra_milk_quantity numeric(10,2) default 0,
  curd_quantity numeric(10,2) default 0,
  extra_curd_quantity numeric(10,2) default 0,
  status text not null check (status in ('delivered', 'not_delivered', 'skipped')) default 'delivered',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(customer_id, delivery_date)
);

-- Migration: run this if the deliveries table already exists
-- alter table public.deliveries
--   add column if not exists extra_milk_quantity numeric(10,2) default 0,
--   add column if not exists extra_curd_quantity numeric(10,2) default 0;

-- 6. Bills
create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) not null,
  bill_month int not null check (bill_month between 1 and 12),
  bill_year int not null,
  total_milk_quantity numeric(10,2) default 0,
  total_curd_quantity numeric(10,2) default 0,
  milk_amount numeric(10,2) default 0,
  curd_amount numeric(10,2) default 0,
  total_amount numeric(10,2) default 0,
  payment_status text not null check (payment_status in ('paid', 'unpaid', 'partially_paid')) default 'unpaid',
  amount_paid numeric(10,2) default 0,
  outstanding_balance numeric(10,2) default 0,
  payment_date date,
  payment_method text,
  notes text,
  generated_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(customer_id, bill_month, bill_year)
);

-- 7. Route Assignments
create table if not exists public.route_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  route_id uuid references public.routes(id) not null,
  assigned_at timestamptz default now(),
  is_active boolean default true,
  unique(user_id, route_id)
);

-- Enable Row Level Security (RLS) - allow all for now, configure as needed
alter table public.profiles enable row level security;
alter table public.routes enable row level security;
alter table public.customers enable row level security;
alter table public.pricing enable row level security;
alter table public.deliveries enable row level security;
alter table public.bills enable row level security;
alter table public.route_assignments enable row level security;

-- Simple permissive policy: allow all for authenticated users
create policy "Allow all for authenticated" on public.profiles for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on public.routes for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on public.customers for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on public.pricing for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on public.deliveries for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on public.bills for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on public.route_assignments for all using (auth.role() = 'authenticated');
