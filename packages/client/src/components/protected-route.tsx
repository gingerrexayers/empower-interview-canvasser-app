import { useLocation } from "preact-iso";
import type { ComponentType } from "preact";
import { useAuth } from "@/context/auth-context";

interface ProtectedRouteProps {
  path: string;
  component: ComponentType<object>;
}

export function ProtectedRoute({
  component: ComponentToRender,
}: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  const location = useLocation();

  if (!isAuthenticated) {
    location.route("/login", true);
    return null;
  }

  return <ComponentToRender />;
}
