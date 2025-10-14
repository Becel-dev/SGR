'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { AlertCircle, Search, Eye, FileText, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import type { Action } from '@/lib/types';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PermissionButton } from '@/components/auth/permission-button';
import { usePermission } from '@/hooks/use-permission';

export default function ActionsPage() {
  return (
    <ProtectedRoute module="acoes" action="view">
      <ActionsContent />
    </ProtectedRoute>
  );
}

function ActionsContent() {
  // ⚡ OTIMIZAÇÃO: Carregar permissões UMA VEZ no componente pai
  const canViewActions = usePermission('acoes', 'view');
  
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    try {
      const res = await fetch('/api/actions');
      if (res.ok) {
        const data = await res.json();
        setActions(data);
      }
    } catch (error) {
      console.error('Erro ao buscar ações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar status baseado no prazo
  const getActionStatus = (action: Action): Action['status'] => {
    if (action.status === 'Concluída') return 'Concluída';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(action.prazo);
    deadline.setHours(0, 0, 0, 0);
    
    if (deadline < today) {
      return 'Vencida';
    }
    
    return action.status;
  };

  const filteredActions = actions
    .map(action => ({ ...action, status: getActionStatus(action) }))
    .filter(action =>
      action.controlName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getStatusBadge = (status: Action['status']) => {
    const statusConfig = {
      'Pendente': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'Em Andamento': { color: 'bg-blue-100 text-blue-800', icon: FileText },
      'Concluída': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'Vencida': { color: 'bg-red-100 text-red-800', icon: AlertCircle },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getCriticidadeBadge = (criticidade: number) => {
    if (criticidade >= 8) {
      return <Badge variant="destructive">Crítica ({criticidade})</Badge>;
    } else if (criticidade >= 5) {
      return <Badge className="bg-orange-100 text-orange-800">Média ({criticidade})</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Baixa ({criticidade})</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando ações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Controle de Ações
          </CardTitle>
          <CardDescription>
            Gerenciamento de ações corretivas para controles críticos não implementados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de pesquisa */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por controle, responsável ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{filteredActions.filter(a => a.status === 'Pendente').length}</div>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">{filteredActions.filter(a => a.status === 'Em Andamento').length}</div>
                <p className="text-xs text-muted-foreground">Em Andamento</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">{filteredActions.filter(a => a.status === 'Vencida').length}</div>
                <p className="text-xs text-muted-foreground">Vencidas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{filteredActions.filter(a => a.status === 'Concluída').length}</div>
                <p className="text-xs text-muted-foreground">Concluídas</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de ações */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Controle</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Criticidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor Estimado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma ação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActions.map((action) => {
                    const isOverdue = action.status === 'Vencida';
                    return (
                      <TableRow key={action.id} className={isOverdue ? 'bg-red-50' : ''}>
                        <TableCell className="font-medium">
                          {action.controlName}
                          {isOverdue && (
                            <AlertCircle className="inline-block ml-2 h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{action.responsavel}</div>
                            <div className="text-xs text-muted-foreground">{action.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(action.prazo).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>{getCriticidadeBadge(action.criticidadeAcao)}</TableCell>
                        <TableCell>{getStatusBadge(action.status)}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(action.valorEstimado)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            asChild
                            disabled={!canViewActions.allowed}
                          >
                            <Link href={`/actions/${action.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
