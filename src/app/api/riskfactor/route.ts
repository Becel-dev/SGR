import { NextRequest, NextResponse } from 'next/server';
import { getRiskFactors, addOrUpdateRiskFactor, initializeDefaultRiskFactors } from '@/lib/azure-table-storage';

export async function GET() {
  try {
    const riskFactors = await getRiskFactors();
    
    // Se não há RiskFactors, inicializa com os padrão
    if (riskFactors.length === 0) {
      await initializeDefaultRiskFactors();
      const initializedRiskFactors = await getRiskFactors();
      return NextResponse.json(initializedRiskFactors);
    }
    
    return NextResponse.json(riskFactors);
  } catch (error) {
    console.error('Erro ao buscar RiskFactors:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome } = body;

    if (!nome) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    // Gera um ID único para o novo RiskFactor
    const id = `RF${Date.now()}`;
    const now = new Date().toISOString();
    const newRiskFactor = await addOrUpdateRiskFactor({ 
      id, 
      nome,
      createdBy: 'System',
      createdAt: now,
      updatedBy: 'System',
      updatedAt: now
    });
    return NextResponse.json(newRiskFactor, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar RiskFactor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}