'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Shield, ArrowRight, Search, AlertCircle, FileText } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import type { Control, Kpi, Action } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PermissionButton } from '@/components/auth/permission-button';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    'Implementado': 'default',
    'Implementado com Pendência': 'secondary',
    'Implementação Futura': 'outline',
    'Não Implementado': 'destructive',
};

// Helper function to format date consistently
const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        // Checa se a data é válida
        if (isNaN(date.getTime())) {
            return dateString; // Retorna a string original se a data for inválida
        }
        return new Intl.DateTimeFormat('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'UTC' // Usar UTC para evitar problemas de fuso horário
        }).format(date);
    } catch(e) {
        return dateString; // fallback to original string if format is unexpected
    }
}

export default function ControlsPage() {
  return (
    <ProtectedRoute module="controles" action="view">
      <ControlsContent />
    </ProtectedRoute>
  );
}

function ControlsContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [controls, setControls] = useState<Control[]>([]);
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);

  // ⚡ OTIMIZAÇÃO: Debounce para evitar filtrar a cada tecla (90% menos re-renders)
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Buscar controles
        const controlsResponse = await fetch('/api/controls');
        if (!controlsResponse.ok) {
          throw new Error('Failed to fetch controls');
        }
        const controlsData = await controlsResponse.json();
        setControls(controlsData);

        // Buscar KPIs
        const kpisResponse = await fetch('/api/kpis');
        if (kpisResponse.ok) {
          const kpisData = await kpisResponse.json();
          setKpis(kpisData);
        }

        // Buscar Actions
        const actionsResponse = await fetch('/api/actions');
        if (actionsResponse.ok) {
          const actionsData = await actionsResponse.json();
          setActions(actionsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Função para verificar se um controle é crítico e não implementado
  const isCriticalNotImplemented = (control: Control): boolean => {
    const isCritical = control.criticidade?.toLowerCase().includes('crítico') || 
                       control.criticidade?.toLowerCase().includes('critico') ||
                       control.criticidade === 'Sim'; // Também aceita "Sim" como crítico
    const isNotImplemented = control.status === 'Não Implementado';
    
    // Log para debug (remover após testar)
    if (isCritical || isNotImplemented) {
      console.log('Debug controle:', {
        id: control.id,
        nome: control.nomeControle,
        criticidade: control.criticidade,
        status: control.status,
        isCritical,
        isNotImplemented,
        showButton: isCritical && isNotImplemented
      });
    }
    
    return isCritical && isNotImplemented;
  };

  // Função para verificar se há ações vencidas para um controle
  const hasOverdueActions = (controlId: string): boolean => {
    const controlActions = actions.filter(action => action.controlId === controlId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return controlActions.some(action => {
      if (action.status === 'Concluída') return false;
      const deadline = new Date(action.prazo);
      deadline.setHours(0, 0, 0, 0);
      return deadline < today;
    });
  };

  // Função para obter o status do KPI de um controle
  const getControlKpiStatus = (controlId: string): 'OK' | 'NOK' | 'Sem KPI' => {
    const controlKpis = kpis.filter(kpi => kpi.controlId === controlId);
    
    if (controlKpis.length === 0) {
      return 'Sem KPI';
    }
    
    // Se algum KPI estiver NOK, o controle está NOK
    if (controlKpis.some(kpi => kpi.status === 'NOK')) {
      return 'NOK';
    }
    
    // Se todos estiverem OK, o controle está OK
    return 'OK';
  };

  const getKpiStatusVariant = (status: 'OK' | 'NOK' | 'Sem KPI') => {
    switch (status) {
      case 'OK':
        return 'default';
      case 'NOK':
        return 'destructive';
      case 'Sem KPI':
        return 'outline';
      default:
        return 'secondary';
    }
  };
  
  const filteredControls = controls.filter((control: Control) => {
    const term = debouncedSearchTerm.toLowerCase();
    return Object.values(control).some(value => 
      String(value).toLowerCase().includes(term)
    );
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <Shield />
                    Governança de Controles
                </CardTitle>
                <CardDescription>
                    Visualize, filtre e gerencie todos os controles do sistema.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-grow-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar controles..."
                        className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <PermissionButton 
                  module="controles" 
                  action="create"
                  size="sm" 
                  className="h-9 gap-1" 
                  asChild
                >
                  <Link href="/controls/capture">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Novo Controle
                    </span>
                  </Link>
                </PermissionButton>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome do Controle</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Dono do Controle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>KPI</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredControls.length > 0 ? (
                filteredControls.map(control => {
                  const kpiStatus = getControlKpiStatus(control.id);
                  const showCreateAction = isCriticalNotImplemented(control);
                  const hasOverdue = hasOverdueActions(control.id);
                  
                  return (
                    <TableRow key={control.id} className={hasOverdue ? 'bg-red-50' : ''}>
                      <TableCell className="font-mono">{control.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {control.nomeControle}
                          {hasOverdue && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Ação Vencida
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{control.area}</TableCell>
                      <TableCell>{control.donoControle}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariantMap[control.status] || 'default'}>{control.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getKpiStatusVariant(kpiStatus)}>{kpiStatus}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {showCreateAction && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/actions/capture?controlId=${control.id}&controlName=${encodeURIComponent(control.nomeControle)}`}>
                                <FileText className="h-4 w-4 mr-1" />
                                Criar Ação
                              </Link>
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/controls/${control.id}`}>
                              <ArrowRight className="h-4 w-4" />
                              <span className="sr-only">Ver Detalhes</span>
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center p-8 text-muted-foreground">
                    {searchTerm ? `Nenhum controle encontrado para "${searchTerm}".` : "Nenhum controle encontrado."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
