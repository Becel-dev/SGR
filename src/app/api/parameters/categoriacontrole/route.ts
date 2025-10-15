import { NextRequest, NextResponse } from 'next/server';
import { getCategoriasControle, addOrUpdateCategoriaControle, deleteCategoriaControle, initializeDefaultCategoriasControle } from '@/lib/azure-table-storage';
import { CategoriaControle } from '@/lib/types';
import { validateApiPermission } from '@/lib/api-permissions';

export async function GET() {
  try {
    // Inicializa as Categorias de Controle padrão se não existirem
    await initializeDefaultCategoriasControle();
    
    const categoriasControle = await getCategoriasControle();
    return NextResponse.json(categoriasControle, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar Categorias de Controle:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar Categorias de Controle' },
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
    const categoriaControleData: CategoriaControle = {
      id: body.id || `categoriacontrole_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      nome: body.nome,
      createdBy: 'Sistema', // TODO: Substituir pelo usuário logado
      createdAt: now,
      updatedBy: 'Sistema', // TODO: Substituir pelo usuário logado
      updatedAt: now,
    };

    const savedCategoriaControle = await addOrUpdateCategoriaControle(categoriaControleData);
    return NextResponse.json(savedCategoriaControle, { status: 201 });
  } catch (error) {
    console.error('Erro ao salvar Categoria de Controle:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao salvar Categoria de Controle' },
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

    const categoriaControleData: CategoriaControle = {
      ...body,
      updatedBy: 'Sistema', // TODO: Substituir pelo usuário logado
      updatedAt: new Date().toISOString(),
    };

    const updatedCategoriaControle = await addOrUpdateCategoriaControle(categoriaControleData);
    return NextResponse.json(updatedCategoriaControle, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar Categoria de Controle:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao atualizar Categoria de Controle' },
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

    // Para exclusão, precisamos do partitionKey. Para CategoriaControle, vamos usar "global"
    await deleteCategoriaControle(id, 'global');
    
    return NextResponse.json(
      { message: 'Categoria de Controle excluída com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir Categoria de Controle:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao excluir Categoria de Controle' },
      { status: 500 }
    );
  }
}
