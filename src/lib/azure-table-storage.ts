// Este arquivo usa a flag 'use server' para indicar que pode ser executado no servidor.
// No entanto, as funções aqui podem ser chamadas tanto do cliente quanto do servidor.
'use server';

import { TableClient, TableEntity, AzureNamedKeyCredential } from "@azure/data-tables";
// Removido mockData: integração 100% Azure
import type { IdentifiedRisk, RiskAnalysis, Control, Kpi, AssociatedRisk, BowtieData, TopRisk, RiskFactor, TemaMaterial, CategoriaControle } from './types';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const identifiedRisksTableName = "identifiedrisks";
const riskAnalysisTableName = "riskanalysis"; // Nova tabela
const controlsTableName = "controls";
const kpisTableName = "kpis";
const parametersTableName = "parameters";
const bowtieTableName = "bowties";
const topRiskTableName = "toprisks";
const riskFactorTableName = "riskfactors";
const temaMaterialTableName = "temasmateriais";
const categoriaControleTableName = "categoriascontrole";

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
    
    // Garante que partitionKey seja válido
    let partitionKey = "Default";
    if (control.area && typeof control.area === 'string') {
        const sanitized = control.area.replace(/[^a-zA-Z0-9]/g, '');
        partitionKey = sanitized || "Default";
    }
    
    // Converte todos os valores para tipos primitivos aceitos pelo Azure Table Storage
    const sanitizedRest: any = {};
    for (const key in rest) {
        const value = (rest as any)[key];
        
        // Se for objeto ou array, serializa como JSON string
        if (value !== null && value !== undefined) {
            if (typeof value === 'object') {
                sanitizedRest[key] = JSON.stringify(value);
            } else {
                sanitizedRest[key] = value;
            }
        } else {
            // Mantém null/undefined como string vazia para Azure
            sanitizedRest[key] = value ?? '';
        }
    }
    
    return {
        partitionKey: partitionKey,
        rowKey: id,
        ...sanitizedRest,
        associatedRisks: JSON.stringify(associatedRisks || []),
    };
};

const fromControlTableEntity = (entity: TableEntity<any>): Control => {
    const control: any = {};
    for (const key in entity) {
        if (key !== 'partitionKey' && key !== 'rowKey' && key !== 'etag' && key !== 'timestamp' && !key.endsWith('@odata.type')) {
            const value = entity[key];
            
            // Tenta deserializar strings JSON de volta para objetos/arrays
            if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
                try {
                    control[key] = JSON.parse(value);
                } catch (e) {
                    // Se falhar, mantém como string
                    control[key] = value;
                }
            } else {
                control[key] = value;
            }
        }
    }
    control.id = entity.rowKey;

    // Garante que associatedRisks seja sempre um array
    if (!Array.isArray(control.associatedRisks)) {
        if (typeof control.associatedRisks === 'string') {
            try {
                control.associatedRisks = JSON.parse(control.associatedRisks);
            } catch (e) {
                control.associatedRisks = [];
            }
        } else {
            control.associatedRisks = [];
        }
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

        console.log("Tentando salvar controle:", control);
        console.log("Campo categoria:", control.categoria, "Tipo:", typeof control.categoria);
        const entity = toControlTableEntity(control);
        console.log("Entity gerada:", entity);
        console.log("Entity categoria:", entity.categoria, "Tipo:", typeof entity.categoria);
        await client.upsertEntity(entity, "Merge");
        return fromControlTableEntity(entity);
    } catch (error: any) {
        console.error("Erro ao salvar o controle:", error);
        console.error("Mensagem de erro:", error?.message);
        console.error("Stack trace:", error?.stack);
        console.error("Detalhes do erro:", JSON.stringify(error, null, 2));
        throw new Error(`Falha ao salvar o controle no Azure Table Storage: ${error?.message || 'Erro desconhecido'}`);
    }
}

