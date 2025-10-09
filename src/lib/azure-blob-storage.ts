'use server';

import { BlobServiceClient, BlobSASPermissions, generateBlobSASQueryParameters, StorageSharedKeyCredential } from '@azure/storage-blob';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connectionString) {
    throw new Error("Azure Storage connection string not found in environment variables.");
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

// Extrair credenciais da connection string para gerar SAS tokens
const getStorageCredentials = () => {
    const accountName = connectionString.match(/AccountName=([^;]+)/)?.[1];
    const accountKey = connectionString.match(/AccountKey=([^;]+)/)?.[1];
    
    if (!accountName || !accountKey) {
        throw new Error("Could not extract account credentials from connection string");
    }
    
    return { accountName, accountKey };
};

const getContainerClient = (containerName: string) => {
    return blobServiceClient.getContainerClient(containerName);
};

export const uploadFileToBlob = async (containerName: string, file: File): Promise<string> => {
    const containerClient = getContainerClient(containerName);
    // Criar container privado (sem acesso público)
    await containerClient.createIfNotExists();

    const blobName = `${new Date().getTime()}-${file.name}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: file.type }
    });

    return blockBlobClient.url;
};

export const uploadKpiEvidence = async (kpiId: string, file: File): Promise<{ fileName: string; fileUrl: string }> => {
    const containerName = 'kpi-evidences';
    const containerClient = getContainerClient(containerName);
    // Criar container privado (sem acesso público)
    await containerClient.createIfNotExists();

    const timestamp = new Date().getTime();
    const blobName = `${kpiId}/${timestamp}-${file.name}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: file.type }
    });

    // Gerar URL com SAS token para acesso seguro
    const sasUrl = await generateSasUrl(containerName, blobName);

    return {
        fileName: file.name,
        fileUrl: sasUrl,
    };
};

// Gerar URL com SAS token para acesso seguro a blobs privados
const generateSasUrl = async (containerName: string, blobName: string): Promise<string> => {
    try {
        const { accountName, accountKey } = getStorageCredentials();
        const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
        
        const containerClient = getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        
        // SAS token válido por 10 anos (para evidências arquivadas)
        const expiresOn = new Date();
        expiresOn.setFullYear(expiresOn.getFullYear() + 10);
        
        const sasToken = generateBlobSASQueryParameters(
            {
                containerName,
                blobName,
                permissions: BlobSASPermissions.parse("r"), // Read only
                expiresOn,
            },
            sharedKeyCredential
        ).toString();
        
        return `${blockBlobClient.url}?${sasToken}`;
    } catch (error) {
        console.error('Erro ao gerar SAS URL:', error);
        throw new Error('Falha ao gerar URL de acesso ao arquivo');
    }
};

export const getBlobSasUrl = async (blobUrl: string): Promise<string> => {
    // Extrair container e blob name da URL
    const url = new URL(blobUrl);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    if (pathParts.length < 2) {
        throw new Error('URL inválida');
    }
    
    const containerName = pathParts[0];
    const blobName = pathParts.slice(1).join('/');
    
    return generateSasUrl(containerName, blobName);
};
