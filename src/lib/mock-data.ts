import type { Risk, RecentActivity, BowtieData } from './types';

export const kpiData = {
  compliance: {
    value: 92.5,
    change: 1.2,
  },
  overdueItems: {
    value: 8,
    change: -3,
  },
  criticalRisks: {
    value: 3,
    change: 1,
  },
  controlDeviations: {
    value: 5,
    change: 2,
  },
};

export const complianceChartData = [
  { month: 'Jan', compliance: 88, target: 90 },
  { month: 'Feb', compliance: 91, target: 90 },
  { month: 'Mar', compliance: 92, target: 90 },
  { month: 'Apr', compliance: 89, target: 90 },
  { month: 'May', compliance: 93, target: 90 },
  { month: 'Jun', compliance: 95, target: 90 },
  { month: 'Jul', compliance: 92.5, target: 90 },
];

export const statusBreakdownChartData = [
  { name: 'No Prazo', value: 400, fill: 'hsl(var(--chart-1))' },
  { name: 'Em Risco', value: 150, fill: 'hsl(var(--chart-2))' },
  { name: 'Atrasado', value: 50, fill: 'hsl(var(--destructive))' },
];

export const riskMatrixData = [
  { impact: 'Insignificante', probability: 0, color: 'bg-green-200' },
  { impact: 'Menor', probability: 1, color: 'bg-yellow-200' },
  { impact: 'Moderado', probability: 2, color: 'bg-orange-300' },
  { impact: 'Maior', probability: 3, color: 'bg-red-400' },
  { impact: 'Catastrófico', probability: 4, color: 'bg-red-600' },
];


export const recentActivityData: RecentActivity[] = [
    {
        id: '1',
        user: { name: 'Alice Johnson', avatarUrl: 'https://picsum.photos/seed/101/32/32' },
        action: 'criou um novo risco',
        target: 'Falha no sistema de freios',
        timestamp: '2 horas atrás',
    },
    {
        id: '2',
        user: { name: 'Bob Williams', avatarUrl: 'https://picsum.photos/seed/102/32/32' },
        action: 'atualizou o controle',
        target: 'Inspeção de via semanal',
        timestamp: '5 horas atrás',
    },
    {
        id: '3',
        user: { name: 'Carla Davis', avatarUrl: 'https://picsum.photos/seed/103/32/32' },
        action: 'aprovou o risco',
        target: 'Descarrilamento em pátio',
        timestamp: '1 dia atrás',
    },
    {
        id: '4',
        user: { name: 'David Miller', avatarUrl: 'https://picsum.photos/seed/104/32/32' },
        action: 'comentou no KPI',
        target: '% de conformidade de inspeção',
        timestamp: '2 dias atrás',
    },
];

