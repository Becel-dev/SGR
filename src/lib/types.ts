export type Role = 'admin' | 'moderator' | 'editor' | 'viewer';

export type User = {
  name: string;
  email: string;
  avatarUrl: string;
  role: Role;
};

export type Kpi = {
  id: string;
  name: string;
  value: number;
  target: number;
  period: string;
};

export type Risk = {
  id: string;
  risk: string;
  description: string;
  identificationDate: string;
  riskSource: 'Interna' | 'Externa';
  primaryCause: string;
  consequence: string;
  riskType: 'Estratégico' | 'Financeiro' | 'Operacional' | 'Conformidade';
  responsibleArea: string;
  impactedProcess: string;
  inherentLikelihood: 'Raro' | 'Improvável' | 'Possível' | 'Provável' | 'Quase Certo';
  inherentImpact: 'Insignificante' | 'Menor' | 'Moderado' | 'Maior' | 'Catastrófico';
  inherentRiskLevel: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
  responseStrategy: 'Mitigar' | 'Aceitar' | 'Transferir' | 'Evitar';
  controlDescription: string;
  controlType: 'Preventivo' | 'Detectivo' | 'Corretivo';
  controlEffectiveness: 'Ineficaz' | 'Pouco Eficaz' | 'Eficaz' | 'Muito Eficaz';
  residualLikelihood: 'Raro' | 'Improvável' | 'Possível' | 'Provável' | 'Quase Certo';
  residualImpact: 'Insignificante' | 'Menor' | 'Moderado' | 'Maior' | 'Catastrófico';
  residualRiskLevel: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
  status: 'Aberto' | 'Em Tratamento' | 'Fechado' | 'Mitigado';
  responsible: string;
  lastReviewDate: string;
  nextReviewDate: string;
};

export type RecentActivity = {
  id: string;
  user: {
    name: string;
    avatarUrl: string;
  };
  action: string;
  target: string;
  timestamp: string;
};

export type BowtieNodeData = {
    label: string;
    description: string;
};

export type BowtieData = {
    event: BowtieNodeData;
    threats: BowtieNodeData[];
    preventiveControls: BowtieNodeData[];
    consequences: BowtieNodeData[];
    mitigatoryControls: BowtieNodeData[];
};
