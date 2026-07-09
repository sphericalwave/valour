import { useStore, currentEvent, staffOwedCents, payStaff, payAllStaff } from "../data/store";
import { StatCard } from "../components/Stats";
import { money } from "../lib/format";

export default function StaffPayouts() {
  const event = useStore(currentEvent);
  const staff = useStore((s) => s.staff.filter((x) => x.eventId === event.id));

  const totalOwed = staff.reduce((a, s) => a + staffOwedCents(s), 0);
  const pending = staff.filter((s) => s.payStatus === "pending");
  const pendingTotal = pending.reduce((a, s) => a + staffOwedCents(s), 0);

  const rate = (s: (typeof staff)[number]) => {
    const per = { per_event: "event", per_hour: "hr", per_match: "match" }[s.payType];
    return `${money(s.payRateCents)}/${per} × ${s.unitsWorked}`;
  };

  return (
    <div className="container">
      <div className="row spread wrap">
        <h1 style={{ margin: 0 }}>Staff & payouts</h1>
        <button className="btn primary" disabled={pending.length === 0}
          onClick={() => payAllStaff(event.id)}>
          Pay all pending ({money(pendingTotal)})
        </button>
      </div>

      <div className="grid cols-3" style={{ marginTop: 16 }}>
        <StatCard label="Total payroll" value={money(totalOwed)} />
        <StatCard label="Pending" value={money(pendingTotal)} sub={`${pending.length} staff`} accent />
        <StatCard label="Staff on roster" value={String(staff.length)} />
      </div>

      <div className="card" style={{ marginTop: 16, padding: 0 }}>
        <table>
          <thead>
            <tr><th>Name</th><th>Role</th><th>Mat</th><th>Rate</th><th>Owed</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{s.name}</td>
                <td style={{ textTransform: "capitalize" }}>{s.role}</td>
                <td>{s.mat ?? "—"}</td>
                <td className="muted">{rate(s)}</td>
                <td className="display" style={{ color: "var(--accent)" }}>{money(staffOwedCents(s))}</td>
                <td><span className={`pill ${s.payStatus}`}>{s.payStatus}</span></td>
                <td>
                  {s.payStatus === "pending"
                    ? <button className="btn sm primary" onClick={() => payStaff(s.id)}>Pay</button>
                    : <span className="muted" style={{ fontSize: "0.8rem" }}>✓ sent</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted" style={{ fontSize: "0.8rem", marginTop: 10 }}>
        Real payouts move via Stripe Connect transfers to each staff member's connected account.
      </p>
    </div>
  );
}
