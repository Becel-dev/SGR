

import type { Risk, RecentActivity, BowtieData, BowtieThreat, BowtieConsequence, Control } from './types';

export const controlsData: Control[] = [
    {
        criadoEm: '2024-06-24',
        id: 1,
        codigoMUE: 'RUMO 01',
        titulo: 'RUMO 01-01',
        idRiscoMUE: 30,
        descricaoMUE: 'Incêndio e explosão em terminais (silos/ armazéns/ correias transportadoras)',
        nomeControle: 'Plano de Inspeção e Limpeza das Estruturas',
        tipo: 'Preventivo',
        classificacao: 'Procedimento',
        status: 'Implementação Futura',
        donoControle: 'Kaio Coutinho de Farias',
        emailDono: 'kaio.farias@rumolog.com',
        area: 'OPERAÇÃO',
        dataUltimaVerificacao: '2024-06-05',
        frequenciaMeses: 6,
        proximaVerificacao: '2024-12-02',
        validacao: 'DENTRO DO PRAZO',
        onePager: '01-01 Inspeção Limpeza',
        evidencia: '',
        criadoPor: 'Aluisio Fernando de Oliveira Filho',
        modificadoEm: '2024-08-26',
        modificadoPor: 'Victor Dimitri Zolotareff',
        preenchimentoKPI: 'CS337482@rumolog.com;RUBENS.ALENCAR@RUMOLOG.COM;CS264288@rumolog.com;kaio.farias@rumolog.com',
        gerenciaRisco: 'Operação',
        topRiskAssociado: 'Risco 01.Não integridade Operacional de Ativos',
        idRiscos: 30,
        criticidade: 'Sim',
    },
    {
        criadoEm: '2024-06-24',
        id: 2,
        codigoMUE: 'RUMO 01',
        titulo: 'RUMO 01-02',
        idRiscoMUE: 30,
        descricaoMUE: 'Incêndio e explosão em terminais (silos/ armazéns/ correias transportadoras)',
        nomeControle: 'SPDA - Aterramento dos Silos, Armazéns e Equipamentos',
        tipo: 'Preventivo',
        classificacao: 'Equipamento',
        status: 'Implementado com Pendência',
        donoControle: 'Pablo Lacerda Aguiar',
        emailDono: 'pablo.aguiar@rumolog.com',
        area: 'MANUTENÇÃO',
        dataUltimaVerificacao: '2024-06-10',
        frequenciaMeses: 12,
        proximaVerificacao: '2025-06-05',
        validacao: 'DENTRO DO PRAZO',
        onePager: '01-02 SPDA',
        evidencia: 'E-LDT-RMO-02202-001-00 - LAUDO ATERRAMENTO E SPDA TRO',
        criadoPor: 'Aluisio Fernando de Oliveira Filho',
        modificadoEm: '2024-08-26',
        modificadoPor: 'Victor Dimitri Zolotareff',
        preenchimentoKPI: 'CS337482@rumolog.com;pablo.aguiar@rumolog.com',
        gerenciaRisco: 'Operação',
        topRiskAssociado: 'Risco 01.Não integridade Operacional de Ativos',
        idRiscos: 30,
        criticidade: 'Sim',
    },
    {
        criadoEm: '2024-06-24',
        id: 3,
        codigoMUE: 'RUMO 01',
        titulo: 'RUMO 01-03',
        idRiscoMUE: 30,
        descricaoMUE: 'Incêndio e explosão em terminais (silos/ armazéns/ correias transportadoras)',
        nomeControle: 'Instalação elétrica adequada e classificação de área',
        tipo: 'Preventivo',
        classificacao: 'Equipamento',
        status: 'Implementação Futura',
        donoControle: 'Bruno Edison Silva Dalosto',
        emailDono: 'bruno.dalosto@rumolog.com',
        area: 'SEGURANÇA',
        dataUltimaVerificacao: '2024-06-03',
        frequenciaMeses: 6,
        proximaVerificacao: '2024-11-30',
        validacao: 'DENTRO DO PRAZO',
        onePager: '01-03 Área classificada',
        evidencia: '',
        criadoPor: 'Aluisio Fernando de Oliveira Filho',
        modificadoEm: '2024-08-26',
        modificadoPor: 'Victor Dimitri Zolotareff',
        preenchimentoKPI: 'CS337482@rumolog.com;CS306132@rumolog.com;bruno.dalosto@rumolog.com',
        gerenciaRisco: 'Operação',
        topRiskAssociado: 'Risco 01.Não integridade Operacional de Ativos',
        idRiscos: 30,
        criticidade: 'Sim',
    },
    {
        criadoEm: '2024-06-24',
        id: 4,
        codigoMUE: 'RUMO 01',
        titulo: 'RUMO 01-04',
        idRiscoMUE: 30,
        descricaoMUE: 'Incêndio e explosão em terminais (silos/ armazéns/ correias transportadoras)',
        nomeControle: 'Dispositivo de Supressão de Pó',
        tipo: 'Preventivo',
        classificacao: 'Equipamento',
        status: 'Não Implementado',
        donoControle: 'Pablo Lacerda Aguiar',
        emailDono: 'pablo.aguiar@rumolog.com',
        area: 'MANUTENÇÃO',
        dataUltimaVerificacao: '2024-06-10',
        frequenciaMeses: 12,
        proximaVerificacao: '2025-06-05',
        validacao: 'DENTRO DO PRAZO',
        onePager: '01-04 Supressão de Pó',
        evidencia: '',
        criadoPor: 'Aluisio Fernando de Oliveira Filho',
        modificadoEm: '2024-08-26',
        modificadoPor: 'Victor Dimitri Zolotareff',
        preenchimentoKPI: 'CS337482@rumolog.com;pablo.aguiar@rumolog.com',
        gerenciaRisco: 'Operação',
        topRiskAssociado: 'Risco 01.Não integridade Operacional de Ativos',
        idRiscos: 30,
        criticidade: 'Sim',
    }
];


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

