import { useState } from "react";
import { useStore, staffOwedCents } from "../data/store";
import { money } from "../lib/format";

const MY_STAFF_ID = "s3"; // Priya Nair (demo staff identity)

export default function StaffDashboard() {
  const me = useStore((s) => s.staff.find((x) => x.id === MY_STAFF_ID)!);
  const [onShift, setOnShift] = useState(true);

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <h1>{me.name}</h1>
      <p className="muted" style={{ textTransform: "capitalize" }}>{me.role} · Mat {me.mat}</p>

      <div className="card pad-lg" style={{ marginTop: 12 }}>
        <div className="row spread">
          <div className="section-title" style={{ margin: 0 }}>Shift</div>
          <span className={`pill ${onShift ? "live" : "pending"}`}>{onShift ? "On shift" : "Off"}</span>
        </div>
        <div className="row spread" style={{ marginTop: 10 }}>
          <div>
            <div className="display" style={{ fontSize: "1.6rem" }}>{me.unitsWorked} hrs</div>
            <div className="muted" style={{ fontSize: "0.8rem" }}>logged today</div>
          </div>
          <button className="btn" onClick={() => setOnShift((v) => !v)}>
            {onShift ? "Check out" : "Check in"}
          </button>
        </div>
      </div>

      <div className="card pad-lg" style={{ marginTop: 16 }}>
        <div className="section-title" style={{ margin: 0 }}>Pay</div>
        <div className="row spread" style={{ marginTop: 10 }}>
          <div>
            <div className="display" style={{ fontSize: "2rem", color: "var(--accent)" }}>{money(staffOwedCents(me))}</div>
            <div className="muted" style={{ fontSize: "0.82rem" }}>
              {money(me.payRateCents)}/hr × {me.unitsWorked} hrs
            </div>
          </div>
          <span className={`pill ${me.payStatus}`}>{me.payStatus}</span>
        </div>
        <p className="muted" style={{ fontSize: "0.8rem", marginTop: 12 }}>
          Payouts are sent by the organizer via Stripe after the event. You'll get an email when yours is on the way.
        </p>
      </div>
    </div>
  );
}
