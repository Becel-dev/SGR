

export type Role = 'admin' | 'moderator' | 'editor' | 'viewer';

export type User = {
  name: string;
  email: string;
  avatarUrl: string;
  role: Role;
};

export type Kpi = {
  id: string;
  name:string;
  value: number;
  target: number;
  period: string;
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
  idRiscos: number;
  criticidade: string;
};


export type Risk = {
  id: string;
  gerencia: string;
  diretoria: string;
  processo: string;
  risco: string;
  descricaoDoRisco: string;
  dataDeIdentificacao: string;
  origemDoRisco: string;
  causaRaizDoRisco: string;
  consequenciaDoRisco: string;
  categoriaDoRisco: string;
  tipoDeRisco: string;
  processoAfetado: string;
  
  probabilidadeInerente: 'Raro' | 'Improvável' | 'Possível' | 'Provável' | 'Quase Certo' | '';
  impactoInerente: 'Insignificante' | 'Menor' | 'Moderado' | 'Maior' | 'Catastrófico' | '';
  nivelDeRiscoInerente: 'Baixo' | 'Médio' | 'Alto' | 'Crítico' | 'Extremo' | '';
  
  estrategia: string;
  descricaoDoControle: string;
  naturezaDoControle: string;
  tipoDeControle: string;
  classificacaoDoControle: string;
  frequencia: string;
  eficaciaDoControle: 'Ineficaz' | 'Pouco Eficaz' | 'Eficaz' | 'Muito Eficaz' | '';
  documentacaoControle: string;

  probabilidadeResidual: 'Raro' | 'Improvável' | 'Possível' | 'Provável' | 'Quase Certo' | '';
  impactoResidual: 'Insignificante' | 'Menor' | 'Moderado' | 'Maior' | 'Catastrófico' | '';
  nivelDeRiscoResidual: 'Baixo' | 'Médio' | 'Alto' | 'Crítico' | 'Extremo' | '';

  apetiteAoRisco: string;
  statusDoRisco: 'Aberto' | 'Em Tratamento' | 'Fechado' | 'Mitigado' | '';
  planoDeAcao: string;
  responsavelPeloRisco: string;
  dataDaUltimaRevisao: string;
  dataDaProximaRevisao: string;

  kri: string;
  indicadorRisco: string;
  limiteApetite: number;
  limiteTolerancia: number;
  limiteCapacidade: number;
  medicaoAtual: number;
  
  custoDoRisco: number;
  beneficioDoControle: number;
  valorExposto: number;
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
