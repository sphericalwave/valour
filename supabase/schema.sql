-- Valour — Supabase/Postgres schema.
-- Run in the Supabase SQL editor to back the app with a real database.
-- The app auto-switches to Supabase when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set.

create type role as enum ('competitor', 'ref', 'admin', 'staff');
create type belt as enum ('white', 'blue', 'purple', 'brown', 'black');
create type payment_status as enum ('paid', 'pending');
create type match_status as enum ('pending', 'live', 'complete');
create type win_method as enum ('points', 'submission', 'advantage', 'decision', 'dq');
create type staff_role as enum ('ref', 'table', 'medic', 'setup');
create type pay_type as enum ('per_event', 'per_hour', 'per_match');

create table org (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  stripe_account_id text
);

create table events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references org(id) on delete cascade,
  name text not null,
  date date not null,
  venue text,
  city text,
  gi boolean not null default true,
  status text not null default 'upcoming',
  banner_text text,
  palette jsonb not null default '{}',
  banner_url text
);

create table divisions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  name text not null,
  belt belt not null,
  age_group text,
  gender char(1),
  weight_class text,
  gi boolean not null default true,
  ruleset text default 'IBJJF',
  fee_cents int not null default 0
);

create table competitors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  name text not null,
  team text,
  belt belt not null,
  weight_kg numeric
);

create table registrations (
  id uuid primary key default gen_random_uuid(),
  competitor_id uuid references competitors(id) on delete cascade,
  division_id uuid references divisions(id) on delete cascade,
  payment_status payment_status not null default 'pending',
  stripe_session_id text
);

create table brackets (
  id uuid primary key default gen_random_uuid(),
  division_id uuid references divisions(id) on delete cascade,
  type text not null default 'single_elim',
  status text not null default 'pending'
);

create table matches (
  id uuid primary key default gen_random_uuid(),
  division_id uuid references divisions(id) on delete cascade,
  round int not null,
  slot int not null,
  competitor_a uuid references competitors(id),
  competitor_b uuid references competitors(id),
  winner_id uuid references competitors(id),
  method win_method,
  points_a int not null default 0,
  points_b int not null default 0,
  adv_a int not null default 0,
  adv_b int not null default 0,
  pen_a int not null default 0,
  pen_b int not null default 0,
  mat int,
  status match_status not null default 'pending'
);

-- Ref scoring log — every point/advantage/penalty a referee awards.
create table match_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete cascade,
  competitor_id uuid references competitors(id),
  type text not null,
  created_at timestamptz not null default now()
);

create table staff (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  event_id uuid references events(id) on delete cascade,
  name text not null,
  role staff_role not null,
  mat int,
  pay_type pay_type not null,
  pay_rate_cents int not null,
  pay_status payment_status not null default 'pending'
);

create table staff_shifts (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references staff(id) on delete cascade,
  mat int,
  check_in timestamptz,
  check_out timestamptz,
  matches_worked int not null default 0
);

create table payouts (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references staff(id) on delete cascade,
  event_id uuid references events(id) on delete cascade,
  amount_cents int not null,
  status payment_status not null default 'pending',
  stripe_transfer_id text
);

-- Enable RLS and add policies before going live. Sketch:
--   * public read on events, divisions, brackets, matches (spectators see brackets)
--   * competitors read/write their own registrations
--   * staff read their own staff/shift/payout rows
--   * admins (org members) full write within their org's events
-- alter table matches enable row level security;  -- etc.
