import { NextRequest, NextResponse } from 'next/server';
import { getKpiById, updateKpi } from '@/lib/azure-table-storage';
import { uploadKpiEvidence } from '@/lib/azure-blob-storage';
import type { EvidenceFile } from '@/lib/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[Evidence API] Iniciando upload para KPI:', params.id);
    
    const kpi = await getKpiById(params.id);
    if (!kpi) {
      console.error('[Evidence API] KPI não encontrado:', params.id);
      return NextResponse.json(
        { error: 'KPI não encontrado' },
        { status: 404 }
      );
    }

    console.log('[Evidence API] KPI encontrado:', kpi.id);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadedBy = formData.get('uploadedBy') as string || 'Sistema';

    console.log('[Evidence API] Arquivo recebido:', file?.name, 'Tamanho:', file?.size);

    if (!file) {
      console.error('[Evidence API] Arquivo não fornecido');
      return NextResponse.json(
        { error: 'Arquivo não fornecido' },
        { status: 400 }
      );
    }

    // Upload do arquivo para blob storage
    console.log('[Evidence API] Iniciando upload para blob storage...');
    const { fileName, fileUrl } = await uploadKpiEvidence(params.id, file);
    console.log('[Evidence API] Upload concluído. URL:', fileUrl);

    // Criar registro de evidência
    const newEvidence: EvidenceFile = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      fileName,
      fileUrl,
      uploadedAt: new Date().toISOString(),
      uploadedBy,
    };

    console.log('[Evidence API] Evidência criada:', newEvidence.id);

    // Adicionar evidência ao histórico
    const updatedEvidenceFiles = [...kpi.evidenceFiles, newEvidence];

    // Calcular próxima verificação (adiciona frequenciaDias dias à data atual)
    const nextVerificationDate = new Date();
    nextVerificationDate.setDate(nextVerificationDate.getDate() + kpi.frequenciaDias);
    const dataProximaVerificacao = nextVerificationDate.toISOString().split('T')[0];

    console.log('[Evidence API] Próxima verificação calculada:', dataProximaVerificacao);

    // Atualizar KPI com nova evidência e próxima verificação
    const updatedKpi = await updateKpi(params.id, {
      evidenceFiles: updatedEvidenceFiles,
      dataProximaVerificacao,
      status: 'OK', // Evidência anexada = status OK
    });

    console.log('[Evidence API] KPI atualizado com sucesso');

    return NextResponse.json({
      message: 'Evidência anexada com sucesso',
      kpi: updatedKpi,
      evidence: newEvidence,
    });
  } catch (error) {
    console.error('[Evidence API] Erro ao anexar evidência:', error);
    return NextResponse.json(
      { error: 'Falha ao anexar evidência', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}
