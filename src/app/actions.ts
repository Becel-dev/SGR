'use server';

import { generateRiskReport } from '@/ai/flows/generate-risk-report';
import { controlsData, kpisData, risksData } from '@/lib/mock-data';
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
    const result = await generateRiskReport({
      prompt: validatedFields.data.prompt,
      risks: risksData,
      controls: controlsData,
      kpis: kpisData,
    });
    return {
      message: 'Report generated successfully.',
      report: result.report,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Failed to generate report. An unexpected error occurred.',
    };
  }
}
