// Domain types. Mirror the Supabase Postgres schema in /supabase/schema.sql.

export type Role = "competitor" | "ref" | "admin" | "staff";

export type Belt = "white" | "blue" | "purple" | "brown" | "black";

export interface Palette {
  bg: string;
  surface: string;
  accent: string;
  accent2: string;
  text: string;
}

export interface EventInfo {
  id: string;
  name: string;
  date: string; // ISO
  venue: string;
  city: string;
  organizer: string;
  status: "upcoming" | "live" | "complete";
  gi: boolean;
  bannerText: string;
  palette: Palette;
  entries: number;
  revenueCents: number;
}

export interface Division {
  id: string;
  eventId: string;
  name: string;
  belt: Belt;
  ageGroup: string;
  gender: "M" | "F";
  weightClass: string;
  gi: boolean;
  ruleset: string;
  feeCents: number;
}

export interface Competitor {
  id: string;
  name: string;
  team: string;
  belt: Belt;
  weightKg: number;
}

export type PaymentStatus = "paid" | "pending";

export interface Registration {
  id: string;
  competitorId: string;
  divisionId: string;
  paymentStatus: PaymentStatus;
}

export type MatchStatus = "pending" | "live" | "complete";
export type WinMethod = "points" | "submission" | "advantage" | "decision" | "dq";

export interface Match {
  id: string;
  divisionId: string;
  round: number; // 0 = final, higher = earlier
  slot: number;
  competitorA: string | null;
  competitorB: string | null;
  winnerId: string | null;
  method: WinMethod | null;
  pointsA: number;
  pointsB: number;
  advA: number;
  advB: number;
  penA: number;
  penB: number;
  mat: number;
  status: MatchStatus;
}

export type StaffRole = "ref" | "table" | "medic" | "setup";
export type PayType = "per_event" | "per_hour" | "per_match";

export interface StaffMember {
  id: string;
  name: string;
  eventId: string;
  role: StaffRole;
  mat: number | null;
  payType: PayType;
  payRateCents: number;
  unitsWorked: number; // hours, matches, or 1 for per_event
  payStatus: PaymentStatus;
}
