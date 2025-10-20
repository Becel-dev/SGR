import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getAllUserAccessControls } from '@/lib/azure-table-storage';
import type { UserAccessControl } from '@/lib/types';
import { isSuperAdmin } from '@/lib/config';

/**
 * GET /api/access-control?userId=email@example.com
 * Busca o controle de acesso ativo de um usuário específico
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar parâmetro userId
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Parâmetro userId é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🔍 Buscando controle de acesso para usuário:', userId);

    // Super Admin bypass - não precisa de controle de acesso no banco
    if (isSuperAdmin(userId)) {
      console.log('👑 Super Admin detectado - bypass de permissões ativado');
      // Super Admin não precisa de controle de acesso, o sistema vai dar bypass nas permissões
      return NextResponse.json({
        accessControl: null,
        isSuperAdmin: true,
      });
    }

    // Buscar todos os controles de acesso
    const allAccessControls = await getAllUserAccessControls();

    // Filtrar pelo userId
    const userAccessControls = allAccessControls.filter(
      (ac: UserAccessControl) => ac.userId === userId
    );

    if (userAccessControls.length === 0) {
      console.log('⚠️ Nenhum controle de acesso encontrado para o usuário');
      return NextResponse.json({
        accessControl: null,
      });
    }

    // Buscar o controle de acesso ativo e dentro da validade
    const now = new Date();
    const activeAccessControl = userAccessControls.find((ac: UserAccessControl) => {
      if (!ac.isActive || !ac.startDate) {
        return false;
      }

      const startDate = new Date(ac.startDate);
      const endDate = ac.endDate ? new Date(ac.endDate) : null;

      // Verificar se está dentro do período
      if (now < startDate) {
        return false;
      }

      if (endDate && now > endDate) {
        return false;
      }

      return true;
    });

    if (!activeAccessControl) {
      console.log('⚠️ Nenhum controle de acesso ativo encontrado');
      return NextResponse.json({
        accessControl: null,
      });
    }

    console.log('✅ Controle de acesso ativo encontrado:', activeAccessControl.id);

    return NextResponse.json({
      accessControl: activeAccessControl,
    });

  } catch (error) {
    console.error('❌ Erro ao buscar controle de acesso:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao buscar controle de acesso',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
