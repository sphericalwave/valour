import { Link, useParams } from "react-router-dom";
import { useStore, finishMatch, generateBracket } from "../data/store";
import Bracket from "../components/Bracket";

export default function AdminBracket() {
  const { divisionId } = useParams();
  const division = useStore((s) => s.divisions.find((d) => d.id === divisionId));
  const hasMatches = useStore((s) => s.matches.some((m) => m.divisionId === divisionId));
  const entrantCount = useStore((s) => s.registrations.filter((r) => r.divisionId === divisionId).length);
  const liveMatch = useStore((s) => s.matches.find((m) => m.divisionId === divisionId && m.status === "live"));

  if (!division) return <div className="container">Division not found.</div>;

  return (
    <div className="container">
      <div className="row spread wrap">
        <div>
          <div className="muted" style={{ fontSize: "0.8rem" }}>Editing bracket</div>
          <h1 style={{ margin: 0 }}>{division.name}</h1>
        </div>
        <div className="row" style={{ gap: 8 }}>
          {liveMatch && <Link className="btn primary" to={`/ref/mat/${liveMatch.id}`}>Open live match →</Link>}
          <Link className="btn ghost" to={`/bracket/${division.id}`}>Public view</Link>
        </div>
      </div>

      {hasMatches ? (
        <>
          <div className="card" style={{ margin: "14px 0", padding: "10px 14px" }}>
            <span className="muted" style={{ fontSize: "0.85rem" }}>
              ✏️ Click a competitor in any open match to declare them the winner — the bracket advances them automatically.
              Use the live match's scoreboard for full point scoring.
            </span>
          </div>
          <Bracket
            divisionId={division.id}
            editable
            onPickWinner={(m, c) => finishMatch(m.id, c, "decision")}
          />
        </>
      ) : (
        <div className="card center pad-lg" style={{ marginTop: 16 }}>
          <div style={{ fontSize: "2rem" }}>🗂️</div>
          <h3>No bracket generated yet</h3>
          <p className="muted">
            {entrantCount} registered. Seed this division to build the single-elimination bracket
            (byes added automatically).
          </p>
          <button className="btn primary" disabled={entrantCount < 2}
            onClick={() => generateBracket(division.id)}>
            Generate bracket ({entrantCount} entrants)
          </button>
        </div>
      )}
    </div>
  );
}
