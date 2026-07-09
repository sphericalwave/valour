import { useSyncExternalStore } from "react";
import * as seed from "./seed";
import type { Match, StaffMember } from "./types";
import { hasSupabase } from "../lib/supabase";

// In-memory store seeded from ./seed. Mutations notify subscribers so the UI
// (brackets, scoreboard, payouts) updates live. When Supabase env vars are set,
// `usesSupabase` is true and the same shapes would be backed by Postgres — the
// component code is identical; only this module's guts change.

interface State {
  events: typeof seed.events;
  divisions: typeof seed.divisions;
  competitors: typeof seed.competitors;
  registrations: typeof seed.registrations;
  matches: Match[];
  staff: StaffMember[];
  currentEventId: string;
}

let state: State = {
  events: structuredClone(seed.events),
  divisions: structuredClone(seed.divisions),
  competitors: structuredClone(seed.competitors),
  registrations: structuredClone(seed.registrations),
  matches: structuredClone(seed.matches),
  staff: structuredClone(seed.staff),
  currentEventId: seed.events[0].id,
};

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
  state.events = [
    ...state.events,
    { ...src, id: newId, name: `${src.name} (copy)`, status: "upcoming", entries: 0, revenueCents: 0 },
  ];
  const newDivs = state.divisions
    .filter((d) => d.eventId === eventId)
    .map((d, i) => ({ ...d, id: `${newId}-div${i}`, eventId: newId }));
  state.divisions = [...state.divisions, ...newDivs];
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
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
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
  emit();
}

export function finishMatch(matchId: string, winnerId: string, method: Match["method"]) {
  const m = state.matches.find((x) => x.id === matchId);
  if (!m) return;
  m.winnerId = winnerId;
  m.method = method;
  m.status = "complete";
  advanceWinner(m, winnerId);
  emit();
}

// Standard single-elim advancement: winner of (round r, slot s) goes to
// (round r-1, slot ceil(s/2)); odd slot -> side A, even slot -> side B.
function advanceWinner(m: Match, winnerId: string) {
  if (m.round === 0) return;
  const nextSlot = Math.ceil(m.slot / 2);
  const next = state.matches.find(
    (x) => x.divisionId === m.divisionId && x.round === m.round - 1 && x.slot === nextSlot,
  );
  if (!next) return;
  if (m.slot % 2 === 1) next.competitorA = winnerId;
  else next.competitorB = winnerId;
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

  emit();
}

// --- Admin bracket edit ----------------------------------------------------

export function setSlot(matchId: string, side: "A" | "B", competitorId: string | null) {
  const m = state.matches.find((x) => x.id === matchId);
  if (!m) return;
  if (side === "A") m.competitorA = competitorId;
  else m.competitorB = competitorId;
  emit();
}

// --- Payments --------------------------------------------------------------

export function markRegistrationPaid(registrationId: string) {
  const r = state.registrations.find((x) => x.id === registrationId);
  if (r) r.paymentStatus = "paid";
  emit();
}

export function payStaff(staffId: string) {
  const s = state.staff.find((x) => x.id === staffId);
  if (s) s.payStatus = "paid";
  emit();
}

export function payAllStaff(eventId: string) {
  state.staff.forEach((s) => {
    if (s.eventId === eventId) s.payStatus = "paid";
  });
  emit();
}

export function staffOwedCents(s: StaffMember): number {
  return s.payRateCents * s.unitsWorked;
}
