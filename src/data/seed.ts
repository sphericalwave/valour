import type {
  Belt,
  Competitor,
  Division,
  EventInfo,
  Match,
  Registration,
  StaffMember,
} from "./types";

// Belt-inspired combat palettes. Swap `palette` per event to re-theme instantly.
const combat = {
  bg: "#0c0d10",
  surface: "#16181d",
  accent: "#e4b53d", // gold
  accent2: "#c0392b", // blood red
  text: "#f2f3f5",
};

export const events: EventInfo[] = [
  {
    id: "ev-valour-open",
    name: "Valour Open — Winter Championship",
    date: "2026-02-14",
    venue: "Iron Fortress Arena",
    city: "Austin, TX",
    organizer: "Valour BJJ",
    status: "live",
    gi: true,
    bannerText: "VALOUR OPEN",
    palette: combat,
    entries: 214,
    revenueCents: 1712000,
  },
  {
    id: "ev-nogi-clash",
    name: "No-Gi Clash III",
    date: "2026-04-11",
    venue: "Iron Fortress Arena",
    city: "Austin, TX",
    organizer: "Valour BJJ",
    status: "upcoming",
    gi: false,
    bannerText: "NO-GI CLASH",
    palette: { ...combat, accent: "#3da5e4", accent2: "#8e44ad" },
    entries: 96,
    revenueCents: 768000,
  },
  {
    id: "ev-kids-cup",
    name: "Valour Kids Cup",
    date: "2025-11-22",
    venue: "Southside Dojo",
    city: "Austin, TX",
    organizer: "Valour BJJ",
    status: "complete",
    gi: true,
    bannerText: "KIDS CUP",
    palette: { ...combat, accent: "#2ecc71", accent2: "#e67e22" },
    entries: 132,
    revenueCents: 858000,
  },
];

export const divisions: Division[] = [
  {
    id: "div-blue-mid",
    eventId: "ev-valour-open",
    name: "Adult / Blue / Middle",
    belt: "blue",
    ageGroup: "Adult",
    gender: "M",
    weightClass: "82.3 kg",
    gi: true,
    ruleset: "IBJJF",
    feeCents: 8500,
  },
  {
    id: "div-purple-light",
    eventId: "ev-valour-open",
    name: "Adult / Purple / Light",
    belt: "purple",
    ageGroup: "Adult",
    gender: "M",
    weightClass: "76.0 kg",
    gi: true,
    ruleset: "IBJJF",
    feeCents: 8500,
  },
  {
    id: "div-white-fea",
    eventId: "ev-valour-open",
    name: "Adult / White / Feather",
    belt: "white",
    ageGroup: "Adult",
    gender: "M",
    weightClass: "70.0 kg",
    gi: true,
    ruleset: "IBJJF",
    feeCents: 7500,
  },
  {
    id: "div-women-blue",
    eventId: "ev-valour-open",
    name: "Adult / Blue / Feather (Women)",
    belt: "blue",
    ageGroup: "Adult",
    gender: "F",
    weightClass: "58.5 kg",
    gi: true,
    ruleset: "IBJJF",
    feeCents: 8500,
  },
];

// Competitors for the featured 8-person bracket (div-blue-mid).
export const competitors: Competitor[] = [
  { id: "c1", name: "Diego Ramos", team: "Iron Fortress", belt: "blue", weightKg: 81 },
  { id: "c2", name: "Marcus Lee", team: "Southside Dojo", belt: "blue", weightKg: 82 },
  { id: "c3", name: "Tomas Vidal", team: "Checkmat ATX", belt: "blue", weightKg: 80 },
  { id: "c4", name: "Jordan Pike", team: "Gracie Barra", belt: "blue", weightKg: 82 },
  { id: "c5", name: "Andre Costa", team: "Alliance", belt: "blue", weightKg: 81 },
  { id: "c6", name: "Sam Whitaker", team: "Iron Fortress", belt: "blue", weightKg: 80 },
  { id: "c7", name: "Kenji Watanabe", team: "10th Planet", belt: "blue", weightKg: 82 },
  { id: "c8", name: "Luis Ferreira", team: "Atos", belt: "blue", weightKg: 81 },
];

// You (the logged-in competitor) — registered in div-blue-mid as c1.
export const meCompetitorId = "c1";

// Single-elimination bracket for div-blue-mid.
// round 2 = quarterfinals (4 matches), round 1 = semis (2), round 0 = final.
export const matches: Match[] = [
  // Quarterfinals — all complete
  qf("m-qf1", "c1", "c2", "c1", "submission", { pointsA: 0, pointsB: 0 }, 1, "complete"),
  qf("m-qf2", "c3", "c4", "c3", "points", { pointsA: 6, pointsB: 2 }, 2, "complete"),
  qf("m-qf3", "c5", "c6", "c6", "advantage", { pointsA: 2, pointsB: 2, advA: 0, advB: 1 }, 1, "complete"),
  qf("m-qf4", "c7", "c8", "c7", "points", { pointsA: 11, pointsB: 0 }, 2, "complete"),
  // Semifinals — one LIVE, one pending
  {
    id: "m-sf1",
    divisionId: "div-blue-mid",
    round: 1,
    slot: 1,
    competitorA: "c1",
    competitorB: "c3",
    winnerId: null,
    method: null,
    pointsA: 4,
    pointsB: 2,
    advA: 1,
    advB: 0,
    penA: 0,
    penB: 1,
    mat: 1,
    status: "live",
  },
  {
    id: "m-sf2",
    divisionId: "div-blue-mid",
    round: 1,
    slot: 2,
    competitorA: "c6",
    competitorB: "c7",
    winnerId: null,
    method: null,
    pointsA: 0,
    pointsB: 0,
    advA: 0,
    advB: 0,
    penA: 0,
    penB: 0,
    mat: 2,
    status: "pending",
  },
  // Final — waiting on semis
  {
    id: "m-final",
    divisionId: "div-blue-mid",
    round: 0,
    slot: 1,
    competitorA: null,
    competitorB: null,
    winnerId: null,
    method: null,
    pointsA: 0,
    pointsB: 0,
    advA: 0,
    advB: 0,
    penA: 0,
    penB: 0,
    mat: 1,
    status: "pending",
  },
];

