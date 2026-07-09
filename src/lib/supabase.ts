import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// If both env vars are present the app talks to a real Supabase project;
// otherwise it runs on seeded in-browser data (default demo mode).
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const hasSupabase = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = hasSupabase
  ? createClient(url!, anonKey!)
  : null;
