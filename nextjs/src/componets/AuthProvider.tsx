"use client";

import { fetchSession } from "@/lib/auth/actions";
import { User } from "@/lib/auth/session";
import { createContext, useCallback, useContext, useState } from "react";

type AuthContextType = {
  user: User | null;
  refreshUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: User | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(initialUser);

  const refreshUser = useCallback(async () => {
    setUser(await fetchSession());
  }, []);

  return (
    <AuthContext.Provider value={{ user, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthConetxt(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within a AuthProvider");
  }
  return context;
}
