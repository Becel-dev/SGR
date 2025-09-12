
import type { IdentifiedRisk } from './types';

export const identifiedRisksData: IdentifiedRisk[] = [
  {
    id: 'IR-001',
    riskName: 'Interrupção no fornecimento de peças críticas',
    topRisk: 'Risco 09. Dependência de Fornecedores',
    riskFactor: '1.1 Paralisação e/ou indisponibilidade operacional por vandalismo, greve ou manifestação',
    probableCause: 'Alta dependência de fornecedor único internacional sem plano de contingência.',
    riskScenario: 'Crise geopolítica impede o envio de componentes essenciais.',
    expectedConsequence: 'Locomotivas paradas, queda na capacidade operacional, multas contratuais.',
    currentControls: 'Estoque de peças críticas, Contratos com cláusulas de penalidade.',
    riskRole: 'De negócio direto',
    pointingType: 'Risco efetivo',
    businessObjectives: ['Continuidade operacional', 'Integridade financeira'],
    corporateImpact: 8,
    organizationalRelevance: 8,
    contextualizedProbability: 6,
    currentControlCapacity: 7,
    containmentTime: 8,
    technicalFeasibility: 6
  },
  {
    id: 'IR-002',
    riskName: 'Vazamento de dados de clientes',
    topRisk: 'Risco 07. Impactos no Ambiente Operacional de Tecnologia',
    riskFactor: '7.1 Inclusão',
    probableCause: 'Vulnerabilidade em sistema web não corrigida.',
    riskScenario: 'Atacante explora falha de SQL Injection e exfiltra base de dados de clientes.',
    expectedConsequence: 'Danos à reputação, multas da LGPD, perda de confiança do cliente.',
    currentControls: 'Firewall de Aplicação Web (WAF), Scans de vulnerabilidade periódicos.',
    riskRole: 'De negócio direto',
    pointingType: 'Facilitador técnico',
    businessObjectives: ['Imagem e reputação', 'Conformidade legal/regulatória'],
    corporateImpact: 9,
    organizationalRelevance: 7,
    contextualizedProbability: 4,
    currentControlCapacity: 6,
    containmentTime: 5,
    technicalFeasibility: 5
  }
];
