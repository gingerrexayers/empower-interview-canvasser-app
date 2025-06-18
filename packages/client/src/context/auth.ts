import { createContext } from "react";
import type { Canvasser } from "@/types";

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

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