const riscosBase: Omit<Risk, keyof ReturnType<typeof generateRiskMetrics>>[] = [
  {
    id: 'R001',
    gerencia: 'Operação',
    diretoria: 'Operações Malha Sul',
    processo: 'Manutenção de Via Permanente',
    risco: 'Descarrilamento em Curva',
    descricaoDoRisco: 'Risco de descarrilamento de vagões em curvas de raio reduzido na Malha Sul, especialmente em trechos com histórico de desgaste de trilhos.',
    dataDeIdentificacao: '2023-01-15',
    origemDoRisco: 'Técnico', // 'Interna'
    causaRaizDoRisco: 'Desgaste excessivo do boleto do trilho combinado com velocidade inadequada do trem.',
    consequenciaDoRisco: 'Danos ao material rodante, à via e à carga, interrupção do tráfego ferroviário e potenciais impactos ambientais.',
    categoriaDoRisco: 'Operacional',
    tipoDeRisco: 'Risco Crítico', // 'Segurança Operacional'
    processoAfetado: 'Operação Ferroviária',
    probabilidadeInerente: 'Possível',
    impactoInerente: 'Catastrófico',
    estrategia: 'Manter', // 'Mitigar'
    descricaoDoControle: 'Inspeção ultrassônica de trilhos para detecção de defeitos e controle de velocidade via ATC (Automatic Train Control).',
    naturezaDoControle: 'Semi-Sistêmico',
    tipoDeControle: 'Preventivo',
    classificacaoDoControle: 'Chave',
    frequencia: 'Semanal',
    eficaciaDoControle: 'Eficaz',
    documentacaoControle: 'DOC-CTRL-001',
    probabilidadeResidual: 'Raro',
    impactoResidual: 'Maior',
    apetiteAoRisco: 'Baixo',
    statusDoRisco: 'Em Tratamento',
    planoDeAcao: 'PA-2024-01',
    responsavelPeloRisco: 'Guilherme', // 'João da Silva'
    dataDaUltimaRevisao: '2024-07-10',
    dataDaProximaRevisao: '2024-10-10',
    kri: 'Taxa de defeitos em trilhos',
    indicadorRisco: 'Aumento de 5% na taxa de defeitos',
    limiteApetite: 10,
    limiteTolerancia: 15,
    limiteCapacidade: 20,
    medicaoAtual: 12,
    // New fields
    topRiskAssociado: 'Queda de Risco OLN Operacional',
    categoriaMP: '10',
    impactoResidual: 'Moderado',
    prob: 7,
    ctrl: 7,
    tempo: 20,
    facil: 9,
    elev: 815,
    ier: 0,
    filho: 'Não',
    v: 9,
    d: 6.5,
    g: 0,
    u: 0,
    t_score: 0,
    i_score: 0,
    oredsX: 9,
    t_rating: 7,
    riscosAceitaveis: 'não',
    riscosNaoAceitaveis: 'não',
    riscosMix: 'sim',
    statusControle: 'Não Iniciado',
    urlDoCC: '',
    possuiCC: 'Não',
    pilar: 'G - Governance',
    pilarESG: 'S - Social',
    indicador: '2.2 Perdas',
    subtema: 'Integridade Operacional',
    categoriaRisco: 'RISK-CR-Negócio',
    tronco: '1.1 Paralis',
    englobado: 'Curto Prazo',
    fatorDeRisco: 'Comercial',
    horizonte: 'Curto Prazo',
    ge: '',
    gr: '',
    observacao: 'Controles Internos',
    dataDaAvaliacao: '2025-07-15',
    contexto: '70%',
    bowtie: 'Não',
  },
  {
    id: 'R002',
    gerencia: 'Tecnologia',
    diretoria: 'Logística e Suprimentos',
    processo: 'Gestão de Fornecedores',
    risco: 'Atraso na Entrega de Peças Críticas',
    descricaoDoRisco: 'Atraso na entrega de componentes essenciais (ex: sapatas de freio, rodeiros) por parte de fornecedores, impactando a disponibilidade da frota.',
    dataDeIdentificacao: '2023-02-20',
    origemDoRisco: 'Técnico', // Externa
    causaRaizDoRisco: 'Problemas logísticos do fornecedor e falta de fornecedores alternativos homologados.',
    consequenciaDoRisco: 'Redução da disponibilidade de locomotivas e vagões, impactando o plano de transporte.',
    categoriaDoRisco: 'Estratégico', // Operacional
    tipoDeRisco: 'Risco Crítico', // Disponibilidade de Ativos
    processoAfetado: 'Manutenção de Material Rodante',
    probabilidadeInerente: 'Provável',
    impactoInerente: 'Moderado',
    estrategia: 'Manter', // 'Mitigar'
    descricaoDoControle: 'Manutenção de estoque de segurança para itens críticos e desenvolvimento de fornecedores alternativos.',
    naturezaDoControle: 'Manual',
    tipoDeControle: 'Corretivo',
    classificacaoDoControle: 'Não Chave',
    frequencia: 'Mensal',
    eficaciaDoControle: 'Pouco Eficaz',
    documentacaoControle: 'DOC-CTRL-002',
    probabilidadeResidual: 'Possível',
    impactoResidual: 'Moderado',
    apetiteAoRisco: 'Médio',
    statusDoRisco: 'Aberto',
    planoDeAcao: 'PA-2024-02',
    responsavelPeloRisco: 'Silvia', // 'Maria Oliveira'
    dataDaUltimaRevisao: '2024-06-25',
    dataDaProximaRevisao: '2024-09-25',
    kri: 'Nível de estoque de segurança',
    indicadorRisco: 'Estoque abaixo de 30 dias',
    limiteApetite: 30,
    limiteTolerancia: 20,
    limiteCapacidade: 15,
    medicaoAtual: 25,
    // New fields
    topRiskAssociado: 'Comprometimento OLN T.I',
    categoriaMP: '20',
    prob: 9,
    ctrl: 9,
    tempo: 7,
    facil: 9,
    elev: 805,
    ier: 0,
    filho: 'Não',
    v: 9.5,
    d: 8,
    g: 0,
    u: 0,
    t_score: 0,
    i_score: 0,
    oredsX: 9.5,
    t_rating: 8,
    riscosAceitaveis: 'não',
    riscosNaoAceitaveis: 'não',
    riscosMix: 'sim',
    statusControle: 'Realizado',
    urlDoCC: '',
    possuiCC: 'Não',
    pilar: 'E - Environmental',
    pilarESG: 'S - Social',
    indicador: '2.1 Licenciamento',
    subtema: 'Integridade',
    categoriaRisco: 'RISK-TC-Negócio',
    tronco: '7.1 Inclusão',
    englobado: 'Longo Prazo',
    fatorDeRisco: 'Tecnologia',
    horizonte: 'Longo Prazo',
    ge: '',
    gr: '',
    observacao: 'Tecnologia e Segurança da Informação',
    dataDaAvaliacao: '2025-07-15',
    contexto: '60%',
    bowtie: 'Não',
  },
];

