import { NextRequest, NextResponse } from 'next/server';
import { getTopRisks, addOrUpdateTopRisk, deleteTopRisk, initializeDefaultTopRisks } from '@/lib/azure-table-storage';
import { TopRisk } from '@/lib/types';

export async function GET() {
  try {
    // Inicializa os Top Risks padrão se não existirem
    await initializeDefaultTopRisks();
    
    const topRisks = await getTopRisks();
    return NextResponse.json(topRisks, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar Top Risks:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar Top Risks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const topRiskData: TopRisk = {
      id: body.id || `toprisk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      nome: body.nome,
      createdBy: 'Sistema', // TODO: Substituir pelo usuário logado
      createdAt: now,
      updatedBy: 'Sistema', // TODO: Substituir pelo usuário logado
      updatedAt: now,
    };

    const savedTopRisk = await addOrUpdateTopRisk(topRiskData);
    return NextResponse.json(savedTopRisk, { status: 201 });
  } catch (error) {
    console.error('Erro ao salvar Top Risk:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao salvar Top Risk' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validação básica
    if (!body.id || !body.nome) {
      return NextResponse.json(
        { error: 'ID e nome são obrigatórios' },
        { status: 400 }
      );
    }

    const topRiskData: TopRisk = {
      ...body,
      updatedBy: 'Sistema', // TODO: Substituir pelo usuário logado
      updatedAt: new Date().toISOString(),
    };

    const updatedTopRisk = await addOrUpdateTopRisk(topRiskData);
    return NextResponse.json(updatedTopRisk, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar Top Risk:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao atualizar Top Risk' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório para exclusão' },
        { status: 400 }
      );
    }

    // Para exclusão, precisamos do partitionKey. Para TopRisk, vamos usar "global"
    await deleteTopRisk(id, 'global');
    
    return NextResponse.json(
      { message: 'Top Risk excluído com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir Top Risk:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao excluir Top Risk' },
      { status: 500 }
    );
  }
}