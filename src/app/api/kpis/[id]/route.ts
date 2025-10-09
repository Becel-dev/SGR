import { NextRequest, NextResponse } from 'next/server';
import { getKpiById, updateKpi, deleteKpi } from '@/lib/azure-table-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const kpi = await getKpiById(params.id);
    if (!kpi) {
      return NextResponse.json(
        { error: 'KPI não encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json(kpi);
  } catch (error) {
    console.error('Erro ao buscar KPI:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar KPI' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updatedKpi = await updateKpi(params.id, body);
    return NextResponse.json(updatedKpi);
  } catch (error) {
    console.error('Erro ao atualizar KPI:', error);
    return NextResponse.json(
      { error: 'Falha ao atualizar KPI' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteKpi(params.id);
    return NextResponse.json({ message: 'KPI deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar KPI:', error);
    return NextResponse.json(
      { error: 'Falha ao deletar KPI' },
      { status: 500 }
    );
  }
}
