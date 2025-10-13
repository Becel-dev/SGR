'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/use-user';
import { useAuth } from '@/hooks/use-auth';
import { signOut } from 'next-auth/react';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';

export function UserMenu() {
  const { user: legacyUser, logout: legacyLogout } = useUser();
  const { user: authUser, isAuthenticated, isLoading } = useAuth();

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return names[0].substring(0, 2);
  };

  // Se estiver carregando, mostra skeleton
  if (isLoading) {
    return (
      <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
    );
  }

  // Prioriza usuário autenticado via Azure AD, senão usa o legado
  // A aplicação funciona sem login - autenticação é opcional
  const displayUser = authUser || legacyUser;

  if (!displayUser) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={(displayUser as any).image || (displayUser as any).avatarUrl} alt={displayUser.name || 'User'} data-ai-hint="person portrait"/>
            <AvatarFallback>{getInitials(displayUser.name || 'U')}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayUser.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {displayUser.email}
            </p>
            {authUser && (
              <p className="text-xs leading-none text-green-600 font-semibold">
                ✓ Microsoft Account
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configurações</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => authUser ? signOut({ callbackUrl: '/auth/signin' }) : legacyLogout()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
