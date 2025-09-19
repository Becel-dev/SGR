

import type { Risk, BowtieData, BowtieThreat, BowtieConsequence, Control, Kpi, EscalationRule, BowtieBarrierNode } from './types';
import { identifiedRisksData } from './identified-risks-data';

export const kpisData: Kpi[] = [
    { id: "KPI-1", controlId: 1, frequencia: "Mensal", ultimoKpiInformado: undefined, prazoProximoRegistro: "2024-07-30", diasPendentes: -25, status: "Pendente", responsavel: "Kaio Coutinho de Farias", emailResponsavel: "kaio.farias@rumolog.com" },
    { id: "KPI-2", controlId: 2, frequencia: "Mensal", ultimoKpiInformado: "2024-07-02", prazoProximoRegistro: "2024-08-01", diasPendentes: -27, status: "Atrasado", responsavel: "Pablo Lacerda Aguiar", emailResponsavel: "pablo.aguiar@rumolog.com" },
    { id: "KPI-3", controlId: 3, frequencia: "Semestral", ultimoKpiInformado: undefined, prazoProximoRegistro: "2024-12-28", diasPendentes: -146, status: "Pendente", responsavel: "Pablo Lacerda Aguiar", emailResponsavel: "pablo.aguiar@rumolog.com" },
    { id: "KPI-4", controlId: 4, frequencia: "Anual", ultimoKpiInformado: undefined, prazoProximoRegistro: "2025-06-30", diasPendentes: -360, status: "Pendente", responsavel: "Pablo Lacerda Aguiar", emailResponsavel: "pablo.aguiar@rumolog.com" },
    { id: "KPI-5", controlId: 5, frequencia: "Mensal", ultimoKpiInformado: undefined, prazoProximoRegistro: "2024-07-29", diasPendentes: -24, status: "Pendente", responsavel: "Pablo Lacerda Aguiar", emailResponsavel: "pablo.aguiar@rumolog.com" },
    { id: "KPI-6", controlId: 6, frequencia: "Anual", ultimoKpiInformado: undefined, prazoProximoRegistro: "2025-06-30", diasPendentes: -360, status: "Pendente", responsavel: "Edson Yassuo Abe", emailResponsavel: "edson.abe@rumolog.com" },
    { id: "KPI-7", controlId: 7, frequencia: "Anual", ultimoKpiInformado: undefined, prazoProximoRegistro: "2025-06-30", diasPendentes: -360, status: "Pendente", responsavel: "Bruno Edison Silva Dalosto", emailResponsavel: "bruno.dalosto@rumolog.com" },
    { id: "KPI-8", controlId: 8, frequencia: "Mensal", ultimoKpiInformado: "2024-07-02", prazoProximoRegistro: "2024-08-01", diasPendentes: -27, status: "Atrasado", responsavel: "Bruno Edison Silva Dalosto", emailResponsavel: "bruno.dalosto@rumolog.com" },
    { id: "KPI-9", controlId: 9, frequencia: "Anual", ultimoKpiInformado: undefined, prazoProximoRegistro: "2025-06-30", diasPendentes: -360, status: "Pendente", responsavel: "Pablo Lacerda Aguiar", emailResponsavel: "pablo.aguiar@rumolog.com" },
    { id: "KPI-10", controlId: 10, frequencia: "Mensal", ultimoKpiInformado: "2024-07-02", prazoProximoRegistro: "2024-08-01", diasPendentes: -27, status: "Atrasado", responsavel: "Kaio Coutinho de Farias", emailResponsavel: "kaio.farias@rumolog.com" },
    { id: "KPI-11", controlId: 11, frequencia: "Mensal", ultimoKpiInformado: undefined, prazoProximoRegistro: "2024-07-30", diasPendentes: -25, status: "Pendente", responsavel: "Victor Dimitri Zolotareff", emailResponsavel: "victor.zolotareff@rumolog.com" },
    { id: "KPI-12", controlId: 12, frequencia: "Semestral", ultimoKpiInformado: undefined, prazoProximoRegistro: "2024-12-28", diasPendentes: -146, status: "Pendente", responsavel: "Victor Dimitri Zolotareff", emailResponsavel: "victor.zolotareff@rumolog.com" },
    { id: "KPI-13", controlId: 13, frequencia: "Trimestral", ultimoKpiInformado: "2024-07-02", prazoProximoRegistro: "2024-10-01", diasPendentes: -88, status: "Atrasado", responsavel: "Bruno Edison Silva Dalosto", emailResponsavel: "bruno.dalosto@rumolog.com" },
    { id: "KPI-14", controlId: 14, frequencia: "Mensal", ultimoKpiInformado: undefined, prazoProximoRegistro: "2024-07-30", diasPendentes: -25, status: "Pendente", responsavel: "Kaio Coutinho de Farias", emailResponsavel: "kaio.farias@rumolog.com" },
    { id: "KPI-15", controlId: 15, frequencia: "Anual", ultimoKpiInformado: undefined, prazoProximoRegistro: "2025-06-30", diasPendentes: -360, status: "Pendente", responsavel: "Pablo Lacerda Aguiar", emailResponsavel: "pablo.aguiar@rumolog.com" },
    { id: "KPI-16", controlId: 16, frequencia: "Trimestral", ultimoKpiInformado: undefined, prazoProximoRegistro: "2024-09-30", diasPendentes: -87, status: "Pendente", responsavel: "Kaio Coutinho de Farias", emailResponsavel: "kaio.farias@rumolog.com" },
    { id: "KPI-17", controlId: 17, frequencia: "Anual", ultimoKpiInformado: undefined, prazoProximoRegistro: "2025-06-30", diasPendentes: -360, status: "Pendente", responsavel: "Edson Yassuo Abe", emailResponsavel: "edson.abe@rumolog.com" },
    { id: "KPI-18", controlId: 18, frequencia: "Anual", ultimoKpiInformado: undefined, prazoProximoRegistro: "2025-06-30", diasPendentes: -360, status: "Pendente", responsavel: "Bruno Edison Silva Dalosto", emailResponsavel: "bruno.dalosto@rumolog.com" },
    { id: "KPI-19", controlId: 19, frequencia: "Anual", ultimoKpiInformado: undefined, prazoProximoRegistro: "2025-06-30", diasPendentes: -360, status: "Pendente", responsavel: "Kaio Coutinho de Farias", emailResponsavel: "kaio.farias@rumolog.com" },
    { id: "KPI-20", controlId: 20, frequencia: "Anual", ultimoKpiInformado: undefined, prazoProximoRegistro: "2025-06-30", diasPendentes: -360, status: "Pendente", responsavel: "Victor Dimitri Zolotareff", emailResponsavel: "victor.zolotareff@rumolog.com" },
    { id: "KPI-21", controlId: 21, frequencia: "Mensal", ultimoKpiInformado: "2024-07-02", prazoProximoRegistro: "2024-08-01", diasPendentes: -27, status: "Atrasado", responsavel: "Kaio Coutinho de Farias", emailResponsavel: "kaio.farias@rumolog.com" },
    { id: "KPI-22", controlId: 22, frequencia: "Anual", ultimoKpiInformado: undefined, prazoProximoRegistro: "2025-06-30", diasPendentes: -360, status: "Pendente", responsavel: "Victor Dimitri Zolotareff", emailResponsavel: "victor.zolotareff@rumolog.com" },
    { id: "KPI-23", controlId: 23, frequencia: "Mensal", ultimoKpiInformado: "2024-07-02", prazoProximoRegistro: "2024-08-01", diasPendentes: -27, status: "Atrasado", responsavel: "Edson Yassuo Abe", emailResponsavel: "edson.abe@rumolog.com" },
    { id: "KPI-24", controlId: 24, frequencia: "Anual", ultimoKpiInformado: undefined, prazoProximoRegistro: "2025-06-30", diasPendentes: -360, status: "Pendente", responsavel: "Edson Yassuo Abe", emailResponsavel: "edson.abe@rumolog.com" },
    { id: "KPI-25", controlId: 25, frequencia: "Anual", ultimoKpiInformado: undefined, prazoProximoRegistro: "2025-06-30", diasPendentes: -360, status: "Pendente", responsavel: "Edson Yassuo Abe", emailResponsavel: "edson.abe@rumolog.com" },
    { id: "KPI-26", controlId: 26, frequencia: "Anual", ultimoKpiInformado: undefined, prazoProximoRegistro: "2025-06-30", diasPendentes: -360, status: "Pendente", responsavel: "Kaio Coutinho de Farias", emailResponsavel: "kaio.farias@rumolog.com" },
    { id: "KPI-27", controlId: 27, frequencia: "Anual", ultimoKpiInformado: undefined, prazoProximoRegistro: "2025-06-30", diasPendentes: -360, status: "Pendente", responsavel: "Edson Yassuo Abe", emailResponsavel: "edson.abe@rumolog.com" }
];

