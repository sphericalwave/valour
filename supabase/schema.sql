-- Valour — Supabase/Postgres schema (demo).
-- Idempotent: safe to re-run; drops and recreates the demo tables.
-- IDs are text so they line up 1:1 with the app's seed IDs (c1, ev-…, div-…)
-- — no UUID remapping needed. RLS is left OFF so the passwordless demo's anon
-- browser client can read AND write. Enable RLS + policies before production.

drop table if exists payouts cascade;
drop table if exists staff_shifts cascade;
drop table if exists staff cascade;
drop table if exists match_events cascade;
drop table if exists matches cascade;
drop table if exists brackets cascade;
drop table if exists registrations cascade;
drop table if exists competitors cascade;
drop table if exists divisions cascade;
drop table if exists events cascade;

create table events (
  id text primary key,
  name text not null,
  date date not null,
  venue text,
  city text,
  organizer text,
  gi boolean not null default true,
  status text not null default 'upcoming',
  banner_text text,
  palette jsonb not null default '{}',
  entries int not null default 0,
  revenue_cents int not null default 0
);

create table divisions (
  id text primary key,
  event_id text references events(id) on delete cascade,
  name text not null,
  belt text not null,
  age_group text,
  gender char(1),
  weight_class text,
  gi boolean not null default true,
  ruleset text default 'IBJJF',
  fee_cents int not null default 0
);

create table competitors (
  id text primary key,
  name text not null,
  team text,
  belt text not null,
  weight_kg numeric
);

create table registrations (
  id text primary key,
  competitor_id text references competitors(id) on delete cascade,
  division_id text references divisions(id) on delete cascade,
  payment_status text not null default 'pending'
);

create table matches (
  id text primary key,
  division_id text references divisions(id) on delete cascade,
  round int not null,
  slot int not null,
  competitor_a text,
  competitor_b text,
  winner_id text,
  method text,
  points_a int not null default 0,
  points_b int not null default 0,
  adv_a int not null default 0,
  adv_b int not null default 0,
  pen_a int not null default 0,
  pen_b int not null default 0,
  mat int,
  status text not null default 'pending'
);

create table staff (
  id text primary key,
  event_id text references events(id) on delete cascade,
  name text not null,
  role text not null,
  mat int,
  pay_type text not null,
  pay_rate_cents int not null,
  units_worked int not null default 0,
  pay_status text not null default 'pending'
);

-- Ref scoring log — kept for the production path (not synced by the demo UI yet).
create table match_events (
  id text primary key,
  match_id text references matches(id) on delete cascade,
  competitor_id text,
  type text not null,
  created_at timestamptz not null default now()
);

-- Let the anon/authenticated roles read+write (RLS is off for the demo).
grant all on all tables in schema public to anon, authenticated;

-- Broadcast row changes so live brackets update across devices.
alter publication supabase_realtime add table matches;
