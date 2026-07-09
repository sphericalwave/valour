import { useStore, setCurrentEvent, cloneEvent } from "../data/store";
import { money, shortDate } from "../lib/format";

export default function EventSwitcher() {
  const events = useStore((s) => s.events);
  const currentId = useStore((s) => s.currentEventId);

  return (
    <div className="container">
      <div className="row spread wrap">
        <div>
          <h1 style={{ margin: 0 }}>Tournaments</h1>
          <p className="muted">One brand, many events. Switch context or clone one to start the next.</p>
        </div>
      </div>

      <div className="stack" style={{ marginTop: 8 }}>
        {events.map((e) => {
          const active = e.id === currentId;
          return (
            <div key={e.id} className="card row spread wrap"
              style={{ gap: 12, borderColor: active ? "var(--accent)" : "var(--border)" }}>
              <div className="row" style={{ gap: 14 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 10, flexShrink: 0,
                  background: `linear-gradient(135deg, ${e.palette.accent2}, ${e.palette.accent})`,
                }} />
                <div>
                  <div className="row" style={{ gap: 8 }}>
                    <span style={{ fontWeight: 700 }}>{e.name}</span>
                    {active && <span className="pill accent">Current</span>}
                    <span className={`pill ${e.status === "live" ? "live" : e.status === "upcoming" ? "pending" : ""}`}>{e.status}</span>
                  </div>
                  <div className="muted" style={{ fontSize: "0.82rem" }}>
                    {shortDate(e.date)} · {e.city} · {e.entries} entries · {money(e.revenueCents)}
                  </div>
                </div>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <button className="btn sm ghost" onClick={() => cloneEvent(e.id)}>Clone</button>
                <button className="btn sm primary" disabled={active} onClick={() => setCurrentEvent(e.id)}>
                  {active ? "Selected" : "Switch to"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
