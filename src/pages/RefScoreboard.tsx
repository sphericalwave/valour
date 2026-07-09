import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore, competitorName, bumpScore, finishMatch } from "../data/store";
import type { Match, WinMethod } from "../data/types";

export default function RefScoreboard() {
  const { matchId } = useParams();
  const nav = useNavigate();
  const match = useStore((s) => s.matches.find((m) => m.id === matchId));

  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  if (!match) return <div className="container">Match not found.</div>;

  const clock = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const complete = match.status === "complete";

  const win = (competitorId: string, method: WinMethod) => {
    finishMatch(match.id, competitorId, method);
    nav("/ref");
  };

  return (
    <div className="container" style={{ maxWidth: 960 }}>
      <div className="row spread">
        <button className="btn sm ghost" onClick={() => nav("/ref")}>← Mat</button>
        <div className="display" style={{ fontSize: "2rem", letterSpacing: "0.08em" }}>{clock}</div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn sm" onClick={() => setRunning((r) => !r)}>{running ? "Pause" : "Start"}</button>
          <button className="btn sm ghost" onClick={() => { setSeconds(0); setRunning(false); }}>Reset</button>
        </div>
      </div>

      <div className="grid cols-2" style={{ marginTop: 16 }}>
        <Side match={match} side="A" disabled={complete} onWin={win} />
        <Side match={match} side="B" disabled={complete} onWin={win} />
      </div>

      {complete && (
        <div className="card center" style={{ marginTop: 16, borderColor: "var(--accent)" }}>
          <span className="pill accent">Result recorded</span>
          <div className="display" style={{ fontSize: "1.4rem", marginTop: 8 }}>
            {competitorName(match.winnerId)} wins by {match.method}
          </div>
          <div className="muted" style={{ marginTop: 4 }}>Winner advanced to the next round automatically.</div>
        </div>
      )}
    </div>
  );
}

function Side({ match, side, disabled, onWin }:
  { match: Match; side: "A" | "B"; disabled: boolean; onWin: (id: string, m: WinMethod) => void }) {
  const id = (side === "A" ? match.competitorA : match.competitorB)!;
  const pts = side === "A" ? match.pointsA : match.pointsB;
  const adv = side === "A" ? match.advA : match.advB;
  const pen = side === "A" ? match.penA : match.penB;
  const F = (f: string) => `${f}${side}` as Parameters<typeof bumpScore>[1];

  return (
    <div className="card pad-lg" style={{ background: "var(--surface)" }}>
      <div className="display" style={{ fontSize: "1.2rem" }}>{competitorName(id)}</div>
      <div className="center" style={{ margin: "8px 0" }}>
        <div className="display" style={{ fontSize: "4.5rem", color: "var(--accent)", lineHeight: 1 }}>{pts}</div>
        <div className="row" style={{ justifyContent: "center", gap: 16, marginTop: 4 }}>
          <span className="muted">ADV <b style={{ color: "var(--text)" }}>{adv}</b></span>
          <span className="muted">PEN <b style={{ color: "var(--warn)" }}>{pen}</b></span>
        </div>
      </div>

      <div className="row wrap" style={{ gap: 8, justifyContent: "center" }}>
        {[2, 3, 4].map((n) => (
          <button key={n} className="btn primary" disabled={disabled}
            onClick={() => bumpScore(match.id, F("points"), n)}>+{n}</button>
        ))}
        <button className="btn" disabled={disabled} onClick={() => bumpScore(match.id, F("adv"), 1)}>+Adv</button>
        <button className="btn" disabled={disabled} onClick={() => bumpScore(match.id, F("pen"), 1)}>+Pen</button>
      </div>
      <div className="row" style={{ gap: 8, justifyContent: "center", marginTop: 8 }}>
        <button className="btn sm ghost" disabled={disabled} onClick={() => bumpScore(match.id, F("points"), -2)}>Undo pts</button>
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: "14px 0" }} />
      <div className="row wrap" style={{ gap: 8, justifyContent: "center" }}>
        <button className="btn danger" disabled={disabled} onClick={() => onWin(id, "submission")}>Submission</button>
        <button className="btn" disabled={disabled} onClick={() => onWin(id, "points")}>Win pts</button>
        <button className="btn" disabled={disabled} onClick={() => onWin(id, "decision")}>Decision</button>
      </div>
    </div>
  );
}
