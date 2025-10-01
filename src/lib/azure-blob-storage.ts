'use server';

import { BlobServiceClient } from '@azure/storage-blob';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connectionString) {
    throw new Error("Azure Storage connection string not found in environment variables.");
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

const getContainerClient = (containerName: string) => {
    return blobServiceClient.getContainerClient(containerName);
};

export const uploadFileToBlob = async (containerName: string, file: File): Promise<string> => {
    const containerClient = getContainerClient(containerName);
    await containerClient.createIfNotExists({ access: 'blob' });

    const blobName = `${new Date().getTime()}-${file.name}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: file.type }
    });

    return blockBlobClient.url;
};
