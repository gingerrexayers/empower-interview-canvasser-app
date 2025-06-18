import { createContext } from "preact";
import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useContext,
} from "preact/hooks";
import type { ComponentChildren } from "preact";
import type { Canvasser } from "@/types";
import { jwtDecode } from "jwt-decode";

// --- Type Definitions ---
export interface AuthContextType {
  isAuthenticated: boolean;
  user: Canvasser | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export interface JwtPayload {
  email: string;
  id: number;
  name: string;
  iat: number;
  exp: number;
}

// --- Context ---
export const AuthContext = createContext<AuthContextType | null>(null);

// --- Provider ---
export const AuthProvider = ({ children }: { children: ComponentChildren }) => {
  const [token, setToken] = useState<string | null>(() => {
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

  useEffect(() => {
    if (token) {
      try {
        const decoded: JwtPayload = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        }
      } catch (error) {
        console.error("Invalid token found, logging out:", error);
        logout();
      }
    }
  }, [token, logout]);

  const user = useMemo((): Canvasser | null => {
    if (!token) {
      return null;
    }
    const decoded: JwtPayload = jwtDecode(token);
    return { id: decoded.id, email: decoded.email, name: decoded.name };
  }, [token]);

  const isAuthenticated = useMemo(() => !!user, [user]);

  const value: AuthContextType = {
    isAuthenticated,
    user,
    token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- Hook ---
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
