import { Link } from "react-router-dom";
import { useStore, currentEvent, staffOwedCents } from "../data/store";
import { StatCard } from "../components/Stats";
import { Belt } from "../components/Belt";
import { money } from "../lib/format";

export default function AdminHome() {
  const event = useStore(currentEvent);
  const divisions = useStore((s) => s.divisions.filter((d) => d.eventId === event.id));
  const liveCount = useStore((s) => s.matches.filter((m) => m.status === "live").length);
  const staff = useStore((s) => s.staff.filter((x) => x.eventId === event.id));

  const owed = staff.filter((s) => s.payStatus === "pending").reduce((a, s) => a + staffOwedCents(s), 0);

  return (
    <div className="container">
      <div className="row spread wrap">
        <div>
          <h1 style={{ margin: 0 }}>{event.name}</h1>
          <div className="muted">{event.venue} · {event.city}</div>
        </div>
        {event.status === "live" && <span className="pill live">Event live</span>}
      </div>

      <div className="grid cols-4" style={{ marginTop: 18 }}>
        <StatCard label="Entries" value={String(event.entries)} accent />
        <StatCard label="Revenue" value={money(event.revenueCents)} />
        <StatCard label="Live matches" value={String(liveCount)} sub="across all mats" />
        <StatCard label="Staff owed" value={money(owed)} sub={`${staff.length} staff`} />
      </div>

      <div className="row wrap" style={{ gap: 8, marginTop: 16 }}>
        <Link className="btn" to="/admin/stats">📊 Event stats</Link>
        <Link className="btn" to="/admin/staff">💵 Staff & payouts</Link>
        <Link className="btn" to="/admin/events">🗂️ All tournaments</Link>
        <Link className="btn ghost" to="/event">Public page ↗</Link>
      </div>

      <div className="section-title">Divisions & brackets</div>
      <div className="stack">
        {divisions.map((d) => (
          <div key={d.id} className="card row spread wrap" style={{ gap: 12 }}>
            <div className="row" style={{ gap: 12 }}>
              <Belt belt={d.belt} />
              <div>
                <div style={{ fontWeight: 700 }}>{d.name}</div>
                <div className="muted" style={{ fontSize: "0.82rem" }}>{d.weightClass} · {d.ruleset}</div>
              </div>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <Link className="btn sm" to={`/bracket/${d.id}`}>View</Link>
              <Link className="btn sm primary" to={`/admin/bracket/${d.id}`}>Edit bracket</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
