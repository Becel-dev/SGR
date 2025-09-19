

export type Role = 'admin' | 'moderator' | 'editor' | 'viewer';

export type User = {
  name: string;
  email: string;
  avatarUrl: string;
  role: Role;
};

export type Kpi = {
  id: string;
  controlId: number;
  frequencia: string;
  ultimoKpiInformado?: string;
  prazoProximoRegistro: string;
  diasPendentes: number;
  status: 'Em dia' | 'Atrasado' | 'Pendente';
  responsavel: string;
  emailResponsavel: string;
};

export type AssociatedRisk = {
  riskId: string;
  codigoMUE: string;
  titulo: string;
};

export type Control = {
  criadoEm: string;
  id: number;
  nomeControle: string;
  tipo: string;
  classificacao: string;
  status: string;
  donoControle: string;
  emailDono: string;
  area: string;
  dataUltimaVerificacao: string;
  frequenciaMeses: number;
  proximaVerificacao: string;
  validacao: string;
  onePager: string;
  evidencia: string;
  criadoPor: string;
  modificadoEm: string;
  modificadoPor: string;
  preenchimentoKPI: string;
  criticidade: string;
  associatedRisks: AssociatedRisk[];
};


export type Risk = {
  id: string;
  status: 'Novo' | 'Em Análise' | 'Analisado';
  gerencia: string;
  risco: string;
  topRiskAssociado: string;
  fatorDeRisco: string;
  categoria: string;
  taxonomia: string;

  imp: number;
  org: number;
  prob: number;
  ctrl: number;
  tempo: number;
  facil: number;
  ier: number;
  
  responsavelBowtie: string;
  x: number;
  y: number;
  origem: string;
  tipoIER: 'Crítico' | 'Prioritário' | 'Gerenciável' | 'Aceitável' | '';
  
  modificado: string;
  criado: string;
  criadoPor: string;
  modificadoPor: string;

  bowtieRealizado: 'Realizado' | 'Não Realizado' | 'Em Andamento';
  urlDoCC: string;
  possuiCC: string;
  
  pilar: string;
  temaMaterial: string;
  pilarESG: string;
  englobador: string;
  horizonteTempo: string;
  geOrigemRisco: string;
  
  observacao: string;
  dataAlteracaoCuradoria: string;
  contexto: string;
  responsavel?: string;
  probabilidadeResidual?: "Raro" | "Improvável" | "Possível" | "Provável" | "Quase Certo";
  impactoResidual?: "Insignificante" | "Menor" | "Moderado" | "Maior" | "Catastrófico";
  escalationRule?: EscalationRule;
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

// Bowtie V2 Types
export type BowtieBarrierNode = {
  id: string;
  controlId?: number; // Link to the actual Control
  title: string;
  responsible: string;
  effectiveness: 'Eficaz' | 'Pouco Eficaz' | 'Ineficaz';
  status: 'Implementado' | 'Não Implementado' | 'Pendente' | 'Implementado com Pendência' | 'Implementação Futura';
};

export type BowtieThreat = {
  id: string;
  title: string;
  barriers: BowtieBarrierNode[];
};

export type BowtieConsequence = {
  id: string;
  title: string;
  barriers: BowtieBarrierNode[];
};

export type BowtieTopEvent = {
  title: string;
  description: string;
};

export type BowtieData = {
  id: string;
  riskId: string;
  topEvent: BowtieTopEvent;
  threats: BowtieThreat[];
  consequences: BowtieConsequence[];
  createdAt: string;
  responsible: string;
  approvalStatus: 'Em aprovação' | 'Aprovado';
  version: number;
};


// New type for the Identification module
export type IdentifiedRisk = {
  id: string;
  // Field 1
  riskName: string;
  // Field 2
  topRisk: string;
  // Field 3
  riskFactor: string;
  // Field 4
  probableCause: string;
  // Field 5
  riskScenario: string;
  // Field 6
  expectedConsequence: string;
  // Field 7
  currentControls: string;
  // Field 8
  riskRole: 'Facilitador técnico' | 'Amplificador de impacto' | 'Estruturante' | 'De negócio direto';
  // Field 9
  pointingType: 'Risco efetivo' | 'Facilitador técnico' | 'Amplificador de impacto';
  // Field 10
  businessObjectives: string[];
  // Field 11
  corporateImpact: number; // 0-10 - IMP
  // Field 12
  organizationalRelevance: number; // 0-10 - ORG
  // Field 13
  contextualizedProbability: number; // 0-10 - PROB
  // Field 14
  currentControlCapacity: number; // 0-10 (inverted logic) - CTRL
  // Field 15
  containmentTime: number; // 0-10 (inverted logic) - TEMPO
  // Field 16
  technicalFeasibility: number; // 0-10 - FACIL
};

// Escalation Module Types
export type EscalationLevel = {
  level: number;
  triggerDays: number; // X, Y, Z dias
  triggerPercentage: number; // N% fora da meta
  role: string;
  responsible: string;
  enabled: boolean;
};

export type EscalationRule = {
  metricType: 'days' | 'percentage';
  levels: EscalationLevel[];
};
