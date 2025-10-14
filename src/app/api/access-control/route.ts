import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getAllUserAccessControls } from '@/lib/azure-table-storage';
import type { UserAccessControl } from '@/lib/types';

// Mock data para ambiente de desenvolvimento
const MOCK_ACCESS_CONTROLS: Record<string, UserAccessControl> = {
  'pedro@teste.com': {
    id: 'mock-ac-pedro',
    userId: 'pedro@teste.com',
    userName: 'Pedro Teste',
    userEmail: 'pedro@teste.com',
    profileId: 'mock-profile-admin',
    profileName: 'Administrador (Mock)',
    startDate: new Date('2024-01-01').toISOString(),
    endDate: new Date('2026-12-31').toISOString(),
    isActive: true,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    createdBy: 'system',
    updatedBy: 'system',
  },
  'maria@teste.com': {
    id: 'mock-ac-maria',
    userId: 'maria@teste.com',
    userName: 'Maria Silva',
    userEmail: 'maria@teste.com',
    profileId: 'mock-profile-viewer',
    profileName: 'Visualizador (Mock)',
    startDate: new Date('2024-01-01').toISOString(),
    endDate: new Date('2026-12-31').toISOString(),
    isActive: true,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    createdBy: 'system',
    updatedBy: 'system',
  },
  'joao@teste.com': {
    id: 'mock-ac-joao',
    userId: 'joao@teste.com',
    userName: 'João Santos',
    userEmail: 'joao@teste.com',
    profileId: 'mock-profile-manager',
    profileName: 'Gestor de Riscos (Mock)',
    startDate: new Date('2024-01-01').toISOString(),
    endDate: new Date('2026-12-31').toISOString(),
    isActive: true,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    createdBy: 'system',
    updatedBy: 'system',
  },
  'ana@teste.com': {
    id: 'mock-ac-ana',
    userId: 'ana@teste.com',
    userName: 'Ana Costa',
    userEmail: 'ana@teste.com',
    profileId: 'mock-profile-admin-full',
    profileName: 'Super Administrador (Mock)',
    startDate: new Date('2024-01-01').toISOString(),
    endDate: new Date('2026-12-31').toISOString(),
    isActive: true,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    createdBy: 'system',
    updatedBy: 'system',
  },
};

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

    // Em desenvolvimento, se for usuário de teste, retornar mock
    const isDevEnvironment = process.env.NODE_ENV !== 'production';
    const isTestUser = userId.endsWith('@teste.com');
    
    if (isDevEnvironment && isTestUser && MOCK_ACCESS_CONTROLS[userId]) {
      console.log('🧪 Usando dados mock para usuário de teste:', userId);
      return NextResponse.json({
        accessControl: MOCK_ACCESS_CONTROLS[userId],
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
