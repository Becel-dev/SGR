// Este arquivo usa a flag 'use server' para indicar que pode ser executado no servidor.
// No entanto, as funções aqui podem ser chamadas tanto do cliente quanto do servidor.
'use server';

import { TableClient, TableEntity, AzureNamedKeyCredential } from "@azure/data-tables";
import { identifiedRisksData as mockData } from './identified-risks-data';
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
        id: rowKey, // Garante que o id está na entidade
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


const getClient = (): TableClient | null => {
    if (!connectionString) {
        console.warn("String de conexão do Azure não configurada. Usando dados mockados.");
        return null;
    }
    try {
        // A criação do TableClient é síncrona
        return TableClient.fromConnectionString(connectionString, tableName);
    } catch (error) {
        console.error("Erro ao criar o cliente da tabela do Azure:", error);
        return null;
    }
}

// ---- Funções CRUD ----

export async function getIdentifiedRisks(): Promise<IdentifiedRisk[]> {
    const client = getClient();
    if (!client) {
        return Promise.resolve(mockData); // Retorna dados mockados se o cliente não for criado
    }
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
    if (!client) {
        return Promise.resolve(mockData.find(r => r.id === id));
    }
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
    if (!client) {
        console.log("Modo mock: Risco 'salvo' no console", riskData);
        // Simula a adição/atualização nos dados mockados (não persistirá)
        const index = mockData.findIndex(r => r.id === riskData.id);
        if (index > -1) {
            mockData[index] = riskData;
        } else {
            mockData.push(riskData);
        }
        return Promise.resolve(riskData);
    }
    try {
        await client.createTable();
        const entity = toTableEntity(riskData);
        await client.upsertEntity(entity, "Merge");
        return fromTableEntity(entity);
    } catch (error) {
        console.error("Erro ao salvar o risco:", error);
        throw new Error("Falha ao salvar o risco no Azure Table Storage.");
    }
}

export async function deleteIdentifiedRisk(id: string, partitionKey: string): Promise<void> {
    const client = getClient();
    if (!client) {
        console.log(`Modo mock: Risco com ID ${id} 'excluído'`);
        const index = mockData.findIndex(r => r.id === id);
        if (index > -1) {
            mockData.splice(index, 1);
        }
        return Promise.resolve();
    }
    try {
        await client.deleteEntity(partitionKey, id);
        console.log(`Risco com ID ${id} e PartitionKey ${partitionKey} excluído com sucesso.`);
    } catch (error) {
        console.error("Erro ao excluir o risco:", error);
        throw new Error("Falha ao excluir o risco no Azure Table Storage.");
    }
}
