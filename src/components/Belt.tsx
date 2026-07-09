import type { Belt as BeltType } from "../data/types";

export function Belt({ belt, label }: { belt: BeltType; label?: boolean }) {
  return (
    <span className="row" style={{ gap: 6, display: "inline-flex" }}>
      <span className={`belt belt-${belt}`} />
      {label && <span style={{ textTransform: "capitalize" }}>{belt}</span>}
    </span>
  );
}
