import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
