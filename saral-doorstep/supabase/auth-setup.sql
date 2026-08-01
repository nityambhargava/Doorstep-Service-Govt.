-- Authentication -> Users (3 agents + 1 admin) and copying their UUIDs.
-- Replace the placeholder UUIDs below with the real ones before running.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('agent', 'admin')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles_select_own"
on profiles for select
using (auth.uid() = id);

-- Replace these UUIDs with the real ones from Authentication -> Users
insert into profiles (id, full_name, role) values
  ('00000000-0000-0000-0000-000000000001', 'Rohit Kumar', 'agent'),
  ('00000000-0000-0000-0000-000000000002', 'Priya Sharma', 'agent'),
  ('00000000-0000-0000-0000-000000000003', 'Amit Yadav', 'agent'),
  ('00000000-0000-0000-0000-000000000004', 'Admin User', 'admin')
on conflict (id) do nothing;

-- Replace the old permissive policy (from seed.sql) with real,
-- role-based access.
drop policy if exists "dev_allow_all" on bookings;

create policy "bookings_admin_select"
on bookings for select
using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "bookings_own_agent_select"
on bookings for select
using (agent = (select full_name from profiles where id = auth.uid()));

create policy "bookings_admin_update"
on bookings for update
using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "bookings_own_agent_update"
on bookings for update
using (agent = (select full_name from profiles where id = auth.uid()))
with check (agent = (select full_name from profiles where id = auth.uid()));