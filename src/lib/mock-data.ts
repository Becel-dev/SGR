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
        title: 'Falha no sistema de freios',
        status: 'Aprovado',
        criticality: 'Crítico',
        area: 'Material Rodante',
        responsible: 'Alice Johnson',
        lastUpdate: '2024-07-28',
    },
    {
        id: 'R002',
        title: 'Descarrilamento em pátio',
        status: 'Em Revisão',
        criticality: 'Alto',
        area: 'Operações',
        responsible: 'Bob Williams',
        lastUpdate: '2024-07-27',
    },
    {
        id: 'R003',
        title: 'Colisão em passagem de nível',
        status: 'Aprovado',
        criticality: 'Crítico',
        area: 'Via Permanente',
        responsible: 'Carla Davis',
        lastUpdate: '2024-07-26',
    },
    {
        id: 'R004',
        title: 'Vazamento de carga perigosa',
        status: 'Rascunho',
        criticality: 'Alto',
        area: 'Meio Ambiente',
        responsible: 'David Miller',
        lastUpdate: '2024-07-29',
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
