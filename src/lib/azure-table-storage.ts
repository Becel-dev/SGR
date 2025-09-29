// Este arquivo usa a flag 'use server' para indicar que pode ser executado no servidor.
// No entanto, as funções aqui podem ser chamadas tanto do cliente quanto do servidor.
'use server';

import { TableClient, TableEntity, AzureNamedKeyCredential } from "@azure/data-tables";
// Removido mockData: integração 100% Azure
import type { IdentifiedRisk } from './types';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const tableName = "identifiedrisks";

// Helper para converter o tipo da aplicação para o tipo da entidade da tabela
const toTableEntity = (risk: Omit<IdentifiedRisk, 'id'> & { id?: string }): TableEntity<Omit<IdentifiedRisk, 'id' | 'businessObjectives'> & { businessObjectives: string }> => {
    const partitionKey = risk.topRisk.replace(/[^a-zA-Z0-9]/g, '') || "Default";
    const rowKey = risk.id || `${Date.now()}${Math.random().toString(36).substring(2, 9)}`;

    return {
        partitionKey,
        rowKey,
        ...risk,
        businessObjectives: JSON.stringify(risk.businessObjectives), // Arrays precisam ser serializados
    };
};

// Helper para converter o tipo da entidade da tabela de volta para o tipo da aplicação
const fromTableEntity = (entity: TableEntity<any>): IdentifiedRisk => {
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


const getClient = (): TableClient => {
    if (!connectionString) {
        throw new Error("String de conexão do Azure não configurada. Configure a variável de ambiente AZURE_STORAGE_CONNECTION_STRING.");
    }
    return TableClient.fromConnectionString(connectionString, tableName);
}

// ---- Funções CRUD ----

export async function getIdentifiedRisks(): Promise<IdentifiedRisk[]> {
    const client = getClient();
    try {
        await client.createTable(); // Cria a tabela se ela não existir
        const entities = client.listEntities();
        const risks: IdentifiedRisk[] = [];
        for await (const entity of entities) {
            risks.push(fromTableEntity(entity));
        }
        return risks;
    } catch (error) {
        console.error("Erro ao buscar riscos:", error);
        return []; // Retorna um array vazio em caso de erro
    }
}

export async function getIdentifiedRiskById(id: string): Promise<IdentifiedRisk | undefined> {
    const client = getClient();
    try {
        // Para buscar por ID (rowKey), precisamos de um partitionKey. 
        // Como não temos essa informação aqui, teremos que listar e filtrar.
        // Isso é ineficiente e deve ser otimizado se o partitionKey for conhecido.
        const risks = await getIdentifiedRisks();
        return risks.find(risk => risk.id === id);
    } catch (error) {
        console.error(`Erro ao buscar risco com ID ${id}:`, error);
        return undefined;
    }
}

export async function addOrUpdateIdentifiedRisk(riskData: IdentifiedRisk): Promise<IdentifiedRisk> {
    const client = getClient();
    try {
        await client.createTable();
        // Preencher campos de auditoria
        const now = new Date().toISOString();
        let risk = { ...riskData };
        if (!risk.createdAt) {
            risk.createdAt = now;
        }
        if (!risk.createdBy) {
            risk.createdBy = "Sistema";
        }
        // Sempre atualiza os campos de modificação
        risk.updatedAt = now;
        risk.updatedBy = "Sistema";
        const entity = toTableEntity(risk);
        await client.upsertEntity(entity, "Merge");
        return fromTableEntity(entity);
    } catch (error) {
        console.error("Erro ao salvar o risco:", error);
        throw new Error("Falha ao salvar o risco no Azure Table Storage.");
    }
}

export async function deleteIdentifiedRisk(id: string, partitionKey: string): Promise<void> {
    const client = getClient();
    try {
        await client.deleteEntity(partitionKey, id);
        console.log(`Risco com ID ${id} e PartitionKey ${partitionKey} excluído com sucesso.`);
    } catch (error) {
        console.error("Erro ao excluir o risco:", error);
        throw new Error("Falha ao excluir o risco no Azure Table Storage.");
    }
}
