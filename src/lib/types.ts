export type Role = 'admin' | 'moderator' | 'editor' | 'viewer';

export type User = {
  name: string;
  email: string;
  avatarUrl: string;
  role: Role;
};

export type EvidenceFile = {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  uploadedBy: string;
};

export type KpiResponsible = {
  name: string;
  email: string;
};

export type Kpi = {
  id: string;
  controlId: string;
  controlName: string;
  donoControle: string;
  emailDonoControle: string;
  responsibles: KpiResponsible[]; // Responsáveis adicionais
  status: 'OK' | 'NOK';
  dataInicioVerificacao: string; // Data de início da verificação (imutável após criação)
  dataProximaVerificacao: string; // Data da próxima verificação (atualizada após evidência)
  frequenciaDias: number; // Frequência em dias
  evidenceFiles: EvidenceFile[]; // Histórico de evidências
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
};

export type AssociatedRisk = {
  riskId: string;
  codigoMUE: string;
  titulo: string;
};

export type Control = {
  criadoEm: string | Date;
  id: string;
  nomeControle: string;
  categoria: string; // Inspeção, Procedimento, Checklist
  classificacao: string;
  status: string;
  donoControle: string;
  emailDono: string;
  area: string;
  validacao?: string;
  onePager: string;
  criadoPor?: string;
  modificadoEm: string;
  modificadoPor: string;
  preenchimentoKPI?: string;
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
  donoRisco?: string;
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
  controlId: string; // Link to the actual Control
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
  id:string;
  title: string;
  barriers: BowtieBarrierNode[];
};

export type BowtieTopEvent = {
  title: string;
  description: string;
};

export type BowtieData = {
  id: string; // Will be partitionKey
  riskId: string; // Will be rowKey
  topEvent: BowtieTopEvent;
  threats: BowtieThreat[];
  consequences: BowtieConsequence[];
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
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
  // Dono do Risco (auto-preenchido pelo Fator de Risco)
  donoRisco?: string;
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
  // Field 17
  observacao?: string; // Campo de observações livres
  // Auditoria
  createdBy: string; // Usuário criador
  createdAt: string; // Data de criação (ISO)
  updatedBy: string; // Usuário da última alteração
  updatedAt: string; // Data da última alteração (ISO)
};

// Escalation Module Types (Reformulado)
export type EscalationLevel = {
  threshold: number; // % abaixo da meta OU dias vencidos
  supervisor: string; // Nome do superior
  supervisorEmail: string; // E-mail do superior
};

export type EscalationPercentageConfig = {
  enabled: boolean;
  level1: EscalationLevel;
  level2: EscalationLevel;
  level3: EscalationLevel;
};

export type EscalationDaysConfig = {
  enabled: boolean;
  level1: EscalationLevel;
  level2: EscalationLevel;
  level3: EscalationLevel;
};

export type EscalationConfig = {
  id: string; // UUID
  controlId: string; // ID do controle
  controlName?: string; // Nome do controle (denormalizado para exibição)
  percentageConfig: EscalationPercentageConfig;
  daysConfig: EscalationDaysConfig;
  enabled: boolean; // Habilitar/desabilitar o escalonamento inteiro
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
};

