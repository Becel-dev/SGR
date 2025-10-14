'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthUser } from '@/hooks/use-auth';

export function SessionDebugCard() {
  const { data: session, status } = useSession();
  const authUser = useAuthUser();

  if (process.env.NODE_ENV === 'production') {
    return null; // Não exibir em produção
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900">
          🔍 Debug: Sessão e Autenticação
        </CardTitle>
        <CardDescription>
          Informações da sessão NextAuth (apenas em desenvolvimento)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div>
          <strong>Status:</strong>{' '}
          <Badge variant={status === 'authenticated' ? 'default' : 'secondary'}>
            {status}
          </Badge>
        </div>

        {/* Session Data */}
        {session?.user && (
          <div className="space-y-2">
            <div>
              <strong>Session User:</strong>
              <div className="ml-4 font-mono text-sm">
                <div>• Name: {session.user.name || '(não definido)'}</div>
                <div>• Email: {session.user.email || '(não definido)'}</div>
                <div>• Image: {session.user.image || '(não definido)'}</div>
              </div>
            </div>

            <div>
              <strong>Access Token:</strong>{' '}
              <Badge variant={session.accessToken ? 'default' : 'destructive'}>
                {session.accessToken ? 'Presente' : 'Ausente'}
              </Badge>
            </div>
          </div>
        )}

        {/* useAuthUser Result */}
        <div>
          <strong>useAuthUser() retorna:</strong>
          <div className="ml-4 font-mono text-sm bg-white p-2 rounded border">
            <div>• Name: <span className="text-blue-600">{authUser.name || '(vazio)'}</span></div>
            <div>• Email: <span className="text-blue-600">{authUser.email || '(vazio)'}</span></div>
            <div>• isLoading: <Badge variant={authUser.isLoading ? 'secondary' : 'default'}>{String(authUser.isLoading)}</Badge></div>
          </div>
        </div>

        {/* Auditoria Preview */}
        {!authUser.isLoading && authUser.name && authUser.email && (
          <div className="p-3 bg-white rounded border">
            <strong>Formato de Auditoria:</strong>
            <div className="mt-2 font-mono text-sm text-green-700">
              {authUser.name} ({authUser.email})
            </div>
          </div>
        )}

        {/* Warning se estiver loading */}
        {authUser.isLoading && (
          <div className="p-3 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm">
            <strong>⏳ CARREGANDO:</strong> Sessão ainda está sendo carregada...
            <br />
            Aguarde alguns segundos antes de submeter formulários.
          </div>
        )}

        {/* Warning se estiver usando valores padrão */}
        {!authUser.isLoading && (authUser.name === 'Sistema' || authUser.email === 'sistema@sgr.com') && (
          <div className="p-3 bg-red-100 border border-red-300 rounded text-red-800 text-sm">
            <strong>⚠️ ATENÇÃO:</strong> useAuthUser() está retornando valores padrão!
            <br />
            Isso significa que a sessão NextAuth não está sendo carregada corretamente.
          </div>
        )}

        {/* Console Logs Info */}
        <div className="text-xs text-muted-foreground">
          💡 Abra o console do navegador (F12) para ver logs detalhados
        </div>
      </CardContent>
    </Card>
  );
}
