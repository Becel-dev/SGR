
'use client';

import { Menu } from 'lucide-react';
import { UserMenu } from '@/components/auth/user-menu';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/hooks/use-sidebar';

export function AppHeader() {
  const { toggleSidebar } = useSidebar();
  
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
       <Button
          variant="outline"
          size="icon"
          className="shrink-0 md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      
       <Button
          variant="outline"
          size="icon"
          className="hidden h-8 w-8 shrink-0 md:flex"
          onClick={toggleSidebar}
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>

      <div className="w-full flex-1">
        {/* Espaço reservado para futuros elementos */}
      </div>
      <UserMenu />
    </header>
  );
}
