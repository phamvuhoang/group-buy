-- Auth bootstrap and initial RLS policies
-- Safe to run in Supabase SQL editor

-- 1) Mirror auth.users into public.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', null))
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop trigger if exists, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2) Enable RLS on all tables
alter table if exists public.users enable row level security;
alter table if exists public.products enable row level security;
alter table if exists public.groups enable row level security;
alter table if exists public.group_participants enable row level security;
alter table if exists public.orders enable row level security;

-- 3) Policies
-- Drop existing policies first, then create new ones
drop policy if exists "Users can select self" on public.users;
drop policy if exists "Admins can select users" on public.users;

-- Users: a user can see only own row; admins can see all
create policy "Users can select self" on public.users
  for select using (id = auth.uid());

create policy "Admins can select users" on public.users
  for select using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

-- Products policies
drop policy if exists "Public read products" on public.products;
drop policy if exists "Merchants insert products" on public.products;
drop policy if exists "Merchants update own products or admin" on public.products;

create policy "Public read products" on public.products
  for select using (true);

create policy "Merchants insert products" on public.products
  for insert with check (
    exists (select 1 from public.users u where u.id = auth.uid() and (u.role = 'merchant' or u.role = 'admin'))
  );

create policy "Merchants update own products or admin" on public.products
  for update using (
    exists (select 1 from public.users u where u.id = auth.uid() and ((u.role = 'merchant' and products.merchant_id = u.id) or u.role = 'admin'))
  ) with check (
    exists (select 1 from public.users u where u.id = auth.uid() and ((u.role = 'merchant' and products.merchant_id = u.id) or u.role = 'admin'))
  );

-- Groups policies
drop policy if exists "Public read groups" on public.groups;
drop policy if exists "Authenticated create groups" on public.groups;
drop policy if exists "Leader or admin update groups" on public.groups;

create policy "Public read groups" on public.groups
  for select using (true);

create policy "Authenticated create groups" on public.groups
  for insert with check (
    auth.role() = 'authenticated' and leader_id = auth.uid()
  );

create policy "Leader or admin update groups" on public.groups
  for update using (
    (leader_id = auth.uid()) or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  ) with check (
    (leader_id = auth.uid()) or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

-- Group participants policies
drop policy if exists "Public read group participants" on public.group_participants;
drop policy if exists "User joins group as self" on public.group_participants;

create policy "Public read group participants" on public.group_participants
  for select using (true);

create policy "User joins group as self" on public.group_participants
  for insert with check (
    auth.role() = 'authenticated' and user_id = auth.uid()
  );

-- Orders policies
drop policy if exists "User reads own orders" on public.orders;
drop policy if exists "Admin reads all orders" on public.orders;
drop policy if exists "User creates own orders" on public.orders;

create policy "User reads own orders" on public.orders
  for select using (user_id = auth.uid());

create policy "Admin reads all orders" on public.orders
  for select using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

create policy "User creates own orders" on public.orders
  for insert with check (
    auth.role() = 'authenticated' and user_id = auth.uid()
  );