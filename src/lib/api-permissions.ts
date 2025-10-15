/**
 * Validação de Permissões para APIs
 * 
 * Este arquivo contém funções utilitárias para validar permissões
 * em rotas de API do Next.js.
 */

import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { AccessProfile, UserAccessControl } from './types';
import { hasPermission, SystemModule, Permission, isAccessControlActive } from './permissions';

/**
 * Valida se o usuário tem permissão para executar uma ação em um módulo
 * @param request - NextRequest object
 * @param module - Módulo do sistema
 * @param action - Ação a ser validada
 * @returns NextResponse com erro ou null se permitido
 */
export async function validateApiPermission(
  request: NextRequest,
  module: SystemModule,
  action: Permission
): Promise<NextResponse | null> {
  try {
    // 1. Verificar autenticação
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token || !token.email) {
      console.error('❌ API Permission: Usuário não autenticado');
      return NextResponse.json(
        { error: 'Não autenticado. Faça login para continuar.' },
        { status: 401 }
      );
    }

    const userEmail = token.email as string;
    console.log(`🔐 API Permission: Validando ${action} em ${module} para ${userEmail}`);

    // 2. Buscar controle de acesso do usuário
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const accessControlResponse = await fetch(
      `${baseUrl}/api/access-control?userId=${userEmail}`,
      {
        headers: {
          'Cookie': request.headers.get('cookie') || '',
        },
      }
    );

    if (!accessControlResponse.ok) {
      console.error('❌ API Permission: Erro ao buscar controle de acesso');
      return NextResponse.json(
        { error: 'Erro ao verificar permissões do usuário.' },
        { status: 500 }
      );
    }

    const accessControlData = await accessControlResponse.json();

    // 3. Verificar se tem controle de acesso
    if (!accessControlData.accessControl) {
      console.error('⚠️ API Permission: Usuário sem controle de acesso');
      return NextResponse.json(
        { error: 'Você não possui um perfil de acesso ativo.' },
        { status: 403 }
      );
    }

    const accessControl: UserAccessControl = accessControlData.accessControl;

    // 4. Verificar se o controle de acesso está ativo
    if (!isAccessControlActive(accessControl)) {
      console.error('⚠️ API Permission: Controle de acesso inativo ou expirado');
      return NextResponse.json(
        { error: 'Seu acesso está inativo ou expirado.' },
        { status: 403 }
      );
    }

    // 5. Buscar perfil de acesso
    const profileResponse = await fetch(
      `${baseUrl}/api/access-profiles/${accessControl.profileId}`,
      {
        headers: {
          'Cookie': request.headers.get('cookie') || '',
        },
      }
    );

    if (!profileResponse.ok) {
      console.error('❌ API Permission: Erro ao buscar perfil de acesso');
      return NextResponse.json(
        { error: 'Erro ao verificar perfil de acesso.' },
        { status: 500 }
      );
    }

    const profileData = await profileResponse.json();

    if (!profileData.profile) {
      console.error('⚠️ API Permission: Perfil não encontrado');
      return NextResponse.json(
        { error: 'Perfil de acesso não encontrado.' },
        { status: 403 }
      );
    }

    const userProfile: AccessProfile = profileData.profile;

    // 6. Verificar se o perfil está ativo
    if (!userProfile.isActive) {
      console.error('⚠️ API Permission: Perfil inativo');
      return NextResponse.json(
        { error: 'Seu perfil de acesso está inativo.' },
        { status: 403 }
      );
    }

    // 7. Verificar permissão específica
    const allowed = hasPermission(userProfile, module, action);

    if (!allowed) {
      console.error(`⚠️ API Permission: Usuário sem permissão de ${action} em ${module}`);
      return NextResponse.json(
        { 
          error: `Você não tem permissão para ${getActionDescription(action)} neste módulo.`,
          module,
          action,
        },
        { status: 403 }
      );
    }

    console.log(`✅ API Permission: Permissão concedida para ${action} em ${module}`);
    return null; // Permissão concedida

  } catch (error) {
    console.error('❌ API Permission: Erro ao validar permissões:', error);
    return NextResponse.json(
      { error: 'Erro interno ao validar permissões.' },
      { status: 500 }
    );
  }
}

/**
 * Retorna uma descrição amigável da ação
 */
function getActionDescription(action: Permission): string {
  const descriptions: Record<Permission, string> = {
    view: 'visualizar',
    create: 'criar',
    edit: 'editar',
    delete: 'excluir',
    export: 'exportar',
  };
  return descriptions[action] || action;
}
