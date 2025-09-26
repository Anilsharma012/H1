import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

type User = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  roles: string[];
} | null;

const AuthCtx = createContext<{
  user: User;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);

  const refresh = async () => {
    const me = await fetch("/api/me", { credentials: "include" }).then((r) =>
      r.json(),
    );
    setUser(me);
  };

  const logout = async () => {
    await api("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <AuthCtx.Provider value={{ user, refresh, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
