import { useNavigate } from "react-router-dom";
import { useRole } from "../auth/RoleContext";
import { demoIdentities } from "../data/seed";
import type { Role } from "../data/types";
import { usesSupabase } from "../data/store";

const roles: { role: Role; label: string; blurb: string; icon: string; to: string }[] = [
  { role: "competitor", label: "Competitor", blurb: "See my division, next match & payment", icon: "🥋", to: "/me" },
  { role: "ref", label: "Referee", blurb: "Score matches on the mat", icon: "🧑‍⚖️", to: "/ref" },
  { role: "admin", label: "Admin", blurb: "Run the event, edit brackets, pay staff", icon: "🛠️", to: "/admin" },
  { role: "staff", label: "Staff", blurb: "My assignment, shift & pay", icon: "📋", to: "/staff" },
];

export default function SignIn() {
  const { signIn } = useRole();
  const nav = useNavigate();

  const pick = (role: Role, to: string) => {
    signIn(role);
    nav(to);
  };

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <div className="center" style={{ margin: "32px 0 8px" }}>
        <img src={`${import.meta.env.BASE_URL}valour-logo.png`} alt="Valour Series Jiu-Jitsu"
          style={{ width: 220, maxWidth: "70%" }} />
        <p className="muted" style={{ marginTop: 12 }}>Run jiu-jitsu tournaments. Pick a role to explore the demo —{" "}
          <strong>no password needed</strong>.</p>
      </div>

      <div className="grid cols-2" style={{ marginTop: 24 }}>
        {roles.map((r) => (
          <button key={r.role} className="card" onClick={() => pick(r.role, r.to)}
            style={{ textAlign: "left", cursor: "pointer", color: "var(--text)" }}>
            <div style={{ fontSize: "1.8rem" }}>{r.icon}</div>
            <h3 style={{ margin: "8px 0 4px" }}>{r.label}</h3>
            <div className="muted" style={{ fontSize: "0.88rem" }}>{r.blurb}</div>
            <div className="pill accent" style={{ marginTop: 12 }}>
              as {demoIdentities[r.role].name}
            </div>
          </button>
        ))}
      </div>

      <p className="muted center" style={{ marginTop: 24, fontSize: "0.8rem" }}>
        Data source: {usesSupabase ? "live Supabase project" : "seeded in-browser demo data"}.
      </p>
    </div>
  );
}
