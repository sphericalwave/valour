import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useStore, markRegistrationPaid } from "../data/store";
import { meCompetitorId } from "../data/seed";
import { money } from "../lib/format";

export default function Checkout() {
  const { divisionId } = useParams();
  const division = useStore((s) => s.divisions.find((d) => d.id === divisionId));
  const myPendingReg = useStore((s) =>
    s.registrations.find((r) => r.divisionId === divisionId && r.competitorId === meCompetitorId && r.paymentStatus === "pending"));
  const [phase, setPhase] = useState<"form" | "processing" | "done">("form");

  if (!division) return <div className="container">Division not found.</div>;

  const pay = () => {
    setPhase("processing");
    setTimeout(() => {
      if (myPendingReg) markRegistrationPaid(myPendingReg.id);
      setPhase("done");
    }, 1200);
  };

  if (phase === "done") {
    return (
      <div className="container" style={{ maxWidth: 520 }}>
        <div className="card center pad-lg" style={{ borderColor: "var(--ok)" }}>
          <div style={{ fontSize: "2.4rem" }}>✅</div>
          <h2>You're registered</h2>
          <p className="muted">{division.name} · {money(division.feeCents)} paid</p>
          <div className="row" style={{ justifyContent: "center", gap: 8, marginTop: 8 }}>
            <Link className="btn primary" to={`/bracket/${division.id}`}>View bracket</Link>
            <Link className="btn ghost" to="/me">My event</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <h1>Checkout</h1>
      <div className="card" style={{ marginTop: 8 }}>
        <div className="row spread"><span className="muted">Division</span><span>{division.name}</span></div>
        <div className="row spread" style={{ marginTop: 8 }}><span className="muted">Weight</span><span>{division.weightClass}</span></div>
        <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
        <div className="row spread"><span style={{ fontWeight: 700 }}>Entry fee</span>
          <span className="display" style={{ fontSize: "1.4rem", color: "var(--accent)" }}>{money(division.feeCents)}</span></div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="section-title" style={{ margin: "0 0 10px" }}>Card details</div>
        <input className="btn" style={{ width: "100%", marginBottom: 8, cursor: "text" }} placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" />
        <div className="row" style={{ gap: 8 }}>
          <input className="btn grow" style={{ cursor: "text" }} placeholder="MM / YY" defaultValue="04 / 28" />
          <input className="btn grow" style={{ cursor: "text" }} placeholder="CVC" defaultValue="123" />
        </div>
        <button className="btn primary" style={{ width: "100%", marginTop: 14, justifyContent: "center" }}
          disabled={phase === "processing"} onClick={pay}>
          {phase === "processing" ? "Processing…" : `Pay ${money(division.feeCents)}`}
        </button>
        <p className="muted center" style={{ fontSize: "0.75rem", marginTop: 10 }}>
          🔒 Demo checkout — no real charge. Production uses Stripe Checkout.
        </p>
      </div>
    </div>
  );
}
