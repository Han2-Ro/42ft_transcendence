'use client';
 
import { User } from '@/lib/auth/session';
import { createContext, useContext, useState } from 'react';
 
export const AuthContext = createContext<User | null>(null);
 
export default function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: User | null,
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useAuthConetxt() {
  const context = useContext(AuthContext);
  if (!context) {
    // throw new Error('useAuthContext must be used within a AuthProvider');
    console.log('null context');
  }
  return context;
}