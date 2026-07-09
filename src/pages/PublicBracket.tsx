import { Link, useParams } from "react-router-dom";
import { useStore } from "../data/store";
import Bracket from "../components/Bracket";

export default function PublicBracket() {
  const { divisionId } = useParams();
  const division = useStore((s) => s.divisions.find((d) => d.id === divisionId));
  const hasMatches = useStore((s) => s.matches.some((m) => m.divisionId === divisionId));

  if (!division) return <div className="container">Division not found.</div>;

  return (
    <div className="container">
      <div className="row spread wrap">
        <div>
          <div className="muted" style={{ fontSize: "0.8rem" }}>Bracket</div>
          <h1 style={{ margin: 0 }}>{division.name}</h1>
        </div>
        <Link className="btn ghost" to="/event">← Event</Link>
      </div>
      <p className="muted">Live results update as referees score matches.</p>

      {hasMatches
        ? <Bracket divisionId={division.id} />
        : <div className="card center pad-lg">Bracket not seeded yet — check back after registration closes.</div>}
    </div>
  );
}
