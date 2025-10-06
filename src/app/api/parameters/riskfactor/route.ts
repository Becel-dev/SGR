import { NextRequest, NextResponse } from 'next/server';
import { getRiskFactors, addOrUpdateRiskFactor, deleteRiskFactor, initializeDefaultRiskFactors } from '@/lib/azure-table-storage';
import { RiskFactor } from '@/lib/types';

export async function GET() {
  try {
    // Inicializa os Risk Factors padrão se não existirem
    await initializeDefaultRiskFactors();
    
    const riskFactors = await getRiskFactors();
    return NextResponse.json(riskFactors, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar Risk Factors:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar Risk Factors' },
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
    
    if (!body.donoRisco) {
      return NextResponse.json(
        { error: "O campo 'Dono do Risco' é obrigatório" },
        { status: 400 }
      );
    }

    // Gera um ID único se não for fornecido
    const now = new Date().toISOString();
    const riskFactorData: RiskFactor = {
      id: body.id || `riskfactor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      nome: body.nome,
      donoRisco: body.donoRisco,
      createdBy: 'Sistema', // TODO: Substituir pelo usuário logado
      createdAt: now,
      updatedBy: 'Sistema', // TODO: Substituir pelo usuário logado
      updatedAt: now,
    };

    const savedRiskFactor = await addOrUpdateRiskFactor(riskFactorData);
    return NextResponse.json(savedRiskFactor, { status: 201 });
  } catch (error) {
    console.error('Erro ao salvar Risk Factor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao salvar Risk Factor' },
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
    
    if (!body.donoRisco) {
      return NextResponse.json(
        { error: "O campo 'Dono do Risco' é obrigatório" },
        { status: 400 }
      );
    }

    const riskFactorData: RiskFactor = {
      ...body,
      updatedBy: 'Sistema', // TODO: Substituir pelo usuário logado
      updatedAt: new Date().toISOString(),
    };

    const updatedRiskFactor = await addOrUpdateRiskFactor(riskFactorData);
    return NextResponse.json(updatedRiskFactor, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar Risk Factor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao atualizar Risk Factor' },
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

    // Para exclusão, precisamos do partitionKey. Para RiskFactor, vamos usar "global"
    await deleteRiskFactor(id, 'global');
    
    return NextResponse.json(
      { message: 'Risk Factor excluído com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir Risk Factor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao excluir Risk Factor' },
      { status: 500 }
    );
  }
}