const probabilityMap = { 'Raro': 1, 'Improvável': 2, 'Possível': 3, 'Provável': 4, 'Quase Certo': 5 };
const impactMap = { 'Insignificante': 1, 'Menor': 2, 'Moderado': 3, 'Maior': 4, 'Catastrófico': 5 };
const riskLevelMap = [
    ["Baixo", "Baixo", "Médio", "Médio", "Alto"],
    ["Baixo", "Médio", "Médio", "Alto", "Alto"],
    ["Médio", "Médio", "Alto", "Alto", "Crítico"],
    ["Médio", "Alto", "Alto", "Crítico", "Crítico"],
    ["Alto", "Alto", "Crítico", "Crítico", "Extremo"]
];

const generateRiskMetrics = (prob: Risk['probabilidadeInerente'], impact: Risk['impactoInerente']) => {
    const probValue = probabilityMap[prob] || 0;
    const impactValue = impactMap[impact] || 0;

    let nivelDeRiscoInerente: Risk['nivelDeRiscoInerente'] = 'Baixo';

    if (probValue > 0 && impactValue > 0) {
        nivelDeRiscoInerente = riskLevelMap[probValue - 1][impactValue - 1] as Risk['nivelDeRiscoInerente'];
    }

    const custoDoRisco = probValue * impactValue * 10000;
    const beneficioDoControle = custoDoRisco * 0.75;
    const valorExposto = custoDoRisco - beneficioDoControle;

    // A probabilidade residual é calculada como um nível abaixo da inerente (se possível)
    const residualProbIndex = Math.max(0, probValue - 2);
    const residualProbKey = Object.keys(probabilityMap).find(key => probabilityMap[key as keyof typeof probabilityMap] === residualProbIndex + 1) as Risk['probabilidadeResidual'] | undefined;
    
    // O impacto residual é calculado como um nível abaixo do inerente (se possível)
    const residualImpactIndex = Math.max(0, impactValue - 2);
     const residualImpactKey = Object.keys(impactMap).find(key => impactMap[key as keyof typeof impactMap] === residualImpactIndex + 1) as Risk['impactoResidual'] | undefined;


    let nivelDeRiscoResidual: Risk['nivelDeRiscoResidual'] = 'Baixo';
    if(residualProbKey && residualImpactKey) {
        const residualProbValue = probabilityMap[residualProbKey] || 0;
        const residualImpactValue = impactMap[residualImpactKey] || 0;
        if(residualProbValue > 0 && residualImpactValue > 0) {
           nivelDeRiscoResidual = riskLevelMap[residualProbValue - 1][residualImpactValue - 1] as Risk['nivelDeRiscoResidual'];
        }
    }


    return {
        nivelDeRiscoInerente,
        probabilidadeResidual: residualProbKey || 'Raro',
        impactoResidual: residualImpactKey || 'Insignificante',
        nivelDeRiscoResidual,
        custoDoRisco,
        beneficioDoControle,
        valorExposto
    };
};

