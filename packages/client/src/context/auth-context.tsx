import { createContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { Canvasser } from "@/types";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  isAuthenticated: boolean;
  user: Canvasser | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

interface JwtPayload {
  email: string;
  id: number;
  name: string;
  iat: number;
  exp: number;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("authToken")
  );
  const [user, setUser] = useState<Canvasser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
    void navigate("/login");
  }, [navigate]);

  const login = useCallback((newToken: string) => {
    localStorage.setItem("authToken", newToken);
    setToken(newToken);
    const decoded: JwtPayload = jwtDecode(newToken);
    setUser({ id: decoded.id, email: decoded.email, name: decoded.name });
    void navigate("/dashboard");
  }, [navigate]);

  useEffect(() => {
    const initializeAuth = () => {
      if (token) {
        try {
          const decoded: JwtPayload = jwtDecode(token);
          // Check if token is expired
          if (decoded.exp * 1000 < Date.now()) {
            logout(); // Now calls the memoized version
          } else {
            // You could fetch user details here if needed
            // For now, we'll just use the decoded token
            setUser({
              id: decoded.id,
              email: decoded.email,
              name: decoded.name,
            });
          }
        } catch (error) {
          console.error("Invalid token:", error);
          logout(); // Now calls the memoized version
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [token, logout]);

  const value = {
    isAuthenticated: !!token,
    user,
    token,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
