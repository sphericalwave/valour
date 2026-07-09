import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useRole } from "./auth/RoleContext";
import { useStore, currentEvent } from "./data/store";
import Layout from "./components/Layout";
import SignIn from "./pages/SignIn";
import EventLanding from "./pages/EventLanding";
import CompetitorDashboard from "./pages/CompetitorDashboard";
import RefDashboard from "./pages/RefDashboard";
import RefScoreboard from "./pages/RefScoreboard";
import StaffDashboard from "./pages/StaffDashboard";
import AdminHome from "./pages/AdminHome";
import AdminBracket from "./pages/AdminBracket";
import StaffPayouts from "./pages/StaffPayouts";
import EventStats from "./pages/EventStats";
import EventSwitcher from "./pages/EventSwitcher";
import PublicBracket from "./pages/PublicBracket";
import Checkout from "./pages/Checkout";

export default function App() {
  const { role } = useRole();
  const event = useStore(currentEvent);
  const ready = useStore((s) => s.ready);
  const loc = useLocation();

  if (!ready) {
    return (
      <div className="container center" style={{ paddingTop: 120 }}>
        <div className="display" style={{ fontSize: "2rem", color: "var(--accent)" }}>VALOUR</div>
        <p className="muted">Loading event data…</p>
      </div>
    );
  }

  // Apply the current event's palette as CSS variables — re-themes the whole
  // app when you switch tournaments.
  const themeVars = {
    "--accent": event.palette.accent,
    "--accent-2": event.palette.accent2,
  } as React.CSSProperties;

  if (!role && loc.pathname !== "/signin") {
    return <Navigate to="/signin" replace />;
  }

  return (
    <div style={themeVars}>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to={homeFor(role)} replace />} />
          <Route path="/event" element={<EventLanding />} />
          <Route path="/me" element={<CompetitorDashboard />} />
          <Route path="/ref" element={<RefDashboard />} />
          <Route path="/ref/mat/:matchId" element={<RefScoreboard />} />
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/admin/events" element={<EventSwitcher />} />
          <Route path="/admin/staff" element={<StaffPayouts />} />
          <Route path="/admin/stats" element={<EventStats />} />
          <Route path="/admin/bracket/:divisionId" element={<AdminBracket />} />
          <Route path="/bracket/:divisionId" element={<PublicBracket />} />
          <Route path="/register/:divisionId" element={<Checkout />} />
          <Route path="*" element={<Navigate to="/event" replace />} />
        </Route>
      </Routes>
    </div>
  );
}

function homeFor(role: string | null): string {
  switch (role) {
    case "competitor": return "/me";
    case "ref": return "/ref";
    case "admin": return "/admin";
    case "staff": return "/staff";
    default: return "/event";
  }
}
