"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { clearUser, getStoredUser, saveUser, type User } from "@/lib/storage";

interface AuthContextValue {
  user: User | null;
  login: (u: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const login = (u: User | null) => {
    setUser(u);
    if (u) saveUser(u);
    else clearUser();
  };

  const logout = () => {
    setUser(null);
    clearUser();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
