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
  LifeBuoy,
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const navigationItems = [
  { href: '/dashboard', icon: AreaChart, label: 'Painéis' },
  { href: '/risks', icon: Siren, label: 'Captura de Riscos' },
  { href: '/controls', icon: Shield, label: 'Governança de Controles' },
  { href: "/kpis", icon: GanttChartSquare, label: "Gestão de KPI's" },
  { href: '/escalation', icon: Rss, label: 'Escalonamento' },
  { href: '/bowtie', icon: GitFork, label: 'Visualização Bowtie' },
  { href: '/reports/generate', icon: Bot, label: 'Gerador de Relatório IA' },
  { href: '/improvement', icon: Sparkles, label: 'Melhoria Contínua' },
  { href: '/administration', icon: Users, label: 'Administração', roles: ['admin'] },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { hasRole } = useUser();

  const isNavItemActive = (href: string) => {
    return pathname.startsWith(href);
  };

  return (
    <div className="hidden border-r bg-card md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Shield className="h-6 w-6 text-primary" />
            <span className="">SGR: Sistema de Gestão de Riscos</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navigationItems.map((item) => {
              if (item.roles && !hasRole(item.roles as any)) {
                return null;
              }
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    isNavItemActive(item.href)
                      ? 'bg-muted text-primary'
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto p-4">
           <Button size="sm" className="w-full">
              Ajuda & Suporte
            </Button>
        </div>
      </div>
    </div>
  );
}
