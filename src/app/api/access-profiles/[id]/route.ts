import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { AccessProfile } from '@/lib/types';

// Mock profiles para ambiente de desenvolvimento
const MOCK_PROFILES: Record<string, AccessProfile> = {
  'mock-profile-admin': {
    id: 'mock-profile-admin',
    name: 'Administrador (Mock)',
    description: 'Perfil com permissões totais para Pedro - Setup inicial',
    permissions: [
      { module: 'identificacao', actions: { view: true, create: true, edit: true, delete: true, export: true } },
      { module: 'analise', actions: { view: true, create: true, edit: true, delete: true, export: true } },
      { module: 'controles', actions: { view: true, create: true, edit: true, delete: true, export: true } },
      { module: 'kpis', actions: { view: true, create: true, edit: true, delete: true, export: true } },
      { module: 'acoes', actions: { view: true, create: true, edit: true, delete: true, export: true } },
      { module: 'bowtie', actions: { view: true, create: true, edit: true, delete: true, export: true } },
      { module: 'escalation', actions: { view: true, create: true, edit: true, delete: true, export: true } },
      { module: 'melhoria', actions: { view: true, create: true, edit: true, delete: true, export: true } },
      { module: 'relatorios', actions: { view: true, create: true, edit: true, delete: true, export: true } },
      { module: 'perfis-acesso', actions: { view: true, create: true, edit: true, delete: true, export: true } },
      { module: 'controle-acesso', actions: { view: true, create: true, edit: true, delete: true, export: true } },
      { module: 'parametros', actions: { view: true, create: true, edit: true, delete: true, export: true } },
    ],
    isActive: true,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    createdBy: 'system',
    updatedBy: 'system',
  },
  'mock-profile-viewer': {
    id: 'mock-profile-viewer',
    name: 'Visualizador (Mock)',
    description: 'Perfil somente leitura para Maria - Pode ver mas não pode criar/editar',
    permissions: [
      { module: 'identificacao', actions: { view: true, create: false, edit: false, delete: false, export: true } },
      { module: 'analise', actions: { view: true, create: false, edit: false, delete: false, export: true } },
      { module: 'controles', actions: { view: true, create: false, edit: false, delete: false, export: true } },
      { module: 'kpis', actions: { view: true, create: false, edit: false, delete: false, export: true } },
      { module: 'acoes', actions: { view: true, create: false, edit: false, delete: false, export: true } },
      { module: 'bowtie', actions: { view: true, create: false, edit: false, delete: false, export: true } },
      { module: 'escalation', actions: { view: true, create: false, edit: false, delete: false, export: true } },
      { module: 'melhoria', actions: { view: true, create: false, edit: false, delete: false, export: true } },
      { module: 'relatorios', actions: { view: true, create: false, edit: false, delete: false, export: true } },
      { module: 'perfis-acesso', actions: { view: false, create: false, edit: false, delete: false, export: false } },
      { module: 'controle-acesso', actions: { view: false, create: false, edit: false, delete: false, export: false } },
      { module: 'parametros', actions: { view: false, create: false, edit: false, delete: false, export: false } },
    ],
    isActive: true,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    createdBy: 'system',
    updatedBy: 'system',
  },
  'mock-profile-manager': {
    id: 'mock-profile-manager',
    name: 'Gestor de Riscos (Mock)',
    description: 'Perfil operacional para João - Pode criar/editar mas não excluir',
    permissions: [
      { module: 'identificacao', actions: { view: true, create: true, edit: true, delete: false, export: true } },
      { module: 'analise', actions: { view: true, create: true, edit: true, delete: false, export: true } },
      { module: 'controles', actions: { view: true, create: true, edit: true, delete: false, export: true } },
      { module: 'kpis', actions: { view: true, create: true, edit: true, delete: false, export: true } },
      { module: 'acoes', actions: { view: true, create: true, edit: true, delete: false, export: true } },
      { module: 'bowtie', actions: { view: true, create: true, edit: true, delete: false, export: true } },
      { module: 'escalation', actions: { view: true, create: true, edit: true, delete: false, export: true } },
      { module: 'melhoria', actions: { view: true, create: true, edit: true, delete: false, export: true } },
      { module: 'relatorios', actions: { view: true, create: true, edit: true, delete: false, export: true } },
      { module: 'perfis-acesso', actions: { view: false, create: false, edit: false, delete: false, export: false } },
      { module: 'controle-acesso', actions: { view: false, create: false, edit: false, delete: false, export: false } },
      { module: 'parametros', actions: { view: true, create: false, edit: false, delete: false, export: false } },
    ],
    isActive: true,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    createdBy: 'system',
    updatedBy: 'system',
  },
  'mock-profile-admin-full': {
    id: 'mock-profile-admin-full',
    name: 'Super Administrador (Mock)',
    description: 'Perfil com acesso total para Ana - Todas as permissões em todos os módulos',
    permissions: [
      { module: 'identificacao', actions: { view: true, create: true, edit: true, delete: true, export: true } },
      { module: 'analise', actions: { view: true, create: true, edit: true, delete: true, export: true } },
      { module: 'controles', actions: { view: true, create: true, edit: true, delete: true, export: true } },
      { module: 'kpis', actions: { view: true, create: true, edit: true, delete: true, export: true } },
      { module: 'acoes', actions: { view: true, create: true, edit: true, delete: true, export: true } },
      { module: 'bowtie', actions: { view: true, create: true, edit: true, delete: true, export: true } },
      { module: 'escalation', actions: { view: true, create: true, edit: true, delete: true, export: true } },
      { module: 'melhoria', actions: { view: true, create: true, edit: true, delete: true, export: true } },
      { module: 'relatorios', actions: { view: true, create: true, edit: true, delete: true, export: true } },
      { module: 'perfis-acesso', actions: { view: true, create: true, edit: true, delete: true, export: true } },
      { module: 'controle-acesso', actions: { view: true, create: true, edit: true, delete: true, export: true } },
      { module: 'parametros', actions: { view: true, create: true, edit: true, delete: true, export: true } },
    ],
    isActive: true,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    createdBy: 'system',
    updatedBy: 'system',
  },
};

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

    // Em desenvolvimento, se for perfil mock, retornar mock
    const isDevEnvironment = process.env.NODE_ENV !== 'production';
    const isMockProfile = profileId.startsWith('mock-profile-');
    
    if (isDevEnvironment && isMockProfile && MOCK_PROFILES[profileId]) {
      console.log('🧪 Usando perfil mock:', profileId);
      return NextResponse.json({
        profile: MOCK_PROFILES[profileId],
      });
    }

    // TODO: Buscar perfil real do Azure Table Storage
    // const profile = await getAccessProfileById(profileId);
    
    return NextResponse.json(
      { error: 'Perfil não encontrado' },
      { status: 404 }
    );

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
