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
  const { data: session, status } = useSession();
  
  // Durante loading, retornar dados vazios temporários
  if (status === 'loading') {
    return {
      name: '',
      email: '',
      isLoading: true,
    };
  }
  
  if (!session?.user) {
    return {
      name: 'Sistema',
      email: 'sistema@sgr.com',
      isLoading: false,
    };
  }

  return {
    name: session.user.name || 'Usuário',
    email: session.user.email || 'usuario@email.com',
    isLoading: false,
  };
}