function qf(
  id: string,
  a: string,
  b: string,
  winner: string,
  method: Match["method"],
  score: Partial<Pick<Match, "pointsA" | "pointsB" | "advA" | "advB">>,
  mat: number,
  status: Match["status"],
): Match {
  return {
    id,
    divisionId: "div-blue-mid",
    round: 2,
    slot: Number(id.slice(-1)),
    competitorA: a,
    competitorB: b,
    winnerId: winner,
    method,
    pointsA: score.pointsA ?? 0,
    pointsB: score.pointsB ?? 0,
    advA: score.advA ?? 0,
    advB: score.advB ?? 0,
    penA: 0,
    penB: 0,
    mat,
    status,
  };
}

export const registrations: Registration[] = [
  { id: "r1", competitorId: "c1", divisionId: "div-blue-mid", paymentStatus: "paid" },
  { id: "r2", competitorId: "c2", divisionId: "div-blue-mid", paymentStatus: "paid" },
  { id: "r3", competitorId: "c1", divisionId: "div-purple-light", paymentStatus: "pending" },
];

// Entrant pools for the other divisions so an admin can seed a real bracket.
// (7 in white/feather → exercises a bye; 4 in the women's division → clean 4-man.)
const pools: { divisionId: string; belt: Belt; weight: number; roster: [string, string][] }[] = [
  {
    divisionId: "div-purple-light",
    belt: "purple",
    weight: 75,
    roster: [
      ["Nate Boyd", "Gracie Barra"], ["Favio Nunes", "Atos"], ["Cole Prince", "Alliance"],
      ["Yuki Tanaka", "10th Planet"], ["Rob Deacon", "Checkmat ATX"], ["Ivan Petrov", "Iron Fortress"],
    ],
  },
  {
    divisionId: "div-white-fea",
    belt: "white",
    weight: 69,
    roster: [
      ["Chris Hale", "Iron Fortress"], ["Danny Ortiz", "Southside Dojo"], ["Owen Blake", "Gracie Barra"],
      ["Priyansh Rao", "Atos"], ["Mateo Silva", "Alliance"], ["Jon Weir", "Checkmat ATX"],
      ["Kwame Osei", "10th Planet"],
    ],
  },
  {
    divisionId: "div-women-blue",
    belt: "blue",
    weight: 58,
    roster: [
      ["Ana Reyes", "Iron Fortress"], ["Mei Lin", "Atos"], ["Sofia Castro", "Gracie Barra"],
      ["Hana Novak", "Alliance"],
    ],
  },
];

let poolCid = 100;
for (const p of pools) {
  for (const [name, team] of p.roster) {
    const id = `c${poolCid++}`;
    competitors.push({ id, name, team, belt: p.belt, weightKg: p.weight });
    registrations.push({ id: `r-${id}`, competitorId: id, divisionId: p.divisionId, paymentStatus: "paid" });
  }
}

export const staff: StaffMember[] = [
  { id: "s1", name: "Bianca Alves", eventId: "ev-valour-open", role: "ref", mat: 1, payType: "per_match", payRateCents: 1500, unitsWorked: 18, payStatus: "pending" },
  { id: "s2", name: "Rafael Souza", eventId: "ev-valour-open", role: "ref", mat: 2, payType: "per_match", payRateCents: 1500, unitsWorked: 21, payStatus: "pending" },
  { id: "s3", name: "Priya Nair", eventId: "ev-valour-open", role: "table", mat: 1, payType: "per_hour", payRateCents: 2200, unitsWorked: 6, payStatus: "pending" },
  { id: "s4", name: "Devon Clark", eventId: "ev-valour-open", role: "medic", mat: null, payType: "per_event", payRateCents: 20000, unitsWorked: 1, payStatus: "paid" },
  { id: "s5", name: "Elena Petrova", eventId: "ev-valour-open", role: "setup", mat: null, payType: "per_hour", payRateCents: 1800, unitsWorked: 8, payStatus: "pending" },
];

// The signed-in identities for each passwordless demo role.
export const demoIdentities = {
  competitor: { name: "Diego Ramos", detail: "Blue belt · Iron Fortress" },
  ref: { name: "Bianca Alves", detail: "Referee · Mat 1", staffId: "s1" },
  admin: { name: "Coach Alvarez", detail: "Organizer · Valour BJJ" },
  staff: { name: "Priya Nair", detail: "Table staff · Mat 1", staffId: "s3" },
};
