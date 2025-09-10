'use server';

import { generateRiskReport } from '@/ai/flows/generate-risk-report';
import { z } from 'zod';

const ReportSchema = z.object({
  riskDetails: z.string().min(10, 'Risk details must be at least 10 characters.'),
  controlDetails: z.string().min(10, 'Control details must be at least 10 characters.'),
  kpiDetails: z.string().min(10, 'KPI details must be at least 10 characters.'),
  reportFormat: z.string(),
});

export type ReportState = {
  message?: string;
  errors?: {
    riskDetails?: string[];
    controlDetails?: string[];
    kpiDetails?: string[];
    reportFormat?: string[];
  };
  report?: string;
};

export async function generateReportAction(prevState: ReportState, formData: FormData): Promise<ReportState> {
  const validatedFields = ReportSchema.safeParse({
    riskDetails: formData.get('riskDetails'),
    controlDetails: formData.get('controlDetails'),
    kpiDetails: formData.get('kpiDetails'),
    reportFormat: formData.get('reportFormat'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check the fields.',
    };
  }

  try {
    const result = await generateRiskReport(validatedFields.data);
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
