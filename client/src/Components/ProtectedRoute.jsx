
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <p className="page-loading">Loading your workspace...</p>;
  }

  return isAuthenticated
    ? <Outlet />
    : <Navigate to="/login" replace />;
}
