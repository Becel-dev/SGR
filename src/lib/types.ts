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
  title: string;
  status: 'Aprovado' | 'Em Revisão' | 'Rascunho';
  criticality: 'Crítico' | 'Alto' | 'Médio' | 'Baixo';
  area: string;
  responsible: string;
  lastUpdate: string;
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
