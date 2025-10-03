import { getTopRisks, getRiskFactors } from './azure-table-storage';

// TopRisks dinâmicos - busca do Azure Storage
export async function getTopRiskOptions(): Promise<string[]> {
  try {
    const topRisks = await getTopRisks();
    return topRisks
      .filter(tr => tr.nome) // Filtra apenas TopRisks ativos
      .map(tr => tr.nome);
  } catch (error) {
    console.error('Erro ao carregar TopRisks:', error);
    // Fallback para os valores estáticos em caso de erro
    return [
      "Risco 01.Não integridade Operacional de Ativos",
      "Risco 02. Execução nos projetos de expansão",
      "Risco 03. Não atendimento junto ao Regulador",
      "Risco 04. Crise Ambiental & Mudanças Climáticas",
      "Risco 05. Decisões Tributárias e Judiciais Adversas",
      "Risco 06. Ambiente Concorrencial & Demanda",
      "Risco 07. Impactos no Ambiente Operacional de Tecnologia",
      "Risco 08. Integridade, Compliance & Reputacional",
      "Risco 09. Dependência de Fornecedores",
      "Risco 10. Gente & Cultura",
      "Risco 11. Gestão de Mudança",
    ];
  }
}

// RiskFactors dinâmicos - busca do Azure Storage
export async function getRiskFactorOptions(): Promise<string[]> {
  try {
    const riskFactors = await getRiskFactors();
    
    if (riskFactors.length === 0) {
      throw new Error('Nenhum risk factor encontrado no Azure');
    }
    
    return riskFactors
      .filter(rf => rf.nome) // Filtra apenas RiskFactors válidos
      .map(rf => rf.nome);
  } catch (error) {
    console.error('Erro ao carregar RiskFactors:', error);
    // Fallback para os valores estáticos em caso de erro
    return [
      "1.1 Paralisação e/ou indisponibilidade operacional por vandalismo, greve ou manifestação.",
      "1.2 Limitação de capacidade operacional.",
      "1.3 Paralização e/ou indisponibilidade operacional causado por acidentes",
      "2.2 Comprometimento do CAPEX e cronograma planejado",
      "3.2 Decisões regulatórias adversas: Cumprimento e gerenciamento do caderno de obrigações das concessões e autorizações.",
      "3.3 Licenciamento e Atos Autorizativos : Não manutenção das licenças e/ou atendimento das condicionantes para operar",
      "4.1 Danos físicos aos ativos e operação, principalmente corredor Santos",
      "4.2 Danos ambientais causados pela Companhia",
      "4.3 Impacto em demanda",
      "5.2 Perdas financeiras devido a divergência de Interpretação do dispositivo legal ou mudança da jurisprudência",
      "5.3 Decisões judiciais adversas.",
    ];
  }
}

// TopRisks estáticos (para compatibilidade e fallback)
export const topRiskOptions = [
  "Risco 01.Não integridade Operacional de Ativos",
  "Risco 02. Execução nos projetos de expansão",
  "Risco 03. Não atendimento junto ao Regulador",
  "Risco 04. Crise Ambiental & Mudanças Climáticas",
  "Risco 05. Decisões Tributárias e Judiciais Adversas",
  "Risco 06. Ambiente Concorrencial & Demanda",
  "Risco 07. Impactos no Ambiente Operacional de Tecnologia",
  "Risco 08. Integridade, Compliance & Reputacional",
  "Risco 09. Dependência de Fornecedores",
  "Risco 10. Gente & Cultura",
  "Risco 11. Gestão de Mudança",
];