export const controlsData: Control[] = Array.from({ length: 27 }, (_, i) => ({
    criadoEm: '2024-06-24',
    id: i + 1,
    nomeControle: `Controle Exemplo ${i + 1}`,
    tipo: (i % 2 === 0) ? 'Preventivo' : 'Mitigatório',
    classificacao: ['Procedimento', 'Equipamento', 'Pessoa', 'Sistema'][i % 4],
    status: ['Implementado', 'Implementado com Pendência', 'Não Implementado', 'Implementação Futura'][i % 4],
    donoControle: ['Kaio Farias', 'Pablo Aguiar', 'Bruno Dalosto', 'Edson Abe', 'Victor Zolotareff'][i % 5],
    emailDono: 'exemplo@rumolog.com',
    area: ['OPERAÇÃO', 'MANUTENÇÃO', 'SEGURANÇA', 'VIA PERMANENTE', 'FINANCEIRO'][i % 5],
    dataUltimaVerificacao: '2024-06-10',
    frequenciaMeses: [1, 3, 6, 12][i % 4],
    proximaVerificacao: '2024-12-10',
    validacao: ['DENTRO DO PRAZO', 'ATRASADO', 'PENDENTE'][i % 3],
    onePager: `onepager-0${i + 1}.pdf`,
    evidencia: `evidencia-0${i + 1}.pdf`,
    criadoPor: 'Admin',
    modificadoEm: '2024-07-01',
    modificadoPor: 'Admin',
    preenchimentoKPI: 'kpi@rumolog.com',
    criticidade: (i % 2 === 0) ? 'Sim' : 'Não',
    associatedRisks: [
        {
            riskId: `${[30, 29, 2, 1, 18, 14, 21, 13, 27, 25, 22][i % 11]}`,
            codigoMUE: `RUMO ${String(i + 1).padStart(2, '0')}`,
            titulo: `RUMO ${String(i + 1).padStart(2, '0')}-01`,
        }
    ]
}));


