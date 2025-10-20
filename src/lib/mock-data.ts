/**
 * Funções auxiliares para criação de estruturas Bowtie
 * 
 * IMPORTANTE: Este arquivo NÃO contém mais dados mockados.
 * Todos os dados devem vir do Azure Table Storage via APIs.
 */

import type { BowtieData, BowtieThreat, BowtieConsequence, BowtieBarrierNode, RiskAnalysis } from './types';

/**
 * Cria um Bowtie vazio a partir de um risco
 * Usado quando um risco ainda não tem diagrama Bowtie
 */
export const getEmptyBowtie = (risk: RiskAnalysis): BowtieData => {
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
            title: risk.riskName,
            description: risk.gerencia || '',
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
