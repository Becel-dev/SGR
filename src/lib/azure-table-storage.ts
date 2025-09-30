// Este arquivo usa a flag 'use server' para indicar que pode ser executado no servidor.
// No entanto, as funções aqui podem ser chamadas tanto do cliente quanto do servidor.
'use server';

import { TableClient, TableEntity, AzureNamedKeyCredential } from "@azure/data-tables";
// Removido mockData: integração 100% Azure
import type { IdentifiedRisk, RiskAnalysis } from './types';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const identifiedRisksTableName = "identifiedrisks";
const riskAnalysisTableName = "riskanalysis"; // Nova tabela

// Helper para converter o tipo da aplicação para o tipo da entidade da tabela (IdentifiedRisk)
const toIdentifiedRiskTableEntity = (risk: Omit<IdentifiedRisk, 'id'> & { id?: string }): TableEntity<Omit<IdentifiedRisk, 'id' | 'businessObjectives'> & { businessObjectives: string }> => {
    const partitionKey = risk.topRisk.replace(/[^a-zA-Z0-9]/g, '') || "Default";
    const rowKey = risk.id || `${Date.now()}${Math.random().toString(36).substring(2, 9)}`;

    return {
        partitionKey,
        rowKey,
        ...risk,
        businessObjectives: JSON.stringify(risk.businessObjectives), // Arrays precisam ser serializados
    };
};

// Helper para converter o tipo da entidade da tabela de volta para o tipo da aplicação (IdentifiedRisk)
const fromIdentifiedRiskTableEntity = (entity: TableEntity<any>): IdentifiedRisk => {
    const risk: any = {};
    for (const key in entity) {
        if (key !== 'partitionKey' && key !== 'rowKey' && key !== 'etag' && key !== 'timestamp' && !key.endsWith('@odata.type')) {
            risk[key] = entity[key];
        }
    }
    // Garante que o ID seja o rowKey
    risk.id = entity.rowKey;

    // Deserializa o campo de objetivos
    if(risk.businessObjectives && typeof risk.businessObjectives === 'string') {
        try {
            risk.businessObjectives = JSON.parse(risk.businessObjectives);
        } catch (e) {
            risk.businessObjectives = []; // Em caso de erro, retorna um array vazio
        }
    } else {
        risk.businessObjectives = [];
    }

    return risk as IdentifiedRisk;
};

// --- Novas Funções para RiskAnalysis ---

// Helper para converter RiskAnalysis para a entidade da tabela
const toRiskAnalysisTableEntity = (analysis: RiskAnalysis): TableEntity<any> => {
    const { id, ...rest } = analysis;
    return {
        partitionKey: analysis.topRisk.replace(/[^a-zA-Z0-9]/g, '') || "Default",
        rowKey: id, // O ID do IdentifiedRisk original se torna o RowKey aqui
        ...rest,
        businessObjectives: JSON.stringify(analysis.businessObjectives),
    };
};

// Helper para converter a entidade da tabela de volta para RiskAnalysis
const fromRiskAnalysisTableEntity = (entity: TableEntity<any>): RiskAnalysis => {
    const analysis: any = {};
    for (const key in entity) {
        if (key !== 'partitionKey' && key !== 'rowKey' && key !== 'etag' && key !== 'timestamp' && !key.endsWith('@odata.type')) {
            analysis[key] = entity[key];
        }
    }
    analysis.id = entity.rowKey;
    // O status pode ser 'Em Análise' ou 'Analisado', então vamos ler do registro se existir
    analysis.status = entity.status || 'Em Análise'; 

    if (analysis.businessObjectives && typeof analysis.businessObjectives === 'string') {
        try {
            analysis.businessObjectives = JSON.parse(analysis.businessObjectives);
        } catch (e) {
            analysis.businessObjectives = [];
        }
    } else {
        analysis.businessObjectives = [];
    }

    // Garante que o IER seja um número
    analysis.ier = Number(entity.ier) || 0;

    return analysis as RiskAnalysis;
};


const getClient = (tableName: string): TableClient => {
    if (!connectionString) {
        throw new Error("String de conexão do Azure não configurada. Configure a variável de ambiente AZURE_STORAGE_CONNECTION_STRING.");
    }
    return TableClient.fromConnectionString(connectionString, tableName);
}

// ---- Funções CRUD para IdentifiedRisk ----

export async function getIdentifiedRisks(): Promise<IdentifiedRisk[]> {
    const client = getClient(identifiedRisksTableName);
    try {
        await client.createTable();
        const entities = client.listEntities();
        const risks: IdentifiedRisk[] = [];
        for await (const entity of entities) {
            risks.push(fromIdentifiedRiskTableEntity(entity));
        }
        return risks;
    } catch (error) {
        console.error("Erro ao buscar riscos identificados:", error);
        return [];
    }
}

export async function getIdentifiedRiskById(id: string): Promise<IdentifiedRisk | undefined> {
    const client = getClient(identifiedRisksTableName);
    try {
        const risks = await getIdentifiedRisks();
        return risks.find(risk => risk.id === id);
    } catch (error) {
        console.error(`Erro ao buscar risco identificado com ID ${id}:`, error);
        return undefined;
    }
}

export async function addOrUpdateIdentifiedRisk(riskData: IdentifiedRisk): Promise<IdentifiedRisk> {
    const client = getClient(identifiedRisksTableName);
    try {
        await client.createTable();
        const now = new Date().toISOString();
        let risk = { ...riskData };
        if (!risk.createdAt) {
            risk.createdAt = now;
            risk.createdBy = "Sistema";
        }
        risk.updatedAt = now;
        risk.updatedBy = "Sistema";
        const entity = toIdentifiedRiskTableEntity(risk);
        await client.upsertEntity(entity, "Merge");
        return fromIdentifiedRiskTableEntity(entity);
    } catch (error) {
        console.error("Erro ao salvar o risco identificado:", error);
        throw new Error("Falha ao salvar o risco identificado no Azure Table Storage.");
    }
}

