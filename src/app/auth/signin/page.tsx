'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, FlaskConical, User } from 'lucide-react';

export default function SignInPage() {
  const isDevEnvironment = process.env.NODE_ENV !== 'production';

  const testUsers = [
    { 
      email: 'pedro@teste.com', 
      name: 'Pedro Teste',
      description: '👨‍💼 Usuário base para setup inicial',
      color: 'blue'
    },
    { 
      email: 'maria@teste.com', 
      name: 'Maria Silva',
      description: '👁️ Perfil Visualizador (somente leitura)',
      color: 'purple'
    },
    { 
      email: 'joao@teste.com', 
      name: 'João Santos',
      description: '⚙️ Gestor de Riscos (criar/editar)',
      color: 'green'
    },
    { 
      email: 'ana@teste.com', 
      name: 'Ana Costa',
      description: '👑 Administrador (acesso total)',
      color: 'orange'
    },
  ];

  const handleTestLogin = (email: string) => {
    signIn('test-credentials', { 
      email,
      callbackUrl: '/' 
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">SGR - Sistema de Gestão de Riscos</CardTitle>
          <CardDescription>
            Faça login com sua conta Microsoft para continuar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => signIn('azure-ad', { callbackUrl: '/' })}
            className="w-full"
            size="lg"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
              <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
              <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
            </svg>
            Entrar com Microsoft
          </Button>

          {isDevEnvironment && (
            <>
              <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-muted-foreground">
                  AMBIENTE DE DESENVOLVIMENTO
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-center text-orange-900 flex items-center justify-center gap-2">
                  <FlaskConical className="h-4 w-4" />
                  Usuários de Teste
                </p>
                
                {testUsers.map((user) => (
                  <Button
                    key={user.email}
                    onClick={() => handleTestLogin(user.email)}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 px-4 border-orange-200 bg-orange-50 hover:bg-orange-100"
                  >
                    <div className="flex items-start gap-3 w-full">
                      <User className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-orange-900">{user.name}</div>
                        <div className="text-xs text-orange-700">{user.email}</div>
                        <div className="text-xs text-orange-600 mt-1">{user.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>

              <p className="text-xs text-center text-muted-foreground mt-4">
                💡 Use usuários de teste para validar diferentes níveis de permissão
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