const newRisksFromIdentification: Risk[] = identifiedRisksData.map(ir => {
    const imp = ir.corporateImpact;
    const org = ir.organizationalRelevance;
    const prob = ir.contextualizedProbability;
    const ctrl = ir.currentControlCapacity;
    const tempo = ir.containmentTime;
    const facil = ir.technicalFeasibility;
    const ier = Math.round(((imp * 0.3) + (org * 0.1) + (prob * 0.2) + (ctrl * 0.15) + (tempo * 0.15) + (facil * 0.1)) * 100);

    let tipoIER: Risk['tipoIER'];
    if (ier >= 800) tipoIER = 'Crítico';
    else if (ier >= 700) tipoIER = 'Prioritário';
    else if (ier >= 600) tipoIER = 'Gerenciável';
    else tipoIER = 'Aceitável';

    return {
        id: ir.id,
        risco: ir.riskName,
        topRiskAssociado: ir.topRisk,
        fatorDeRisco: ir.riskFactor,
        imp: ir.corporateImpact,
        org: ir.organizationalRelevance,
        prob: ir.contextualizedProbability,
        ctrl: ir.currentControlCapacity,
        tempo: ir.containmentTime,
        facil: ir.technicalFeasibility,
        criado: new Date().toISOString().split('T')[0],
        criadoPor: 'Sistema de Identificação',
        status: 'Novo',
        taxonomia: '',
        gerencia: '',
        categoria: '',
        ier: ier,
        tipoIER: tipoIER,
        responsavelBowtie: '',
        x: 0,
        y: 0,
        origem: 'Identificação de Risco',
        modificado: '',
        modificadoPor: '',
        bowtieRealizado: 'Não Realizado',
        urlDoCC: '',
        possuiCC: 'Não',
        pilar: '',
        temaMaterial: '',
        pilarESG: '',
        englobador: '',
        horizonteTempo: '',
        geOrigemRisco: '',
        observacao: ir.currentControls,
        dataAlteracaoCuradoria: '',
        contexto: ir.riskScenario,
    }
});

