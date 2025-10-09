import { NextRequest, NextResponse } from 'next/server';
import { getActionById, addOrUpdateAction, deleteAction } from '@/lib/azure-table-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const action = await getActionById(params.id);
    if (!action) {
      return NextResponse.json(
        { error: 'Action não encontrada' },
        { status: 404 }
      );
    }
    return NextResponse.json(action);
  } catch (error) {
    console.error('Erro ao buscar Action:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar Action' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await getActionById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Action não encontrada' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updatedAction = {
      ...existing,
      ...body,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };

    const saved = await addOrUpdateAction(updatedAction);
    return NextResponse.json(saved);
  } catch (error) {
    console.error('Erro ao atualizar Action:', error);
    return NextResponse.json(
      { error: 'Falha ao atualizar Action' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteAction(params.id);
    return NextResponse.json({ message: 'Action deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar Action:', error);
    return NextResponse.json(
      { error: 'Falha ao deletar Action' },
      { status: 500 }
    );
  }
}
