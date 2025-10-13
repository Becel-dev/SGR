'use client';

import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    status,
  };
}

export function useAuthUser() {
  const { data: session } = useSession();
  
  if (!session?.user) {
    return {
      name: 'Sistema',
      email: 'sistema@sgr.com',
    };
  }

  return {
    name: session.user.name || 'Usuário',
    email: session.user.email || 'usuario@email.com',
  };
}
