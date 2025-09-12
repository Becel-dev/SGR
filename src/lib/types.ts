

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

export type Control = {
  criadoEm: string;
  id: number;
  codigoMUE: string;
  titulo: string;
  idRiscoMUE: number;
  descricaoMUE: string;
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
  gerenciaRisco: string;
  topRiskAssociado: string;
  idRiscos: string;
  criticidade: string;
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
  tipoIER: string;
  
  modificado: string;
  criado: string;
  criadoPor: string;
  modificadoPor: string;

  bowtieRealizado: string;
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
  title: string;
  responsible: string;
  effectiveness: 'Eficaz' | 'Pouco Eficaz' | 'Ineficaz';
  status: 'Implementado' | 'Não Implementado' | 'Pendente';
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
