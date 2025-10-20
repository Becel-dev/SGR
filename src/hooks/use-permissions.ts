/**
 * Hook usePermissions (plural)
 * 
 * Hook OTIMIZADO para verificar MÚLTIPLAS permissões de uma vez.
 * Reduz chamadas à API verificando várias permissões em uma única requisição.
 * 
 * USO RECOMENDADO: Para tabelas com múltiplos botões de ação por linha.
 */

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useUser } from './use-user';
import { AccessProfile, UserAccessControl } from '@/lib/types';
import { 
  hasPermission, 
  isAccessControlActive,
  SystemModule,
  Permission,
  PERMISSION_MESSAGES
} from '@/lib/permissions';
import { isSuperAdmin } from '@/lib/config';

export type PermissionResult = {
  allowed: boolean;
  message?: string;
};

export type PermissionsCheckResult = {
  loading: boolean;
  [key: string]: boolean | PermissionResult | undefined;
} & {
  view?: PermissionResult;
  create?: PermissionResult;
  edit?: PermissionResult;
  delete?: PermissionResult;
  export?: PermissionResult;
};

type PermissionCheck = {
  module: SystemModule;
  action: Permission;
  key?: string; // chave customizada para o resultado
};

/**
 * Hook otimizado para verificar múltiplas permissões de uma vez
 * 
 * @example
 * // Verificar múltiplas permissões em uma tabela
 * const permissions = usePermissions([
 *   { module: 'perfis-acesso', action: 'edit' },
 *   { module: 'perfis-acesso', action: 'delete' },
 * ]);
 * 
 * // Usar no componente
 * <Button disabled={!permissions.edit?.allowed || permissions.loading}>
 *   Editar
 * </Button>
 */
export function usePermissions(checks: PermissionCheck[]): PermissionsCheckResult {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<AccessProfile | null>(null);
  const [accessControl, setAccessControl] = useState<UserAccessControl | null>(null);
  const [userChecked, setUserChecked] = useState(false);

  // Carregar perfil e access control UMA ÚNICA VEZ
  useEffect(() => {
    const loadUserPermissions = async () => {
      if (!user?.email) {
        if (!userChecked) {
          setUserChecked(true);
        }
        return;
      }

      setLoading(true);
      setUserChecked(true);

      // SUPER ADMIN BYPASS - verifica antes de buscar perfil
      if (isSuperAdmin(user.email)) {
        setLoading(false);
        return;
      }

      try {
        // Buscar controle de acesso do usuário
        const accessControlResponse = await fetch(`/api/access-control?userId=${user.email}`);
        
        if (!accessControlResponse.ok) {
          setLoading(false);
          return;
        }

        const accessControlData = await accessControlResponse.json();
        
        if (!accessControlData.accessControl) {
          setLoading(false);
          return;
        }

        setAccessControl(accessControlData.accessControl);

        if (!isAccessControlActive(accessControlData.accessControl)) {
          setLoading(false);
          return;
        }

        // Buscar o perfil de acesso
        const profileResponse = await fetch(`/api/access-profiles/${accessControlData.accessControl.profileId}`);
        
        if (!profileResponse.ok) {
          setLoading(false);
          return;
        }

        const profileData = await profileResponse.json();
        setUserProfile(profileData.profile);
        
      } catch (error) {
        console.error('Erro ao carregar permissões:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserPermissions();
  }, [user?.email]);

  // Calcular resultado de TODAS as permissões de uma vez (memoizado)
  const result = useMemo<PermissionsCheckResult>(() => {
    // Se ainda está carregando
    if (!user?.email || loading) {
      const loadingResult: PermissionsCheckResult = { loading: true };
      checks.forEach(check => {
        const key = check.key || check.action;
        loadingResult[key] = { allowed: false, message: 'Carregando...' };
      });
      return loadingResult;
    }

    // SUPER ADMIN TEM ACESSO TOTAL
    if (isSuperAdmin(user.email)) {
      const superAdminResult: PermissionsCheckResult = { loading: false };
      checks.forEach(check => {
        const key = check.key || check.action;
        superAdminResult[key] = { allowed: true };
      });
      return superAdminResult;
    }

    // Se não houver controle de acesso
    if (!accessControl) {
      const noAccessResult: PermissionsCheckResult = { loading: false };
      checks.forEach(check => {
        const key = check.key || check.action;
        noAccessResult[key] = { 
          allowed: false, 
          message: PERMISSION_MESSAGES.noProfile 
        };
      });
      return noAccessResult;
    }

    // Se o controle de acesso estiver inativo
    if (!isAccessControlActive(accessControl)) {
      const inactiveResult: PermissionsCheckResult = { loading: false };
      checks.forEach(check => {
        const key = check.key || check.action;
        inactiveResult[key] = { 
          allowed: false, 
          message: PERMISSION_MESSAGES.expiredAccess 
        };
      });
      return inactiveResult;
    }

    // Se não houver perfil
    if (!userProfile) {
      const noProfileResult: PermissionsCheckResult = { loading: false };
      checks.forEach(check => {
        const key = check.key || check.action;
        noProfileResult[key] = { 
          allowed: false, 
          message: PERMISSION_MESSAGES.noProfile 
        };
      });
      return noProfileResult;
    }

    // Se o perfil estiver inativo
    if (!userProfile.isActive) {
      const inactiveProfileResult: PermissionsCheckResult = { loading: false };
      checks.forEach(check => {
        const key = check.key || check.action;
        inactiveProfileResult[key] = { 
          allowed: false, 
          message: PERMISSION_MESSAGES.inactiveProfile 
        };
      });
      return inactiveProfileResult;
    }

    // Verificar TODAS as permissões de uma vez
    const permissions: PermissionsCheckResult = { loading: false };
    
    checks.forEach(check => {
      const key = check.key || check.action;
      // Passa o email do usuário para verificar super admin
      const allowed = hasPermission(userProfile, check.module, check.action, user.email);
      
      permissions[key] = {
        allowed,
        message: allowed ? undefined : PERMISSION_MESSAGES[check.action],
      };
    });

    return permissions;

  }, [user?.email, loading, userProfile, accessControl, checks]);

  return result;
}

/**
 * Hook otimizado para verificar permissões de um único módulo
 * Útil para tabelas com ações CRUD
 * 
 * @example
 * const perms = useModulePermissions('perfis-acesso');
 * 
 * <Button disabled={!perms.edit?.allowed || perms.loading}>Editar</Button>
 * <Button disabled={!perms.delete?.allowed || perms.loading}>Excluir</Button>
 */
export function useModulePermissions(module: SystemModule) {
  return usePermissions([
    { module, action: 'view', key: 'view' },
    { module, action: 'create', key: 'create' },
    { module, action: 'edit', key: 'edit' },
    { module, action: 'delete', key: 'delete' },
    { module, action: 'export', key: 'export' },
  ]);
}
