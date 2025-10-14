'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Rss, Settings, Search, Plus, Eye, Trash2, Power, PowerOff } from 'lucide-react';
import type { Control, EscalationConfig } from '@/lib/types';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PermissionButton } from '@/components/auth/permission-button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from '@/components/ui/switch';

type ControlWithEscalation = Control & {
  escalation?: EscalationConfig;
};

export default function EscalationPage() {
  return (
    <ProtectedRoute module="escalation" action="view">
      <EscalationContent />
    </ProtectedRoute>
  );
}

function EscalationContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [controls, setControls] = useState<ControlWithEscalation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [controlsRes, escalationsRes] = await Promise.all([
        fetch('/api/controls'),
        fetch('/api/escalation')
      ]);

      if (!controlsRes.ok || !escalationsRes.ok) {
        throw new Error('Falha ao carregar dados');
      }

      const controlsData: Control[] = await controlsRes.json();
      const escalationsData: EscalationConfig[] = await escalationsRes.json();

      // Mapear escalations aos controles
      const controlsWithEscalation = controlsData.map(control => {
        const escalation = escalationsData.find(esc => esc.controlId === control.id);
        return { ...control, escalation };
      });

      setControls(controlsWithEscalation);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleEnabled = async (escalation: EscalationConfig) => {
    try {
      const updated = { ...escalation, enabled: !escalation.enabled };
      const response = await fetch(`/api/escalation/${escalation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      if (!response.ok) throw new Error('Falha ao atualizar');

      toast({
        title: "Sucesso",
        description: `Escalonamento ${updated.enabled ? 'ativado' : 'desativado'} com sucesso.`,
      });

      fetchData();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o escalonamento.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (escalationId: string) => {
    try {
      const response = await fetch(`/api/escalation/${escalationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Falha ao excluir');

      toast({
        title: "Sucesso",
        description: "Escalonamento excluído com sucesso.",
      });

      fetchData();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o escalonamento.",
        variant: "destructive",
      });
    }
  };

  const filteredControls = controls.filter(control =>
    control.nomeControle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    control.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    control.donoControle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Rss />
              Escalonamentos de Controles
            </CardTitle>
            <CardDescription>
              Configure regras de escalonamento por % fora da meta e dias vencidos.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar controle..."
                className="pl-8 w-[300px]"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => router.push('/escalation/capture')}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Escalonamento
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center p-8">Carregando...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Controle</TableHead>
                  <TableHead>Dono do Controle</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Escalonamento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredControls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center p-8 text-muted-foreground">
                      Nenhum controle encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredControls.map(control => (
                    <TableRow key={control.id}>
                      <TableCell className="font-medium">{control.nomeControle}</TableCell>
                      <TableCell>{control.donoControle}</TableCell>
                      <TableCell>{control.categoria}</TableCell>
                      <TableCell>{control.status}</TableCell>
                      <TableCell>
                        {control.escalation ? (
                          <div className="flex items-center gap-2">
                            <Badge variant={control.escalation.enabled ? "default" : "secondary"}>
                              {control.escalation.enabled ? "Ativo" : "Inativo"}
                            </Badge>
                            <Switch
                              checked={control.escalation.enabled}
                              onCheckedChange={() => handleToggleEnabled(control.escalation!)}
                            />
                          </div>
                        ) : (
                          <Badge variant="outline">Não configurado</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {control.escalation ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push(`/escalation/${control.escalation!.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push(`/escalation/capture?id=${control.escalation!.id}`)}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir o escalonamento do controle &quot;{control.nomeControle}&quot;?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(control.escalation!.id)}
                                      className="bg-destructive hover:bg-destructive/90"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/escalation/capture?controlId=${control.id}&controlName=${encodeURIComponent(control.nomeControle)}`)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Configurar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
