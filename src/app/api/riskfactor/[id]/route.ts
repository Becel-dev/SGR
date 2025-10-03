import { NextRequest, NextResponse } from 'next/server';
import { getRiskFactorById, addOrUpdateRiskFactor, deleteRiskFactor } from '@/lib/azure-table-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const riskFactor = await getRiskFactorById(params.id);
    
    if (!riskFactor) {
      return NextResponse.json(
        { error: 'RiskFactor não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(riskFactor);
  } catch (error) {
    console.error('Erro ao buscar RiskFactor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { nome } = body;

    if (!nome) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    // Busca o RiskFactor existente
    const existingRiskFactor = await getRiskFactorById(params.id);
    
    if (!existingRiskFactor) {
      return NextResponse.json(
        { error: 'RiskFactor não encontrado' },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();
    const updatedRiskFactor = await addOrUpdateRiskFactor({
      ...existingRiskFactor,
      nome,
      updatedBy: 'System',
      updatedAt: now
    });

    return NextResponse.json(updatedRiskFactor);
  } catch (error) {
    console.error('Erro ao atualizar RiskFactor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteRiskFactor(params.id, 'RiskFactor');
    return NextResponse.json({ message: 'RiskFactor excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir RiskFactor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}