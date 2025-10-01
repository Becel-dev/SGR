// Este arquivo usa a flag 'use server' para indicar que pode ser executado no servidor.
// No entanto, as funções aqui podem ser chamadas tanto do cliente quanto do servidor.
'use server';

import { TableClient, TableEntity, AzureNamedKeyCredential } from "@azure/data-tables";
// Removido mockData: integração 100% Azure
import type { IdentifiedRisk, RiskAnalysis, Control, Kpi, AssociatedRisk } from './types';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const identifiedRisksTableName = "identifiedrisks";
const riskAnalysisTableName = "riskanalysis"; // Nova tabela
const controlsTableName = "controls";
const kpisTableName = "kpis";
const parametersTableName = "parameters";

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

    // Garante que o campo 'risco' (usado na UI) seja preenchido a partir de 'riskName'
    if (entity.riskName) {
        analysis.risco = entity.riskName;
    }

    return analysis as RiskAnalysis;
};

// --- Novas Funções para Control ---

const toControlTableEntity = (control: Control): TableEntity<any> => {
    const { id, associatedRisks, ...rest } = control;
    return {
        partitionKey: control.area.replace(/[^a-zA-Z0-9]/g, '') || "Default",
        rowKey: id,
        ...rest,
        associatedRisks: JSON.stringify(associatedRisks || []),
    };
};

const fromControlTableEntity = (entity: TableEntity<any>): Control => {
    const control: any = {};
    for (const key in entity) {
        if (key !== 'partitionKey' && key !== 'rowKey' && key !== 'etag' && key !== 'timestamp' && !key.endsWith('@odata.type')) {
            control[key] = entity[key];
        }
    }
    control.id = entity.rowKey;

    if (control.associatedRisks && typeof control.associatedRisks === 'string') {
        try {
            control.associatedRisks = JSON.parse(control.associatedRisks);
        } catch (e) {
            control.associatedRisks = [];
        }
    } else {
        control.associatedRisks = [];
    }

    return control as Control;
};

// --- Novas Funções para Kpi ---
const fromKpiTableEntity = (entity: TableEntity<any>): Kpi => {
    const kpi: any = {};
    for (const key in entity) {
        if (key !== 'partitionKey' && key !== 'rowKey' && key !== 'etag' && key !== 'timestamp' && !key.endsWith('@odata.type')) {
            kpi[key] = entity[key];
        }
    }
    kpi.id = entity.rowKey;
    return kpi as Kpi;
};


const getClient = (tableName: string): TableClient => {
    if (!connectionString) {
        throw new Error("String de conexão do Azure não configurada. Configure a variável de ambiente AZURE_STORAGE_CONNECTION_STRING.");
    }
    return TableClient.fromConnectionString(connectionString, tableName);
}

// ---- Funções CRUD para Controls ----

export async function createControlsTable(): Promise<void> {
    const client = getClient(controlsTableName);
    try {
        await client.createTable();
        console.log(`Tabela "${controlsTableName}" criada ou já existente.`);
    } catch (error) {
        console.error(`Erro ao criar a tabela "${controlsTableName}":`, error);
    }
}

export async function getAllControls(): Promise<Control[]> {
    const client = getClient(controlsTableName);
    try {
        const entities = client.listEntities();
        const controls: Control[] = [];
        for await (const entity of entities) {
            controls.push(fromControlTableEntity(entity));
        }
        return controls;
    } catch (error) {
        console.error("Erro ao buscar controles:", error);
        return [];
    }
}

export async function getControlById(id: string): Promise<Control | undefined> {
    const client = getClient(controlsTableName);
    try {
        const entities = client.listEntities<TableEntity<any>>({
            queryOptions: { filter: `RowKey eq '${id}'` }
        });
        for await (const entity of entities) {
            return fromControlTableEntity(entity);
        }
        return undefined;
    } catch (error) {
        console.error(`Erro ao buscar controle com ID ${id}:`, error);
        return undefined;
    }
}

export async function addOrUpdateControl(controlData: Control): Promise<Control> {
    const client = getClient(controlsTableName);
    try {
        await client.createTable();
        const now = new Date().toISOString();
        let control = { ...controlData };
        if (!control.criadoEm) {
            control.criadoEm = now;
            control.criadoPor = "Sistema"; // Substituir pelo usuário logado
        }
        control.modificadoEm = now;
        control.modificadoPor = "Sistema"; // Substituir pelo usuário logado

        const entity = toControlTableEntity(control);
        await client.upsertEntity(entity, "Merge");
        return fromControlTableEntity(entity);
    } catch (error) {
        console.error("Erro ao salvar o controle:", error);
        throw new Error("Falha ao salvar o controle no Azure Table Storage.");
    }
}

