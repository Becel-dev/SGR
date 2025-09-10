

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
  gerencia: 'Operação' | 'Tecnologia' | 'Ambiental' | 'GesMun' | 'Compliance' | 'Regulatório' | 'Suprimentos' | 'Jurídico' | 'Comercial' | 'DHO' | 'Expansão' | 'Financeiro' | 'SMS' | 'RH';
  risco: string;
  descricaoDoRisco: string;
  dataDeIdentificacao: string;
  origemDoRisco: 'Interna' | 'Externa';
  causaRaizDoRisco: string;
  consequenciaDoRisco: string;
  tipoDeRisco: 'Estratégico' | 'Financeiro' | 'Operacional' | 'Conformidade' | 'Ambiental' | 'Regulatório' | 'Legal' | 'Imagem';
  processoAfetado: string;
  probabilidadeInerente: 'Raro' | 'Improvável' | 'Possível' | 'Provável' | 'Quase Certo';
  impactoInerente: 'Insignificante' | 'Menor' | 'Moderado' | 'Maior' | 'Catastrófico';
  nivelDeRiscoInerente: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
  estrategia: 'Mitigar' | 'Aceitar' | 'Transferir' | 'Evitar';
  descricaoDoControle: string;
  naturezaDoControle: 'Manual' | 'Sistêmico' | 'Semi-Sistêmico';
  tipoDeControle: 'Preventivo' | 'Detectivo' | 'Corretivo';
  classificacaoDoControle: 'Chave' | 'Não Chave';
  frequencia: 'Diário' | 'Semanal' | 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual';
  eficaciaDoControle: 'Ineficaz' | 'Pouco Eficaz' | 'Eficaz' | 'Muito Eficaz';
  probabilidadeResidual: 'Raro' | 'Improvável' | 'Possível' | 'Provável' | 'Quase Certo';
  impactoResidual: 'Insignificante' | 'Menor' | 'Moderado' | 'Maior' | 'Catastrófico';
  nivelDeRiscoResidual: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
  statusDoRisco: 'Aberto' | 'Em Tratamento' | 'Fechado' | 'Mitigado';
  responsavelPeloRisco: string;
  dataDaUltimaRevisao: string;
  dataDaProximaRevisao: string;
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
    id: string;
    label: string;
    description: string;
    color: string;
};

export type BowtieSide = "threats" | "preventiveControls" | "consequences" | "mitigatoryControls";

export type BowtieData = {
    id: string;
    riskId: string;
    event: Omit<BowtieNodeData, 'id'> & { color: string };
    threats: BowtieNodeData[];
    preventiveControls: BowtieNodeData[];
    consequences: BowtieNodeData[];
    mitigatoryControls: BowtieNodeData[];
};
