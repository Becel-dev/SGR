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
  risks: z.array(z.any()).describe('A list of all risks analyzed in the system (RiskAnalysis).'),
  controls: z.array(z.any()).describe('A list of all controls registered in the system.'),
  escalations: z.array(z.any()).describe('A list of all escalation configurations by control.'),
  identifiedRisks: z.array(z.any()).describe('A list of all identified risks in the system.'),
  topRisks: z.array(z.any()).describe('A list of top risks in the system.'),
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

Aqui estão os dados disponíveis no sistema de Gestão de Riscos:

1. **Riscos Analisados (RiskAnalysis)**: Todos os riscos que foram analisados e estão no sistema.
   - Dados: {{{json risks}}}
   - Contém: nome, status, categoria, IER (Índice de Exposição ao Risco), probabilidade/impacto residual, responsável, etc.

2. **Controles**: Todos os controles implementados para mitigar riscos.
   - Dados: {{{json controls}}}
   - Contém: nome, categoria, status, dono, área, criticidade, riscos associados, evidências, etc.

3. **Escalonamentos**: Configurações de escalonamento por controle (% fora da meta e dias vencidos).
   - Dados: {{{json escalations}}}
   - Contém: controlId, controlName, níveis de escalonamento (N1, N2, N3), supervisores, emails, thresholds.

4. **Riscos Identificados**: Riscos identificados no módulo de identificação.
   - Dados: {{{json identifiedRisks}}}
   - Contém: nome do risco, top risk, fator de risco, causa provável, cenário, consequência, controles atuais, IER.

5. **Top Risks**: Os principais riscos da empresa.
   - Dados: {{{json topRisks}}}
   - Contém: nome, descrição, categoria, dono, status.

Pedido do Usuário:
"{{{prompt}}}"

Instruções:
- Baseie sua resposta EXCLUSIVAMENTE nos dados fornecidos acima.
- Responda de forma direta e objetiva à solicitação do usuário.
- Use formatação Markdown para melhor legibilidade (títulos, listas, tabelas, negrito).
- Se o pedido for para listar itens, use listas com bullet points ou tabelas.
- Inclua números e métricas quando relevante.
- Sempre responda em português do Brasil (pt-br).
- Se o usuário pedir análises cruzadas (ex: controles x riscos), cruze os dados usando os IDs e relacionamentos.
- Para escalonamentos, explique os níveis e thresholds de forma clara.
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