// ---- Funções para buscar dados relacionados ----

export async function getRisksByIds(riskIds: string[]): Promise<RiskAnalysis[]> {
    if (!riskIds || riskIds.length === 0) {
        return [];
    }
    const client = getClient(riskAnalysisTableName);
    try {
        const filter = riskIds.map(id => `RowKey eq '${id}'`).join(' or ');
        const entities = client.listEntities<TableEntity<any>>({
            queryOptions: { filter }
        });
        const risks: RiskAnalysis[] = [];
        for await (const entity of entities) {
            risks.push(fromRiskAnalysisTableEntity(entity));
        }
        return risks;
    } catch (error) {
        console.error("Erro ao buscar riscos por IDs:", error);
        return [];
    }
}

export async function getKpisByControlId(controlId: string): Promise<Kpi[]> {
    const client = getClient(kpisTableName);
    try {
        await client.createTable(); // Garante que a tabela de KPIs exista
        const filter = `controlId eq '${controlId}'`;
        const entities = client.listEntities<TableEntity<any>>({
            queryOptions: { filter }
        });
        const kpis: Kpi[] = [];
        for await (const entity of entities) {
            kpis.push(fromKpiTableEntity(entity));
        }
        return kpis;
    } catch (error) {
        console.error(`Erro ao buscar KPIs para o controle ${controlId}:`, error);
        return [];
    }
}

export async function getRisksForAssociation(): Promise<RiskAnalysis[]> {
    const client = getClient(riskAnalysisTableName);
    try {
        const filter = `status eq 'Analisado' or status eq 'Em Análise'`;
        const entities = client.listEntities<TableEntity<any>>({
            queryOptions: { filter }
        });
        const risks: RiskAnalysis[] = [];
        for await (const entity of entities) {
            risks.push(fromRiskAnalysisTableEntity(entity));
        }
        return risks;
    } catch (error) {
        console.error("Erro ao buscar riscos para associação:", error);
        return [];
    }
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

// Nova função para verificar o status de um risco na tabela de análise
export async function getRiskAnalysisStatus(riskId: string): Promise<'Novo' | 'Em Análise' | 'Analisado' | null> {
    try {
        const analysis = await getRiskAnalysisById(riskId);
        if (analysis) {
            // Se a análise existir, retorna seu status.
            return analysis.status;
        }
        // Se não existir na tabela de análise, consideramos como 'Novo' para fins de lógica de negócio.
        return 'Novo';
    } catch (error) {
        console.error(`Erro ao verificar o status do risco ${riskId}:`, error);
        // Em caso de erro, retornamos null para não bloquear o usuário indevidamente.
        return null;
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
        // Só força 'Em Análise' se não for 'Analisado'
        const statusToSave = analysisData.status === 'Analisado' ? 'Analisado' : 'Em Análise';
        const analysisToSave: RiskAnalysis = {
            ...analysisData,
            status: statusToSave,
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

// --- Funções para Parâmetros ---

export async function getParameter<T>(name: string): Promise<T | null> {
    const client = getClient(parametersTableName);
    try {
        await client.createTable();
        const entity = await client.getEntity<TableEntity<{ value: string }>>("global", name);
        return JSON.parse(entity.value) as T;
    } catch (error: any) {
        if (error.statusCode === 404) {
            return null; // Parâmetro não encontrado
        }
        console.error(`Erro ao buscar o parâmetro "${name}":`, error);
        throw new Error(`Falha ao buscar o parâmetro "${name}" no Azure Table Storage.`);
    }
}

export async function setParameter<T>(name: string, value: T): Promise<void> {
    const client = getClient(parametersTableName);
    try {
        await client.createTable();
        const entity = {
            partitionKey: "global",
            rowKey: name,
            value: JSON.stringify(value),
        };
        await client.upsertEntity(entity, "Replace");
    } catch (error) {
        console.error(`Erro ao salvar o parâmetro "${name}":`, error);
        throw new Error(`Falha ao salvar o parâmetro "${name}" no Azure Table Storage.`);
    }
}
