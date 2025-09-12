

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
  gerencia: string;
  diretoria: string;
  processo: string;
  risco: string; // Title
  descricaoDoRisco: string;
  dataDeIdentificacao: string;
  origemDoRisco: string; // ORIGEM column
  causaRaizDoRisco: string;
  consequenciaDoRisco: string;
  categoriaDoRisco: string; // Categoria
  tipoDeRisco: string; // TIPO ER
  processoAfetado: string;
  
  // Inherent Risk
  probabilidadeInerente: 'Raro' | 'Improvável' | 'Possível' | 'Provável' | 'Quase Certo' | ''; // PROB
  impactoInerente: 'Insignificante' | 'Menor' | 'Moderado' | 'Maior' | 'Catastrófico' | ''; // IMP
  nivelDeRiscoInerente: 'Baixo' | 'Médio' | 'Alto' | 'Crítico' | 'Extremo' | ''; // Calculated
  
  // Treatment
  estrategia: string; // AÇÃO column
  descricaoDoControle: string;
  
  // Residual Risk
  probabilidadeResidual: 'Raro' | 'Improvável' | 'Possível' | 'Provável' | 'Quase Certo' | '';
  impactoResidual: 'Insignificante' | 'Menor' | 'Moderado' | 'Maior' | 'Catastrófico' | '';
  nivelDeRiscoResidual: 'Baixo' | 'Médio' | 'Alto' | 'Crítico' | 'Extremo' | ''; // Calculated
  
  // Management and Monitoring
  statusDoRisco: 'Aberto' | 'Em Tratamento' | 'Fechado' | 'Mitigado' | '';
  planoDeAcao: string;
  responsavelPeloRisco: string; // Responsável
  dataDaUltimaRevisao: string;
  dataDaProximaRevisao: string;
  
  // New fields from image
  topRiskAssociado: string;
  categoriaMP: string;
  orig: number;
  prob: number;
  ctrl: number;
  tempo: number;
  facil: number;
  elev: number;
  ier: number;
  filho: string;
  v: number;
  d: number;
  g: number;
  u: number;
  t_score: number; // Renamed from "t" to avoid conflict
  i_score: number; // Renamed from "i" to avoid conflict
  oredsX: number;
  t_rating: number; // from the second 'T' column
  riscosAceitaveis: string;
  riscosNaoAceitaveis: string;
  riscosMix: string;
  statusControle: string;
  urlDoCC: string;
  possuiCC: string;
  pilar: string;
  pilarESG: string;
  indicador: string;
  subtema: string;
  tronco: string;
  englobado: string;
  fatorDeRisco: string;
  horizonte: string;
  ge: string;
  gr: string;
  observacao: string;
  dataDaAvaliacao: string;
  contexto: string;
  bowtie: string;
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
  corporateImpact: number; // 0-10
  // Field 12
  organizationalRelevance: number; // 0-10
  // Field 13
  contextualizedProbability: number; // 0-10
  // Field 14
  currentControlCapacity: number; // 0-10 (inverted logic)
  // Field 15
  containmentTime: number; // 0-10 (inverted logic)
  // Field 16
  technicalFeasibility: number; // 0-10
};
