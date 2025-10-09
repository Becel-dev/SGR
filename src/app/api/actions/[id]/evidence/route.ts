import { NextRequest, NextResponse } from 'next/server';
import { getActionById, addOrUpdateAction, getControlById, addOrUpdateControl } from '@/lib/azure-table-storage';
import { uploadActionEvidence } from '@/lib/azure-blob-storage';
import type { ActionEvidence } from '@/lib/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[Action Evidence API] Iniciando upload para Action:', params.id);
    
    const action = await getActionById(params.id);
    if (!action) {
      console.error('[Action Evidence API] Action não encontrada:', params.id);
      return NextResponse.json(
        { error: 'Action não encontrada' },
        { status: 404 }
      );
    }

    console.log('[Action Evidence API] Action encontrada:', action.id);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadedBy = formData.get('uploadedBy') as string || 'Sistema';

    console.log('[Action Evidence API] Arquivo recebido:', file?.name, 'Tamanho:', file?.size);

    if (!file) {
      console.error('[Action Evidence API] Arquivo não fornecido');
      return NextResponse.json(
        { error: 'Arquivo não fornecido' },
        { status: 400 }
      );
    }

    // Upload do arquivo para blob storage
    console.log('[Action Evidence API] Iniciando upload para blob storage...');
    const { fileName, fileUrl } = await uploadActionEvidence(params.id, file);
    console.log('[Action Evidence API] Upload concluído. URL:', fileUrl);

    // Criar registro de evidência
    const newEvidence: ActionEvidence = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      fileName,
      fileUrl,
      uploadedAt: new Date().toISOString(),
      uploadedBy,
    };

    console.log('[Action Evidence API] Evidência criada:', newEvidence.id);

    // Adicionar evidência ao histórico e marcar como Concluída
    const updatedEvidences = [...action.evidences, newEvidence];
    const updatedAction = await addOrUpdateAction({
      ...action,
      evidences: updatedEvidences,
      status: 'Concluída',
    });

    console.log('[Action Evidence API] Action atualizada com sucesso');

    // Atualizar o status do controle para "Implementado"
    const control = await getControlById(action.controlId);
    if (control) {
      console.log('[Action Evidence API] Atualizando status do controle:', control.id);
      await addOrUpdateControl({
        ...control,
        status: 'Implementado',
      });
      console.log('[Action Evidence API] Controle atualizado para Implementado');
    }

    return NextResponse.json({
      message: 'Evidência anexada com sucesso e controle atualizado',
      action: updatedAction,
      evidence: newEvidence,
    });
  } catch (error) {
    console.error('[Action Evidence API] Erro ao anexar evidência:', error);
    return NextResponse.json(
      { error: 'Falha ao anexar evidência', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}
