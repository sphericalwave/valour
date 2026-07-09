export function StatCard({ label, value, sub, accent }:
  { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="card">
      <div className="muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div className="display" style={{ fontSize: "1.9rem", marginTop: 6, color: accent ? "var(--accent)" : "var(--text)" }}>{value}</div>
      {sub && <div className="muted" style={{ fontSize: "0.8rem", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// Minimal, accessible bar chart. One hue, labelled rows — reads in light & dark.
export function BarChart({ data, unit }: { data: { label: string; value: number }[]; unit?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="stack" style={{ gap: 10 }}>
      {data.map((d) => (
        <div key={d.label} className="row" style={{ gap: 12 }}>
          <div className="muted" style={{ width: 150, fontSize: "0.82rem", textAlign: "right", flexShrink: 0 }}>{d.label}</div>
          <div className="grow" style={{ background: "var(--surface-2)", borderRadius: 6, overflow: "hidden", height: 22 }}>
            <div style={{
              width: `${(d.value / max) * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg, var(--accent-2), var(--accent))",
              minWidth: 2,
            }} />
          </div>
          <div className="display" style={{ width: 52, fontSize: "0.9rem" }}>{d.value}{unit}</div>
        </div>
      ))}
    </div>
  );
}