// Risk Analysis Module Types
export type RiskAnalysis = IdentifiedRisk & {
  // --- Fields from Identification (Mapped) ---
  // id, riskName, topRisk, riskFactor, riskScenario, corporateImpact (IMP), 
  // organizationalRelevance (ORG), contextualizedProbability (PROB), 
  // currentControlCapacity (CTRL), containmentTime (TEMPO), technicalFeasibility (FACIL)
  // createdBy, createdAt, updatedBy, updatedAt
  
  // --- Status and ID ---
  status: 'Novo' | 'Em Análise' | 'Analisado';
  analysisId: string; // PartitionKey for the new table

  // --- Identification & Context (Complementary) ---
  gerencia?: string;
  categoria?: string;
  taxonomia?: string;
  observacao?: string;
  contexto?: string; // This seems to be the same as riskScenario, can be clarified.

  // --- Analysis & Classification ---
  ier?: number;
  origem?: string; // e.g., 'Identificação de Risco'
  tipoIER?: string;
  x?: number; // Coordinate
  y?: number; // Coordinate
  englobador?: string;

  // --- ESG & Governance ---
  pilar?: string;
  temaMaterial?: string;
  pilarESG?: string;
  geOrigemRisco?: string;

  // --- Management & Deadlines ---
  responsavelBowtie?: string;
  horizonteTempo?: string;
  dataAlteracaoCuradoria?: string; // Date as string (ISO)
  
  // --- Controls & Bowtie ---
  bowtieRealizado?: string; // 'Realizado' | 'Não Realizado' | 'Em Andamento';
  possuiCC?: string;
  urlDoCC?: string; // URL
  // Campo auxiliar para exibição/associação
  topRiskAssociado?: string;
  
  // --- Residual Risk (Example) ---
  residualRiskProbability?: "Raro" | "Improvável" | "Possível" | "Provável" | "Quase Certo";
  residualRiskImpact?: "Insignificante" | "Menor" | "Moderado" | "Maior" | "Catastrófico";
};

// IER Rules Parameter
export type IerRule = {
  min: number;
  max: number;
  label: string;
  color: string;
};

export type IerParameter = {
  name: 'ierRules';
  rules: IerRule[];
};

// TopRisk Parameter
export type TopRisk = {
  id: string;
  nome: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
};

export type TopRiskParameter = {
  name: 'topRisks';
  items: TopRisk[];
};

// RiskFactor Parameter
export type RiskFactor = {
  id: string;
  nome: string;
  donoRisco: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
};

export type RiskFactorParameter = {
  name: 'riskFactors';
  items: RiskFactor[];
};

// TemaMaterial Parameter
export type TemaMaterial = {
  id: string;
  nome: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
};

export type TemaMaterialParameter = {
  name: 'temasMateriais';
  items: TemaMaterial[];
};

// CategoriaControle Parameter
export type CategoriaControle = {
  id: string;
  nome: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
};

export type CategoriaControleParameter = {
  name: 'categoriasControle';
  items: CategoriaControle[];
};

// Action Module Types (Controle de Ações)
export type ActionEvidence = {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  uploadedBy: string;
};

export type Action = {
  id: string;
  controlId: string; // Vinculado ao controle crítico não implementado
  controlName: string; // Nome do controle (denormalizado para exibição)
  responsavel: string; // Nome do responsável pela ação
  email: string; // Email do responsável
  prazo: string; // Data limite (ISO date string)
  descricao: string; // Descrição da ação de correção
  contingencia: string; // Plano de contingência
  criticidadeAcao: number; // Criticidade de 0 a 10
  valorEstimado: number; // Valor estimado em R$
  status: 'Pendente' | 'Em Andamento' | 'Concluída' | 'Vencida'; // Status da ação
  evidences: ActionEvidence[]; // Evidências de execução da tarefa
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
};

// Access Profile Module Types
export type ModulePermission = {
  module: string; // Nome do módulo (ex: "Identificação de Risco")
  actions: {
    view: boolean; // Visualizar
    create: boolean; // Criar
    edit: boolean; // Editar
    delete: boolean; // Excluir
    export: boolean; // Exportar
  };
};

export type AccessProfile = {
  id: string;
  name: string; // Nome do perfil (ex: "Gestor de Riscos")
  description?: string; // Descrição opcional do perfil
  permissions: ModulePermission[]; // Permissões por módulo
  isActive: boolean; // Perfil ativo ou inativo
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
};

// Access Control Module Types (Vínculo Usuário-Perfil)
export type UserAccessControl = {
  id: string;
  userId: string; // ID do usuário no EntraID
  userName: string; // Nome do usuário
  userEmail: string; // Email do usuário
  profileId: string; // ID do perfil de acesso vinculado
  profileName: string; // Nome do perfil (denormalizado para exibição)
  isActive: boolean; // Vínculo ativo ou inativo
  startDate?: string; // Data de início do acesso (opcional)
  endDate?: string; // Data de término do acesso (opcional)
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
};

// EntraID User (Simplified)
export type EntraIdUser = {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
  jobTitle?: string;
  department?: string;
};
