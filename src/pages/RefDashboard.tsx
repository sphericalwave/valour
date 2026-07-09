import { Link } from "react-router-dom";
import { useStore, competitorName } from "../data/store";

const MY_MAT = 1;

export default function RefDashboard() {
  const matches = useStore((s) => s.matches.filter((m) => m.mat === MY_MAT));
  const queue = matches.filter((m) => m.status !== "complete");
  const done = matches.filter((m) => m.status === "complete");

  return (
    <div className="container">
      <h1>Mat {MY_MAT}</h1>
      <p className="muted">Referee: Bianca Alves · tap a match to open the scoreboard.</p>

      <div className="section-title">Queue</div>
      <div className="stack">
        {queue.length === 0 && <div className="card muted">Mat clear — no matches queued.</div>}
        {queue.map((m) => (
          <Link key={m.id} to={`/ref/mat/${m.id}`} className="card row spread wrap"
            style={{ gap: 12, borderColor: m.status === "live" ? "var(--live)" : "var(--border)" }}>
            <div className="display" style={{ fontSize: "1.1rem" }}>
              {competitorName(m.competitorA)} <span className="muted">vs</span> {competitorName(m.competitorB)}
            </div>
            <div className="row" style={{ gap: 8 }}>
              {m.status === "live"
                ? <span className="pill live">Live</span>
                : <span className="pill pending">Ready</span>}
              <span className="btn sm primary">Score →</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="section-title">Completed</div>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <tbody>
            {done.map((m) => (
              <tr key={m.id}>
                <td>{competitorName(m.competitorA)} vs {competitorName(m.competitorB)}</td>
                <td style={{ color: "var(--accent)", fontWeight: 700 }}>def. {competitorName(m.winnerId)}</td>
                <td className="muted" style={{ textTransform: "uppercase", fontSize: "0.75rem" }}>{m.method}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
