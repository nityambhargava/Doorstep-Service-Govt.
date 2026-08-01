-- for a fresh project. It creates the bookings table, enables Row Level
-- Security with a permissive dev-only policy, and seeds the same demo
-- rows we were using as hardcoded mock data before.

create table if not exists bookings (
  id text primary key,
  citizen text not null,
  service text not null,
  area text not null,
  slot text not null,
  agent text,
  status text not null default 'scheduled',
  checklist jsonb not null default '{"idProof": false, "form": false, "photo": false}'::jsonb,
  signature text,
  created_at timestamptz not null default now()
);

alter table bookings enable row level security;

-- DEV ONLY: allows the public anon key full read/write access.
-- This MUST be replaced with real policies once auth is added in the
-- next phase (e.g. agents can only update their own assigned bookings,
-- only admins can verify/submit).
create policy "dev_allow_all"
on bookings
for all
using (true)
with check (true);

insert into bookings (id, citizen, service, area, slot, agent, status, checklist, signature) values
  ('B-101', 'Sunita Devi',   'Income Certificate',   'Sector 14, Gurugram', '9:30 AM',  'Rohit Kumar', 'scheduled',   '{"idProof": false, "form": false, "photo": false}', null),
  ('B-102', 'Mahesh Chand',  'Domicile Certificate', 'Sector 45, Gurugram', '10:00 AM', 'Priya Sharma', 'in_progress', '{"idProof": true, "form": true, "photo": false}', null),
  ('B-103', 'Kavita Yadav',  'Income Certificate',   'Sector 9, Gurugram',  '10:30 AM', 'Amit Yadav',  'completed',   '{"idProof": true, "form": true, "photo": true}', 'captured'),
  ('B-104', 'Ramesh Kumar',  'Caste Certificate',    'Sector 23, Gurugram', '11:15 AM', 'Rohit Kumar', 'in_progress', '{"idProof": true, "form": false, "photo": false}', null),
  ('B-105', 'Anita Sharma',  'Income Certificate',   'Sector 56, Gurugram', '12:00 PM', 'Priya Sharma', 'completed',   '{"idProof": true, "form": true, "photo": true}', 'captured'),
  ('B-106', 'Suresh Pal',    'Domicile Certificate', 'Sector 4, Gurugram',  '12:45 PM', 'Amit Yadav',  'verified',    '{"idProof": true, "form": true, "photo": true}', 'captured'),
  ('B-107', 'Geeta Devi',    'Income Certificate',   'Sector 31, Gurugram', '1:30 PM',  'Rohit Kumar', 'scheduled',   '{"idProof": false, "form": false, "photo": false}', null),
  ('B-108', 'Vinod Saini',   'Caste Certificate',    'Sector 17, Gurugram', '2:15 PM',  'Amit Yadav',  'submitted',   '{"idProof": true, "form": true, "photo": true}', 'captured'),
  ('B-109', 'Deepak Verma',  'Income Certificate',   'Sector 50, Gurugram', '3:00 PM',  null,          'scheduled',   '{"idProof": false, "form": false, "photo": false}', null)
on conflict (id) do nothing;