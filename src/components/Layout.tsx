import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useRole } from "../auth/RoleContext";
import { useStore, currentEvent } from "../data/store";
import { usesSupabase } from "../data/store";
import type { Role } from "../data/types";

const navByRole: Record<Role, { to: string; label: string }[]> = {
  competitor: [
    { to: "/me", label: "My event" },
    { to: "/event", label: "Event page" },
    { to: "/replays", label: "Replays" },
  ],
  ref: [
    { to: "/ref", label: "My mat" },
    { to: "/event", label: "Event page" },
    { to: "/replays", label: "Replays" },
  ],
  staff: [
    { to: "/staff", label: "My shift" },
    { to: "/event", label: "Event page" },
    { to: "/replays", label: "Replays" },
  ],
  admin: [
    { to: "/admin", label: "Overview" },
    { to: "/admin/events", label: "Tournaments" },
    { to: "/admin/staff", label: "Staff & pay" },
    { to: "/admin/stats", label: "Stats" },
    { to: "/event", label: "Public page" },
    { to: "/replays", label: "Replays" },
  ],
};

export default function Layout() {
  const { role, identity, signOut } = useRole();
  const event = useStore(currentEvent);
  const nav = useNavigate();
  const loc = useLocation();
  if (!role) return null;

  return (
    <>
      <header style={{
        borderBottom: "1px solid var(--border)",
        background: "rgba(12,13,16,0.85)",
        backdropFilter: "blur(8px)",
        position: "sticky", top: 0, zIndex: 20,
      }}>
        <div className="container" style={{ padding: "12px 20px" }}>
          <div className="row spread wrap">
            <div className="row">
              <Link to="/" className="row" style={{ gap: 8 }}>
                <img src={`${import.meta.env.BASE_URL}valour-logo.png`} alt="Valour" style={{ height: 30 }} />
              </Link>
              <span className="muted" style={{ fontSize: "0.82rem" }}>{event.name}</span>
            </div>
            <div className="row wrap">
              {navByRole[role].map((n) => (
                <Link key={n.to} to={n.to}
                  className="btn sm ghost"
                  style={loc.pathname === n.to ? { borderColor: "var(--accent)", color: "var(--accent)" } : undefined}>
                  {n.label}
                </Link>
              ))}
            </div>
            <div className="row">
              <div style={{ textAlign: "right", lineHeight: 1.1 }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{identity?.name}</div>
                <div className="muted" style={{ fontSize: "0.72rem" }}>{identity?.detail}</div>
              </div>
              <button className="btn sm" onClick={() => { signOut(); nav("/signin"); }}>Switch role</button>
            </div>
          </div>
        </div>
      </header>

      {!usesSupabase && (
        <div className="center muted" style={{ fontSize: "0.72rem", padding: "6px", background: "var(--surface)" }}>
          Demo mode · seeded in-browser data · edits persist for this session
        </div>
      )}

      <Outlet />
    </>
  );
}
