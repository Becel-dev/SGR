/**
 * Hook usePermission
 * 
 * Hook para verificar permissões do usuário em módulos específicos.
 * Usa o contexto de usuário e carrega o perfil de acesso automaticamente.
 */

'use client';

import { useEffect, useState } from 'react';
import { useUser } from './use-user';
import { AccessProfile, UserAccessControl } from '@/lib/types';
import { 
  hasPermission, 
  canView, 
  canCreate, 
  canEdit, 
  canDelete, 
  canExport,
  getUserPermissions,
  isAccessControlActive,
  isAdmin,
  SystemModule,
  Permission,
  PERMISSION_MESSAGES
} from '@/lib/permissions';
import { isSuperAdmin } from '@/lib/config';

export type PermissionCheckResult = {
  allowed: boolean;
  loading: boolean;
  message?: string;
};

/**
 * Hook principal para verificar permissões
 */
export function usePermission(module: SystemModule, action: Permission): PermissionCheckResult {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<AccessProfile | null>(null);
  const [accessControl, setAccessControl] = useState<UserAccessControl | null>(null);
  const [userChecked, setUserChecked] = useState(false);

  useEffect(() => {
    const loadUserPermissions = async () => {
      // Se não há usuário, MANTÉM loading = true
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
        
        // Se não houver controle de acesso, usuário não tem perfil
        if (!accessControlData.accessControl) {
          setLoading(false);
          return;
        }

        setAccessControl(accessControlData.accessControl);

        // Verificar se o controle de acesso está ativo
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

  // Se usuário não está disponível ainda
  if (!user?.email) {
    return {
      allowed: false,
      loading: true,
    };
  }

  // Se ainda está carregando as permissões
  if (loading) {
    return {
      allowed: false,
      loading: true,
    };
  }

  // SUPER ADMIN TEM ACESSO TOTAL
  if (isSuperAdmin(user.email)) {
    return {
      allowed: true,
      loading: false,
    };
  }

  // Se não houver usuário (não deve chegar aqui, mas mantém por segurança)
  if (!user) {
    return {
      allowed: false,
      loading: false,
      message: 'Usuário não autenticado',
    };
  }

  // Se não houver controle de acesso
  if (!accessControl) {
    return {
      allowed: false,
      loading: false,
      message: PERMISSION_MESSAGES.noProfile,
    };
  }

  // Se o controle de acesso estiver inativo
  if (!isAccessControlActive(accessControl)) {
    return {
      allowed: false,
      loading: false,
      message: PERMISSION_MESSAGES.expiredAccess,
    };
  }

  // Se não houver perfil
  if (!userProfile) {
    return {
      allowed: false,
      loading: false,
      message: PERMISSION_MESSAGES.noProfile,
    };
  }

  // Se o perfil estiver inativo
  if (!userProfile.isActive) {
    return {
      allowed: false,
      loading: false,
      message: PERMISSION_MESSAGES.inactiveProfile,
    };
  }

  // Verificar permissão (passa o email do usuário para verificar super admin)
  const allowed = hasPermission(userProfile, module, action, user.email);

  return {
    allowed,
    loading: false,
    message: allowed ? undefined : PERMISSION_MESSAGES[action],
  };
}

/**
 * Hook para verificar permissão de visualização
 */
export function useCanView(module: SystemModule): PermissionCheckResult {
  return usePermission(module, 'view');
}

/**
 * Hook para verificar permissão de criação
 */
export function useCanCreate(module: SystemModule): PermissionCheckResult {
  return usePermission(module, 'create');
}

/**
 * Hook para verificar permissão de edição
 */
export function useCanEdit(module: SystemModule): PermissionCheckResult {
  return usePermission(module, 'edit');
}

/**
 * Hook para verificar permissão de exclusão
 */
export function useCanDelete(module: SystemModule): PermissionCheckResult {
  return usePermission(module, 'delete');
}

/**
 * Hook para verificar permissão de exportação
 */
export function useCanExport(module: SystemModule): PermissionCheckResult {
  return usePermission(module, 'export');
}

/**
 * Hook para obter todas as permissões do usuário
 */
export function useUserPermissions() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<AccessProfile | null>(null);
  const [accessControl, setAccessControl] = useState<UserAccessControl | null>(null);
  const [permissions, setPermissions] = useState<ReturnType<typeof getUserPermissions> | null>(null);

  useEffect(() => {
    const loadUserPermissions = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      // SUPER ADMIN BYPASS
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

        // Buscar o perfil de acesso
        const profileResponse = await fetch(`/api/access-profiles/${accessControlData.accessControl.profileId}`);
        
        if (!profileResponse.ok) {
          setLoading(false);
          return;
        }

        const profileData = await profileResponse.json();
        setUserProfile(profileData.profile);
        
        // Gerar todas as permissões
        const allPermissions = getUserPermissions(profileData.profile);
        setPermissions(allPermissions);
        
      } catch (error) {
        console.error('Erro ao carregar permissões do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserPermissions();
  }, [user?.email]);

  return {
    permissions,
    userProfile,
    accessControl,
    isActive: accessControl ? isAccessControlActive(accessControl) : false,
    isAdmin: user?.email ? (isSuperAdmin(user.email) || isAdmin(userProfile)) : false,
    loading,
  };
}
