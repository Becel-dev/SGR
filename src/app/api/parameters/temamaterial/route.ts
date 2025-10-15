import { NextRequest, NextResponse } from 'next/server';
import { getTemasMateriais, addOrUpdateTemaMaterial, deleteTemaMaterial, initializeDefaultTemasMateriais } from '@/lib/azure-table-storage';
import { TemaMaterial } from '@/lib/types';
import { validateApiPermission } from '@/lib/api-permissions';

export async function GET() {
  try {
    // Inicializa os Temas Materiais padrão se não existirem
    await initializeDefaultTemasMateriais();
    
    const temasMateriais = await getTemasMateriais();
    return NextResponse.json(temasMateriais, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar Temas Materiais:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar Temas Materiais' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validar permissão
    const permissionError = await validateApiPermission(request, 'parametros', 'create');
    if (permissionError) {
      return permissionError;
    }

    const body = await request.json();
    
    // Validação básica
    if (!body.nome) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    // Gera um ID único se não for fornecido
    const now = new Date().toISOString();
    const temaMaterialData: TemaMaterial = {
      id: body.id || `temamaterial_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      nome: body.nome,
      createdBy: 'Sistema', // TODO: Substituir pelo usuário logado
      createdAt: now,
      updatedBy: 'Sistema', // TODO: Substituir pelo usuário logado
      updatedAt: now,
    };

    const savedTemaMaterial = await addOrUpdateTemaMaterial(temaMaterialData);
    return NextResponse.json(savedTemaMaterial, { status: 201 });
  } catch (error) {
    console.error('Erro ao salvar Tema Material:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao salvar Tema Material' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Validar permissão
    const permissionError = await validateApiPermission(request, 'parametros', 'edit');
    if (permissionError) {
      return permissionError;
    }

    const body = await request.json();
    
    // Validação básica
    if (!body.id || !body.nome) {
      return NextResponse.json(
        { error: 'ID e nome são obrigatórios' },
        { status: 400 }
      );
    }

    const temaMaterialData: TemaMaterial = {
      ...body,
      updatedBy: 'Sistema', // TODO: Substituir pelo usuário logado
      updatedAt: new Date().toISOString(),
    };

    const updatedTemaMaterial = await addOrUpdateTemaMaterial(temaMaterialData);
    return NextResponse.json(updatedTemaMaterial, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar Tema Material:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao atualizar Tema Material' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Validar permissão
    const permissionError = await validateApiPermission(request, 'parametros', 'delete');
    if (permissionError) {
      return permissionError;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório para exclusão' },
        { status: 400 }
      );
    }

    // Para exclusão, precisamos do partitionKey. Para TemaMaterial, vamos usar "global"
    await deleteTemaMaterial(id, 'global');
    
    return NextResponse.json(
      { message: 'Tema Material excluído com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir Tema Material:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao excluir Tema Material' },
      { status: 500 }
    );
  }
}
