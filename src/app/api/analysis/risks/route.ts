import { NextResponse } from 'next/server';
import { getRisksForAnalysis } from '@/lib/azure-table-storage';

/**
 * GET /api/analysis/risks
 * Busca todos os riscos para análise do Azure Table Storage
 */
export async function GET() {
  try {
    const risks = await getRisksForAnalysis();
    return NextResponse.json(risks);
  } catch (error) {
    console.error('Erro ao buscar riscos para análise:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { 
        error: 'Erro ao buscar riscos para análise',
        message: errorMessage 
      },
      { status: 500 }
    );
  }
}
