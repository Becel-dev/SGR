'use server';

import { generateRiskReport } from '@/ai/flows/generate-risk-report';
import { z } from 'zod';

const ReportSchema = z.object({
  prompt: z.string().min(10, 'O prompt deve ter pelo menos 10 caracteres.'),
});

export type ReportState = {
  message?: string;
  errors?: {
    prompt?: string[];
  };
  report?: string;
};

export async function generateReportAction(prevState: ReportState, formData: FormData): Promise<ReportState> {
  const validatedFields = ReportSchema.safeParse({
    prompt: formData.get('prompt'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check the fields.',
    };
  }

  try {
    // Buscar dados reais do sistema diretamente (evitar fetch em server action)
    const {
      getRisksForAnalysis,
      getAllControls,
      getAllEscalations,
      getIdentifiedRisks,
      getTopRisks,
    } = await import('@/lib/azure-table-storage');

    const [risks, controls, escalations, identifiedRisks, topRisks] = await Promise.all([
      getRisksForAnalysis(),
      getAllControls(),
      getAllEscalations(),
      getIdentifiedRisks(),
      getTopRisks(),
    ]);

    console.log('Dados carregados:', {
      risks: risks.length,
      controls: controls.length,
      escalations: escalations.length,
      identifiedRisks: identifiedRisks.length,
      topRisks: topRisks.length,
    });

    const result = await generateRiskReport({
      prompt: validatedFields.data.prompt,
      risks: risks as any[],
      controls: controls as any[],
      escalations: escalations as any[],
      identifiedRisks: identifiedRisks as any[],
      topRisks: topRisks as any[],
    });
    
    console.log('Relatório gerado:', result.report ? 'Sucesso' : 'Vazio');
    
    return {
      message: 'Report generated successfully.',
      report: result.report,
    };
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return {
      message: `Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
