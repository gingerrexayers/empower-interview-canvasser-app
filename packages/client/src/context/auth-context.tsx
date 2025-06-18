import { useState, useCallback, useMemo, type ReactNode, useEffect } from "react";
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

  // Proactively check for an expired token on load or when the token changes.
  useEffect(() => {
    if (token) {
      try {
        const decoded: JwtPayload = jwtDecode(token);
        // Check if the token is expired
        if (decoded.exp * 1000 < Date.now()) {
          logout(); // Token is expired, so log out
        }
      } catch (error) {
        // If the token is invalid or corrupted, log out
        console.error("Invalid token found, logging out:", error);
        logout();
      }
    }
  }, [token, logout]);

  const user = useMemo((): Canvasser | null => {
    if (!token) {
      return null;
    }
    try {
      const decoded: JwtPayload = jwtDecode(token);
      return { id: decoded.id, email: decoded.email, name: decoded.name };
    } catch (error) {
      // This catch block is crucial for handling invalid tokens on initial load.
      // It prevents the app from crashing during render.
      // The useEffect hook below will then handle cleaning up the invalid token.
      console.error(
        "Failed to decode token in user memo, treating as unauthenticated:",
        error
      );
      return null;
    }
  }, [token]);

  const isAuthenticated = useMemo(() => !!user, [user]);

  const value = {
    isAuthenticated,
    user,
    token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