export const risksData: Risk[] = riscosBase.map(risk => {
    const metrics = generateRiskMetrics(risk.probabilidadeInerente, risk.impactoInerente);
    return {
        ...risk,
        ...metrics
    };
});


const getStatusCounts = (risks: Risk[]) => {
  const counts: { [key: string]: number } = {
    'Aberto': 0,
    'Em Tratamento': 0,
    'Fechado': 0,
    'Mitigado': 0,
  };
  risks.forEach(risk => {
    const status = risk.statusDoRisco;
    if (counts.hasOwnProperty(status)) {
      counts[status]++;
    }
  });
  return counts;
};

const statusCounts = getStatusCounts(risksData);

export const statusBreakdownChartData = [
  { name: 'Aberto', value: statusCounts['Aberto'], fill: 'hsl(var(--chart-2))' },
  { name: 'Em Tratamento', value: statusCounts['Em Tratamento'], fill: 'hsl(var(--chart-1))' },
  { name: 'Mitigado', value: statusCounts['Mitigado'], fill: 'hsl(var(--chart-3))' },
  { name: 'Fechado', value: statusCounts['Fechado'], fill: 'hsl(var(--muted-foreground))' },
];

export const initialBowtieData: BowtieData[] = [
    {
        id: 'B001',
        riskId: 'R001',
        topEvent: {
            title: "Descarrilamento em Curva",
            description: "Operação Ferroviária"
        },
        threats: [
            { 
                id: 'T1', 
                title: 'Desgaste excessivo do trilho',
                barriers: [
                    { id: 'B1-1', title: 'Inspeção ultrassônica', responsible: 'Operação', effectiveness: 'Eficaz', status: 'Implementado' },
                ]
            },
            { 
                id: 'T2', 
                title: 'Velocidade inadequada do trem',
                barriers: [
                    { id: 'B2-1', title: 'Controle de velocidade via ATC', responsible: 'CCO', effectiveness: 'Eficaz', status: 'Implementado' },
                ]
            }
        ],
        consequences: [
            {
                id: 'C1',
                title: 'Danos ao material rodante e à via',
                barriers: [
                    { id: 'B3-1', title: 'Plano de Ação Corretiva', responsible: 'Manutenção', effectiveness: 'Eficaz', status: 'Implementado' },
                ]
            },
            {
                id: 'C2',
                title: 'Interrupção do tráfego ferroviário',
                barriers: [
                    { id: 'B4-1', title: 'Plano de contingência operacional', responsible: 'CCO', effectiveness: 'Pouco Eficaz', status: 'Pendente' },
                ]
            }
        ]
    }
];

