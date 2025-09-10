'use server';

/**
 * @fileOverview An AI agent for generating risk reports.
 *
 * - generateRiskReport - A function that generates a risk report.
 * - GenerateRiskReportInput - The input type for the generateRiskReport function.
 * - GenerateRiskReportOutput - The return type for the generateRiskReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRiskReportInputSchema = z.object({
  riskDetails: z
    .string()
    .describe('Detailed information about the risks to be included in the report.'),
  controlDetails: z
    .string()
    .describe('Detailed information about the controls in place for the risks.'),
  kpiDetails: z.string().describe('Detailed information about the KPIs associated with the risks.'),
  reportFormat: z
    .string()
    .describe('The desired format of the report, e.g., bullet points, paragraph, etc.'),
});
export type GenerateRiskReportInput = z.infer<typeof GenerateRiskReportInputSchema>;

const GenerateRiskReportOutputSchema = z.object({
  report: z.string().describe('The generated risk report.'),
});
export type GenerateRiskReportOutput = z.infer<typeof GenerateRiskReportOutputSchema>;

export async function generateRiskReport(input: GenerateRiskReportInput): Promise<GenerateRiskReportOutput> {
  return generateRiskReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRiskReportPrompt',
  input: {schema: GenerateRiskReportInputSchema},
  output: {schema: GenerateRiskReportOutputSchema},
  prompt: `You are an AI agent specializing in generating comprehensive risk reports.

  You will use the provided details about risks, controls, and KPIs to generate a risk report in the specified format.

  Risk Details: {{{riskDetails}}}
  Control Details: {{{controlDetails}}}
  KPI Details: {{{kpiDetails}}}
  Report Format: {{{reportFormat}}}

  Generate the risk report based on the information provided. The report should be well-structured and easy to understand.
  `,
});

const generateRiskReportFlow = ai.defineFlow(
  {
    name: 'generateRiskReportFlow',
    inputSchema: GenerateRiskReportInputSchema,
    outputSchema: GenerateRiskReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
