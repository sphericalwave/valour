import { Link } from "react-router-dom";
import { useStore, competitorName, competitor } from "../data/store";
import { meCompetitorId } from "../data/seed";
import { Belt } from "../components/Belt";
import { money } from "../lib/format";

export default function CompetitorDashboard() {
  const me = competitor(meCompetitorId)!;
  const regs = useStore((s) => s.registrations.filter((r) => r.competitorId === meCompetitorId));
  const divisions = useStore((s) => s.divisions);
  const myMatch = useStore((s) =>
    s.matches.find((m) => (m.competitorA === meCompetitorId || m.competitorB === meCompetitorId)
      && m.status !== "complete"));

  const divOf = (id: string) => divisions.find((d) => d.id === id);

  return (
    <div className="container">
      <div className="row spread wrap">
        <div className="row" style={{ gap: 12 }}>
          <div style={{ fontSize: "2rem" }}>🥋</div>
          <div>
            <h1 style={{ margin: 0 }}>{me.name}</h1>
            <div className="muted row" style={{ gap: 8 }}><Belt belt={me.belt} label /> · {me.team} · {me.weightKg} kg</div>
          </div>
        </div>
      </div>

      {myMatch && (
        <div className="card pad-lg" style={{ marginTop: 20, borderColor: "var(--accent)" }}>
          <div className="section-title" style={{ margin: 0 }}>Your next match</div>
          <div className="row spread wrap" style={{ marginTop: 8 }}>
            <div>
              <div className="display" style={{ fontSize: "1.4rem" }}>
                {competitorName(myMatch.competitorA)} <span className="muted">vs</span> {competitorName(myMatch.competitorB)}
              </div>
              <div className="muted">{divOf(myMatch.divisionId)?.name} · Mat {myMatch.mat}</div>
            </div>
            {myMatch.status === "live"
              ? <span className="pill live">On the mat now</span>
              : <span className="pill pending">Up next</span>}
          </div>
        </div>
      )}

      <div className="section-title">My registrations</div>
      <div className="stack">
        {regs.map((r) => {
          const d = divOf(r.divisionId)!;
          return (
            <div key={r.id} className="card row spread wrap" style={{ gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700 }}>{d.name}</div>
                <div className="muted" style={{ fontSize: "0.82rem" }}>{d.weightClass} · {money(d.feeCents)}</div>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <span className={`pill ${r.paymentStatus}`}>{r.paymentStatus}</span>
                {r.paymentStatus === "pending"
                  ? <Link className="btn sm primary" to={`/register/${d.id}`}>Pay now</Link>
                  : <Link className="btn sm" to={`/bracket/${d.id}`}>My bracket</Link>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