const defaultEscalationRule: EscalationRule = {
  metricType: 'days',
  levels: [
    { level: 0, triggerDays: 0, triggerPercentage: 0, role: 'Gerente do Dono do Controle', responsible: 'Nome Gerente', enabled: true },
    { level: 1, triggerDays: 5, triggerPercentage: 10, role: 'Gerente Executivo', responsible: 'Nome Gerente Exec.', enabled: true },
    { level: 2, triggerDays: 10, triggerPercentage: 20, role: 'Diretor', responsible: 'Nome Diretor', enabled: true },
    { level: 3, triggerDays: 15, triggerPercentage: 30, role: 'VP', responsible: 'Nome VP', enabled: true },
  ],
};


const existingRisks: Risk[] = [
  { id: '1', status: 'Em Análise', gerencia: 'Operação', risco: 'Queda de pessoa ou objeto de passarela/plataforma/escada', topRiskAssociado: 'Quedas de Risco OLN Operacional', fatorDeRisco: 'Material Rodante', imp: 8, org: 0, prob: 7, ctrl: 7, tempo: 10, facil: 8, ier: 815, contexto: '70%', bowtieRealizado: 'Não Realizado', observacao: '', pilar: 'G - Governança', pilarESG: 'S - Social', temaMaterial: 'Integridade de Ativos', geOrigemRisco: 'Controles Internos', origem: 'GR - Observação', taxonomia: 'RISK-CR-Negócio-1', englobador: 'Curto Prazo', horizonteTempo: 'Curto Prazo', tipoIER: 'Crítico', urlDoCC: '', possuiCC: 'Não', modificado: '2025-07-15', criado: '2025-07-15', criadoPor: 'Admin', modificadoPor: 'Admin', categoria: 'RISK-CR-Negócio', responsavelBowtie: 'Guilherme', x: 9, y: 9.5, dataAlteracaoCuradoria: '2025-07-15', escalationRule: defaultEscalationRule},
  { id: '2', status: 'Em Análise', gerencia: 'Tecnologia', risco: 'Descarrilamento em AMV durante manobra de entrada/saída do terminal', topRiskAssociado: 'Comprometimento de Risco 07. I. Tecnológico', fatorDeRisco: 'Tecnologia e Segurança da Informação', imp: 9, org: 0, prob: 8, ctrl: 8, tempo: 6, facil: 8, ier: 805, contexto: '40%', bowtieRealizado: 'Não Realizado', observacao: '', pilar: 'E - Ambiental', pilarESG: 'S - Social', temaMaterial: 'Integridade Tecnológica', geOrigemRisco: 'Controles Internos', origem: 'GR - Observação', taxonomia: 'RISK-TC-Negócio-2', englobador: 'Longo Prazo', horizonteTempo: 'Longo Prazo', tipoIER: 'Crítico', urlDoCC: '', possuiCC: 'Não', modificado: '2025-07-15', criado: '2025-07-15', criadoPor: 'Admin', modificadoPor: 'Admin', categoria: 'RISK-TC-Negócio', responsavelBowtie: 'Silvio Hesi', x: 9.5, y: 8, dataAlteracaoCuradoria: '2025-07-15', escalationRule: defaultEscalationRule},
  { id: '29', status: 'Em Análise', gerencia: 'Operação', risco: 'Colapso de estrutura (silo, armazém, torre de elevador, moega)', topRiskAssociado: 'Colapso de Risco OLN Operacional', fatorDeRisco: 'Terminais', imp: 6, org: 0, prob: 4, ctrl: 8, tempo: 8, facil: 4, ier: 660, contexto: '', bowtieRealizado: 'Realizado', observacao: '', pilar: 'G - Governança', pilarESG: 'S - Social', temaMaterial: 'Integridade de Ativos', geOrigemRisco: 'Controles Internos', origem: 'GR - Observação', taxonomia: 'RISK-OPE-Negócio-29', englobador: 'Longo Prazo', horizonteTempo: 'Longo Prazo', tipoIER: 'Gerenciável', urlDoCC: 'https://rumo.com/bowtie/29', possuiCC: 'Sim', modificado: '2025-07-15', criado: '2025-07-15', criadoPor: 'Admin', modificadoPor: 'Admin', categoria: 'RISK-OPE-Negócio', responsavelBowtie: 'Guilherme', x: 4, y: 7, dataAlteracaoCuradoria: '2025-07-15', escalationRule: defaultEscalationRule},
  { id: '30', status: 'Em Análise', gerencia: 'Operação', risco: 'Incêndio e explosão em terminais (silos/ armazéns/ correias transportadoras)', topRiskAssociado: 'Incêndio e Risco OLN Operacional', fatorDeRisco: 'Segurança do Trabalho', imp: 4, org: 0, prob: 4, ctrl: 4, tempo: 8, facil: 4, ier: 660, contexto: '', bowtieRealizado: 'Realizado', observacao: '', pilar: 'G - Governança', pilarESG: 'S - Social', temaMaterial: 'Integridade de Ativos', geOrigemRisco: 'Controles Internos', origem: 'GR - Observação', taxonomia: 'RISK-OPE-Negócio-30', englobador: 'Longo Prazo', horizonteTempo: 'Longo Prazo', tipoIER: 'Gerenciável', urlDoCC: 'https://rumo.com/bowtie/30', possuiCC: 'Sim', modificado: '2025-07-15', criado: '2025-07-15', criadoPor: 'Admin', modificadoPor: 'Admin', categoria: 'RISK-OPE-Negócio', responsavelBowtie: 'Guilherme', x: 4, y: 7, dataAlteracaoCuradoria: '2025-07-15', escalationRule: defaultEscalationRule },
];


