import { useStore, currentEvent } from "../data/store";
import { StatCard, BarChart } from "../components/Stats";
import { money } from "../lib/format";

export default function EventStats() {
  const event = useStore(currentEvent);
  const divisions = useStore((s) => s.divisions.filter((d) => d.eventId === event.id));
  const matches = useStore((s) => s.matches);

  const completed = matches.filter((m) => m.status === "complete");

  // Win methods — derived live from scored matches.
  const methods = ["submission", "points", "advantage", "decision"].map((k) => ({
    label: k[0].toUpperCase() + k.slice(1),
    value: completed.filter((m) => m.method === k).length,
  }));

  // Illustrative distributions for the demo dashboard.
  const byDivision = divisions.map((d, i) => ({ label: d.name.replace("Adult / ", ""), value: [32, 24, 41, 12][i] ?? 10 }));
  const byBelt = [
    { label: "White", value: 78 }, { label: "Blue", value: 64 },
    { label: "Purple", value: 38 }, { label: "Brown", value: 20 }, { label: "Black", value: 14 },
  ];
  const medals = [
    { label: "Iron Fortress", value: 12 }, { label: "Checkmat ATX", value: 9 },
    { label: "Gracie Barra", value: 7 }, { label: "Atos", value: 5 }, { label: "Alliance", value: 4 },
  ];

  const net = Math.round(event.revenueCents * 0.968) - 30 * event.entries;

  return (
    <div className="container">
      <h1>Event stats</h1>
      <p className="muted">{event.name} · {event.status}</p>

      <div className="grid cols-4" style={{ marginTop: 12 }}>
        <StatCard label="Entries" value={String(event.entries)} accent />
        <StatCard label="Gross revenue" value={money(event.revenueCents)} sub="entry fees" />
        <StatCard label="Net after fees" value={money(net)} sub="− Stripe 2.9% + 30¢" />
        <StatCard label="Matches done" value={String(completed.length)} sub="live-scored" />
      </div>

      <div className="grid cols-2" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="section-title" style={{ margin: "0 0 12px" }}>Registrations by division</div>
          <BarChart data={byDivision} />
        </div>
        <div className="card">
          <div className="section-title" style={{ margin: "0 0 12px" }}>Entries by belt</div>
          <BarChart data={byBelt} />
        </div>
        <div className="card">
          <div className="section-title" style={{ margin: "0 0 12px" }}>Win methods (scored so far)</div>
          <BarChart data={methods} />
        </div>
        <div className="card">
          <div className="section-title" style={{ margin: "0 0 12px" }}>Medals by team</div>
          <BarChart data={medals} />
        </div>
      </div>
    </div>
  );
}
