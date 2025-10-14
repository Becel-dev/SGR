/**
 * PermissionButton Component
 * 
 * Botão que é automaticamente desabilitado baseado nas permissões do usuário.
 * Mostra tooltip explicando porque está desabilitado.
 */

'use client';

import { Button, ButtonProps } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePermission } from '@/hooks/use-permission';
import { SystemModule, Permission } from '@/lib/permissions';
import { Loader2 } from 'lucide-react';

type PermissionButtonProps = ButtonProps & {
  module: SystemModule;
  action: Permission;
  loadingText?: string;
  deniedTooltip?: string;
};

/**
 * Botão que verifica permissões automaticamente
 */
export function PermissionButton({
  module,
  action,
  loadingText = 'Verificando permissões...',
  deniedTooltip,
  children,
  disabled,
  asChild,
  ...props
}: PermissionButtonProps) {
  const { allowed, loading, message } = usePermission(module, action);

  const isDisabled = disabled || !allowed || loading;
  const tooltipMessage = deniedTooltip || message || 'Sem permissão';

  // Se estiver carregando e não for asChild (não podemos modificar o child)
  if (loading && !asChild) {
    return (
      <Button disabled {...props}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {loadingText}
      </Button>
    );
  }

  // Se estiver carregando mas for asChild, não renderizar o child
  if (loading && asChild) {
    return (
      <Button disabled {...props} asChild={false}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {loadingText}
      </Button>
    );
  }

  // Se não tiver permissão, mostrar tooltip com botão desabilitado
  if (!allowed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Button disabled {...props} asChild={asChild}>
                {children}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipMessage}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Se tiver permissão, mostrar botão normal
  return (
    <Button disabled={isDisabled} asChild={asChild} {...props}>
      {children}
    </Button>
  );
}

/**
 * Wrapper para ocultar completamente um elemento se não tiver permissão
 */
type PermissionGuardProps = {
  module: SystemModule;
  action: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
};

export function PermissionGuard({
  module,
  action,
  children,
  fallback = null,
  loading: loadingComponent = null,
}: PermissionGuardProps) {
  const { allowed, loading } = usePermission(module, action);

  if (loading) {
    return <>{loadingComponent}</>;
  }

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
