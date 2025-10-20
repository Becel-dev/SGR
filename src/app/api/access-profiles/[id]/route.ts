import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { AccessProfile } from '@/lib/types';
import { getAccessProfileById } from '@/lib/azure-table-storage';

/**
 * GET /api/access-profiles/[id]
 * Busca um perfil de acesso pelo ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const profileId = params.id;

    if (!profileId) {
      return NextResponse.json(
        { error: 'ID do perfil é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🔍 Buscando perfil de acesso:', profileId);

    // Buscar perfil real do Azure Table Storage
    const profile = await getAccessProfileById(profileId);

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      profile,
    });

  } catch (error) {
    console.error('❌ Erro ao buscar perfil de acesso:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao buscar perfil de acesso',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
