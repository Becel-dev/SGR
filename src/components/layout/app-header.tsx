'use client';

import { Menu, Search } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Input } from '@/components/ui/input';
import { UserMenu } from '@/components/auth/user-menu';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/hooks/use-sidebar';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { AppSidebar } from './app-sidebar';


export function AppHeader() {
  const { toggleSidebar } = useSidebar();
  
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
       <Button
          variant="outline"
          size="icon"
          className="shrink-0 md:hidden"
          asChild
        >
          <Sheet>
            <SheetTrigger>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </SheetTrigger>
             <SheetContent side="left" className="flex flex-col p-0">
                <AppSidebar isMobile />
            </SheetContent>
          </Sheet>
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


       <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Portal</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="w-full appearance-none bg-card pl-8 shadow-none md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>
      <UserMenu />
    </header>
  );
}
