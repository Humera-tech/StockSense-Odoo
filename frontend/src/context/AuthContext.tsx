import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { setUnauthorizedHandler, tokenStore } from "../services/api";
import { authService } from "../services/authService";
import type { User } from "../types/auth";
import { AuthContext } from "./auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => tokenStore.get() !== null);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    if (!tokenStore.get()) return;
    authService
      .me()
      .then(setUser, () => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (login: string, password: string, remember: boolean) => {
    const response = await authService.login(login, password);
    tokenStore.set(response.access_token, remember);
    setUser(response.user);
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
