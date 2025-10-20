import { NextRequest, NextResponse } from 'next/server';
import { getRiskAnalysisById } from '@/lib/azure-table-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const risk = await getRiskAnalysisById(params.id);
    
    if (!risk) {
      return NextResponse.json(
        { error: 'Risco não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(risk);
  } catch (error) {
    console.error('Erro ao buscar risco:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar risco' },
      { status: 500 }
    );
  }
}
