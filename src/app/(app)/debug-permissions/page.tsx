'use client';

import { useUser } from '@/hooks/use-user';
import { useUserPermissions } from '@/hooks/use-permission';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function PermissionsDebugPage() {
  const { user } = useUser();
  const { permissions, userProfile, accessControl, isActive, isAdmin, loading } = useUserPermissions();

  if (loading) {
    return (
      <div className="container py-6 space-y-6">
        <h1 className="text-3xl font-bold">🔍 Debug de Permissões</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p>Carregando permissões...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🔍 Debug de Permissões</h1>
        <p className="text-muted-foreground">Visualize o estado completo das permissões do usuário</p>
      </div>

      {/* Informações do Usuário */}
      <Card>
        <CardHeader>
          <CardTitle>👤 Informações do Usuário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="font-semibold">Nome:</div>
            <div>{user?.name || 'N/A'}</div>
            
            <div className="font-semibold">Email:</div>
            <div>{user?.email || 'N/A'}</div>
            
            <div className="font-semibold">Provider:</div>
            <div>
              <Badge variant={user?.email?.endsWith('@teste.com') ? 'secondary' : 'default'}>
                {user?.email?.endsWith('@teste.com') ? 'Test User' : 'Azure AD'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle>🔗 Controle de Acesso (UserAccessControl)</CardTitle>
          <CardDescription>Vínculo do usuário com o perfil de acesso</CardDescription>
        </CardHeader>
        <CardContent>
          {accessControl ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">ID:</div>
                <div className="font-mono text-sm">{accessControl.id}</div>
                
                <div className="font-semibold">Profile ID:</div>
                <div className="font-mono text-sm">{accessControl.profileId}</div>
                
                <div className="font-semibold">Profile Name:</div>
                <div>{accessControl.profileName}</div>
                
                <div className="font-semibold">Status:</div>
                <div>
                  {accessControl.isActive ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      Inativo
                    </Badge>
                  )}
                </div>
                
                <div className="font-semibold">Data Início:</div>
                <div>{accessControl.startDate ? new Date(accessControl.startDate).toLocaleDateString() : 'N/A'}</div>
                
                <div className="font-semibold">Data Fim:</div>
                <div>{accessControl.endDate ? new Date(accessControl.endDate).toLocaleDateString() : 'Sem data fim'}</div>
                
                <div className="font-semibold">Access Control Ativo?</div>
                <div>
                  {isActive ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Sim
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      Não
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <XCircle className="h-12 w-12 mx-auto mb-2 text-destructive" />
              <p className="font-semibold">Nenhum controle de acesso encontrado</p>
              <p className="text-sm">Usuário não está vinculado a nenhum perfil</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Access Profile */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Perfil de Acesso (AccessProfile)</CardTitle>
          <CardDescription>Permissões do perfil vinculado ao usuário</CardDescription>
        </CardHeader>
        <CardContent>
          {userProfile ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 pb-4 border-b">
                <div className="font-semibold">ID:</div>
                <div className="font-mono text-sm">{userProfile.id}</div>
                
                <div className="font-semibold">Nome:</div>
                <div className="font-semibold">{userProfile.name}</div>
                
                <div className="font-semibold">Descrição:</div>
                <div>{userProfile.description || 'N/A'}</div>
                
                <div className="font-semibold">Status:</div>
                <div>
                  {userProfile.isActive ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      Inativo
                    </Badge>
                  )}
                </div>
                
                <div className="font-semibold">É Admin?</div>
                <div>
                  {isAdmin ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Sim
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      Não
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Permissões por Módulo:</h4>
                <div className="space-y-2">
                  {userProfile.permissions.map((perm) => (
                    <Card key={perm.module}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">{perm.module}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant={perm.actions.view ? 'default' : 'outline'}>
                            {perm.actions.view ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                            View
                          </Badge>
                          <Badge variant={perm.actions.create ? 'default' : 'outline'}>
                            {perm.actions.create ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                            Create
                          </Badge>
                          <Badge variant={perm.actions.edit ? 'default' : 'outline'}>
                            {perm.actions.edit ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                            Edit
                          </Badge>
                          <Badge variant={perm.actions.delete ? 'default' : 'outline'}>
                            {perm.actions.delete ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                            Delete
                          </Badge>
                          <Badge variant={perm.actions.export ? 'default' : 'outline'}>
                            {perm.actions.export ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                            Export
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <XCircle className="h-12 w-12 mx-auto mb-2 text-destructive" />
              <p className="font-semibold">Nenhum perfil de acesso encontrado</p>
              <p className="text-sm">Não foi possível carregar o perfil vinculado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo de Permissões */}
      {permissions && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Resumo de Permissões</CardTitle>
            <CardDescription>Mapa rápido de todas as permissões</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {Object.entries(permissions).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  {value ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">{key}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações de Depuração */}
      <Card>
        <CardHeader>
          <CardTitle>🐛 Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-xs">
            <div><strong>Loading:</strong> {loading ? 'true' : 'false'}</div>
            <div><strong>Has User:</strong> {user ? 'true' : 'false'}</div>
            <div><strong>Has Access Control:</strong> {accessControl ? 'true' : 'false'}</div>
            <div><strong>Has Profile:</strong> {userProfile ? 'true' : 'false'}</div>
            <div><strong>Is Active:</strong> {isActive ? 'true' : 'false'}</div>
            <div><strong>Is Admin:</strong> {isAdmin ? 'true' : 'false'}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