export const risksData: Risk[] = [...existingRisks, ...newRisksFromIdentification.map(r => ({ ...r, escalationRule: defaultEscalationRule }))];


export const complianceChartData = [
  { month: 'Jan', compliance: 88, target: 90 },
  { month: 'Feb', compliance: 91, target: 90 },
  { month: 'Mar', compliance: 92, target: 90 },
  { month: 'Apr', compliance: 89, target: 90 },
  { month: 'May', compliance: 93, target: 90 },
  { month: 'Jun', compliance: 95, target: 90 },
  { month: 'Jul', compliance: 85.7, target: 90 },
];

export const initialBowtieData: BowtieData[] = [
    {
        id: 'B001',
        riskId: '29',
        createdAt: '2024-07-20',
        responsible: 'Admin Rumo',
        approvalStatus: 'Aprovado',
        version: 2,
        topEvent: {
            title: "Colapso de estrutura",
            description: "Armazenagem"
        },
        threats: [
            { 
                id: 'T1', 
                title: 'Sobrecarga da estrutura',
                barriers: [
                    { id: 'B1-1', controlId: 1, title: 'Controle de Peso', responsible: 'Operação', effectiveness: 'Eficaz', status: 'Implementado' },
                ]
            },
        ],
        consequences: [
            {
                id: 'C1',
                title: 'Perda de material',
                barriers: [
                    { id: 'B3-1', controlId: 3, title: 'Seguro Patrimonial', responsible: 'Financeiro', effectiveness: 'Eficaz', status: 'Implementado' },
                ]
            },
        ]
    }
];

export const getEmptyBowtie = (risk: Risk): BowtieData => {
    const newId = `B${Math.random().toString(36).substr(2, 9)}`;
    const newThreat: BowtieThreat = {
        id: 'T1',
        title: 'Nova Ameaça',
        barriers: [{
            id: 'B1-1',
            controlId: undefined,
            title: 'Selecione um Controle',
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
            controlId: undefined,
            title: 'Selecione um Controle',
            responsible: 'Indefinido',
            effectiveness: 'Eficaz',
            status: 'Pendente'
        }]
    };

    return {
        id: newId,
        riskId: risk.id,
        createdAt: new Date().toISOString().split('T')[0],
        responsible: risk.responsavelBowtie || 'Não definido',
        approvalStatus: 'Em aprovação',
        version: 1,
        topEvent: {
            title: risk.risco,
            description: risk.gerencia,
        },
        threats: [newThreat],
        consequences: [newConsequence],
    };
};
