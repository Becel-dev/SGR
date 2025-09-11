'use server';

/**
 * @fileOverview An AI agent for generating risk reports based on system data.
 *
 * - generateRiskReport - A function that generates a risk report.
 * - GenerateRiskReportInput - The input type for the generateRiskReport function.
 * - GenerateRiskReportOutput - The return type for the generateRiskReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Risk, Control, Kpi } from '@/lib/types';


const GenerateRiskReportInputSchema = z.object({
  prompt: z.string().describe('The user\'s request or question about the data.'),
  risks: z.array(z.any()).describe('A list of all risks registered in the system.'),
  controls: z.array(z.any()).describe('A list of all controls registered in the system.'),
  kpis: z.array(z.any()).describe('A list of all KPIs registered in the system.'),
});
export type GenerateRiskReportInput = z.infer<typeof GenerateRiskReportInputSchema>;

const GenerateRiskReportOutputSchema = z.object({
  report: z.string().describe('The generated risk report, formatted in Portuguese (pt-br).'),
});
export type GenerateRiskReportOutput = z.infer<typeof GenerateRiskReportOutputSchema>;

export async function generateRiskReport(input: GenerateRiskReportInput): Promise<GenerateRiskReportOutput> {
  return generateRiskReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRiskReportPrompt',
  input: {schema: GenerateRiskReportInputSchema},
  output: {schema: GenerateRiskReportOutputSchema},
  prompt: `Você é um especialista em análise de riscos e geração de relatórios para uma grande empresa de logística (Rumo).

Sua tarefa é analisar os dados fornecidos e gerar um relatório claro e conciso em português do Brasil (pt-br) que responda diretamente ao pedido do usuário.

Aqui estão os dados disponíveis no sistema:
1. Riscos: Uma lista de todos os riscos mapeados.
   - Dados de Riscos: {{{json risks}}}
2. Controles: Uma lista de todos os controles para mitigar os riscos.
   - Dados de Controles: {{{json controls}}}
3. KPIs: Uma lista de todos os indicadores chave de performance para monitorar os controles.
   - Dados de KPIs: {{{json kpis}}}

Pedido do Usuário:
"{{{prompt}}}"

Instruções:
- Baseie sua resposta EXCLUSIVAMENTE nos dados fornecidos (Riscos, Controles, KPIs).
- Responda de forma direta e objetiva à solicitação do usuário.
- Se o pedido for para criar um sumário ou listar itens, use tópicos (bullet points) para clareza.
- Formate a saída como um relatório bem estruturado.
- Sempre responda em português do Brasil (pt-br).
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
