'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Shield,
  GanttChartSquare,
  Siren,
  GitFork,
  Bot,
  Sparkles,
  Users,
  Settings,
  Rss,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  FileText,
  LayoutDashboard,
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/hooks/use-sidebar';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';


// Estrutura de navegação atualizada com submenu para Administração
const navigationItems = [
  { href: '/painel', icon: LayoutDashboard, label: 'Painel' },
  { href: '/identification', icon: Lightbulb, label: 'Identificação de Risco' },
  { href: '/analysis', icon: Siren, label: 'Análise de Riscos' },
  { href: '/controls', icon: Shield, label: 'Governança de Controles' },
  { href: "/kpis", icon: GanttChartSquare, label: "Gestão de KPI's" },
  { href: '/actions', icon: FileText, label: 'Controle de Ações' },
  { href: '/escalation', icon: Rss, label: 'Escalonamento' },
  { href: '/bowtie', icon: GitFork, label: 'Visualização Bowtie' },
  { href: '/reports/generate', icon: Bot, label: 'Gerador de Relatório IA' },
];

// Item de Administração com submenu
const administrationItem = {
  href: '/administration',
  icon: Users,
  label: 'Administração',
  roles: ['admin'],
  subItems: [
    { href: '/administration/parameters', icon: Settings, label: 'Parâmetros' },
    { href: '/administration/access-profiles', icon: Shield, label: 'Perfil de Acesso' },
    { href: '/administration/access-control', icon: Users, label: 'Controle de Acesso' },
  ]
};

export function AppSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const { hasRole } = useUser();
  const { isCollapsed } = useSidebar();
  const [administrationExpanded, setAdministrationExpanded] = useState(
    pathname?.startsWith('/administration') || false
  );

  const isNavItemActive = (href: string) => {
    if (!pathname) return false;
    // For dashboard, we want an exact match. For others, we want to match the parent path.
    return href === '/dashboard' ? pathname === href : pathname.startsWith(href);
  };

  const isAdministrationSectionActive = () => {
    return pathname?.startsWith('/administration') || false;
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
              {/* Itens de navegação regulares */}
              {navigationItems.map((item) => {
                const isActive = isNavItemActive(item.href);
                
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
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
                      </Link>
                    </TooltipTrigger>
                    {isCollapsed && !isMobile && (
                      <TooltipContent side="right">
                        <p>{item.label}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}

              {/* Item de Administração com Acordeão */}
              {hasRole(['admin']) && (
                <div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        onClick={() => setAdministrationExpanded(!administrationExpanded)}
                        className={cn(
                          'w-full flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                          isAdministrationSectionActive() ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground',
                          isCollapsed && !isMobile ? 'justify-center' : 'justify-between'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <administrationItem.icon className="h-4 w-4" />
                          <span className={cn('transition-all duration-300', isCollapsed && !isMobile ? 'hidden' : 'w-auto opacity-100')}>
                            {administrationItem.label}
                          </span>
                        </div>
                        {!isCollapsed && !isMobile && (
                          <div className="transition-transform duration-200">
                            {administrationExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        )}
                      </Button>
                    </TooltipTrigger>
                    {isCollapsed && !isMobile && (
                      <TooltipContent side="right">
                        <p>{administrationItem.label}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>

                  {/* Submenu */}
                  {administrationExpanded && !isCollapsed && (
                    <div className="ml-6 mt-1 space-y-1">
                      {administrationItem.subItems.map((subItem) => {
                        const isSubItemActive = isNavItemActive(subItem.href);
                        
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                              isSubItemActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground'
                            )}
                          >
                            <subItem.icon className="h-4 w-4" />
                            <span>{subItem.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
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

