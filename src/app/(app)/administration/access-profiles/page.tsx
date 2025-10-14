'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Plus, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { getAllAccessProfiles, deleteAccessProfile } from '@/lib/azure-table-storage';
import type { AccessProfile } from '@/lib/types';

export default function AccessProfilesPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<AccessProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<AccessProfile | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await getAllAccessProfiles();
      setProfiles(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar perfis',
        description: 'Não foi possível carregar os perfis de acesso.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!profileToDelete) return;

    try {
      await deleteAccessProfile(profileToDelete.id);
      toast({
        title: 'Perfil excluído',
        description: 'O perfil de acesso foi excluído com sucesso.',
      });
      loadProfiles();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o perfil de acesso.',
      });
    } finally {
      setDeleteDialogOpen(false);
      setProfileToDelete(null);
    }
  };

  const openDeleteDialog = (profile: AccessProfile) => {
    setProfileToDelete(profile);
    setDeleteDialogOpen(true);
  };

  const countPermissions = (profile: AccessProfile) => {
    let total = 0;
    profile.permissions.forEach(p => {
      if (p.actions.view) total++;
      if (p.actions.create) total++;
      if (p.actions.edit) total++;
      if (p.actions.delete) total++;
      if (p.actions.export) total++;
    });
    return total;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Perfis de Acesso
              </CardTitle>
              <CardDescription>
                Gerencie os perfis de acesso e permissões do sistema
              </CardDescription>
            </div>
            <Button onClick={() => router.push('/administration/access-profiles/capture')}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Perfil
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Carregando perfis...</div>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhum perfil de acesso cadastrado
              </p>
              <Button onClick={() => router.push('/administration/access-profiles/capture')}>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeiro perfil
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Perfil</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Permissões</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado por</TableHead>
                  <TableHead>Última alteração</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {profile.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {countPermissions(profile)} permissões
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={profile.isActive ? 'default' : 'secondary'}>
                        {profile.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {profile.createdBy}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div>{profile.updatedBy}</div>
                      <div className="text-xs">
                        {new Date(profile.updatedAt).toLocaleString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/administration/access-profiles/capture?id=${profile.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(profile)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
              Tem certeza que deseja excluir o perfil "{profileToDelete?.name}"?
              Esta ação não pode ser desfeita.
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
