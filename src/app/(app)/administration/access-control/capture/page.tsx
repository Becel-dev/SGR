'use client';

import { useState, useEffect } from 'react';
import { useHideDocumentScrollbar } from '@/hooks/use-hide-document-scrollbar';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, Save, ArrowLeft, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { 
  getUserAccessControlById, 
  addOrUpdateUserAccessControl,
  getAllAccessProfiles 
} from '@/lib/azure-table-storage';
import { useAuthUser } from '@/hooks/use-auth';
import type { UserAccessControl, AccessProfile, EntraIdUser } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function AccessControlCapturePage() {
  useHideDocumentScrollbar();
  const searchParams = useSearchParams();
  const controlId = searchParams?.get('id') || null;
  
  return (
    <ProtectedRoute module="controle-acesso" action={controlId ? 'edit' : 'create'}>
      <AccessControlCaptureContent />
    </ProtectedRoute>
  );
}

function AccessControlCaptureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const controlId = searchParams?.get('id') || null;
  const isEditing = !!controlId;
  const authUser = useAuthUser();

  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<AccessProfile[]>([]);
  const [entraIdUsers, setEntraIdUsers] = useState<EntraIdUser[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  // Form fields
  const [selectedUser, setSelectedUser] = useState<EntraIdUser | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadProfiles();
    if (isEditing && controlId) {
      loadControl(controlId);
    }
  }, [controlId, isEditing]);

  const loadProfiles = async () => {
    try {
      const data = await getAllAccessProfiles();
      // Filtrar apenas perfis ativos
      setProfiles(data.filter(p => p.isActive));
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar perfis',
        description: 'Não foi possível carregar os perfis de acesso.',
      });
    }
  };

  const loadControl = async (id: string) => {
    try {
      setLoading(true);
      const control = await getUserAccessControlById(id);
      if (control) {
        // Simular o usuário selecionado
        setSelectedUser({
          id: control.userId,
          displayName: control.userName,
          mail: control.userEmail,
          userPrincipalName: control.userEmail,
        });
        setSelectedProfileId(control.profileId);
        setIsActive(control.isActive);
        setStartDate(control.startDate || '');
        setEndDate(control.endDate || '');
      } else {
        toast({
          variant: 'destructive',
          title: 'Controle não encontrado',
          description: 'O controle de acesso não foi encontrado.',
        });
        router.push('/administration/access-control');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar controle',
        description: 'Não foi possível carregar o controle de acesso.',
      });
    } finally {
      setLoading(false);
    }
  };

  const searchEntraIdUsers = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setEntraIdUsers([]);
      return;
    }

    try {
      setSearchingUsers(true);
      const response = await fetch(`/api/entraid/users?search=${encodeURIComponent(searchTerm)}&top=20`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar usuários');
      }

      const data = await response.json();
      setEntraIdUsers(data.users || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao buscar usuários',
        description: error instanceof Error ? error.message : 'Não foi possível buscar usuários do EntraID.',
      });
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (authUser.isLoading) {
      toast({
        variant: 'destructive',
        title: 'Aguarde',
        description: 'Aguardando autenticação carregar. Tente novamente em alguns segundos.',
      });
      return;
    }

    if (!selectedUser) {
      toast({
        variant: 'destructive',
        title: 'Usuário obrigatório',
        description: 'Por favor, selecione um usuário do EntraID.',
      });
      return;
    }

    if (!selectedProfileId) {
      toast({
        variant: 'destructive',
        title: 'Perfil obrigatório',
        description: 'Por favor, selecione um perfil de acesso.',
      });
      return;
    }

    // Validar datas
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast({
        variant: 'destructive',
        title: 'Datas inválidas',
        description: 'A data de término deve ser posterior à data de início.',
      });
      return;
    }

    try {
      setLoading(true);
      const now = new Date().toISOString();
      const userName = `${authUser.name} (${authUser.email})`;

      const selectedProfile = profiles.find(p => p.id === selectedProfileId);
      if (!selectedProfile) {
        throw new Error('Perfil não encontrado');
      }

      const controlData: UserAccessControl = {
        id: controlId || `${Date.now()}${Math.random().toString(36).substring(2, 9)}`,
        userId: selectedUser.id,
        userName: selectedUser.displayName,
        userEmail: selectedUser.mail || selectedUser.userPrincipalName,
        profileId: selectedProfileId,
        profileName: selectedProfile.name,
        isActive,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        updatedBy: userName,
        updatedAt: now,
        createdBy: isEditing ? (await getUserAccessControlById(controlId!))?.createdBy || userName : userName,
        createdAt: isEditing ? (await getUserAccessControlById(controlId!))?.createdAt || now : now,
      };

      await addOrUpdateUserAccessControl(controlData);

      toast({
        title: 'Sucesso!',
        description: `Controle de acesso ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso.`,
      });

      router.push('/administration/access-control');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o controle de acesso.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Carregando controle...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            {isEditing ? 'Editar Controle de Acesso' : 'Novo Controle de Acesso'}
          </h1>
          <p className="text-muted-foreground">
            Vincule um usuário do EntraID a um perfil de acesso
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Vínculo</CardTitle>
            <CardDescription>
              Selecione o usuário e o perfil de acesso a ser vinculado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Busca de usuário do EntraID */}
            <div className="space-y-2">
              <Label>Usuário do EntraID *</Label>
              {isEditing && selectedUser ? (
                <div className="p-3 border rounded-md bg-muted">
                  <div className="font-medium">{selectedUser.displayName}</div>
                  <div className="text-sm text-muted-foreground">{selectedUser.mail || selectedUser.userPrincipalName}</div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Digite o nome ou email do usuário..."
                      className="pl-8"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length >= 2) {
                          searchEntraIdUsers(value);
                        } else {
                          setEntraIdUsers([]);
                        }
                      }}
                    />
                  </div>
                  
                  {searchingUsers && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">Buscando usuários...</span>
                    </div>
                  )}
                  
                  {!searchingUsers && entraIdUsers.length > 0 && (
                    <Card>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-1 p-2">
                          {entraIdUsers.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => {
                                setSelectedUser(user);
                                setEntraIdUsers([]);
                              }}
                              className="w-full text-left p-3 hover:bg-accent rounded-md transition-colors"
                            >
                              <div className="font-medium">{user.displayName}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.mail || user.userPrincipalName}
                              </div>
                              {user.jobTitle && (
                                <div className="text-xs text-muted-foreground mt-1">{user.jobTitle}</div>
                              )}
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    </Card>
                  )}
                  
                  {selectedUser && (
                    <Card className="p-3 bg-primary/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{selectedUser.displayName}</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedUser.mail || selectedUser.userPrincipalName}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUser(null)}
                        >
                          Remover
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>

            {/* Seleção de perfil */}
            <div className="space-y-2">
              <Label htmlFor="profile">Perfil de Acesso *</Label>
              <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um perfil" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status ativo */}
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="isActive">Acesso ativo</Label>
            </div>

            {/* Datas de início e término */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data de Início (opcional)</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Data de Término (opcional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Controle'}
          </Button>
        </div>
      </form>
    </div>
  );
}
