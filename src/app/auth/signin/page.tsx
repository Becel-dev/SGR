'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, FlaskConical, User } from 'lucide-react';

export default function SignInPage() {
  const isDevEnvironment = process.env.NODE_ENV === 'development';

  const handleDevLogin = (email: string, name: string) => {
    signIn('dev-credentials', { 
      email,
      name,
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

              <div className="space-y-3">
                <p className="text-sm font-medium text-center text-orange-900 flex items-center justify-center gap-2">
                  <FlaskConical className="h-4 w-4" />
                  Login de Desenvolvimento
                </p>
                
                <div className="space-y-2">
                  <input
                    type="email"
                    id="dev-email"
                    placeholder="seu.email@exemplo.com"
                    className="w-full px-3 py-2 border border-orange-200 rounded-md text-sm"
                  />
                  <input
                    type="text"
                    id="dev-name"
                    placeholder="Seu Nome"
                    className="w-full px-3 py-2 border border-orange-200 rounded-md text-sm"
                  />
                  <Button
                    onClick={() => {
                      const email = (document.getElementById('dev-email') as HTMLInputElement).value;
                      const name = (document.getElementById('dev-name') as HTMLInputElement).value;
                      if (email) {
                        handleDevLogin(email, name || email.split('@')[0]);
                      }
                    }}
                    variant="outline"
                    className="w-full border-orange-200 bg-orange-50 hover:bg-orange-100"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Entrar como Desenvolvedor
                  </Button>
                </div>
              </div>

              <p className="text-xs text-center text-muted-foreground mt-4">
                💡 Para desenvolvimento local apenas. Configure perfis de acesso no sistema após o login.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
