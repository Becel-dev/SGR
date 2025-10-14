'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { Kpi } from '@/lib/types';
import Link from 'next/link';
import { Search, FileText, Upload, Eye, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PermissionButton } from '@/components/auth/permission-button';
import { usePermission } from '@/hooks/use-permission';

export default function KpisPage() {
  return (
    <ProtectedRoute module="kpis" action="view">
      <KpisContent />
    </ProtectedRoute>
  );
}

function KpisContent() {
  const { toast } = useToast();
  
  // ⚡ OTIMIZAÇÃO: Carregar permissões UMA VEZ no componente pai
  const canViewKpis = usePermission('kpis', 'view');
  const canEditKpis = usePermission('kpis', 'edit');
  const canDeleteKpis = usePermission('kpis', 'delete');
  
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [filteredKpis, setFilteredKpis] = useState<Kpi[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadingKpiId, setUploadingKpiId] = useState<string | null>(null);
  const [deletingKpiId, setDeletingKpiId] = useState<string | null>(null);

  useEffect(() => {
    fetchKpis();
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = kpis.filter(
        (kpi) =>
          kpi.controlName.toLowerCase().includes(search.toLowerCase()) ||
          kpi.donoControle.toLowerCase().includes(search.toLowerCase()) ||
          kpi.id.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredKpis(filtered);
    } else {
      setFilteredKpis(kpis);
    }
  }, [search, kpis]);

  const fetchKpis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/kpis');
      if (!response.ok) throw new Error('Falha ao carregar KPIs');
      const data = await response.json();
      setKpis(data);
      setFilteredKpis(data);
    } catch (error) {
      console.error('Erro ao carregar KPIs:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os KPIs.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadEvidence = async (kpiId: string, file: File) => {
    setUploadingKpiId(kpiId);
    try {
      console.log('[KPI Page] Iniciando upload de evidência para KPI:', kpiId);
      console.log('[KPI Page] Arquivo:', file.name, 'Tamanho:', file.size, 'bytes');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadedBy', 'Sistema'); // TODO: usar usuário logado

      const response = await fetch(`/api/kpis/${kpiId}/evidence`, {
        method: 'POST',
        body: formData,
      });

      console.log('[KPI Page] Resposta da API:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[KPI Page] Erro na resposta:', errorData);
        throw new Error(errorData.details || errorData.error || 'Falha ao anexar evidência');
      }

      const result = await response.json();
      console.log('[KPI Page] Upload concluído:', result);

      toast({
        title: 'Sucesso',
        description: 'Evidência anexada com sucesso!',
      });

      fetchKpis(); // Recarrega a lista
    } catch (error) {
      console.error('[KPI Page] Erro ao anexar evidência:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Não foi possível anexar a evidência.',
        variant: 'destructive',
      });
    } finally {
      setUploadingKpiId(null);
    }
  };

  const handleDeleteKpi = async (kpiId: string, kpiName: string) => {
    setDeletingKpiId(kpiId);
    try {
      const response = await fetch(`/api/kpis/${kpiId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Falha ao excluir KPI');

      toast({
        title: 'Sucesso',
        description: `KPI "${kpiName}" excluído com sucesso!`,
      });

      fetchKpis(); // Recarrega a lista
    } catch (error) {
      console.error('Erro ao excluir KPI:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o KPI.',
        variant: 'destructive',
      });
    } finally {
      setDeletingKpiId(null);
    }
  };

  const isOverdue = (nextVerification: string) => {
    const today = new Date();
    const verificationDate = new Date(nextVerification);
    return verificationDate < today;
  };

  const getStatusBadge = (status: 'OK' | 'NOK') => {
    return (
      <Badge variant={status === 'OK' ? 'default' : 'destructive'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Gestão de KPIs</CardTitle>
              <CardDescription>
                Acompanhamento de indicadores de desempenho dos controles
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Busca */}
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por controle, responsável ou ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {/* Tabela */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID KPI</TableHead>
                    <TableHead>Controle</TableHead>
                    <TableHead>Dono do Controle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Próxima Verificação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : filteredKpis.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Nenhum KPI encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredKpis.map((kpi) => (
                      <TableRow
                        key={kpi.id}
                        className={isOverdue(kpi.dataProximaVerificacao) ? 'bg-red-50' : ''}
                      >
                        <TableCell className="font-medium">{kpi.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{kpi.controlName}</span>
                            <span className="text-xs text-muted-foreground">
                              ID: {kpi.controlId}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{kpi.donoControle}</span>
                            <span className="text-xs text-muted-foreground">
                              {kpi.emailDonoControle}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(kpi.status)}</TableCell>
                        <TableCell>
                          <span
                            className={
                              isOverdue(kpi.dataProximaVerificacao)
                                ? 'text-red-600 font-semibold'
                                : ''
                            }
                          >
                            {new Date(kpi.dataProximaVerificacao).toLocaleDateString('pt-BR')}
                            {isOverdue(kpi.dataProximaVerificacao) && ' (Vencida)'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Atalho para anexar evidência */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  disabled={!canEditKpis.allowed}
                                >
                                  <Upload className="h-4 w-4 mr-1" />
                                  Anexar
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Anexar Evidência</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Controle: {kpi.controlName}</Label>
                                  </div>
                                  <div>
                                    <Label htmlFor={`file-${kpi.id}`}>
                                      Selecione o arquivo
                                    </Label>
                                    <Input
                                      id={`file-${kpi.id}`}
                                      type="file"
                                      accept=".pdf,.xls,.xlsx,.ppt,.pptx,.doc,.docx"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleUploadEvidence(kpi.id, file);
                                        }
                                      }}
                                      disabled={uploadingKpiId === kpi.id}
                                    />
                                  </div>
                                  {uploadingKpiId === kpi.id && (
                                    <p className="text-sm text-muted-foreground">
                                      Enviando arquivo...
                                    </p>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>

                            {/* Ver detalhes */}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              asChild
                              disabled={!canViewKpis.allowed}
                            >
                              <Link href={`/kpis/${kpi.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Link>
                            </Button>

                            {/* Excluir KPI */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  disabled={deletingKpiId === kpi.id || !canDeleteKpis.allowed}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir KPI?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir o KPI "{kpi.id}" do controle "{kpi.controlName}"?
                                    Esta ação não pode ser desfeita e todo o histórico de evidências será perdido.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel disabled={deletingKpiId === kpi.id}>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteKpi(kpi.id, kpi.controlName)}
                                    disabled={deletingKpiId === kpi.id}
                                  >
                                    Sim, excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
