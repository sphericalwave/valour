import { useSyncExternalStore } from "react";
import * as seed from "./seed";
import type { Match, StaffMember } from "./types";
import { hasSupabase, supabase } from "../lib/supabase";
import * as db from "../lib/db";

// In-memory store, seeded from ./seed. Mutations notify subscribers so the UI
// (brackets, scoreboard, payouts) updates live. When Supabase is configured the
// store bootstraps from Postgres, writes through on every mutation, and
// subscribes to realtime so edits sync across devices. Component code is
// identical either way — only this module's guts change.

interface State {
  events: typeof seed.events;
  divisions: typeof seed.divisions;
  competitors: typeof seed.competitors;
  registrations: typeof seed.registrations;
  matches: Match[];
  staff: StaffMember[];
  currentEventId: string;
  ready: boolean;
}

let state: State = {
  events: structuredClone(seed.events),
  divisions: structuredClone(seed.divisions),
  competitors: structuredClone(seed.competitors),
  registrations: structuredClone(seed.registrations),
  matches: structuredClone(seed.matches),
  staff: structuredClone(seed.staff),
  currentEventId: seed.events[0].id,
  // Local-only mode is ready immediately; Supabase mode flips ready after load.
  ready: !hasSupabase,
};

// Load from Supabase (or seed an empty project from the bundled data), then
// start realtime. No-op in local demo mode.
export async function bootstrap(): Promise<void> {
  if (!hasSupabase) return;
  try {
    const snap = await db.loadAll();
    if (snap && snap.events.length > 0) {
      state = {
        ...state,
        events: snap.events, divisions: snap.divisions, competitors: snap.competitors,
        registrations: snap.registrations, matches: snap.matches, staff: snap.staff,
        currentEventId: snap.events[0].id,
      };
    } else if (snap) {
      // Empty project — seed it from the bundled demo data (state already holds it).
      await db.seedAll({
        events: state.events, divisions: state.divisions, competitors: state.competitors,
        registrations: state.registrations, matches: state.matches, staff: state.staff,
      });
    }
    startRealtime();
  } catch (e) {
    console.error("bootstrap failed, falling back to local data:", e);
  } finally {
    state.ready = true;
    emit();
  }
}

let realtimeStarted = false;
function startRealtime() {
  if (!supabase || realtimeStarted) return;
  realtimeStarted = true;
  supabase
    .channel("valour-matches")
    .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, () => {
      void db.loadMatches().then((m) => {
        if (m) { state.matches = m; emit(); }
      });
    })
    .subscribe();
}

export function setCurrentEvent(eventId: string) {
  state.currentEventId = eventId;
  emit();
}
export function currentEvent() {
  return state.events.find((e) => e.id === state.currentEventId)!;
}

let cloneCounter = 1;
// Spin up the next tournament from an existing one as a template — event
// settings + divisions copied, entries/revenue reset.
export function cloneEvent(eventId: string): string {
  const src = state.events.find((e) => e.id === eventId);
  if (!src) return eventId;
  const newId = `ev-clone-${cloneCounter++}`;
  const newEvent = { ...src, id: newId, name: `${src.name} (copy)`, status: "upcoming" as const, entries: 0, revenueCents: 0 };
  state.events = [...state.events, newEvent];
  const newDivs = state.divisions
    .filter((d) => d.eventId === eventId)
    .map((d, i) => ({ ...d, id: `${newId}-div${i}`, eventId: newId }));
  state.divisions = [...state.divisions, ...newDivs];
  db.insertEventWithDivisions(newEvent, newDivs);
  emit();
  return newId;
}

