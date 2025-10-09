'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import type { Kpi, KpiResponsible } from '@/lib/types';
import { ArrowLeft, Upload, Download, FileText, Calendar, User, Plus, X, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
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

export default function KpiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params?.id as string;

  const [kpi, setKpi] = useState<Kpi | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [addingResponsible, setAddingResponsible] = useState(false);
  const [newResponsible, setNewResponsible] = useState<KpiResponsible>({ name: '', email: '' });

  useEffect(() => {
    if (id) {
      fetchKpi();
    }
  }, [id]);

  const fetchKpi = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/kpis/${id}`);
      if (!response.ok) throw new Error('Falha ao carregar KPI');
      const data = await response.json();
      setKpi(data);
    } catch (error) {
      console.error('Erro ao carregar KPI:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o KPI.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadEvidence = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadedBy', 'Sistema'); // TODO: usar usuário logado

      const response = await fetch(`/api/kpis/${id}/evidence`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Falha ao anexar evidência');

      toast({
        title: 'Sucesso',
        description: 'Evidência anexada com sucesso!',
      });

      fetchKpi(); // Recarrega o KPI
    } catch (error) {
      console.error('Erro ao anexar evidência:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível anexar a evidência.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const isOverdue = (nextVerification: string) => {
    const today = new Date();
    const verificationDate = new Date(nextVerification);
    return verificationDate < today;
  };

  const handleAddResponsible = async () => {
    if (!newResponsible.name.trim() || !newResponsible.email.trim()) {
      toast({
        title: 'Atenção',
        description: 'Preencha o nome e e-mail do responsável.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const updatedResponsibles = [...(kpi?.responsibles || []), newResponsible];

      const response = await fetch(`/api/kpis/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responsibles: updatedResponsibles,
        }),
      });

      if (!response.ok) throw new Error('Falha ao adicionar responsável');

      toast({
        title: 'Sucesso',
        description: 'Responsável adicionado com sucesso!',
      });

      setNewResponsible({ name: '', email: '' });
      setAddingResponsible(false);
      fetchKpi(); // Recarrega o KPI
    } catch (error) {
      console.error('Erro ao adicionar responsável:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o responsável.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveResponsible = async (index: number) => {
    try {
      const updatedResponsibles = kpi?.responsibles.filter((_, idx) => idx !== index) || [];

      const response = await fetch(`/api/kpis/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responsibles: updatedResponsibles,
        }),
      });

      if (!response.ok) throw new Error('Falha ao remover responsável');

      toast({
        title: 'Sucesso',
        description: 'Responsável removido com sucesso!',
      });

      fetchKpi(); // Recarrega o KPI
    } catch (error) {
      console.error('Erro ao remover responsável:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o responsável.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteKpi = async () => {
    if (!kpi) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/kpis/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Falha ao excluir KPI');

      toast({
        title: 'Sucesso',
        description: 'KPI excluído com sucesso!',
      });

      // Redireciona para a listagem de KPIs
      router.push('/kpis');
    } catch (error) {
      console.error('Erro ao excluir KPI:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o KPI.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <p className="text-center">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (!kpi) {
    return (
      <Card>
        <CardContent className="p-8">
          <p className="text-center">KPI não encontrado.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Detalhes do KPI: {kpi.id}</CardTitle>
              <CardDescription>{kpi.controlName}</CardDescription>
            </div>
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={deleting}>
                    {deleting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    {deleting ? "Excluindo..." : "Excluir"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza que deseja excluir este KPI?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá permanentemente o KPI "{kpi.id}" e todo o histórico de evidências associado.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteKpi} disabled={deleting}>
                      Sim, excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button variant="outline" asChild disabled={deleting}>
                <Link href="/kpis">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Status</Label>
              <div className="mt-1">
                <Badge variant={kpi.status === 'OK' ? 'default' : 'destructive'}>
                  {kpi.status}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Data de Início da Verificação</Label>
              <p className="mt-1">
                {new Date(kpi.dataInicioVerificacao).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Próxima Verificação</Label>
              <p
                className={`mt-1 ${
                  isOverdue(kpi.dataProximaVerificacao) ? 'text-red-600 font-semibold' : ''
                }`}
              >
                {new Date(kpi.dataProximaVerificacao).toLocaleDateString('pt-BR')}
                {isOverdue(kpi.dataProximaVerificacao) && ' (Vencida)'}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Frequência</Label>
              <p className="mt-1">{kpi.frequenciaDias} dia(s)</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Dono do Controle</Label>
              <p className="mt-1">{kpi.donoControle}</p>
              <p className="text-sm text-muted-foreground">{kpi.emailDonoControle}</p>
            </div>
          </div>

          {/* Responsáveis Adicionais */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm text-muted-foreground">
                Responsáveis Adicionais ({kpi.responsibles?.length || 0})
              </Label>
              {!addingResponsible && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddingResponsible(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Responsável
                </Button>
              )}
            </div>

            {/* Formulário para adicionar responsável */}
            {addingResponsible && (
              <Card className="mb-3">
                <CardContent className="pt-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="resp-name">Nome</Label>
                      <Input
                        id="resp-name"
                        value={newResponsible.name}
                        onChange={(e) =>
                          setNewResponsible({ ...newResponsible, name: e.target.value })
                        }
                        placeholder="Nome do responsável"
                      />
                    </div>
                    <div>
                      <Label htmlFor="resp-email">E-mail</Label>
                      <Input
                        id="resp-email"
                        type="email"
                        value={newResponsible.email}
                        onChange={(e) =>
                          setNewResponsible({ ...newResponsible, email: e.target.value })
                        }
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddResponsible} size="sm">
                      Salvar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAddingResponsible(false);
                        setNewResponsible({ name: '', email: '' });
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de responsáveis */}
            {kpi.responsibles && kpi.responsibles.length > 0 ? (
              <ul className="space-y-2">
                {kpi.responsibles.map((resp, idx) => (
                  <li
                    key={idx}
                    className="text-sm flex items-center justify-between p-2 border rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>
                        {resp.name} <span className="text-muted-foreground">({resp.email})</span>
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveResponsible(idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              !addingResponsible && (
                <p className="text-sm text-muted-foreground mt-2">
                  Nenhum responsável adicional cadastrado.
                </p>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload de Nova Evidência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Anexar Nova Evidência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="evidence-file">Selecione o arquivo</Label>
            <Input
              id="evidence-file"
              type="file"
              accept=".pdf,.xls,.xlsx,.ppt,.pptx,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleUploadEvidence(file);
                }
              }}
              disabled={uploading}
            />
            {uploading && (
              <p className="text-sm text-muted-foreground">Enviando arquivo...</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Evidências */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Histórico de Evidências
          </CardTitle>
          <CardDescription>
            {kpi.evidenceFiles.length} evidência(s) anexada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {kpi.evidenceFiles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma evidência anexada ainda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Data de Upload</TableHead>
                  <TableHead>Enviado Por</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kpi.evidenceFiles
                  .sort(
                    (a, b) =>
                      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
                  )
                  .map((evidence) => (
                    <TableRow key={evidence.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {evidence.fileName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(evidence.uploadedAt).toLocaleString('pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell>{evidence.uploadedBy}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={evidence.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
