-- Minimal seed to mirror the in-browser demo data. Run after schema.sql.
-- (The app ships with the same data client-side; this is for the Supabase path.)

insert into org (id, name) values
  ('00000000-0000-0000-0000-000000000001', 'Valour BJJ');

insert into events (org_id, name, date, venue, city, gi, status, banner_text, palette) values
  ('00000000-0000-0000-0000-000000000001', 'Valour Open — Winter Championship', '2026-02-14',
   'Iron Fortress Arena', 'Austin, TX', true, 'live', 'VALOUR OPEN',
   '{"accent":"#e4b53d","accent2":"#c0392b"}');

-- Add divisions, competitors, matches, staff as needed. See src/data/seed.ts
-- for the full demo dataset (names, brackets, scores) to replicate here.