export const risksData: Risk[] = [
  {
    id: 'R001',
    risk: 'Falha no sistema de freios',
    description: 'Falha completa ou parcial do sistema de frenagem do trem, resultando em incapacidade de parar ou reduzir a velocidade conforme necessário.',
    identificationDate: '2023-01-15',
    riskSource: 'Interna',
    primaryCause: 'Desgaste excessivo das sapatas de freio',
    consequence: 'Colisão com outros trens ou obstáculos, descarrilamento.',
    riskType: 'Operacional',
    responsibleArea: 'Manutenção',
    impactedProcess: 'Operação Ferroviária',
    inherentLikelihood: 'Possível',
    inherentImpact: 'Catastrófico',
    inherentRiskLevel: 'Crítico',
    responseStrategy: 'Mitigar',
    controlDescription: 'Inspeções regulares e substituição preventiva das sapatas de freio.',
    controlType: 'Preventivo',
    controlEffectiveness: 'Eficaz',
    residualLikelihood: 'Raro',
    residualImpact: 'Maior',
    residualRiskLevel: 'Alto',
    status: 'Em Tratamento',
    responsible: 'João Silva',
    lastReviewDate: '2024-07-15',
    nextReviewDate: '2025-01-15',
  },
  {
    id: 'R002',
    risk: 'Descarrilamento em pátio',
    description: 'Saída do trem dos trilhos durante manobras em pátios de baixa velocidade.',
    identificationDate: '2023-02-20',
    riskSource: 'Interna',
    primaryCause: 'AMV (Aparelho de Mudança de Via) com defeito',
    consequence: 'Danos ao material rodante e à via, interrupção das operações no pátio.',
    riskType: 'Operacional',
    responsibleArea: 'Operações',
    impactedProcess: 'Manobras em Pátio',
    inherentLikelihood: 'Provável',
    inherentImpact: 'Moderado',
    inherentRiskLevel: 'Alto',
    responseStrategy: 'Mitigar',
    controlDescription: 'Manutenção preventiva dos AMVs e treinamento dos operadores de manobra.',
    controlType: 'Preventivo',
    controlEffectiveness: 'Eficaz',
    residualLikelihood: 'Improvável',
    residualImpact: 'Menor',
    residualRiskLevel: 'Baixo',
    status: 'Mitigado',
    responsible: 'Maria Oliveira',
    lastReviewDate: '2024-06-30',
    nextReviewDate: '2024-12-30',
  },
  {
    id: 'R003',
    risk: 'Aumento inesperado do preço do combustível',
    description: 'Aumento súbito e significativo no custo do diesel, impactando os custos operacionais.',
    identificationDate: '2023-03-10',
    riskSource: 'Externa',
    primaryCause: 'Volatilidade do mercado internacional de petróleo.',
    consequence: 'Aumento dos custos operacionais, redução da margem de lucro.',
    riskType: 'Financeiro',
    responsibleArea: 'Financeiro',
    impactedProcess: 'Gestão de Custos',
    inherentLikelihood: 'Possível',
    inherentImpact: 'Maior',
    inherentRiskLevel: 'Alto',
    responseStrategy: 'Transferir',
    controlDescription: 'Contratos de hedge para fixar o preço do combustível.',
    controlType: 'Corretivo',
    controlEffectiveness: 'Muito Eficaz',
    residualLikelihood: 'Improvável',
    residualImpact: 'Menor',
    residualRiskLevel: 'Baixo',
    status: 'Fechado',
    responsible: 'Carlos Pereira',
    lastReviewDate: '2024-07-20',
    nextReviewDate: '2025-01-20',
  },
  {
    id: 'R004',
    risk: 'Não conformidade com novas regulamentações ambientais',
    description: 'Falha em atender aos novos requisitos regulatórios ambientais, resultando em multas e sanções.',
    identificationDate: '2023-04-05',
    riskSource: 'Externa',
    primaryCause: 'Falta de monitoramento de mudanças na legislação.',
    consequence: 'Multas, sanções legais, dano à reputação da empresa.',
    riskType: 'Conformidade',
    responsibleArea: 'Jurídico',
    impactedProcess: 'Gestão Ambiental',
    inherentLikelihood: 'Improvável',
    inherentImpact: 'Maior',
    inherentRiskLevel: 'Médio',
    responseStrategy: 'Evitar',
    controlDescription: 'Sistema de monitoramento regulatório e auditorias internas de conformidade.',
    controlType: 'Preventivo',
    controlEffectiveness: 'Eficaz',
    residualLikelihood: 'Raro',
    residualImpact: 'Moderado',
    residualRiskLevel: 'Baixo',
    status: 'Aberto',
    responsible: 'Ana Souza',
    lastReviewDate: '2024-07-01',
    nextReviewDate: '2025-01-01',
  },
];


export const bowtieData: BowtieData = {
    event: {
        label: "Descarrilamento",
        description: "Saída do trem dos trilhos na via principal.",
    },
    threats: [
        { label: "Excesso de Velocidade", description: "Operação acima da VMA do trecho." },
        { label: "Falha de Material Rodante", description: "Ex: rolamento, truque, rodeiro." },
        { label: "Defeito na Via", description: "Ex: trilho quebrado, fixação." },
    ],
    preventiveControls: [
        { label: "ATC/ATS", description: "Controle de velocidade embarcado." },
        { label: "Manutenção Preditiva", description: "Inspeção e troca de componentes." },
        { label: "Inspeção de Via", description: "Ultrassom, veículo de controle." },
    ],
    consequences: [
        { label: "Danos à Carga", description: "Avaria ou perda total da carga." },
        { label: "Impacto Ambiental", description: "Vazamento de produtos perigosos." },
        { label: "Interdição da Via", description: "Bloqueio da linha para reparos." },
    ],
    mitigatoryControls: [
        { label: "Plano de Emergência", description: "Ação rápida para contenção de danos." },
        { label: "Kits de Mitigação", description: "Materiais para contenção de vazamentos." },
        { label: "Equipe de Restabelecimento", description: "Equipe para liberar a via rapidamente." },
    ]
};