export async function deleteControl(id: string, partitionKey: string): Promise<void> {
    const client = getClient(controlsTableName);
    try {
        await client.deleteEntity(partitionKey, id);
    } catch (error) {
        console.error("Erro ao excluir o controle:", error);
        throw new Error("Falha ao excluir o controle do Azure Table Storage.");
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
            observacao: risk.observacao,
            imp: risk.corporateImpact,
            org: risk.organizationalRelevance,
            prob: risk.contextualizedProbability,
            ctrl: risk.currentControlCapacity,
            tempo: risk.containmentTime,
            facil: risk.technicalFeasibility,
            ier: 0, // O cálculo do IER será mantido na UI ou em outra camada
        } as unknown as RiskAnalysis));

    // Combina os riscos existentes com os novos, garantindo que não há duplicados
    const allRisks = [...existingAnalysisRisks, ...newRisksForAnalysis];
    const uniqueRisks = allRisks.filter((risk, index, self) => 
        index === self.findIndex(r => r.id === risk.id)
    );
    
    return uniqueRisks.sort((a, b) => 
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

// ---- Funções CRUD para Bowtie ----

const toBowtieTableEntity = (bowtie: BowtieData): TableEntity<any> => {
    const { id, riskId, ...rest } = bowtie;
    return {
        partitionKey: id, // O ID do Bowtie é a PartitionKey
        rowKey: riskId,   // O ID do Risco associado é a RowKey
        ...rest,
        topEvent: JSON.stringify(bowtie.topEvent),
        threats: JSON.stringify(bowtie.threats),
        consequences: JSON.stringify(bowtie.consequences),
    };
};

const fromBowtieTableEntity = (entity: TableEntity<any>): BowtieData => {
    const bowtie: any = {};
    for (const key in entity) {
        if (key !== 'partitionKey' && key !== 'rowKey' && key !== 'etag' && key !== 'timestamp' && !key.endsWith('@odata.type')) {
            bowtie[key] = entity[key];
        }
    }
    bowtie.id = entity.partitionKey;
    bowtie.riskId = entity.rowKey;

    try {
        bowtie.topEvent = JSON.parse(entity.topEvent);
        bowtie.threats = JSON.parse(entity.threats);
        bowtie.consequences = JSON.parse(entity.consequences);
    } catch (e) {
        console.error("Erro ao deserializar dados do Bowtie:", e);
        bowtie.topEvent = {};
        bowtie.threats = [];
        bowtie.consequences = [];
    }

    return bowtie as BowtieData;
};

export async function getAllBowties(): Promise<BowtieData[]> {
    const client = getClient(bowtieTableName);
    try {
        await client.createTable();
        const entities = client.listEntities();
        const bowties: BowtieData[] = [];
        for await (const entity of entities) {
            bowties.push(fromBowtieTableEntity(entity));
        }
        return bowties;
    } catch (error) {
        console.error("Erro ao buscar todos os Bowties:", error);
        return [];
    }
}

export async function getBowtieById(id: string): Promise<BowtieData | undefined> {
    const client = getClient(bowtieTableName);
    try {
        const entities = client.listEntities<TableEntity<any>>({
            queryOptions: { filter: `PartitionKey eq '${id}'` }
        });
        for await (const entity of entities) {
            return fromBowtieTableEntity(entity); // Retorna o primeiro encontrado
        }
        return undefined;
    } catch (error) {
        console.error(`Erro ao buscar Bowtie com ID ${id}:`, error);
        return undefined;
    }
}

export async function addOrUpdateBowtie(bowtieData: BowtieData): Promise<BowtieData> {
    const client = getClient(bowtieTableName);
    try {
        await client.createTable();
        const now = new Date().toISOString();
        
        let bowtieToSave = { ...bowtieData };
        if (!bowtieToSave.createdAt) {
            bowtieToSave.createdAt = now;
            bowtieToSave.createdBy = "Sistema"; // Substituir pelo usuário logado
        }
        bowtieToSave.updatedAt = now;
        bowtieToSave.updatedBy = "Sistema"; // Substituir pelo usuário logado

        const entity = toBowtieTableEntity(bowtieToSave);
        await client.upsertEntity(entity, "Merge");
        return fromBowtieTableEntity(entity);
    } catch (error) {
        console.error("Erro ao salvar o Bowtie:", error);
        throw new Error("Falha ao salvar o Bowtie no Azure Table Storage.");
    }
}

export async function deleteBowtie(id: string, riskId: string): Promise<void> {
    const client = getClient(bowtieTableName);
    try {
        await client.deleteEntity(id, riskId);
        console.log(`Bowtie com ID ${id} e RiskID ${riskId} excluído com sucesso.`);
    } catch (error) {
        console.error("Erro ao excluir o Bowtie:", error);
        throw new Error("Falha ao excluir o Bowtie no Azure Table Storage.");
    }
}

// ---- Funções CRUD para TopRisk ----

const toTopRiskTableEntity = (topRisk: TopRisk): TableEntity<any> => {
    const { id, ...rest } = topRisk;
    return {
        partitionKey: "global", // Todos os Top Risks ficam na mesma partição
        rowKey: id,
        ...rest,
    };
};

const fromTopRiskTableEntity = (entity: TableEntity<any>): TopRisk => {
    const topRisk: any = {};
    for (const key in entity) {
        if (key !== 'partitionKey' && key !== 'rowKey' && key !== 'etag' && key !== 'timestamp' && !key.endsWith('@odata.type')) {
            topRisk[key] = entity[key];
        }
    }
    topRisk.id = entity.rowKey;

    return topRisk as TopRisk;
};

export async function createTopRiskTable(): Promise<void> {
    const client = getClient(topRiskTableName);
    try {
        await client.createTable();
        console.log(`Tabela "${topRiskTableName}" criada ou já existente.`);
    } catch (error) {
        console.error(`Erro ao criar a tabela "${topRiskTableName}":`, error);
    }
}

export async function getTopRisks(): Promise<TopRisk[]> {
    const client = getClient(topRiskTableName);
    try {
        await client.createTable();
        const entities = client.listEntities();
        const topRisks: TopRisk[] = [];
        for await (const entity of entities) {
            topRisks.push(fromTopRiskTableEntity(entity));
        }
        return topRisks;
    } catch (error) {
        console.error("Erro ao buscar Top Risks:", error);
        return [];
    }
}

export async function getTopRiskById(id: string): Promise<TopRisk | undefined> {
    const client = getClient(topRiskTableName);
    try {
        const entity = await client.getEntity<TableEntity<any>>("global", id);
        return fromTopRiskTableEntity(entity);
    } catch (error: any) {
        if (error.statusCode === 404) {
            return undefined;
        }
        console.error(`Erro ao buscar Top Risk com ID ${id}:`, error);
        return undefined;
    }
}

export async function addOrUpdateTopRisk(topRiskData: TopRisk): Promise<TopRisk> {
    const client = getClient(topRiskTableName);
    try {
        await client.createTable();
        const entity = toTopRiskTableEntity(topRiskData);
        await client.upsertEntity(entity, "Merge");
        return fromTopRiskTableEntity(entity);
    } catch (error) {
        console.error("Erro ao salvar o Top Risk:", error);
        throw new Error("Falha ao salvar o Top Risk no Azure Table Storage.");
    }
}

export async function deleteTopRisk(id: string, partitionKey: string): Promise<void> {
    const client = getClient(topRiskTableName);
    try {
        await client.deleteEntity(partitionKey, id);
        console.log(`Top Risk com ID ${id} excluído com sucesso.`);
    } catch (error: any) {
        if (error.statusCode === 404) {
            console.warn(`Tentativa de excluir Top Risk não encontrado (ID: ${id}).`);
            return;
        }
        console.error("Erro ao excluir o Top Risk:", error);
        throw new Error("Falha ao excluir o Top Risk no Azure Table Storage.");
    }
}

// ---- Função para inicializar Top Risks padrão ----

export async function initializeDefaultTopRisks(): Promise<void> {
    const client = getClient(topRiskTableName);
    try {
        await client.createTable();
        
        // Verifica se já existem Top Risks
        const existingTopRisks = await getTopRisks();
        if (existingTopRisks.length > 0) {
            console.log("Top Risks já inicializados.");
            return;
        }

        const defaultTopRisks: Omit<TopRisk, 'id'>[] = [
            {
                nome: "Risco 01.Não integridade Operacional de Ativos",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "Risco 02. Execução nos projetos de expansão",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "Risco 03. Não atendimento junto ao Regulador",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "Risco 04. Crise Ambiental & Mudanças Climáticas",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "Risco 05. Decisões Tributárias e Judiciais Adversas",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "Risco 06. Ambiente Concorrencial & Demanda",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "Risco 07. Impactos no Ambiente Operacional de Tecnologia",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "Risco 08. Integridade, Compliance & Reputacional",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "Risco 09. Dependência de Fornecedores",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "Risco 10. Gente & Cultura",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "Risco 11. Gestão de Mudança",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
        ];

        // Insere os Top Risks padrão
        for (const topRiskData of defaultTopRisks) {
            const topRisk: TopRisk = {
                ...topRiskData,
                id: `toprisk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            };
            await addOrUpdateTopRisk(topRisk);
        }

        console.log("Top Risks padrão inicializados com sucesso.");
    } catch (error) {
        console.error("Erro ao inicializar Top Risks padrão:", error);
        throw new Error("Falha ao inicializar Top Risks padrão no Azure Table Storage.");
    }
}

// ---- Funções CRUD para RiskFactor ----

const toRiskFactorTableEntity = (riskFactor: RiskFactor): TableEntity<any> => {
    const { id, ...rest } = riskFactor;
    return {
        partitionKey: "global", // Todos os Risk Factors ficam na mesma partição
        rowKey: id,
        ...rest,
    };
};

const fromRiskFactorTableEntity = (entity: TableEntity<any>): RiskFactor => {
    const riskFactor: any = {};
    for (const key in entity) {
        if (key !== 'partitionKey' && key !== 'rowKey' && key !== 'etag' && key !== 'timestamp' && !key.endsWith('@odata.type')) {
            riskFactor[key] = entity[key];
        }
    }
    riskFactor.id = entity.rowKey;

    return riskFactor as RiskFactor;
};

export async function createRiskFactorTable(): Promise<void> {
    const client = getClient(riskFactorTableName);
    try {
        await client.createTable();
        console.log(`Tabela "${riskFactorTableName}" criada ou já existente.`);
    } catch (error) {
        console.error(`Erro ao criar a tabela "${riskFactorTableName}":`, error);
    }
}

export async function getRiskFactors(): Promise<RiskFactor[]> {
    const client = getClient(riskFactorTableName);
    try {
        await client.createTable();
        const entities = client.listEntities();
        const riskFactors: RiskFactor[] = [];
        for await (const entity of entities) {
            riskFactors.push(fromRiskFactorTableEntity(entity));
        }
        return riskFactors;
    } catch (error) {
        console.error("Erro ao buscar Risk Factors:", error);
        return [];
    }
}

export async function getRiskFactorById(id: string): Promise<RiskFactor | undefined> {
    const client = getClient(riskFactorTableName);
    try {
        const entity = await client.getEntity<TableEntity<any>>("global", id);
        return fromRiskFactorTableEntity(entity);
    } catch (error: any) {
        if (error.statusCode === 404) {
            return undefined;
        }
        console.error(`Erro ao buscar Risk Factor com ID ${id}:`, error);
        return undefined;
    }
}

export async function addOrUpdateRiskFactor(riskFactorData: RiskFactor): Promise<RiskFactor> {
    const client = getClient(riskFactorTableName);
    try {
        await client.createTable();
        const entity = toRiskFactorTableEntity(riskFactorData);
        await client.upsertEntity(entity, "Merge");
        return fromRiskFactorTableEntity(entity);
    } catch (error) {
        console.error("Erro ao salvar o Risk Factor:", error);
        throw new Error("Falha ao salvar o Risk Factor no Azure Table Storage.");
    }
}

export async function deleteRiskFactor(id: string, partitionKey: string): Promise<void> {
    const client = getClient(riskFactorTableName);
    try {
        await client.deleteEntity(partitionKey, id);
        console.log(`Risk Factor com ID ${id} excluído com sucesso.`);
    } catch (error: any) {
        if (error.statusCode === 404) {
            console.warn(`Tentativa de excluir Risk Factor não encontrado (ID: ${id}).`);
            return;
        }
        console.error("Erro ao excluir o Risk Factor:", error);
        throw new Error("Falha ao excluir o Risk Factor no Azure Table Storage.");
    }
}

// ---- Função para inicializar Risk Factors padrão ----

export async function initializeDefaultRiskFactors(): Promise<void> {
    const client = getClient(riskFactorTableName);
    try {
        await client.createTable();
        
        // Verifica se já existem Risk Factors
        const existingRiskFactors = await getRiskFactors();
        if (existingRiskFactors.length > 0) {
            console.log("Risk Factors já inicializados.");
            return;
        }

        const defaultRiskFactors: Omit<RiskFactor, 'id'>[] = [
            {
                nome: "1.1 Paralisação e/ou indisponibilidade operacional por vandalismo, greve ou manifestação.",
                donoRisco: "",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "1.2 Limitação de capacidade operacional.",
                donoRisco: "",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "1.3 Paralização e/ou indisponibilidade operacional causado por acidentes",
                donoRisco: "",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "2.2 Comprometimento do CAPEX e cronograma planejado",
                donoRisco: "",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "3.2 Decisões regulatórias adversas: Cumprimento e gerenciamento do caderno de obrigações das concessões e autorizações.",
                donoRisco: "",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "3.3 Licenciamento e Atos Autorizativos : Não manutenção das licenças e/ou atendimento das condicionantes para operar",
                donoRisco: "",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "4.1 Danos físicos aos ativos e operação, principalmente corredor Santos",
                donoRisco: "",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "4.2 Danos ambientais causados pela Companhia",
                donoRisco: "",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "4.3 Impacto em demanda",
                donoRisco: "",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "5.2 Perdas financeiras devido a divergência de Interpretação do dispositivo legal ou mudança da jurisprudência",
                donoRisco: "",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "5.3 Decisões judiciais adversas.",
                donoRisco: "",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
        ];

        // Insere os Risk Factors padrão
        for (const riskFactorData of defaultRiskFactors) {
            const riskFactor: RiskFactor = {
                ...riskFactorData,
                id: `riskfactor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            };
            await addOrUpdateRiskFactor(riskFactor);
        }

        console.log("Risk Factors padrão inicializados com sucesso.");
    } catch (error) {
        console.error("Erro ao inicializar Risk Factors padrão:", error);
        throw new Error("Falha ao inicializar Risk Factors padrão no Azure Table Storage.");
    }
}

// ---- Funções CRUD para TemaMaterial ----

const toTemaMaterialTableEntity = (temaMaterial: TemaMaterial): TableEntity<any> => {
    const { id, ...rest } = temaMaterial;
    return {
        partitionKey: "global", // Todos os Temas Materiais ficam na mesma partição
        rowKey: id,
        ...rest,
    };
};

const fromTemaMaterialTableEntity = (entity: TableEntity<any>): TemaMaterial => {
    const temaMaterial: any = {};
    for (const key in entity) {
        if (key !== 'partitionKey' && key !== 'rowKey' && key !== 'etag' && key !== 'timestamp' && !key.endsWith('@odata.type')) {
            temaMaterial[key] = entity[key];
        }
    }
    temaMaterial.id = entity.rowKey;

    return temaMaterial as TemaMaterial;
};

export async function createTemaMaterialTable(): Promise<void> {
    const client = getClient(temaMaterialTableName);
    try {
        await client.createTable();
        console.log(`Tabela "${temaMaterialTableName}" criada ou já existente.`);
    } catch (error) {
        console.error(`Erro ao criar a tabela "${temaMaterialTableName}":`, error);
    }
}

export async function getTemasMateriais(): Promise<TemaMaterial[]> {
    const client = getClient(temaMaterialTableName);
    try {
        await client.createTable();
        const entities = client.listEntities();
        const temasMateriais: TemaMaterial[] = [];
        for await (const entity of entities) {
            temasMateriais.push(fromTemaMaterialTableEntity(entity));
        }
        return temasMateriais;
    } catch (error) {
        console.error("Erro ao buscar Temas Materiais:", error);
        return [];
    }
}

export async function getTemaMaterialById(id: string): Promise<TemaMaterial | undefined> {
    const client = getClient(temaMaterialTableName);
    try {
        const entity = await client.getEntity<TableEntity<any>>("global", id);
        return fromTemaMaterialTableEntity(entity);
    } catch (error: any) {
        if (error.statusCode === 404) {
            return undefined;
        }
        console.error(`Erro ao buscar Tema Material com ID ${id}:`, error);
        return undefined;
    }
}

export async function addOrUpdateTemaMaterial(temaMaterialData: TemaMaterial): Promise<TemaMaterial> {
    const client = getClient(temaMaterialTableName);
    try {
        await client.createTable();
        const entity = toTemaMaterialTableEntity(temaMaterialData);
        await client.upsertEntity(entity, "Merge");
        return fromTemaMaterialTableEntity(entity);
    } catch (error) {
        console.error("Erro ao salvar o Tema Material:", error);
        throw new Error("Falha ao salvar o Tema Material no Azure Table Storage.");
    }
}

export async function deleteTemaMaterial(id: string, partitionKey: string): Promise<void> {
    const client = getClient(temaMaterialTableName);
    try {
        await client.deleteEntity(partitionKey, id);
        console.log(`Tema Material com ID ${id} excluído com sucesso.`);
    } catch (error: any) {
        if (error.statusCode === 404) {
            console.warn(`Tentativa de excluir Tema Material não encontrado (ID: ${id}).`);
            return;
        }
        console.error("Erro ao excluir o Tema Material:", error);
        throw new Error("Falha ao excluir o Tema Material no Azure Table Storage.");
    }
}

// ---- Função para inicializar Temas Materiais padrão ----

export async function initializeDefaultTemasMateriais(): Promise<void> {
    const client = getClient(temaMaterialTableName);
    try {
        await client.createTable();
        
        // Verifica se já existem Temas Materiais
        const existingTemasMateriais = await getTemasMateriais();
        if (existingTemasMateriais.length > 0) {
            console.log("Temas Materiais já inicializados.");
            return;
        }

        const defaultTemasMateriais: Omit<TemaMaterial, 'id'>[] = [
            {
                nome: "Integridade de Ativos",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "Não Aplicável",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "Governança e Ética",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "Meio Ambiente",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "Saúde e Segurança Pessoal",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "Direitos Humanos",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "Mudanças Climáticas e Gestão de Emissões",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "Diversidade, Equidade e Inclusão",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
        ];

        // Insere os Temas Materiais padrão
        for (const temaMaterialData of defaultTemasMateriais) {
            const temaMaterial: TemaMaterial = {
                ...temaMaterialData,
                id: `temamaterial_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            };
            await addOrUpdateTemaMaterial(temaMaterial);
        }

        console.log("Temas Materiais padrão inicializados com sucesso.");
    } catch (error) {
        console.error("Erro ao inicializar Temas Materiais padrão:", error);
        throw new Error("Falha ao inicializar Temas Materiais padrão no Azure Table Storage.");
    }
}

// ---- Funções CRUD para CategoriaControle ----

const toCategoriaControleTableEntity = (categoriaControle: CategoriaControle): TableEntity<any> => {
    const { id, ...rest } = categoriaControle;
    return {
        partitionKey: "global", // Todas as Categorias de Controle ficam na mesma partição
        rowKey: id,
        ...rest,
    };
};

const fromCategoriaControleTableEntity = (entity: TableEntity<any>): CategoriaControle => {
    const categoriaControle: any = {};
    for (const key in entity) {
        if (key !== 'partitionKey' && key !== 'rowKey' && key !== 'etag' && key !== 'timestamp' && !key.endsWith('@odata.type')) {
            categoriaControle[key] = entity[key];
        }
    }
    categoriaControle.id = entity.rowKey;

    return categoriaControle as CategoriaControle;
};

export async function createCategoriaControleTable(): Promise<void> {
    const client = getClient(categoriaControleTableName);
    try {
        await client.createTable();
        console.log(`Tabela "${categoriaControleTableName}" criada ou já existente.`);
    } catch (error) {
        console.error(`Erro ao criar a tabela "${categoriaControleTableName}":`, error);
    }
}

export async function getCategoriasControle(): Promise<CategoriaControle[]> {
    const client = getClient(categoriaControleTableName);
    try {
        await client.createTable();
        const entities = client.listEntities();
        const categoriasControle: CategoriaControle[] = [];
        for await (const entity of entities) {
            categoriasControle.push(fromCategoriaControleTableEntity(entity));
        }
        return categoriasControle;
    } catch (error) {
        console.error("Erro ao buscar Categorias de Controle:", error);
        return [];
    }
}

export async function getCategoriaControleById(id: string): Promise<CategoriaControle | undefined> {
    const client = getClient(categoriaControleTableName);
    try {
        const entity = await client.getEntity<TableEntity<any>>("global", id);
        return fromCategoriaControleTableEntity(entity);
    } catch (error: any) {
        if (error.statusCode === 404) {
            return undefined;
        }
        console.error(`Erro ao buscar Categoria de Controle com ID ${id}:`, error);
        return undefined;
    }
}

export async function addOrUpdateCategoriaControle(categoriaControleData: CategoriaControle): Promise<CategoriaControle> {
    const client = getClient(categoriaControleTableName);
    try {
        await client.createTable();
        const entity = toCategoriaControleTableEntity(categoriaControleData);
        await client.upsertEntity(entity, "Merge");
        return fromCategoriaControleTableEntity(entity);
    } catch (error) {
        console.error("Erro ao salvar a Categoria de Controle:", error);
        throw new Error("Falha ao salvar a Categoria de Controle no Azure Table Storage.");
    }
}

export async function deleteCategoriaControle(id: string, partitionKey: string): Promise<void> {
    const client = getClient(categoriaControleTableName);
    try {
        await client.deleteEntity(partitionKey, id);
        console.log(`Categoria de Controle com ID ${id} excluída com sucesso.`);
    } catch (error: any) {
        if (error.statusCode === 404) {
            console.warn(`Tentativa de excluir Categoria de Controle não encontrada (ID: ${id}).`);
            return;
        }
        console.error("Erro ao excluir a Categoria de Controle:", error);
        throw new Error("Falha ao excluir a Categoria de Controle no Azure Table Storage.");
    }
}

// ---- Função para inicializar Categorias de Controle padrão ----

export async function initializeDefaultCategoriasControle(): Promise<void> {
    const client = getClient(categoriaControleTableName);
    try {
        await client.createTable();
        
        // Verifica se já existem Categorias de Controle
        const existingCategoriasControle = await getCategoriasControle();
        if (existingCategoriasControle.length > 0) {
            console.log("Categorias de Controle já inicializadas.");
            return;
        }

        const defaultCategoriasControle: Omit<CategoriaControle, 'id'>[] = [
            {
                nome: "Inspeção",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "Procedimento",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
            {
                nome: "Checklist",
                createdBy: "Sistema",
                createdAt: new Date().toISOString(),
                updatedBy: "Sistema",
                updatedAt: new Date().toISOString(),
            },
        ];

        // Insere as Categorias de Controle padrão
        for (const categoriaControleData of defaultCategoriasControle) {
            const categoriaControle: CategoriaControle = {
                ...categoriaControleData,
                id: `categoriacontrole_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            };
            await addOrUpdateCategoriaControle(categoriaControle);
        }

        console.log("Categorias de Controle padrão inicializadas com sucesso.");
    } catch (error) {
        console.error("Erro ao inicializar Categorias de Controle padrão:", error);
        throw new Error("Falha ao inicializar Categorias de Controle padrão no Azure Table Storage.");
    }
}
