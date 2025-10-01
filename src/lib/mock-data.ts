import type { Risk, BowtieData, BowtieThreat, BowtieConsequence, Control, EscalationRule, BowtieBarrierNode } from './types';
import { identifiedRisksData } from './identified-risks-data';






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




export const initialBowtieData: BowtieData[] = [
    {
        id: 'B001',
        riskId: '29',
        createdAt: '2024-07-20',
        createdBy: 'Admin Rumo',
        updatedAt: '2024-07-20',
        updatedBy: 'Admin Rumo',
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
                title: 'Excesso de peso no caminhão',
                barriers: [
                    { id: 'B1-1', controlId: '1', title: 'Controle de Peso', responsible: 'Operação', effectiveness: 'Eficaz', status: 'Implementado' },
                ]
            },
            {
                id: 'T2',
                title: 'Falta de manutenção nos freios',
                barriers: []
            },
            {
                id: 'T3',
                title: 'Incêndio na carga',
                barriers: [
                    { id: 'B3-1', controlId: '3', title: 'Seguro Patrimonial', responsible: 'Financeiro', effectiveness: 'Eficaz', status: 'Implementado' },
                ]
            }
        ],
        consequences: [
            {
                id: 'C1',
                title: 'Danos à reputação da empresa',
                barriers: [
                    { id: 'B2-1', controlId: '2', title: 'Plano de Gerenciamento de Crise', responsible: 'Comunicação', effectiveness: 'Pouco Eficaz', status: 'Implementado com Pendência' },
                ]
            },
            {
                id: 'C2',
                title: 'Perda de carga valiosa',
                barriers: [
                    { id: 'B3-1', controlId: '3', title: 'Seguro Patrimonial', responsible: 'Financeiro', effectiveness: 'Eficaz', status: 'Implementado' },
                ]
            }
        ]
    }
];

export const getEmptyBowtie = (risk: Risk): BowtieData => {
    const newId = `B${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const newThreat: BowtieThreat = {
        id: 'T1',
        title: 'Nova Ameaça',
        barriers: [{
            id: 'B1-1',
            controlId: '',
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
            controlId: '',
            title: 'Selecione um Controle',
            responsible: 'Indefinido',
            effectiveness: 'Eficaz',
            status: 'Pendente'
        }]
    };

    return {
        id: newId,
        riskId: risk.id,
        createdAt: now,
        createdBy: risk.responsavelBowtie || 'Não definido',
        updatedAt: now,
        updatedBy: risk.responsavelBowtie || 'Não definido',
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
}

export const createEmptyBarrier = (type: 'threat' | 'consequence'): BowtieBarrierNode => {
    return {
        id: `new-barrier-${Date.now()}`,
        controlId: '', // Default to empty string
        title: 'Nova Barreira',
        responsible: 'Não definido',
        effectiveness: 'Ineficaz',
        status: 'Pendente'
    };
};

export const createEmptyThreat = (): BowtieThreat => {
    return {
        id: `new-threat-${Date.now()}`,
        title: 'Nova Ameaça',
        barriers: [createEmptyBarrier('threat')]
    };
};

export const createEmptyConsequence = (): BowtieConsequence => {
    return {
        id: `new-consequence-${Date.now()}`,
        title: 'Nova Consequência',
        barriers: [createEmptyBarrier('consequence')]
    };
};


export const generateMockBowtie = (riskId: string): BowtieData => {
    const now = new Date().toISOString();
    return {
        id: `bowtie-${riskId}`,
        riskId: riskId,
        createdAt: now,
        createdBy: 'mock-user@example.com',
        updatedAt: now,
        updatedBy: 'mock-user@example.com',
        responsible: 'Gerente de Risco',
        approvalStatus: 'Em aprovação',
        version: 1,
        topEvent: {
            title: 'Evento Topo Mock',
            description: 'Descrição do Evento Topo Mock'
        },
        threats: [
            {
                id: 'T1',
                title: 'Ameaça Mock 1',
                barriers: [
                    { id: 'B1-1', controlId: '1', title: 'Controle Mock 1', responsible: 'Operação', effectiveness: 'Eficaz', status: 'Implementado' },
                ]
            }
        ],
        consequences: [
            {
                id: 'C1',
                title: 'Consequência Mock 1',
                barriers: [
                    { id: 'B2-1', controlId: '2', title: 'Controle Mock 2', responsible: 'Segurança', effectiveness: 'Pouco Eficaz', status: 'Implementado com Pendência' },
                ]
            }
        ]
    };
};
