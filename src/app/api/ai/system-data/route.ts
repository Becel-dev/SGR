import { NextResponse } from 'next/server';
import {
  getRisksForAnalysis,
  getAllControls,
  getAllEscalations,
  getIdentifiedRisks,
  getTopRisks,
} from '@/lib/azure-table-storage';
import type { Risk, Control, EscalationConfig, IdentifiedRisk } from '@/lib/types';

/**
 * GET /api/ai/system-data
 * Retorna todos os dados do sistema para usar como base de conhecimento da IA
 */
export async function GET() {
  try {
    // Buscar todos os dados em paralelo
    const [risks, controls, escalations, identifiedRisks, topRisks] = await Promise.all([
      getRisksForAnalysis(),
      getAllControls(),
      getAllEscalations(),
      getIdentifiedRisks(),
      getTopRisks(),
    ]);

    // Enriquecer escalations com nome dos controles
    const escalationsWithControlNames = escalations.map((esc: EscalationConfig) => {
      const control = controls.find((c: Control) => c.id === esc.controlId);
      return {
        ...esc,
        controlName: control?.nomeControle || 'N/A',
      };
    });

    return NextResponse.json({
      risks,
      controls,
      escalations: escalationsWithControlNames,
      identifiedRisks,
      topRisks,
      summary: {
        totalRisks: risks.length,
        totalControls: controls.length,
        totalEscalations: escalations.length,
        totalIdentifiedRisks: identifiedRisks.length,
        totalTopRisks: topRisks.length,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar dados do sistema:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar dados do sistema' },
      { status: 500 }
    );
  }
}
