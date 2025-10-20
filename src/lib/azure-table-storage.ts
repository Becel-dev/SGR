// Este arquivo usa a flag 'use server' para indicar que pode ser executado no servidor.
// No entanto, as funções aqui podem ser chamadas tanto do cliente quanto do servidor.
'use server';

import { TableClient, TableEntity, AzureNamedKeyCredential } from "@azure/data-tables";
import { getEnvironmentConfig } from './config';
import type { IdentifiedRisk, RiskAnalysis, Control, Kpi, AssociatedRisk, BowtieData, TopRisk, RiskFactor, TemaMaterial, CategoriaControle, EscalationConfig, Action, AccessProfile, UserAccessControl } from './types';

// Usa a connection string apropriada baseada no ambiente
const config = getEnvironmentConfig();
const connectionString = config.azureStorageConnectionString;
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
const escalationTableName = "escalations";

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

    // Mapeia TopRisk para o campo usado em outras telas (topRiskAssociado)
    analysis.topRisk = entity.topRisk || '';
    analysis.topRiskAssociado = entity.topRisk || entity.topRiskAssociado || '';

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

// --- Funções de conversão para KPI ---
const toKpiTableEntity = (kpi: Omit<Kpi, 'id'> & { id?: string }): TableEntity<any> => {
    const partitionKey = "KPI";
    const rowKey = kpi.id || `kpi_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return {
        partitionKey,
        rowKey,
        controlId: kpi.controlId,
        controlName: kpi.controlName,
        donoControle: kpi.donoControle,
        emailDonoControle: kpi.emailDonoControle,
        responsibles: JSON.stringify(kpi.responsibles),
        status: kpi.status,
        dataInicioVerificacao: kpi.dataInicioVerificacao,
        dataProximaVerificacao: kpi.dataProximaVerificacao,
        frequenciaDias: kpi.frequenciaDias,
        evidenceFiles: JSON.stringify(kpi.evidenceFiles),
        createdAt: kpi.createdAt,
        updatedAt: kpi.updatedAt,
        createdBy: kpi.createdBy,
        updatedBy: kpi.updatedBy,
    };
};

const fromKpiTableEntity = (entity: TableEntity<any>): Kpi => {
    const kpi: any = {};
    for (const key in entity) {
        if (key !== 'partitionKey' && key !== 'rowKey' && key !== 'etag' && key !== 'timestamp' && !key.endsWith('@odata.type')) {
            kpi[key] = entity[key];
        }
    }
    kpi.id = entity.rowKey;
    
    // Deserializa campos JSON
    if (kpi.responsibles && typeof kpi.responsibles === 'string') {
        try {
            kpi.responsibles = JSON.parse(kpi.responsibles);
        } catch (e) {
            kpi.responsibles = [];
        }
    }
    
    if (kpi.evidenceFiles && typeof kpi.evidenceFiles === 'string') {
        try {
            kpi.evidenceFiles = JSON.parse(kpi.evidenceFiles);
        } catch (e) {
            kpi.evidenceFiles = [];
        }
    }
    
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

        // Se for novo registro (sem id), gerar id sequencial no formato CTRL-<n>
        if (!control.id || control.id.trim() === '') {
            // Lista entidades existentes e encontra o maior número de CTRL-n
            const entities = client.listEntities<TableEntity<any>>();
            let maxNum = 0;
            for await (const entity of entities) {
                const existingId = entity.rowKey || '';
                const match = existingId.match(/^CTRL-(\d+)$/i);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (!isNaN(num) && num > maxNum) maxNum = num;
                }
            }
            control.id = `CTRL-${maxNum + 1}`;
        }
        if (!control.criadoEm) {
            control.criadoEm = now;
        }
        if (!control.criadoPor) {
            control.criadoPor = "Sistema (sistema@sgr.com)";
        }
        // Sempre atualiza a data de modificação, mas respeita o modificadoPor se vier preenchido
        control.modificadoEm = control.modificadoEm || now;
        control.modificadoPor = control.modificadoPor || "Sistema (sistema@sgr.com)";

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

// ---- Funções CRUD para KPI ----

export async function getAllKpis(): Promise<Kpi[]> {
    const client = getClient(kpisTableName);
    try {
        await client.createTable();
        const entities = client.listEntities<TableEntity<any>>();
        const kpis: Kpi[] = [];
        for await (const entity of entities) {
            kpis.push(fromKpiTableEntity(entity));
        }
        return kpis;
    } catch (error) {
        console.error("Erro ao buscar KPIs:", error);
        return [];
    }
}

export async function getKpiById(id: string): Promise<Kpi | undefined> {
    const client = getClient(kpisTableName);
    try {
        const entity = await client.getEntity("KPI", id);
        return fromKpiTableEntity(entity);
    } catch (error) {
        console.error(`Erro ao buscar KPI com ID ${id}:`, error);
        return undefined;
    }
}

export async function getKpisByControlId(controlId: string): Promise<Kpi[]> {
    const client = getClient(kpisTableName);
    try {
        await client.createTable();
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

export async function createKpi(kpi: Omit<Kpi, 'id' | 'createdAt' | 'updatedAt'>): Promise<Kpi> {
    const client = getClient(kpisTableName);
    try {
        await client.createTable();
        const now = new Date().toISOString();
        // Busca KPIs existentes para o controle
        const existingKpis = await getKpisByControlId(kpi.controlId);
        let maxNum = 0;
        for (const existing of existingKpis) {
            const match = existing.id?.match(/^CTRL-\d+-KPI-(\d+)$/);
            if (match) {
                const num = parseInt(match[1], 10);
                if (!isNaN(num) && num > maxNum) maxNum = num;
            }
        }
        const nextNum = maxNum + 1;
        const controlId = kpi.controlId;
        const kpiId = `${controlId}-KPI-${nextNum}`;
        const newKpi: Omit<Kpi, 'id'> & { id?: string } = {
            ...kpi,
            id: kpiId,
            createdAt: now,
            updatedAt: now,
        };
        const entity = toKpiTableEntity(newKpi);
        await client.createEntity(entity);
        return fromKpiTableEntity(entity);
    } catch (error) {
        console.error("Erro ao criar KPI:", error);
        throw error;
    }
}

export async function updateKpi(id: string, updates: Partial<Kpi>): Promise<Kpi | undefined> {
    const client = getClient(kpisTableName);
    try {
        const existing = await getKpiById(id);
        if (!existing) {
            throw new Error(`KPI com ID ${id} não encontrado`);
        }
        
        const updatedKpi: Kpi = {
            ...existing,
            ...updates,
            id: existing.id,
            updatedAt: new Date().toISOString(),
        };
        
        const entity = toKpiTableEntity(updatedKpi);
        await client.updateEntity(entity, "Replace");
        return fromKpiTableEntity(entity);
    } catch (error) {
        console.error(`Erro ao atualizar KPI ${id}:`, error);
        throw error;
    }
}

export async function deleteKpi(id: string): Promise<void> {
    const client = getClient(kpisTableName);
    try {
        await client.deleteEntity("KPI", id);
    } catch (error) {
        console.error(`Erro ao deletar KPI ${id}:`, error);
        throw error;
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
        
        // Remove duplicatas baseado no ID (mantém o primeiro encontrado)
        const uniqueRisks = risks.reduce((acc, current) => {
            const exists = acc.find(item => item.id === current.id);
            if (!exists) {
                acc.push(current);
            }
            return acc;
        }, [] as RiskAnalysis[]);
        
        return uniqueRisks;
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

        // Se for novo registro (sem id ou id vazio), gera ID sequencial no formato R-n
        if (!risk.id || risk.id.trim() === "") {
            // Busca todos os riscos existentes
            const entities = client.listEntities<TableEntity<any>>();
            let maxNum = 0;
            for await (const entity of entities) {
                const existingId = entity.rowKey || "";
                // Verifica se o ID está no formato R-n
                const match = existingId.match(/^R-(\d+)$/);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num > maxNum) maxNum = num;
                }
            }
            risk.id = `R-${maxNum + 1}`;
        }

        // Mantém os valores de auditoria enviados pelo frontend
        // Só preenche com valores padrão se não foram fornecidos
        if (!risk.createdAt) {
            risk.createdAt = now;
        }
        if (!risk.createdBy) {
            risk.createdBy = "Sistema (sistema@sgr.com)";
        }
        if (!risk.updatedAt) {
            risk.updatedAt = now;
        }
        if (!risk.updatedBy) {
            risk.updatedBy = "Sistema (sistema@sgr.com)";
        }

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
            // Mantém os valores de auditoria se já vieram preenchidos
            updatedAt: analysisData.updatedAt || new Date().toISOString(),
            updatedBy: analysisData.updatedBy || "Sistema (sistema@sgr.com)",
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
    const { id, riskId, version, ...rest } = bowtie;
    return {
        partitionKey: riskId, // O ID do Risco é a PartitionKey (agrupa versões)
        rowKey: `${id}_v${version}`,   // ID do Bowtie + versão é a RowKey
        ...rest,
        id,
        riskId,
        version,
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
    // riskId vem da PartitionKey
    bowtie.riskId = entity.partitionKey;
    // id e version já estão no entity, mas garantimos extração do rowKey como fallback
    if (!bowtie.id || !bowtie.version) {
        const rowKeyParts = entity.rowKey.split('_v');
        bowtie.id = rowKeyParts[0];
        bowtie.version = parseFloat(rowKeyParts[1]) || 1.0;
    }

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

export async function getBowtieVersions(riskId: string): Promise<BowtieData[]> {
    const client = getClient(bowtieTableName);
    try {
        const entities = client.listEntities<TableEntity<any>>({
            queryOptions: { filter: `PartitionKey eq '${riskId}'` }
        });
        const versions: BowtieData[] = [];
        for await (const entity of entities) {
            versions.push(fromBowtieTableEntity(entity));
        }
        // Retorna todas as versões ordenadas da mais recente para a mais antiga
        return versions.sort((a, b) => b.version - a.version);
    } catch (error) {
        console.error(`Erro ao buscar versões do Bowtie com riskId ${riskId}:`, error);
        return [];
    }
}

export async function getBowtieById(id: string): Promise<BowtieData | undefined> {
    const client = getClient(bowtieTableName);
    try {
        console.log(`🔍 getBowtieById - Searching for id: "${id}"`);
        console.log(`🔍 Pattern to match: "${id}_v" (starts with)`);
        
        // Busca por partitionKey OU rowKey que contenha o id
        let latest: BowtieData | undefined = undefined;
        let matchCount = 0;
        let entityCount = 0;
        
        const entities = client.listEntities<TableEntity<any>>();
        for await (const entity of entities) {
            entityCount++;
            console.log(`🔎 Entity ${entityCount}: PK="${entity.partitionKey}", RK="${entity.rowKey}"`);
            
            // Match partitionKey or rowKey pattern
            const pkMatch = entity.partitionKey === id;
            const rkMatch = entity.rowKey && (
                entity.rowKey === id ||                    // Exact match (formato sem versão)
                entity.rowKey.startsWith(id + '_v')        // Formato com versão: id_vX
            );
            
            console.log(`   PK match: ${pkMatch}, RK match: ${rkMatch}`);
            
            if (pkMatch || rkMatch) {
                matchCount++;
                const bowtie = fromBowtieTableEntity(entity);
                console.log(`✅ Match ${matchCount}: PK="${entity.partitionKey}", RK="${entity.rowKey}", version=${bowtie.version}`);
                
                if (!latest || bowtie.version > latest.version) {
                    latest = bowtie;
                }
            }
        }
        
        console.log(`📊 Total entities scanned: ${entityCount}, Matches found: ${matchCount}`);
        
        if (matchCount === 0) {
            console.log(`❌ getBowtieById - No matches found for id: "${id}"`);
        } else {
            console.log(`✅ getBowtieById - Returning latest version ${latest?.version} (${matchCount} total matches)`);
        }
        
        return latest;
    } catch (error) {
        console.error(`❌ Erro ao buscar Bowtie com id ${id}:`, error);
        return undefined;
    }
}

export async function getBowtieByVersion(riskId: string, version: number): Promise<BowtieData | undefined> {
    const client = getClient(bowtieTableName);
    try {
        const rowKey = `${riskId}_v${version}`;
        // Tenta buscar uma versão específica primeiro
        const entities = client.listEntities<TableEntity<any>>({
            queryOptions: { filter: `PartitionKey eq '${riskId}' and RowKey eq '${rowKey}'` }
        });
        for await (const entity of entities) {
            return fromBowtieTableEntity(entity);
        }
        return undefined;
    } catch (error) {
        console.error(`Erro ao buscar Bowtie versão ${version} com riskId ${riskId}:`, error);
        return undefined;
    }
}

export async function addOrUpdateBowtie(bowtieData: BowtieData): Promise<BowtieData> {
    const client = getClient(bowtieTableName);
    try {
        await client.createTable();
        const now = new Date().toISOString();
        
        let bowtieToSave = { ...bowtieData };
        
        // Se é uma atualização, busca a última versão e incrementa
        if (bowtieToSave.id && bowtieToSave.riskId) {
            const existingVersions = await getBowtieVersions(bowtieToSave.riskId);
            if (existingVersions.length > 0) {
                const latestVersion = Math.max(...existingVersions.map((v: BowtieData) => v.version));
                bowtieToSave.version = parseFloat((latestVersion + 0.1).toFixed(1));
            }
        }
        
        // Mantém os valores de auditoria enviados pelo frontend
        if (!bowtieToSave.createdAt) {
            bowtieToSave.createdAt = now;
        }
        if (!bowtieToSave.createdBy) {
            bowtieToSave.createdBy = "Sistema (sistema@sgr.com)";
        }
        if (!bowtieToSave.updatedAt) {
            bowtieToSave.updatedAt = now;
        }
        if (!bowtieToSave.updatedBy) {
            bowtieToSave.updatedBy = "Sistema (sistema@sgr.com)";
        }

        const entity = toBowtieTableEntity(bowtieToSave);
        await client.upsertEntity(entity, "Merge");
        return fromBowtieTableEntity(entity);
    } catch (error) {
        console.error("Erro ao salvar o Bowtie:", error);
        throw new Error("Falha ao salvar o Bowtie no Azure Table Storage.");
    }
}

export async function deleteBowtie(riskId: string, id: string, version: number): Promise<void> {
    const client = getClient(bowtieTableName);
    try {
        const rowKey = `${id}_v${version}`;
        await client.deleteEntity(riskId, rowKey);
        console.log(`Bowtie com riskId ${riskId}, ID ${id} e versão ${version} excluído com sucesso.`);
    } catch (error) {
        console.error("Erro ao excluir o Bowtie:", error);
        throw new Error("Falha ao excluir o Bowtie no Azure Table Storage.");
    }
}

// Exclui todas as versões de um Bowtie (versão atual e anteriores) para um determinado riskId e id
export async function deleteBowtieAllVersions(riskId: string, id: string): Promise<number> {
    const client = getClient(bowtieTableName);
    try {
        let deleted = 0;
        const entities = client.listEntities<TableEntity<any>>({
            queryOptions: { filter: `PartitionKey eq '${riskId}'` }
        });
        const prefixes = new Set<string>([`${id}_v`, `${riskId}_v`]); // cobre dados legados que usavam riskId no RowKey
        for await (const entity of entities) {
            const rk = (entity.rowKey as string) || '';
            if ([...prefixes].some((p) => rk.startsWith(p))) {
                await client.deleteEntity(riskId, rk);
                deleted++;
            }
        }
        console.log(`Bowtie id ${id} (riskId ${riskId}): ${deleted} versão(ões) excluídas.`);
        return deleted;
    } catch (error) {
        console.error("Erro ao excluir todas as versões do Bowtie:", error);
        throw new Error("Falha ao excluir todas as versões do Bowtie no Azure Table Storage.");
    }
}

// Exclui TODOS os Bowties associados a um riskId (todas as versões e quaisquer IDs)
export async function deleteBowtieAllForRisk(riskId: string): Promise<number> {
    const client = getClient(bowtieTableName);
    try {
        let deleted = 0;
        const entities = client.listEntities<TableEntity<any>>({
            queryOptions: { filter: `PartitionKey eq '${riskId}'` }
        });
        for await (const entity of entities) {
            await client.deleteEntity(riskId, entity.rowKey as string);
            deleted++;
        }
        console.log(`Bowtie riskId ${riskId}: ${deleted} entidade(s) excluída(s).`);
        return deleted;
    } catch (error) {
        console.error("Erro ao excluir todos os Bowties do riskId:", error);
        throw new Error("Falha ao excluir todos os Bowties do riskId no Azure Table Storage.");
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

// ---- Funções CRUD para Escalation ----

const toEscalationTableEntity = (escalation: EscalationConfig): TableEntity<any> => {
    const { id, controlId, ...rest } = escalation;
    return {
        partitionKey: "global", // Todos os escalonamentos na mesma partição
        rowKey: id,
        controlId,
        ...rest,
        // Serializar objetos complexos
        percentageConfig: JSON.stringify(escalation.percentageConfig),
        daysConfig: JSON.stringify(escalation.daysConfig),
    };
};

const fromEscalationTableEntity = (entity: TableEntity<any>): EscalationConfig => {
    const escalation: any = {};
    for (const key in entity) {
        if (key !== 'partitionKey' && key !== 'rowKey' && key !== 'etag' && key !== 'timestamp' && !key.endsWith('@odata.type')) {
            escalation[key] = entity[key];
        }
    }
    escalation.id = entity.rowKey;

    // Deserializar objetos complexos
    try {
        escalation.percentageConfig = JSON.parse(entity.percentageConfig);
        escalation.daysConfig = JSON.parse(entity.daysConfig);
    } catch (e) {
        console.error("Erro ao deserializar configs de escalonamento:", e);
    }

    return escalation as EscalationConfig;
};

export async function createEscalationTable(): Promise<void> {
    const client = getClient(escalationTableName);
    try {
        await client.createTable();
        console.log(`Tabela "${escalationTableName}" criada ou já existente.`);
    } catch (error) {
        console.error(`Erro ao criar a tabela "${escalationTableName}":`, error);
    }
}

export async function getAllEscalations(): Promise<EscalationConfig[]> {
    const client = getClient(escalationTableName);
    try {
        await client.createTable();
        const entities = client.listEntities();
        const escalations: EscalationConfig[] = [];
        for await (const entity of entities) {
            escalations.push(fromEscalationTableEntity(entity));
        }
        return escalations;
    } catch (error) {
        console.error("Erro ao buscar Escalations:", error);
        return [];
    }
}

export async function getEscalationById(id: string): Promise<EscalationConfig | undefined> {
    const client = getClient(escalationTableName);
    try {
        const entity = await client.getEntity("global", id);
        return fromEscalationTableEntity(entity);
    } catch (error: any) {
        if (error.statusCode === 404) {
            return undefined;
        }
        console.error(`Erro ao buscar Escalation com ID ${id}:`, error);
        return undefined;
    }
}

export async function getEscalationByControlId(controlId: string): Promise<EscalationConfig | undefined> {
    const client = getClient(escalationTableName);
    try {
        const entities = client.listEntities<TableEntity<any>>({
            queryOptions: { filter: `controlId eq '${controlId}'` }
        });
        for await (const entity of entities) {
            return fromEscalationTableEntity(entity);
        }
        return undefined;
    } catch (error) {
        console.error(`Erro ao buscar Escalation para controlId ${controlId}:`, error);
        return undefined;
    }
}

export async function addOrUpdateEscalation(escalation: EscalationConfig): Promise<EscalationConfig> {
    const client = getClient(escalationTableName);
    try {
        await client.createTable();
        const now = new Date().toISOString();
        
        let escalationToSave = { ...escalation };
        
        // Mantém os valores de auditoria enviados pelo frontend
        if (!escalationToSave.createdAt) {
            escalationToSave.createdAt = now;
        }
        if (!escalationToSave.createdBy) {
            escalationToSave.createdBy = "Sistema (sistema@sgr.com)";
        }
        if (!escalationToSave.updatedAt) {
            escalationToSave.updatedAt = now;
        }
        if (!escalationToSave.updatedBy) {
            escalationToSave.updatedBy = "Sistema (sistema@sgr.com)";
        }

        const entity = toEscalationTableEntity(escalationToSave);
        await client.upsertEntity(entity, "Merge");
        return fromEscalationTableEntity(entity);
    } catch (error) {
        console.error("Erro ao salvar o Escalation:", error);
        throw new Error("Falha ao salvar o Escalation no Azure Table Storage.");
    }
}

export async function deleteEscalation(id: string): Promise<void> {
    const client = getClient(escalationTableName);
    try {
        await client.deleteEntity("global", id);
        console.log(`Escalation com ID ${id} excluído com sucesso.`);
    } catch (error: any) {
        if (error.statusCode === 404) {
            console.warn(`Tentativa de excluir Escalation não encontrado (ID: ${id}).`);
            return;
        }
        console.error("Erro ao excluir o Escalation:", error);
        throw new Error("Falha ao excluir o Escalation no Azure Table Storage.");
    }
}

// ---- Funções CRUD para Actions (Controle de Ações) ----

const actionsTableName = "actions";

const toActionTableEntity = (action: Action): TableEntity<any> => {
    const { id, ...rest } = action;
    return {
        partitionKey: "global", // Todas as ações na mesma partição
        rowKey: id,
        controlId: action.controlId,
        controlName: action.controlName,
        responsavel: action.responsavel,
        email: action.email,
        prazo: action.prazo,
        descricao: action.descricao,
        contingencia: action.contingencia,
        criticidadeAcao: action.criticidadeAcao,
        valorEstimado: action.valorEstimado,
        status: action.status,
        evidences: JSON.stringify(action.evidences || []),
        createdAt: action.createdAt,
        updatedAt: action.updatedAt,
        createdBy: action.createdBy,
        updatedBy: action.updatedBy,
    };
};

const fromActionTableEntity = (entity: TableEntity<any>): Action => {
    const action: any = {};
    for (const key in entity) {
        if (key !== 'partitionKey' && key !== 'rowKey' && key !== 'etag' && key !== 'timestamp' && !key.endsWith('@odata.type')) {
            action[key] = entity[key];
        }
    }
    action.id = entity.rowKey;

    // Deserializar evidences
    try {
        action.evidences = JSON.parse(entity.evidences || '[]');
    } catch (e) {
        action.evidences = [];
    }

    return action as Action;
};

export async function createActionsTable(): Promise<void> {
    const client = getClient(actionsTableName);
    try {
        await client.createTable();
        console.log(`Tabela "${actionsTableName}" criada ou já existente.`);
    } catch (error) {
        console.error(`Erro ao criar a tabela "${actionsTableName}":`, error);
    }
}

export async function getAllActions(): Promise<Action[]> {
    const client = getClient(actionsTableName);
    try {
        await client.createTable();
        const entities = client.listEntities();
        const actions: Action[] = [];
        for await (const entity of entities) {
            actions.push(fromActionTableEntity(entity));
        }
        return actions;
    } catch (error) {
        console.error("Erro ao buscar Actions:", error);
        return [];
    }
}

export async function getActionById(id: string): Promise<Action | undefined> {
    const client = getClient(actionsTableName);
    try {
        const entity = await client.getEntity("global", id);
        return fromActionTableEntity(entity);
    } catch (error: any) {
        if (error.statusCode === 404) {
            return undefined;
        }
        console.error(`Erro ao buscar Action com ID ${id}:`, error);
        return undefined;
    }
}

export async function getActionsByControlId(controlId: string): Promise<Action[]> {
    const client = getClient(actionsTableName);
    try {
        await client.createTable();
        const filter = `controlId eq '${controlId}'`;
        const entities = client.listEntities<TableEntity<any>>({
            queryOptions: { filter }
        });
        const actions: Action[] = [];
        for await (const entity of entities) {
            actions.push(fromActionTableEntity(entity));
        }
        return actions;
    } catch (error) {
        console.error(`Erro ao buscar Actions para o controle ${controlId}:`, error);
        return [];
    }
}

export async function addOrUpdateAction(action: Action): Promise<Action> {
    const client = getClient(actionsTableName);
    try {
        await client.createTable();
        const now = new Date().toISOString();

        let actionToSave = { ...action };

        // Se for novo registro (sem id), gerar id sequencial no formato CTRL-n-A-x
        if (!actionToSave.id || actionToSave.id.trim() === '') {
            // Busca ações existentes para o controle
            const existingActions = await getActionsByControlId(actionToSave.controlId);
            let maxNum = 0;
            for (const existing of existingActions) {
                const match = existing.id?.match(/^CTRL-\d+-A-(\d+)$/);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (!isNaN(num) && num > maxNum) maxNum = num;
                }
            }
            const nextNum = maxNum + 1;
            const controlId = actionToSave.controlId;
            actionToSave.id = `${controlId}-A-${nextNum}`;
        }

        // Mantém os valores de auditoria enviados pelo frontend
        if (!actionToSave.createdAt) {
            actionToSave.createdAt = now;
        }
        if (!actionToSave.createdBy) {
            actionToSave.createdBy = "Sistema (sistema@sgr.com)";
        }
        if (!actionToSave.updatedAt) {
            actionToSave.updatedAt = now;
        }
        if (!actionToSave.updatedBy) {
            actionToSave.updatedBy = "Sistema (sistema@sgr.com)";
        }

        const entity = toActionTableEntity(actionToSave);
        await client.upsertEntity(entity, "Merge");
        return fromActionTableEntity(entity);
    } catch (error) {
        console.error("Erro ao salvar a Action:", error);
        throw new Error("Falha ao salvar a Action no Azure Table Storage.");
    }
}

export async function deleteAction(id: string): Promise<void> {
    const client = getClient(actionsTableName);
    try {
        await client.deleteEntity("global", id);
        console.log(`Action com ID ${id} excluída com sucesso.`);
    } catch (error: any) {
        if (error.statusCode === 404) {
            console.warn(`Tentativa de excluir Action não encontrada (ID: ${id}).`);
            return;
        }
        console.error("Erro ao excluir a Action:", error);
        throw new Error("Falha ao excluir a Action no Azure Table Storage.");
    }
}

// ---- Funções CRUD para Access Profiles ----

const accessProfilesTableName = "accessprofiles";

const toAccessProfileTableEntity = (profile: AccessProfile): TableEntity<any> => {
    const { id, ...rest } = profile;
    return {
        partitionKey: "global",
        rowKey: id,
        ...rest,
        permissions: JSON.stringify(rest.permissions), // Serializar array
    };
};

const fromAccessProfileTableEntity = (entity: TableEntity<any>): AccessProfile => {
    const profile: any = {};
    for (const key in entity) {
        if (key !== 'partitionKey' && key !== 'rowKey' && key !== 'etag' && key !== 'timestamp' && !key.endsWith('@odata.type')) {
            profile[key] = entity[key];
        }
    }
    profile.id = entity.rowKey;
    
    // Deserializar permissions
    if (profile.permissions && typeof profile.permissions === 'string') {
        try {
            profile.permissions = JSON.parse(profile.permissions);
        } catch (e) {
            profile.permissions = [];
        }
    }
    
    return profile as AccessProfile;
};

export async function getAllAccessProfiles(): Promise<AccessProfile[]> {
    const client = getClient(accessProfilesTableName);
    try {
        await client.createTable();
        const entities = client.listEntities<TableEntity<any>>();
        const profiles: AccessProfile[] = [];
        for await (const entity of entities) {
            profiles.push(fromAccessProfileTableEntity(entity));
        }
        return profiles;
    } catch (error) {
        console.error("Erro ao buscar perfis de acesso:", error);
        return [];
    }
}

export async function getAccessProfileById(id: string): Promise<AccessProfile | undefined> {
    const client = getClient(accessProfilesTableName);
    try {
        const entity = await client.getEntity<TableEntity<any>>("global", id);
        return fromAccessProfileTableEntity(entity);
    } catch (error: any) {
        if (error.statusCode === 404) {
            return undefined;
        }
        console.error(`Erro ao buscar perfil de acesso com ID ${id}:`, error);
        return undefined;
    }
}

export async function addOrUpdateAccessProfile(profile: AccessProfile): Promise<AccessProfile> {
    const client = getClient(accessProfilesTableName);
    try {
        await client.createTable();
        const now = new Date().toISOString();
        
        let profileToSave = { ...profile };
        
        // Mantém os valores de auditoria enviados pelo frontend
        if (!profileToSave.createdAt) {
            profileToSave.createdAt = now;
        }
        if (!profileToSave.createdBy) {
            profileToSave.createdBy = "Sistema (sistema@sgr.com)";
        }
        if (!profileToSave.updatedAt) {
            profileToSave.updatedAt = now;
        }
        if (!profileToSave.updatedBy) {
            profileToSave.updatedBy = "Sistema (sistema@sgr.com)";
        }

        const entity = toAccessProfileTableEntity(profileToSave);
        await client.upsertEntity(entity, "Merge");
        return fromAccessProfileTableEntity(entity);
    } catch (error) {
        console.error("Erro ao salvar o perfil de acesso:", error);
        throw new Error("Falha ao salvar o perfil de acesso no Azure Table Storage.");
    }
}

export async function deleteAccessProfile(id: string): Promise<void> {
    const client = getClient(accessProfilesTableName);
    try {
        await client.deleteEntity("global", id);
        console.log(`Perfil de acesso com ID ${id} excluído com sucesso.`);
    } catch (error: any) {
        if (error.statusCode === 404) {
            console.warn(`Tentativa de excluir perfil de acesso não encontrado (ID: ${id}).`);
            return;
        }
        console.error("Erro ao excluir o perfil de acesso:", error);
        throw new Error("Falha ao excluir o perfil de acesso no Azure Table Storage.");
    }
}

// ---- Funções CRUD para User Access Control ----

const userAccessControlTableName = "useraccesscontrol";

const toUserAccessControlTableEntity = (control: UserAccessControl): TableEntity<any> => {
    const { id, ...rest } = control;
    return {
        partitionKey: "global",
        rowKey: id,
        ...rest,
    };
};

const fromUserAccessControlTableEntity = (entity: TableEntity<any>): UserAccessControl => {
    const control: any = {};
    for (const key in entity) {
        if (key !== 'partitionKey' && key !== 'rowKey' && key !== 'etag' && key !== 'timestamp' && !key.endsWith('@odata.type')) {
            control[key] = entity[key];
        }
    }
    control.id = entity.rowKey;
    return control as UserAccessControl;
};

export async function getAllUserAccessControls(): Promise<UserAccessControl[]> {
    const client = getClient(userAccessControlTableName);
    try {
        await client.createTable();
        const entities = client.listEntities<TableEntity<any>>();
        const controls: UserAccessControl[] = [];
        for await (const entity of entities) {
            controls.push(fromUserAccessControlTableEntity(entity));
        }
        return controls;
    } catch (error) {
        console.error("Erro ao buscar controles de acesso de usuários:", error);
        return [];
    }
}

export async function getUserAccessControlById(id: string): Promise<UserAccessControl | undefined> {
    const client = getClient(userAccessControlTableName);
    try {
        const entity = await client.getEntity<TableEntity<any>>("global", id);
        return fromUserAccessControlTableEntity(entity);
    } catch (error: any) {
        if (error.statusCode === 404) {
            return undefined;
        }
        console.error(`Erro ao buscar controle de acesso com ID ${id}:`, error);
        return undefined;
    }
}

export async function getUserAccessControlByUserId(userId: string): Promise<UserAccessControl | undefined> {
    const client = getClient(userAccessControlTableName);
    try {
        await client.createTable();
        const filter = `userId eq '${userId}'`;
        const entities = client.listEntities<TableEntity<any>>({
            queryOptions: { filter }
        });
        
        for await (const entity of entities) {
            return fromUserAccessControlTableEntity(entity);
        }
        return undefined;
    } catch (error) {
        console.error(`Erro ao buscar controle de acesso para usuário ${userId}:`, error);
        return undefined;
    }
}

export async function addOrUpdateUserAccessControl(control: UserAccessControl): Promise<UserAccessControl> {
    const client = getClient(userAccessControlTableName);
    try {
        await client.createTable();
        const now = new Date().toISOString();
        
        let controlToSave = { ...control };
        
        // Mantém os valores de auditoria enviados pelo frontend
        if (!controlToSave.createdAt) {
            controlToSave.createdAt = now;
        }
        if (!controlToSave.createdBy) {
            controlToSave.createdBy = "Sistema (sistema@sgr.com)";
        }
        if (!controlToSave.updatedAt) {
            controlToSave.updatedAt = now;
        }
        if (!controlToSave.updatedBy) {
            controlToSave.updatedBy = "Sistema (sistema@sgr.com)";
        }

        const entity = toUserAccessControlTableEntity(controlToSave);
        await client.upsertEntity(entity, "Merge");
        return fromUserAccessControlTableEntity(entity);
    } catch (error) {
        console.error("Erro ao salvar o controle de acesso de usuário:", error);
        throw new Error("Falha ao salvar o controle de acesso no Azure Table Storage.");
    }
}

export async function deleteUserAccessControl(id: string): Promise<void> {
    const client = getClient(userAccessControlTableName);
    try {
        await client.deleteEntity("global", id);
        console.log(`Controle de acesso com ID ${id} excluído com sucesso.`);
    } catch (error: any) {
        if (error.statusCode === 404) {
            console.warn(`Tentativa de excluir controle de acesso não encontrado (ID: ${id}).`);
            return;
        }
        console.error("Erro ao excluir o controle de acesso:", error);
        throw new Error("Falha ao excluir o controle de acesso no Azure Table Storage.");
    }
}
