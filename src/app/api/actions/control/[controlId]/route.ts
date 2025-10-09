import { NextRequest, NextResponse } from 'next/server';
import { getActionsByControlId } from '@/lib/azure-table-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { controlId: string } }
) {
  try {
    const actions = await getActionsByControlId(params.controlId);
    return NextResponse.json(actions);
  } catch (error) {
    console.error('Erro ao buscar Actions por controlId:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar Actions' },
      { status: 500 }
    );
  }
}