export async function deleteIdentifiedRisk(id: string, partitionKey: string): Promise<void> {
    const client = getClient(identifiedRisksTableName);
    try {
        await client.deleteEntity(partitionKey, id);
        console.log(`Risco com ID ${id} e PartitionKey ${partitionKey} excluído com sucesso.`);
    } catch (error) {
        console.error("Erro ao excluir o risco identificado:", error);
        throw new Error("Falha ao excluir o risco identificado no Azure Table Storage.");
    }
}

// ---- Funções para o Módulo de Análise de Risco ----

export async function deleteRiskAnalysis(id: string, partitionKey: string): Promise<void> {
    const client = getClient(riskAnalysisTableName);
    try {
        await client.deleteEntity(partitionKey, id);
        console.log(`Análise de risco com ID ${id} e PartitionKey ${partitionKey} excluída com sucesso.`);
    } catch (error: any) {
        // Se o erro for 'ResourceNotFound', significa que o registro já foi excluído ou nunca existiu.
        // Podemos tratar isso como um sucesso para a UI não ficar travada.
        if (error.statusCode === 404) {
            console.warn(`Tentativa de excluir análise de risco não encontrada (ID: ${id}).`);
            return;
        }
        console.error("Erro ao excluir a análise de risco:", error);
        throw new Error("Falha ao excluir a análise de risco no Azure Table Storage.");
    }
}

export async function getRiskAnalysisById(id: string): Promise<RiskAnalysis | undefined> {
    const client = getClient(riskAnalysisTableName);
    try {
        // Na tabela de análise, o PartitionKey não é fixo, então precisamos buscar pelo RowKey (que é o nosso 'id')
        const entities = client.listEntities<TableEntity<any>>({
            queryOptions: { filter: `RowKey eq '${id}'` }
        });
        for await (const entity of entities) {
            // Retorna a primeira entidade encontrada que corresponde ao ID
            return fromRiskAnalysisTableEntity(entity);
        }
        return undefined; // Retorna undefined se nenhum registro for encontrado
    } catch (error) {
        console.error(`Erro ao buscar análise de risco com ID ${id}:`, error);
        return undefined;
    }
}

// Nova função para verificar se um risco já foi analisado
export async function isRiskInAnalysis(riskId: string): Promise<boolean> {
    const client = getClient(riskAnalysisTableName);
    try {
        await client.createTable(); // Garante que a tabela exista
        const entities = client.listEntities({
            queryOptions: { filter: `RowKey eq '${riskId}'` }
        });
        for await (const entity of entities) {
            // Se encontrarmos qualquer entidade com o RowKey, significa que já existe na tabela de análise
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Erro ao verificar se o risco ${riskId} está em análise:`, error);
        // Em caso de erro, assumimos que não está em análise para não bloquear o usuário indevidamente
        return false;
    }
}

// Função principal para carregar dados para a tela de Análise de Risco
export async function getRisksForAnalysis(): Promise<RiskAnalysis[]> {
    const identifiedRisks = await getIdentifiedRisks();
    const analysisRisksClient = getClient(riskAnalysisTableName);
    await analysisRisksClient.createTable();
    
    const analysisEntities = analysisRisksClient.listEntities();
    const existingAnalysisRisks: RiskAnalysis[] = [];
    for await (const entity of analysisEntities) {
        existingAnalysisRisks.push(fromRiskAnalysisTableEntity(entity));
    }

    const analysisRiskIds = new Set(existingAnalysisRisks.map(r => r.id));

    // Mapeia os riscos identificados que ainda não foram analisados para o formato de RiskAnalysis com status 'Novo'
    const newRisksForAnalysis: RiskAnalysis[] = identifiedRisks
        .filter(risk => !analysisRiskIds.has(risk.id))
        .map(risk => ({
            ...risk,
            status: 'Novo',
            analysisId: '', // Ainda não tem um ID de análise
            // Mapeamento de campos conforme especificado
            risco: risk.riskName,
            topRiskAssociado: risk.topRisk,
            fatorDeRisco: risk.riskFactor,
            contexto: risk.riskScenario,
            imp: risk.corporateImpact,
            org: risk.organizationalRelevance,
            prob: risk.contextualizedProbability,
            ctrl: risk.currentControlCapacity,
            tempo: risk.containmentTime,
            facil: risk.technicalFeasibility,
            ier: 0, // O cálculo do IER será mantido na UI ou em outra camada
        } as unknown as RiskAnalysis));

    // Combina os riscos existentes com os novos
    return [...existingAnalysisRisks, ...newRisksForAnalysis].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
}

// Salva ou atualiza um item na tabela de Análise de Risco
export async function addOrUpdateRiskAnalysis(analysisData: RiskAnalysis): Promise<RiskAnalysis> {
    const client = getClient(riskAnalysisTableName);
    try {
        await client.createTable();
        
        const analysisToSave: RiskAnalysis = {
            ...analysisData,
            status: 'Em Análise', // Ao salvar, o status muda
            updatedAt: new Date().toISOString(),
            updatedBy: "Sistema", // Adicionar o usuário logado aqui posteriormente
        };

        const entity = toRiskAnalysisTableEntity(analysisToSave);
        await client.upsertEntity(entity, "Merge");
        
        return fromRiskAnalysisTableEntity(entity);

    } catch (error) {
        console.error("Erro ao salvar a análise de risco:", error);
        throw new Error("Falha ao salvar a análise de risco no Azure Table Storage.");
    }
}
