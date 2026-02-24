import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const C  = { blue: "#1AABE3", greyLight: "#F4F7FA", border: "#E2E8F0", muted: "#7A8A9E" };
const ff = "'Barlow', 'Segoe UI', sans-serif";

function Spinner() {
  return (
    <div style={{ minHeight: "100vh", background: C.greyLight, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ff }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: `4px solid ${C.border}`, borderTopColor: C.blue, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>Loading...</div>
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children, role }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <Spinner />;

  // Not logged in → send to portal login
  if (!user) return <Navigate to="/trainer/dashboard" replace />;

  // Wrong role → send to correct home
  if (role && profile?.role !== role) {
    return <Navigate to={profile?.role === "trainer" ? "/trainer/dashboard" : "/client/nutrition"} replace />;
  }

  return children;
}
