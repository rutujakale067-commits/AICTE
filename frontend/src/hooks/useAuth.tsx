import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { api, setToken, getToken } from "../services/api"; import { User } from "../types";
interface Ctx { user: User | null; loading: boolean; login: (u: string, p: string) => Promise<void>; logout: () => void }
const C = createContext<Ctx>(null as any);
export const useAuth = () => useContext(C);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); const [loading, setLoading] = useState(!!getToken());
  useEffect(() => { if (getToken()) api("/auth/me").then(setUser).catch(() => setToken(null)).finally(() => setLoading(false)); }, []);
  const login = useCallback(async (username: string, password: string) => { const r = await api("/auth/login", { json: { username, password } }); setToken(r.token); setUser(r.user); }, []);
  const logout = () => { setToken(null); setUser(null); };
  return <C.Provider value={{ user, loading, login, logout }}>{children}</C.Provider>;
}
