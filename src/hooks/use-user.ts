'use client';

import { useContext } from 'react';
import { UserContext, UserContextType } from '@/components/auth/user-provider';

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
