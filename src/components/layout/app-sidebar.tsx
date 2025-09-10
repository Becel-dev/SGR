

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AreaChart,
  ChevronDown,
  Shield,
  FileText,
  GanttChartSquare,
  Siren,
  GitFork,
  Bot,
  Sparkles,
  Users,
  Settings,
  Rss,
  LifeBuoy,
} from 'lucide-react';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarTrigger,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useUser } from '@/hooks/use-user';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

const navigationItems = [
  { href: '/dashboard', icon: AreaChart, label: 'Painéis', badge: '' },
  { href: '/risks', icon: Siren, label: 'Captura de Riscos', badge: '' },
  { href: '/controls', icon: Shield, label: 'Governança de Controles', badge: '' },
  { href: "/kpis", icon: GanttChartSquare, label: "Gestão de KPI's", badge: '' },
  { href: '/escalation', icon: Rss, label: 'Escalonamento', badge: '' },
  { href: '/bowtie', icon: GitFork, label: 'Visualização Bowtie', badge: '' },
  { href: '/reports/generate', icon: Bot, label: 'Gerador de Relatório IA', badge: '' },
  { href: '/improvement', icon: Sparkles, label: 'Melhoria Contínua', badge: '' },
  { href: '/administration', icon: Users, label: 'Administração', roles: ['admin'] },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, hasRole } = useUser();

  const isNavItemActive = (href: string) => {
    return pathname.startsWith(href);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center justify-between p-2">
        <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-sidebar-primary" />
            <span className="text-xl font-bold text-primary-foreground group-data-[collapsible=icon]:hidden">
              SGR: Sistema de Gestão de Riscos
            </span>
        </div>
        <SidebarTrigger className="md:hidden" />
      </SidebarHeader>
      <SidebarRail />
      <Separator className="my-2" />
      <SidebarContent>
        <SidebarMenu>
          {navigationItems.map((item) => {
            if (item.roles && !hasRole(item.roles as any)) {
              return null;
            }
            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={isNavItemActive(item.href)}
                  icon={item.icon}
                  className="w-full justify-start"
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    {item.label}
                    {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton icon={Settings} tooltip="Configurações">Configurações</SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton icon={LifeBuoy} tooltip="Ajuda">Ajuda</SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