const listeners = new Set<() => void>();
function emit() {
  state = { ...state };
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export const usesSupabase = hasSupabase;

export function useStore<T>(selector: (s: State) => T): T {
  // getSnapshot must return a STABLE reference between emits, or
  // useSyncExternalStore infinite-loops. So we snapshot the whole `state`
  // (its ref only changes on emit) and run the selector during render —
  // selectors returning fresh arrays (.filter/.map) are then harmless.
  const snapshot = useSyncExternalStore(subscribe, () => state, () => state);
  return selector(snapshot);
}

export function competitorName(id: string | null): string {
  if (!id) return "—";
  return state.competitors.find((c) => c.id === id)?.name ?? "TBD";
}
export function competitor(id: string | null) {
  return id ? state.competitors.find((c) => c.id === id) : undefined;
}

// --- Ref scoring -----------------------------------------------------------

type ScoreField = "pointsA" | "pointsB" | "advA" | "advB" | "penA" | "penB";

export function bumpScore(matchId: string, field: ScoreField, delta: number) {
  const m = state.matches.find((x) => x.id === matchId);
  if (!m) return;
  m[field] = Math.max(0, m[field] + delta);
  if (m.status === "pending") m.status = "live";
  db.saveMatches([m]);
  emit();
}

export function finishMatch(matchId: string, winnerId: string, method: Match["method"]) {
  const m = state.matches.find((x) => x.id === matchId);
  if (!m) return;
  m.winnerId = winnerId;
  m.method = method;
  m.status = "complete";
  const next = advanceWinner(m, winnerId);
  db.saveMatches(next ? [m, next] : [m]);
  emit();
}

// Standard single-elim advancement: winner of (round r, slot s) goes to
// (round r-1, slot ceil(s/2)); odd slot -> side A, even slot -> side B.
// Returns the match the winner advanced into, if any.
function advanceWinner(m: Match, winnerId: string): Match | null {
  if (m.round === 0) return null;
  const nextSlot = Math.ceil(m.slot / 2);
  const next = state.matches.find(
    (x) => x.divisionId === m.divisionId && x.round === m.round - 1 && x.slot === nextSlot,
  );
  if (!next) return null;
  if (m.slot % 2 === 1) next.competitorA = winnerId;
  else next.competitorB = winnerId;
  return next;
}

// --- Bracket generation ----------------------------------------------------

function nextPow2(n: number): number {
  let s = 1;
  while (s < n) s *= 2;
  return Math.max(2, s);
}

function blankMatch(divisionId: string, round: number, slot: number, mat: number): Match {
  return {
    id: `${divisionId}-r${round}-s${slot}`,
    divisionId, round, slot,
    competitorA: null, competitorB: null, winnerId: null, method: null,
    pointsA: 0, pointsB: 0, advA: 0, advB: 0, penA: 0, penB: 0,
    mat, status: "pending",
  };
}

// Build a single-elimination bracket from a division's registrations.
// Pads to the next power of two; solo first-round matches are byes that
// auto-advance. Overwrites any existing bracket for the division.
export function generateBracket(divisionId: string) {
  const entrants = state.registrations
    .filter((r) => r.divisionId === divisionId)
    .map((r) => r.competitorId);
  state.matches = state.matches.filter((m) => m.divisionId !== divisionId);
  if (entrants.length < 2) {
    emit();
    return;
  }

  const size = nextPow2(entrants.length);
  const firstRound = Math.log2(size) - 1;
  const fresh: Match[] = [];
  let mat = 0;
  for (let round = firstRound; round >= 0; round--) {
    for (let slot = 1; slot <= 2 ** round; slot++) {
      fresh.push(blankMatch(divisionId, round, slot, (mat++ % 2) + 1));
    }
  }

  const padded: (string | null)[] = [...entrants];
  while (padded.length < size) padded.push(null);

  const first = fresh.filter((m) => m.round === firstRound).sort((a, b) => a.slot - b.slot);
  first.forEach((m, i) => {
    m.competitorA = padded[i * 2] ?? null;
    m.competitorB = padded[i * 2 + 1] ?? null;
  });

  state.matches = [...state.matches, ...fresh];

  // Auto-advance byes (exactly one competitor present).
  first.forEach((m) => {
    const solo = m.competitorA && !m.competitorB ? m.competitorA
      : !m.competitorA && m.competitorB ? m.competitorB : null;
    if (solo) {
      m.status = "complete";
      m.winnerId = solo;
      advanceWinner(m, solo);
    }
  });

  db.deleteMatchesForDivision(divisionId);
  db.saveMatches(fresh);
  emit();
}

// --- Admin bracket edit ----------------------------------------------------

export function setSlot(matchId: string, side: "A" | "B", competitorId: string | null) {
  const m = state.matches.find((x) => x.id === matchId);
  if (!m) return;
  if (side === "A") m.competitorA = competitorId;
  else m.competitorB = competitorId;
  db.saveMatches([m]);
  emit();
}

// --- Payments --------------------------------------------------------------

export function markRegistrationPaid(registrationId: string) {
  const r = state.registrations.find((x) => x.id === registrationId);
  if (!r) return;
  r.paymentStatus = "paid";
  db.saveRegistration(r);
  emit();
}

export function payStaff(staffId: string) {
  const s = state.staff.find((x) => x.id === staffId);
  if (!s) return;
  s.payStatus = "paid";
  db.saveStaff([s]);
  emit();
}

export function payAllStaff(eventId: string) {
  const affected = state.staff.filter((s) => s.eventId === eventId);
  affected.forEach((s) => { s.payStatus = "paid"; });
  db.saveStaff(affected);
  emit();
}

export function staffOwedCents(s: StaffMember): number {
  return s.payRateCents * s.unitsWorked;
}
