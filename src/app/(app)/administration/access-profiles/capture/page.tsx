'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Save, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { getAccessProfileById, addOrUpdateAccessProfile } from '@/lib/azure-table-storage';
import { useAuthUser } from '@/hooks/use-auth';
import type { AccessProfile, ModulePermission } from '@/lib/types';
import { ProtectedRoute } from '@/components/auth/protected-route';

// Definição de todos os módulos do sistema
const SYSTEM_MODULES = [
  { id: 'painel', name: 'Painel', hasExport: true },
  { id: 'identification', name: 'Identificação de Risco', hasExport: true },
  { id: 'analysis', name: 'Análise de Riscos', hasExport: true },
  { id: 'controls', name: 'Governança de Controles', hasExport: true },
  { id: 'kpis', name: "Gestão de KPI's", hasExport: true },
  { id: 'actions', name: 'Controle de Ações', hasExport: true },
  { id: 'escalation', name: 'Escalonamento', hasExport: true },
  { id: 'bowtie', name: 'Visualização Bowtie', hasExport: true },
  { id: 'reports', name: 'Gerador de Relatório IA', hasExport: false },
  { id: 'administration', name: 'Administração', hasExport: false },
];

export default function AccessProfileCapturePage() {
  const searchParams = useSearchParams();
  const profileId = searchParams?.get('id') || null;
  
  return (
    <ProtectedRoute module="perfis-acesso" action={profileId ? 'edit' : 'create'}>
      <AccessProfileCaptureContent />
    </ProtectedRoute>
  );
}

function AccessProfileCaptureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileId = searchParams?.get('id') || null;
  const isEditing = !!profileId;
  const authUser = useAuthUser();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);

  useEffect(() => {
    // Inicializar permissões com todos os módulos
    const initialPermissions: ModulePermission[] = SYSTEM_MODULES.map(module => ({
      module: module.name,
      actions: {
        view: false,
        create: false,
        edit: false,
        delete: false,
        export: false,
      }
    }));
    setPermissions(initialPermissions);

    // Carregar perfil existente se estiver editando
    if (isEditing && profileId) {
      loadProfile(profileId);
    }
  }, [profileId, isEditing]);

  const loadProfile = async (id: string) => {
    try {
      setLoading(true);
      const profile = await getAccessProfileById(id);
      if (profile) {
        setName(profile.name);
        setDescription(profile.description || '');
        setIsActive(profile.isActive);
        setPermissions(profile.permissions);
      } else {
        toast({
          variant: 'destructive',
          title: 'Perfil não encontrado',
          description: 'O perfil de acesso não foi encontrado.',
        });
        router.push('/administration/access-profiles');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar perfil',
        description: 'Não foi possível carregar o perfil de acesso.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (moduleIndex: number, action: keyof ModulePermission['actions'], value: boolean) => {
    const newPermissions = [...permissions];
    newPermissions[moduleIndex].actions[action] = value;
    setPermissions(newPermissions);
  };

  const handleSelectAll = (moduleIndex: number) => {
    const newPermissions = [...permissions];
    const module = SYSTEM_MODULES[moduleIndex];
    newPermissions[moduleIndex].actions = {
      view: true,
      create: true,
      edit: true,
      delete: true,
      export: module.hasExport,
    };
    setPermissions(newPermissions);
  };

  const handleDeselectAll = (moduleIndex: number) => {
    const newPermissions = [...permissions];
    newPermissions[moduleIndex].actions = {
      view: false,
      create: false,
      edit: false,
      delete: false,
      export: false,
    };
    setPermissions(newPermissions);
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

    if (!name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Nome obrigatório',
        description: 'Por favor, informe o nome do perfil.',
      });
      return;
    }

    try {
      setLoading(true);
      const now = new Date().toISOString();
      const userName = `${authUser.name} (${authUser.email})`;

      const profileData: AccessProfile = {
        id: profileId || `${Date.now()}${Math.random().toString(36).substring(2, 9)}`,
        name: name.trim(),
        description: description.trim(),
        permissions,
        isActive,
        updatedBy: userName,
        updatedAt: now,
        createdBy: isEditing ? (await getAccessProfileById(profileId!))?.createdBy || userName : userName,
        createdAt: isEditing ? (await getAccessProfileById(profileId!))?.createdAt || now : now,
      };

      await addOrUpdateAccessProfile(profileData);

      toast({
        title: 'Sucesso!',
        description: `Perfil ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso.`,
      });

      router.push('/administration/access-profiles');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o perfil de acesso.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Carregando perfil...</div>
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
            <Shield className="h-6 w-6" />
            {isEditing ? 'Editar Perfil de Acesso' : 'Novo Perfil de Acesso'}
          </h1>
          <p className="text-muted-foreground">
            Configure as permissões de acesso aos módulos do sistema
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
            <CardDescription>
              Defina o nome e descrição do perfil de acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Perfil *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Gestor de Riscos"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva as responsabilidades deste perfil"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="isActive">Perfil ativo</Label>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Permissões por Módulo</CardTitle>
            <CardDescription>
              Selecione as ações permitidas em cada módulo do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {SYSTEM_MODULES.map((module, index) => (
                <div key={module.id}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{module.name}</h3>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectAll(index)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Marcar todas
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeselectAll(index)}
                      >
                        Desmarcar todas
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 ml-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`${module.id}-view`}
                        checked={permissions[index]?.actions.view || false}
                        onCheckedChange={(checked) => handlePermissionChange(index, 'view', checked)}
                      />
                      <Label htmlFor={`${module.id}-view`}>Visualizar</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`${module.id}-create`}
                        checked={permissions[index]?.actions.create || false}
                        onCheckedChange={(checked) => handlePermissionChange(index, 'create', checked)}
                      />
                      <Label htmlFor={`${module.id}-create`}>Criar</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`${module.id}-edit`}
                        checked={permissions[index]?.actions.edit || false}
                        onCheckedChange={(checked) => handlePermissionChange(index, 'edit', checked)}
                      />
                      <Label htmlFor={`${module.id}-edit`}>Editar</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`${module.id}-delete`}
                        checked={permissions[index]?.actions.delete || false}
                        onCheckedChange={(checked) => handlePermissionChange(index, 'delete', checked)}
                      />
                      <Label htmlFor={`${module.id}-delete`}>Excluir</Label>
                    </div>

                    {module.hasExport && (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${module.id}-export`}
                          checked={permissions[index]?.actions.export || false}
                          onCheckedChange={(checked) => handlePermissionChange(index, 'export', checked)}
                        />
                        <Label htmlFor={`${module.id}-export`}>Exportar</Label>
                      </div>
                    )}
                  </div>

                  {index < SYSTEM_MODULES.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Perfil'}
          </Button>
        </div>
      </form>
    </div>
  );
}
