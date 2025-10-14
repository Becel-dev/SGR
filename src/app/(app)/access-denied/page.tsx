'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';

export default function AccessDeniedPage() {
  const router = useRouter();

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-destructive/10 rounded-full">
              <ShieldX className="h-16 w-16 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Acesso Negado</CardTitle>
          <CardDescription className="text-lg">
            Você não tem permissão para acessar esta página
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">
              Seu perfil de acesso atual não possui as permissões necessárias para visualizar este recurso.
            </p>
            <p>
              Entre em contato com o administrador do sistema para solicitar acesso.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            
            <Button
              onClick={() => router.push('/')}
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Ir para Página Inicial
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Dica:</strong> Se você acredita que deveria ter acesso a esta página,
              verifique se seu perfil de acesso está ativo e dentro do período de validade.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
