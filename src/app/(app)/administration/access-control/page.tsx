'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Pencil, Trash2, AlertCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { getAllUserAccessControls, deleteUserAccessControl } from '@/lib/azure-table-storage';
import type { UserAccessControl } from '@/lib/types';

export default function AccessControlPage() {
  const router = useRouter();
  const [controls, setControls] = useState<UserAccessControl[]>([]);
  const [filteredControls, setFilteredControls] = useState<UserAccessControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [controlToDelete, setControlToDelete] = useState<UserAccessControl | null>(null);

  useEffect(() => {
    loadControls();
  }, []);

  useEffect(() => {
    // Filtrar controles quando o termo de busca mudar
    if (searchTerm.trim() === '') {
      setFilteredControls(controls);
    } else {
      const filtered = controls.filter(
        (control) =>
          control.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          control.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          control.profileName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredControls(filtered);
    }
  }, [searchTerm, controls]);

  const loadControls = async () => {
    try {
      setLoading(true);
      const data = await getAllUserAccessControls();
      setControls(data);
      setFilteredControls(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar controles',
        description: 'Não foi possível carregar os controles de acesso.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!controlToDelete) return;

    try {
      await deleteUserAccessControl(controlToDelete.id);
      toast({
        title: 'Controle excluído',
        description: 'O controle de acesso foi excluído com sucesso.',
      });
      loadControls();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o controle de acesso.',
      });
    } finally {
      setDeleteDialogOpen(false);
      setControlToDelete(null);
    }
  };

  const openDeleteDialog = (control: UserAccessControl) => {
    setControlToDelete(control);
    setDeleteDialogOpen(true);
  };

  const isAccessExpired = (control: UserAccessControl): boolean => {
    if (!control.endDate) return false;
    return new Date(control.endDate) < new Date();
  };

  const getAccessStatus = (control: UserAccessControl): { label: string; variant: 'default' | 'secondary' | 'destructive' } => {
    if (!control.isActive) {
      return { label: 'Inativo', variant: 'secondary' };
    }
    if (isAccessExpired(control)) {
      return { label: 'Expirado', variant: 'destructive' };
    }
    return { label: 'Ativo', variant: 'default' };
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                Controle de Acesso
              </CardTitle>
              <CardDescription>
                Gerencie o vínculo de usuários do EntraID aos perfis de acesso
              </CardDescription>
            </div>
            <Button onClick={() => router.push('/administration/access-control/capture')}>
              <Plus className="h-4 w-4 mr-2" />
              Vincular Usuário
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Barra de busca */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuário, email ou perfil..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Carregando controles de acesso...</div>
            </div>
          ) : filteredControls.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Nenhum controle encontrado com esse critério' : 'Nenhum controle de acesso cadastrado'}
              </p>
              {!searchTerm && (
                <Button onClick={() => router.push('/administration/access-control/capture')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Vincular primeiro usuário
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Perfil de Acesso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Última alteração</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredControls.map((control) => {
                  const status = getAccessStatus(control);
                  return (
                    <TableRow key={control.id}>
                      <TableCell className="font-medium">{control.userName}</TableCell>
                      <TableCell>{control.userEmail}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{control.profileName}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {control.startDate && (
                          <div>Início: {new Date(control.startDate).toLocaleDateString('pt-BR')}</div>
                        )}
                        {control.endDate && (
                          <div>Término: {new Date(control.endDate).toLocaleDateString('pt-BR')}</div>
                        )}
                        {!control.startDate && !control.endDate && '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div>{control.updatedBy}</div>
                        <div className="text-xs">
                          {new Date(control.updatedAt).toLocaleString('pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/administration/access-control/capture?id=${control.id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(control)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o acesso de "{controlToDelete?.userName}"?
              O usuário perderá todas as permissões associadas ao perfil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
