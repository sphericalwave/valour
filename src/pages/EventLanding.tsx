import { Link } from "react-router-dom";
import { useStore, currentEvent } from "../data/store";
import { Belt } from "../components/Belt";
import { money, shortDate } from "../lib/format";

export default function EventLanding() {
  const event = useStore(currentEvent);
  const divisions = useStore((s) => s.divisions.filter((d) => d.eventId === event.id));
  const regsByDiv = useStore((s) => s.registrations);

  const count = (divId: string) => regsByDiv.filter((r) => r.divisionId === divId).length;

  return (
    <div className="container">
      {/* Banner — palette comes from the event, so this reskins per tournament */}
      <div style={{
        borderRadius: "var(--radius)",
        overflow: "hidden",
        border: "1px solid var(--border)",
        background: `linear-gradient(135deg, ${event.palette.accent2} 0%, #0c0d10 55%, ${event.palette.accent} 160%)`,
      }}>
        <div style={{ padding: "48px 28px", backdropFilter: "brightness(0.9)" }}>
          <div className="row" style={{ gap: 10 }}>
            <span className="pill" style={{ background: "rgba(0,0,0,0.4)", borderColor: "transparent" }}>
              {event.gi ? "Gi" : "No-Gi"}
            </span>
            {event.status === "live" && <span className="pill live">Live now</span>}
            {event.status === "upcoming" && <span className="pill accent">Registration open</span>}
          </div>
          <div className="display" style={{ fontSize: "clamp(2.4rem, 8vw, 4.5rem)", marginTop: 12, textShadow: "0 4px 24px rgba(0,0,0,0.6)" }}>
            {event.bannerText}
          </div>
          <h1 style={{ fontWeight: 500, fontSize: "1.2rem", marginTop: 4 }}>{event.name}</h1>
          <div className="row wrap muted" style={{ gap: 18, marginTop: 8, fontSize: "0.95rem" }}>
            <span>📅 {shortDate(event.date)}</span>
            <span>📍 {event.venue}, {event.city}</span>
            <span>🏳️ {event.organizer}</span>
          </div>
        </div>
      </div>

      {/* Quick info tabs (static, mirrors Smoothcomp event surfaces) */}
      <div className="grid cols-4" style={{ marginTop: 20 }}>
        <Info label="Entries" value={String(event.entries)} />
        <Info label="Divisions" value={String(divisions.length)} />
        <Info label="Ruleset" value="IBJJF" />
        <Info label="Mats" value="2" />
      </div>

      <div className="section-title">Divisions</div>
      <div className="stack">
        {divisions.map((d) => (
          <div key={d.id} className="card row spread wrap" style={{ gap: 12 }}>
            <div className="row" style={{ gap: 12 }}>
              <Belt belt={d.belt} />
              <div>
                <div style={{ fontWeight: 700 }}>{d.name}</div>
                <div className="muted" style={{ fontSize: "0.82rem" }}>
                  {d.gender === "M" ? "Male" : "Female"} · {d.weightClass} · {count(d.id)} registered
                </div>
              </div>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <span className="pill accent">{money(d.feeCents)}</span>
              <Link className="btn sm" to={`/bracket/${d.id}`}>Bracket</Link>
              <Link className="btn sm primary" to={`/register/${d.id}`}>Register</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="card center">
      <div className="display" style={{ fontSize: "1.6rem", color: "var(--accent)" }}>{value}</div>
      <div className="muted" style={{ fontSize: "0.78rem", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}
