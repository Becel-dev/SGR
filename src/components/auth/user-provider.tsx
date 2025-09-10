'use client';

import React, { createContext, useState, ReactNode } from 'react';
import type { User, Role } from '@/lib/types';

export type UserContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  hasRole: (roles: Role | Role[]) => boolean;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock user data
const mockUser: User = {
  name: 'Admin Rumo',
  email: 'admin.rumo@example.com',
  avatarUrl: 'https://picsum.photos/seed/123/40/40',
  role: 'admin',
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(mockUser);

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
