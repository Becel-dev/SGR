

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AreaChart,
  Shield,
  GanttChartSquare,
  Siren,
  GitFork,
  Bot,
  Sparkles,
  Users,
  Settings,
  Rss,
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/hooks/use-sidebar';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';


const navigationItems = [
  { href: '/dashboard', icon: AreaChart, label: 'Painéis' },
  { href: '/risks', icon: Siren, label: 'Identificação de Riscos' },
  { href: '/controls', icon: Shield, label: 'Governança de Controles' },
  { href: "/kpis", icon: GanttChartSquare, label: "Gestão de KPI's" },
  { href: '/escalation', icon: Rss, label: 'Escalonamento' },
  { href: '/bowtie', icon: GitFork, label: 'Visualização Bowtie' },
  { href: '/reports/generate', icon: Bot, label: 'Gerador de Relatório IA' },
  { href: '/improvement', icon: Sparkles, label: 'Melhoria Contínua' },
  { href: '/administration', icon: Users, label: 'Administração', roles: ['admin'] },
];

export function AppSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const { hasRole } = useUser();
  const { isCollapsed } = useSidebar();

  const isNavItemActive = (href: string) => {
    // For dashboard, we want an exact match. For others, we want to match the parent path.
    return href === '/dashboard' ? pathname === href : pathname.startsWith(href);
  };
  
  const SidebarContent = () => (
     <div className="flex h-full max-h-screen flex-col gap-2">
        <div className={cn(
          "flex h-14 items-center border-b border-sidebar-border px-4 lg:h-[60px]",
          isCollapsed && !isMobile && "justify-center px-2"
        )}>
          <Link href="/" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
            <Shield className="h-6 w-6 text-sidebar-primary" />
            <span className={cn('transition-opacity duration-300', isCollapsed && !isMobile ? 'hidden' : 'opacity-100')}>SGR</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto">
          <TooltipProvider delayDuration={0}>
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navigationItems.map((item) => {
                if (item.roles && !hasRole(item.roles as any)) {
                  return null;
                }
                const isActive = isNavItemActive(item.href);
                
                return (
                  <Link href={item.href} key={item.label}>
                    <Tooltip>
                      <TooltipTrigger className='w-full'>
                         <div
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                            isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground',
                            isCollapsed && !isMobile ? 'justify-center' : ''
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className={cn('transition-all duration-300', isCollapsed && !isMobile ? 'hidden' : 'w-auto opacity-100')}>
                            {item.label}
                          </span>
                        </div>
                      </TooltipTrigger>
                       {isCollapsed && !isMobile && (
                        <TooltipContent side="right">
                          <p>{item.label}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </Link>
                );
              })}
            </nav>
          </TooltipProvider>
        </div>
      </div>
  );

  if (isMobile) {
    return <SidebarContent />;
  }

  return (
    <div className={cn(
        "hidden md:block border-r bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
    )}>
        <SidebarContent />
    </div>
  );
}