export const getEmptyBowtie = (risk?: Risk): BowtieData => {
    const newId = `B${Math.random().toString(36).substr(2, 9)}`;
    const newThreat: BowtieThreat = {
        id: 'T1',
        title: 'Nova Ameaça',
        barriers: [{
            id: 'B1-1',
            title: 'Nova Barreira Preventiva',
            responsible: 'Indefinido',
            effectiveness: 'Eficaz',
            status: 'Pendente'
        }]
    };
     const newConsequence: BowtieConsequence = {
        id: 'C1',
        title: 'Nova Consequência',
        barriers: [{
            id: 'B2-1',
            title: 'Nova Barreira Mitigatória',
            responsible: 'Indefinido',
            effectiveness: 'Eficaz',
            status: 'Pendente'
        }]
    };

    if (!risk) {
        return {
            id: newId,
            riskId: `R-GENERIC-${newId}`,
            topEvent: {
                title: 'Novo Evento de Topo',
                description: 'Descreva o processo',
            },
            threats: [newThreat],
            consequences: [newConsequence],
        };
    }

    return {
        id: newId,
        riskId: risk.id,
        topEvent: {
            title: risk.risco,
            description: risk.processoAfetado,
        },
        threats: [newThreat],
        consequences: [newConsequence],
    };
};
