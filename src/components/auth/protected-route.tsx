/**
 * ProtectedRoute Component
 * 
 * Wrapper para proteger rotas baseado em permissões ACL.
 * Verifica se o usuário tem permissão para acessar o módulo e ação especificada.
 * Redireciona para página de acesso negado se não tiver permissão.
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePermission, PermissionCheckResult } from '@/hooks/use-permission';
import { SystemModule, Permission } from '@/lib/permissions';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

type ProtectedRouteProps = {
  children: React.ReactNode;
  module: SystemModule;
  action: Permission;
  fallback?: React.ReactNode;
  redirectOnDenied?: boolean;
};

/**
 * Componente para proteger rotas com verificação de permissões
 */
export function ProtectedRoute({
  children,
  module,
  action,
  fallback,
  redirectOnDenied = true,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { allowed, loading, message } = usePermission(module, action);
  
  // CORREÇÃO: Garantir que só redireciona após verificação completa
  const [hasChecked, setHasChecked] = useState(false);
  const isRedirecting = useRef(false);

  useEffect(() => {
    // Marcar que já verificou quando loading terminar
    if (!loading && !hasChecked) {
      console.log(`🔍 ProtectedRoute: Primeira verificação completa para ${module}.${action}`);
      console.log(`   - allowed: ${allowed}`);
      console.log(`   - loading: ${loading}`);
      setHasChecked(true);
    }
  }, [loading, allowed, hasChecked, module, action]);

  useEffect(() => {
    // Só redirecionar se:
    // 1. Já terminou de verificar (hasChecked = true)
    // 2. NÃO estiver carregando (loading = false)
    // 3. NÃO tiver permissão (allowed = false)
    // 4. redirectOnDenied estiver habilitado
    // 5. Ainda não está redirecionando
    if (hasChecked && !loading && !allowed && redirectOnDenied && !isRedirecting.current) {
      console.log(`🚫 ProtectedRoute: Sem permissão para ${module}.${action}, redirecionando...`);
      isRedirecting.current = true;
      router.push('/access-denied');
    } else if (hasChecked && !loading && allowed) {
      console.log(`✅ ProtectedRoute: Permissão concedida para ${module}.${action}`);
    } else if (loading) {
      console.log(`⏳ ProtectedRoute: Verificando permissões para ${module}.${action}...`);
    }
  }, [hasChecked, loading, allowed, redirectOnDenied, router, module, action]);

  // SEMPRE mostrar loading até verificação completa
  if (loading || !hasChecked) {
    console.log(`⏳ ProtectedRoute render: Loading (${module}.${action}) - loading:${loading}, hasChecked:${hasChecked}`);
    return fallback || <LoadingSkeleton />;
  }

  // Se não tiver permissão
  if (!allowed) {
    console.log(`🚫 ProtectedRoute render: Sem permissão (${module}.${action})`);
    if (redirectOnDenied) {
      // Mostrar loading enquanto redireciona
      return <LoadingSkeleton />;
    }
    return null;
  }

  // Se tiver permissão, renderizar conteúdo
  console.log(`✅ ProtectedRoute render: Renderizando conteúdo (${module}.${action})`);
  return <>{children}</>;
}

/**
 * Skeleton de loading padrão
 */
function LoadingSkeleton() {
  return (
    <div className="container py-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Hook helper para verificar se deve mostrar um botão/ação
 */
export function useCanPerformAction(
  module: SystemModule,
  action: Permission
): PermissionCheckResult {
  return usePermission(module, action);
}
