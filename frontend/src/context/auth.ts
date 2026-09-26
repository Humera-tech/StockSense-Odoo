import { createContext, useContext } from "react";

import type { User } from "../types/auth";

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (login: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}
