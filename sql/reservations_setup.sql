-- Create reservations table and policies
create extension if not exists pgcrypto;

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text,
  phone text,
  email text,
  date date not null,
  time text not null,
  party_size int not null check (party_size > 0),
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed')),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_reservations_created_at on public.reservations (created_at desc);
create index if not exists idx_reservations_date_time on public.reservations (date, time);

alter table public.reservations enable row level security;

-- Ensure user_roles exists for admin detection
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null
);

-- Admin policies (assumes user_roles table with role='admin')
create policy if not exists reservations_admin_read
on public.reservations
for select to authenticated
using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'));

create policy if not exists reservations_admin_write
on public.reservations
for insert to authenticated
with check (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'));

create policy if not exists reservations_admin_update
on public.reservations
for update to authenticated
using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'))
with check (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'));

create policy if not exists reservations_admin_delete
on public.reservations
for delete to authenticated
using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'));

-- User policies (own records)
create policy if not exists reservations_user_read_own
on public.reservations
for select to authenticated
using (user_id = auth.uid());

create policy if not exists reservations_user_insert_own
on public.reservations
for insert to authenticated
with check (user_id = auth.uid());

create policy if not exists reservations_user_update_own
on public.reservations
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
