'use client';

import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import type { User, Role } from '@/lib/types';

export type UserContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  hasRole: (roles: Role | Role[]) => boolean;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Atualizar user quando a sessão NextAuth mudar
    if (status === 'authenticated' && session?.user) {
      setUser({
        name: session.user.name || 'Usuário',
        email: session.user.email || '',
        avatarUrl: session.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || 'U')}&background=0D8ABC&color=fff`,
        role: 'admin', // Pode ser extraído do token se configurado no Azure AD
      });
    } else if (status === 'unauthenticated') {
      setUser(null);
    }
  }, [session, status]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const hasRole = (roles: Role | Role[]): boolean => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };
  
  return (
    <UserContext.Provider value={{ user, login, logout, hasRole }}>
      {children}
    </UserContext.Provider>
  );
};
