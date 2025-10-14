'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import {
  AlertCircle,
  ArrowLeft,
  Upload,
  FileText,
  Clock,
  CheckCircle,
  Download,
  Loader2,
  User,
  Mail,
  Calendar,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';
import type { Action } from '@/lib/types';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PermissionButton } from '@/components/auth/permission-button';
import { usePermission } from '@/hooks/use-permission';

export default function ActionDetailPage() {
  return (
    <ProtectedRoute module="acoes" action="view">
      <ActionDetailContent />
    </ProtectedRoute>
  );
}

function ActionDetailContent() {
  const params = useParams();
  const router = useRouter();
  const actionId = params?.id as string;
  const canEditActions = usePermission('acoes', 'edit');

  const [action, setAction] = useState<Action | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (actionId) {
      fetchAction();
    }
  }, [actionId]);

  const fetchAction = async () => {
    try {
      const res = await fetch(`/api/actions/${actionId}`);
      if (res.ok) {
        const data = await res.json();
        setAction(data);
      } else {
        toast({
          title: 'Erro',
          description: 'Ação não encontrada',
          variant: 'destructive',
        });
        router.push('/actions');
      }
    } catch (error) {
      console.error('Erro ao buscar ação:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao buscar ação',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !action) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadedBy', 'Sistema'); // Substituir pelo usuário logado

      const res = await fetch(`/api/actions/${actionId}/evidence`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        toast({
          title: 'Sucesso!',
          description: 'Evidência anexada com sucesso. O controle foi atualizado para Implementado.',
        });
        setAction(data.action);
      } else {
        const error = await res.json();
        toast({
          title: 'Erro',
          description: error.error || 'Falha ao anexar evidência',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao anexar evidência',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      // Limpar input
      event.target.value = '';
    }
  };

  const getActionStatus = (): Action['status'] => {
    if (!action) return 'Pendente';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando ação...</p>
        </div>
      </div>
    );
  }

  if (!action) {
    return null;
  }

  const currentStatus = getActionStatus();
  const isOverdue = currentStatus === 'Vencida';

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/actions">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Detalhes da Ação</h1>
            <p className="text-muted-foreground">ID: {action.id}</p>
          </div>
        </div>
        {getStatusBadge(currentStatus)}
      </div>

      {/* Alert para ações vencidas */}
      {isOverdue && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Ação Vencida</p>
                <p className="text-sm">Esta ação ultrapassou o prazo estabelecido.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações principais */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Ação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Controle Associado</Label>
                <p className="font-medium">{action.controlName}</p>
                <p className="text-sm text-muted-foreground">ID: {action.controlId}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Responsável
                  </Label>
                  <p className="font-medium">{action.responsavel}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <p className="font-medium">{action.email}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Prazo
                  </Label>
                  <p className="font-medium">
                    {new Date(action.prazo).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Criticidade</Label>
                  <p className="font-medium">{action.criticidadeAcao}/10</p>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Valor Estimado
                </Label>
                <p className="font-medium text-lg">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(action.valorEstimado)}
                </p>
              </div>

              <Separator />

              <div>
                <Label className="text-muted-foreground">Descrição da Ação</Label>
                <p className="whitespace-pre-wrap">{action.descricao}</p>
              </div>

              <Separator />

              <div>
                <Label className="text-muted-foreground">Plano de Contingência</Label>
                <p className="whitespace-pre-wrap">{action.contingencia || 'Não informado'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Evidências */}
          <Card>
            <CardHeader>
              <CardTitle>Evidências de Execução</CardTitle>
              <CardDescription>
                Anexe evidências da execução da ação. Ao anexar a primeira evidência, o status do controle será atualizado para "Implementado".
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload de evidência */}
              {currentStatus !== 'Concluída' && (
                <div className={!canEditActions.allowed ? 'opacity-50 pointer-events-none' : ''}>
                  {!canEditActions.allowed && (
                    <p className="text-sm text-red-500 mb-2">
                      Você não tem permissão para anexar evidências
                    </p>
                  )}
                  <Label htmlFor="evidence-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <p className="text-sm text-muted-foreground">Enviando evidência...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm font-medium">Clique para anexar evidência</p>
                          <p className="text-xs text-muted-foreground">PDF, imagens, documentos</p>
                        </div>
                      )}
                    </div>
                    <input
                      id="evidence-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploading || !canEditActions.allowed}
                    />
                  </Label>
                </div>
              )}

              {/* Lista de evidências */}
              {action.evidences.length > 0 && (
                <div className="space-y-2">
                  <Label>Evidências Anexadas ({action.evidences.length})</Label>
                  <div className="space-y-2">
                    {action.evidences.map((evidence) => (
                      <div
                        key={evidence.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{evidence.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              Enviado em {new Date(evidence.uploadedAt).toLocaleString('pt-BR')} por {evidence.uploadedBy}
                            </p>
                          </div>
                        </div>
                        <PermissionButton 
                          module="acoes" 
                          action="view" 
                          variant="ghost" 
                          size="sm" 
                          asChild
                        >
                          <a href={evidence.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </PermissionButton>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {action.evidences.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  Nenhuma evidência anexada ainda
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Auditoria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <Label className="text-muted-foreground">Criado em</Label>
                <p>{new Date(action.createdAt).toLocaleString('pt-BR')}</p>
                <p className="text-xs text-muted-foreground">por {action.createdBy}</p>
              </div>
              <Separator />
              <div>
                <Label className="text-muted-foreground">Última atualização</Label>
                <p>{new Date(action.updatedAt).toLocaleString('pt-BR')}</p>
                <p className="text-xs text-muted-foreground">por {action.updatedBy}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
