import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../pages/LoadingScreen";
import { needsOnboarding } from "../utils/onboarding";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen bg-[#0d1117]">
        <LoadingScreen />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const onOnboarding = location.pathname === "/onboarding";

  if (needsOnboarding() && !onOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!needsOnboarding() && onOnboarding) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
