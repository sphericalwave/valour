import { useStore, competitorName } from "../data/store";
import type { Match } from "../data/types";

const roundName = (round: number, maxRound: number) => {
  if (round === 0) return "Final";
  if (round === 1 && maxRound >= 1) return "Semifinals";
  if (round === 2 && maxRound >= 2) return "Quarterfinals";
  return `Round of ${2 ** (round + 1)}`;
};

interface Props {
  divisionId: string;
  editable?: boolean;
  onPickWinner?: (match: Match, competitorId: string) => void;
}

export default function Bracket({ divisionId, editable, onPickWinner }: Props) {
  const matches = useStore((s) => s.matches.filter((m) => m.divisionId === divisionId));
  const rounds = [...new Set(matches.map((m) => m.round))].sort((a, b) => b - a);
  const maxRound = Math.max(...rounds);

  return (
    <div style={{ overflowX: "auto", paddingBottom: 8 }}>
      <div style={{ display: "flex", gap: 28, minWidth: "min-content" }}>
        {rounds.map((round) => (
          <div key={round} style={{ display: "flex", flexDirection: "column", minWidth: 220 }}>
            <div className="section-title" style={{ margin: "0 0 10px" }}>{roundName(round, maxRound)}</div>
            <div style={{
              display: "flex", flexDirection: "column",
              justifyContent: "space-around", gap: 16, flex: 1,
            }}>
              {matches.filter((m) => m.round === round).sort((a, b) => a.slot - b.slot).map((m) => (
                <MatchCard key={m.id} match={m} editable={editable} onPickWinner={onPickWinner} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchCard({ match, editable, onPickWinner }:
  { match: Match; editable?: boolean; onPickWinner?: (m: Match, c: string) => void }) {
  const live = match.status === "live";
  return (
    <div className="card" style={{
      padding: 0, overflow: "hidden",
      borderColor: live ? "var(--live)" : "var(--border)",
      boxShadow: live ? "0 0 0 1px var(--live)" : undefined,
    }}>
      <div className="row spread" style={{ padding: "6px 10px", background: "var(--surface-2)", fontSize: "0.7rem" }}>
        <span className="muted">Mat {match.mat}</span>
        {live && <span className="pill live">Live</span>}
        {match.status === "complete" && <span className="muted" style={{ textTransform: "uppercase" }}>{match.method}</span>}
        {match.status === "pending" && <span className="muted">Upcoming</span>}
      </div>
      <Slot match={match} side="A" editable={editable} onPickWinner={onPickWinner} />
      <div style={{ height: 1, background: "var(--border)" }} />
      <Slot match={match} side="B" editable={editable} onPickWinner={onPickWinner} />
    </div>
  );
}

function Slot({ match, side, editable, onPickWinner }:
  { match: Match; side: "A" | "B"; editable?: boolean; onPickWinner?: (m: Match, c: string) => void }) {
  const id = side === "A" ? match.competitorA : match.competitorB;
  const pts = side === "A" ? match.pointsA : match.pointsB;
  const adv = side === "A" ? match.advA : match.advB;
  const isWinner = match.winnerId === id;
  const canPick = editable && id && match.status !== "complete" && onPickWinner;

  return (
    <div
      className="row spread"
      onClick={canPick ? () => onPickWinner!(match, id!) : undefined}
      title={canPick ? "Click to declare winner" : undefined}
      style={{
        padding: "9px 10px",
        cursor: canPick ? "pointer" : "default",
        background: isWinner ? "rgba(228,181,61,0.12)" : "transparent",
        borderLeft: isWinner ? "3px solid var(--accent)" : "3px solid transparent",
      }}
    >
      <span style={{
        fontWeight: isWinner ? 700 : 500,
        color: id ? "var(--text)" : "var(--muted)",
        fontSize: "0.9rem",
      }}>
        {id ? competitorName(id) : "TBD"}
      </span>
      <span className="row" style={{ gap: 6 }}>
        {adv > 0 && <span className="muted" style={{ fontSize: "0.7rem" }}>adv {adv}</span>}
        <span className="display" style={{ minWidth: 18, textAlign: "right", color: isWinner ? "var(--accent)" : "var(--muted)" }}>{pts}</span>
      </span>
    </div>
  );
}
