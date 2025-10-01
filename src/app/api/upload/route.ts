import { NextResponse } from 'next/server';
import { uploadFileToBlob } from '@/lib/azure-blob-storage';

const ONEPAGER_CONTAINER = 'onepagers';
const EVIDENCIAS_CONTAINER = 'evidencias';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const onePagerFile = formData.get('onePager') as File | null;
        const evidenciaFile = formData.get('evidencia') as File | null;

        if (!onePagerFile && !evidenciaFile) {
            return new NextResponse(JSON.stringify({ message: 'No files to upload.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        let onePagerUrl: string | undefined;
        let evidenciaUrl: string | undefined;

        if (onePagerFile) {
            onePagerUrl = await uploadFileToBlob(ONEPAGER_CONTAINER, onePagerFile);
        }

        if (evidenciaFile) {
            evidenciaUrl = await uploadFileToBlob(EVIDENCIAS_CONTAINER, evidenciaFile);
        }

        return NextResponse.json({ onePagerUrl, evidenciaUrl });

    } catch (error) {
        console.error('Error uploading files:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(JSON.stringify({ message: 'Failed to upload files', error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
