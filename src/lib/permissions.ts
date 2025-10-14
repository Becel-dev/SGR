/**
 * Sistema de Permissões e ACL (Access Control List)
 * 
 * Este arquivo contém toda a lógica de verificação de permissões
 * baseada nos perfis de acesso dos usuários.
 */

import { AccessProfile, ModulePermission, UserAccessControl } from './types';

// Módulos do sistema
export type SystemModule = 
  | 'identificacao'
  | 'analise'
  | 'controles'
  | 'bowtie'
  | 'escalation'
  | 'melhoria'
  | 'relatorios'
  | 'perfis-acesso'
  | 'controle-acesso'
  | 'parametros';

// Ações possíveis
export type Permission = 'view' | 'create' | 'edit' | 'delete' | 'export';

/**
 * Verifica se um usuário tem permissão específica em um módulo
 */
export function hasPermission(
  userProfile: AccessProfile | null,
  module: SystemModule,
  permission: Permission
): boolean {
  // Se não houver perfil, não tem permissão
  if (!userProfile) {
    return false;
  }

  // Se o perfil estiver inativo, não tem permissão
  if (!userProfile.isActive) {
    return false;
  }

  // Buscar o módulo no perfil
  const modulePermission = userProfile.permissions.find(
    (p) => p.module === module
  );

  // Se o módulo não existir no perfil, não tem permissão
  if (!modulePermission) {
    return false;
  }

  // Retornar se tem a permissão específica
  return modulePermission.actions[permission] || false;
}

/**
 * Verifica se um usuário pode visualizar um módulo
 */
export function canView(
  userProfile: AccessProfile | null,
  module: SystemModule
): boolean {
  return hasPermission(userProfile, module, 'view');
}

/**
 * Verifica se um usuário pode criar registros em um módulo
 */
export function canCreate(
  userProfile: AccessProfile | null,
  module: SystemModule
): boolean {
  return hasPermission(userProfile, module, 'create');
}

/**
 * Verifica se um usuário pode editar registros em um módulo
 */
export function canEdit(
  userProfile: AccessProfile | null,
  module: SystemModule
): boolean {
  return hasPermission(userProfile, module, 'edit');
}

/**
 * Verifica se um usuário pode deletar registros em um módulo
 */
export function canDelete(
  userProfile: AccessProfile | null,
  module: SystemModule
): boolean {
  return hasPermission(userProfile, module, 'delete');
}

/**
 * Verifica se um usuário pode exportar dados de um módulo
 */
export function canExport(
  userProfile: AccessProfile | null,
  module: SystemModule
): boolean {
  return hasPermission(userProfile, module, 'export');
}

/**
 * Retorna todas as permissões de um módulo
 */
export function getModulePermissions(
  userProfile: AccessProfile | null,
  module: SystemModule
): ModulePermission | null {
  if (!userProfile) {
    return null;
  }

  return userProfile.permissions.find((p) => p.module === module) || null;
}

/**
 * Verifica se o controle de acesso do usuário está ativo
 */
export function isAccessControlActive(
  accessControl: UserAccessControl | null
): boolean {
  if (!accessControl) {
    return false;
  }

  if (!accessControl.startDate) {
    return false;
  }

  const now = new Date();
  const startDate = new Date(accessControl.startDate);
  const endDate = accessControl.endDate ? new Date(accessControl.endDate) : null;

  // Verificar se está dentro do período de validade
  if (now < startDate) {
    return false;
  }

  if (endDate && now > endDate) {
    return false;
  }

  return accessControl.isActive;
}

/**
 * Perfis de administrador que têm acesso total
 */
const ADMIN_PROFILES = ['admin', 'administrator', 'administrador'];

/**
 * Verifica se o perfil é de administrador
 */
export function isAdmin(userProfile: AccessProfile | null): boolean {
  if (!userProfile) {
    return false;
  }

  return ADMIN_PROFILES.some((admin) =>
    userProfile.name.toLowerCase().includes(admin)
  );
}

/**
 * Retorna um objeto com todas as permissões do usuário
 */
export function getUserPermissions(userProfile: AccessProfile | null) {
  const modules: SystemModule[] = [
    'identificacao',
    'analise',
    'controles',
    'bowtie',
    'escalation',
    'melhoria',
    'relatorios',
    'perfis-acesso',
    'controle-acesso',
    'parametros',
  ];

  const permissions: Record<SystemModule, Record<Permission, boolean>> = {} as any;

  modules.forEach((module) => {
    permissions[module] = {
      view: canView(userProfile, module),
      create: canCreate(userProfile, module),
      edit: canEdit(userProfile, module),
      delete: canDelete(userProfile, module),
      export: canExport(userProfile, module),
    };
  });

  return permissions;
}

/**
 * Mensagens de erro padrão para permissões negadas
 */
export const PERMISSION_MESSAGES = {
  view: 'Você não tem permissão para visualizar este módulo.',
  create: 'Você não tem permissão para criar registros neste módulo.',
  edit: 'Você não tem permissão para editar registros neste módulo.',
  delete: 'Você não tem permissão para deletar registros neste módulo.',
  export: 'Você não tem permissão para exportar dados deste módulo.',
  noProfile: 'Você não possui um perfil de acesso ativo.',
  inactiveProfile: 'Seu perfil de acesso está inativo.',
  expiredAccess: 'Seu acesso expirou.',
};
