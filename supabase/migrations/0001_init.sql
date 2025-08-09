-- Initial schema for GroupBuy
-- Safe to run in Supabase SQL editor

-- Extensions (usually enabled by default in Supabase)
create extension if not exists pgcrypto;

-- Users
create table if not exists public.users (
  id uuid primary key,
  email text unique,
  name text,
  role text default 'customer', -- customer/merchant/admin/support
  created_at timestamptz default now()
);

-- Products
create table if not exists public.products (
  id uuid primary key,
  merchant_id uuid references public.users(id) on delete set null,
  title text not null,
  description text,
  price numeric not null,
  group_price numeric not null,
  images text[] default array[]::text[],
  current_groups int default 0,
  created_at timestamptz default now()
);

-- Groups (active group-buy sessions)
create table if not exists public.groups (
  id uuid primary key,
  product_id uuid references public.products(id) on delete cascade,
  leader_id uuid references public.users(id) on delete set null,
  required_count int not null,
  current_count int default 1,
  expires_at timestamptz not null,
  status text default 'open', -- open/completed/failed
  created_at timestamptz default now()
);

-- Group participants
create table if not exists public.group_participants (
  id uuid primary key,
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  joined_at timestamptz default now()
);

-- Orders
create table if not exists public.orders (
  id uuid primary key,
  user_id uuid references public.users(id) on delete set null,
  group_id uuid references public.groups(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  amount numeric not null,
  status text default 'pending', -- pending/paid/shipped/delivered/canceled
  created_at timestamptz default now()
);

-- Basic indexes
create index if not exists idx_products_merchant on public.products(merchant_id);
create index if not exists idx_groups_product on public.groups(product_id);
create index if not exists idx_group_participants_group on public.group_participants(group_id);
create index if not exists idx_orders_user on public.orders(user_id);