export const riskFactorOptions = [
  "1.1 Paralisação e/ou indisponibilidade operacional por vandalismo, greve ou manifestação",
  "1.2 Limitação de capacidade operacional.",
  "1.3 Paralização e/ou indisponibilidade operacional causado por acidentes",
  "1.4 Ausência de plano de manutenção preventivo estruturado",
  "2.1 Performance dos contratos chaves.",
  "2.2 Comprometimento do CAPEX e cronograma planejado",
  "3.1 Decisões regulatórias adversas: Passivos contratuais da Malha Sul e Oeste.",
  "3.2 Decisões regulatórias adversas: Cumprimento e gerenciamento do caderno de obrigações das concessões e autorizações",
  "3.3 Licenciamento e Atos Autorizativos : Não manutenção das licenças e/ou atendimento das condicionantes para operar",
  "3.4 Análise, contribuições e acompanhamento da revisão de normativos da ANTT",
  "4.1 Danos físicos aos ativos e operação, principalmente corredor Santos",
  "4.2 Danos ambientais causados pela Companhia",
  "4.3 Impacto em demanda",
  "5.1 Falha no monitoramento da Legislação Tributária.",
  "5.2 Perdas financeiras devido a divergência de Interpretação do dispositivo legal ou mudança da jurisprudência",
  "5.3 Decisões judiciais adversas.",
  "6.1 Desenvolvimento de rotas e serviços alternativos",
  "6.2 Queda abrupta da oferta de grãos",
  "6.3 Evolução da demanda global",
  "7.1 Indisponibilidade de sistemas críticos para operação e planejamento",
  "7.2 Tratamento inadequado de informações confidenciais, pessoais ou sensíveis",
  "7.3 Incapacidade de recuperação de sistemas e dados essenciais após incidentes",
  "8.1 Desvio de conduta",
  "8.2 Relacionamento com órgão público e conduta com fornecedores",
  "8.3 Gestão inadequada e due diligence em terceiros, fornecedores e clientes.",
  "9.1 Dependência dos fornecedores de locomotivas e vagões",
  "10.1 Falta de mão de obra especializada para operacionalização das atividades da ferrovia",
  "10.2 Saúde e Segurança Pessoal",
  "10.3 Não atendimento da legislação trabalhista",
  "10.4 Cultura DNA Rumo não consolidada",
  "10.5 Direitos Humanos",
  "11.1. Gestão inadequada de mudanças ocasionando erro, ruptura e descontinuidade de processos e perda de histórico.",
  "11.2. Gestão inadequada do conhecimento",
];

export const gerenciaOptions = [
  "Operação",
  "Tecnologia",
  "Ambiental",
  "GesMud",
  "Compliance",
  "Regulatório",
  "Suprimentos",
  "Jurídico",
  "Comercial",
  "DHO",
  "Expansão",
  "Seg. Trabalho",
  "Cultura e Comunicação",
];

export const categoriaOptions = [
  "Operacional",
  "Tecnologia da Informação",
  "Compliance",
  "Regulatório & Legal",
  "Estratégico",
  "Financeiro",
  "Sustentabilidade",
  "Não Aplicável",
];

export const origemOptions = ["Técnico", "Negócio"];

export const tipoIerOptions = [
  "Risco Crítico",
  "Risco Prioritário",
  "Risco Gerenciável",
  "Risco Aceitável",
];

export const bowtieRealizadoOptions = ["Realizado", "Não Realizado", "Em Andamento"];

export const pilarOptions = ["G - Governança", "E - Ambiente", "S - Social"];

export const temaMaterialOptions = [
  "Integridade de Ativos",
  "Não Aplicável",
  "Governança e Ética",
  "Meio Ambiente",
  "Saúde e Segurança Pessoal",
  "Direitos Humanos",
  "Mudanças Climáticas e Gestão de Emissões",
  "Diversidade, Equidade e Inclusão",
];

export const englobadorOptions = ["Negócio", "Operacional"];

export const horizonteTempoOptions = ["Curto Prazo", "Longo Prazo", "Médio Prazo"];

export const geOrigemRiscoOptions = [
  "Controles Internos",
  "Tecnologia e Segurança da Informação",
  "Segurança e Riscos Operacionais",
  "Material Rodante",
  "Meio Ambiente",
  "Expansão - Portos e Terminais",
  "EXP - Malha Paulista",
  "Expansão - FMT",
  "Financeiro",
  "Terminais",
  "Segurança do Trabalho",
  "Operação",
  "Seguros",
  "Via Permanente",
  "Jurídico",
  "Regulatório",
  "Manutenção - CIM",
  "Segurança Pessoal",
];

export const businessObjectivesOptions = [
    "Segurança",
    "Eficiência Operacional",
    "Sustentabilidade",
    "Crescimento",
    "Rentabilidade",
    "Inovação",
    "Satisfação do Cliente",
    "Desenvolvimento de Pessoas"
];
