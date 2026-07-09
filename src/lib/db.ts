import { supabase } from "./supabase";
import type {
  Competitor, Division, EventInfo, Match, Registration, StaffMember,
  Belt, PaymentStatus, MatchStatus, WinMethod, StaffRole, PayType, Palette,
} from "../data/types";

// Row <-> domain mappers. DB is snake_case; the app is camelCase. IDs are text
// and identical on both sides, so relationships need no remapping.

const toMatch = (r: any): Match => ({
  id: r.id, divisionId: r.division_id, round: r.round, slot: r.slot,
  competitorA: r.competitor_a, competitorB: r.competitor_b, winnerId: r.winner_id,
  method: r.method as WinMethod | null,
  pointsA: r.points_a, pointsB: r.points_b, advA: r.adv_a, advB: r.adv_b,
  penA: r.pen_a, penB: r.pen_b, mat: r.mat, status: r.status as MatchStatus,
});
const fromMatch = (m: Match) => ({
  id: m.id, division_id: m.divisionId, round: m.round, slot: m.slot,
  competitor_a: m.competitorA, competitor_b: m.competitorB, winner_id: m.winnerId,
  method: m.method, points_a: m.pointsA, points_b: m.pointsB,
  adv_a: m.advA, adv_b: m.advB, pen_a: m.penA, pen_b: m.penB,
  mat: m.mat, status: m.status,
});

const toEvent = (r: any): EventInfo => ({
  id: r.id, name: r.name, date: r.date, venue: r.venue, city: r.city,
  organizer: r.organizer, status: r.status, gi: r.gi, bannerText: r.banner_text,
  palette: r.palette as Palette, entries: r.entries, revenueCents: r.revenue_cents,
});
const fromEvent = (e: EventInfo) => ({
  id: e.id, name: e.name, date: e.date, venue: e.venue, city: e.city,
  organizer: e.organizer, gi: e.gi, status: e.status, banner_text: e.bannerText,
  palette: e.palette, entries: e.entries, revenue_cents: e.revenueCents,
});

const toDivision = (r: any): Division => ({
  id: r.id, eventId: r.event_id, name: r.name, belt: r.belt as Belt,
  ageGroup: r.age_group, gender: r.gender, weightClass: r.weight_class,
  gi: r.gi, ruleset: r.ruleset, feeCents: r.fee_cents,
});
const fromDivision = (d: Division) => ({
  id: d.id, event_id: d.eventId, name: d.name, belt: d.belt, age_group: d.ageGroup,
  gender: d.gender, weight_class: d.weightClass, gi: d.gi, ruleset: d.ruleset, fee_cents: d.feeCents,
});

const toCompetitor = (r: any): Competitor => ({
  id: r.id, name: r.name, team: r.team, belt: r.belt as Belt, weightKg: r.weight_kg,
});
const fromCompetitor = (c: Competitor) => ({
  id: c.id, name: c.name, team: c.team, belt: c.belt, weight_kg: c.weightKg,
});

const toRegistration = (r: any): Registration => ({
  id: r.id, competitorId: r.competitor_id, divisionId: r.division_id,
  paymentStatus: r.payment_status as PaymentStatus,
});
const fromRegistration = (r: Registration) => ({
  id: r.id, competitor_id: r.competitorId, division_id: r.divisionId, payment_status: r.paymentStatus,
});

const toStaff = (r: any): StaffMember => ({
  id: r.id, name: r.name, eventId: r.event_id, role: r.role as StaffRole,
  mat: r.mat, payType: r.pay_type as PayType, payRateCents: r.pay_rate_cents,
  unitsWorked: r.units_worked, payStatus: r.pay_status as PaymentStatus,
});
const fromStaff = (s: StaffMember) => ({
  id: s.id, event_id: s.eventId, name: s.name, role: s.role, mat: s.mat,
  pay_type: s.payType, pay_rate_cents: s.payRateCents, units_worked: s.unitsWorked, pay_status: s.payStatus,
});

export interface Snapshot {
  events: EventInfo[];
  divisions: Division[];
  competitors: Competitor[];
  registrations: Registration[];
  matches: Match[];
  staff: StaffMember[];
}

// Read the whole dataset. Returns null if Supabase isn't configured.
export async function loadAll(): Promise<Snapshot | null> {
  if (!supabase) return null;
  const [ev, dv, co, rg, ma, st] = await Promise.all([
    supabase.from("events").select("*"),
    supabase.from("divisions").select("*"),
    supabase.from("competitors").select("*"),
    supabase.from("registrations").select("*"),
    supabase.from("matches").select("*"),
    supabase.from("staff").select("*"),
  ]);
  const err = ev.error || dv.error || co.error || rg.error || ma.error || st.error;
  if (err) {
    console.error("Supabase load failed:", err.message);
    return null;
  }
  return {
    events: (ev.data ?? []).map(toEvent),
    divisions: (dv.data ?? []).map(toDivision),
    competitors: (co.data ?? []).map(toCompetitor),
    registrations: (rg.data ?? []).map(toRegistration),
    matches: (ma.data ?? []).map(toMatch),
    staff: (st.data ?? []).map(toStaff),
  };
}

// Just the matches (used by the realtime refresh path).
export async function loadMatches(): Promise<Match[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("matches").select("*");
  if (error || !data) return null;
  return data.map(toMatch);
}

// First-run seed: push the bundled demo dataset into an empty project.
// Upsert (not insert) so simultaneous first-loaders don't collide.
export async function seedAll(s: Snapshot): Promise<void> {
  if (!supabase) return;
  await supabase.from("events").upsert(s.events.map(fromEvent));
  await supabase.from("divisions").upsert(s.divisions.map(fromDivision));
  await supabase.from("competitors").upsert(s.competitors.map(fromCompetitor));
  await supabase.from("registrations").upsert(s.registrations.map(fromRegistration));
  await supabase.from("matches").upsert(s.matches.map(fromMatch));
  await supabase.from("staff").upsert(s.staff.map(fromStaff));
}

// --- Write-through helpers (fire-and-forget from the store) ----------------

export function saveMatches(matches: Match[]): void {
  if (!supabase || matches.length === 0) return;
  void supabase.from("matches").upsert(matches.map(fromMatch)).then(({ error }) => {
    if (error) console.error("saveMatches:", error.message);
  });
}

export function deleteMatchesForDivision(divisionId: string): void {
  if (!supabase) return;
  void supabase.from("matches").delete().eq("division_id", divisionId);
}

export function saveRegistration(r: Registration): void {
  if (!supabase) return;
  void supabase.from("registrations").upsert(fromRegistration(r));
}

export function saveStaff(list: StaffMember[]): void {
  if (!supabase || list.length === 0) return;
  void supabase.from("staff").upsert(list.map(fromStaff));
}

export function insertEventWithDivisions(event: EventInfo, divisions: Division[]): void {
  if (!supabase) return;
  void supabase.from("events").insert(fromEvent(event)).then(() => {
    if (divisions.length) void supabase!.from("divisions").insert(divisions.map(fromDivision));
  });
}
