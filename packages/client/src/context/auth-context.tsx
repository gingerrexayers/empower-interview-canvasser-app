import { useState, useCallback, useMemo, type ReactNode } from "react";
// useNavigate will be removed as navigation is decoupled
import type { Canvasser } from "@/types";
import { jwtDecode } from "jwt-decode";
import { AuthContext, type JwtPayload } from "./auth";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => {
    // Initialize token from localStorage synchronously
    return localStorage.getItem("authToken");
  });

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    setToken(null);
  }, []);

  const login = useCallback((newToken: string) => {
    localStorage.setItem("authToken", newToken);
    setToken(newToken);
  }, []);

  // useEffect to sync token from localStorage on initial load (already handled by useState initializer)
  // The primary effect of token changes will be handled by useMemo for user and isAuthenticated.
  // If other side effects are needed when the token changes (e.g., analytics), they can go here.

  const user = useMemo((): Canvasser | null => {
    if (token) {
      try {
        const decoded: JwtPayload = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          return null;
        }
        return { id: decoded.id, email: decoded.email, name: decoded.name };
      } catch (error) {
        console.error("Invalid token during decode:", error);
        return null;
      }
    }
    return null;
  }, [token]);

  const isAuthenticated = useMemo(() => !!token && !!user, [token, user]);

  const value = {
    isAuthenticated,
    user,
    token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
