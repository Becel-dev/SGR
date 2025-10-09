import { NextRequest, NextResponse } from 'next/server';
import { getAllActions, addOrUpdateAction } from '@/lib/azure-table-storage';
import type { Action } from '@/lib/types';

export async function GET() {
  try {
    const actions = await getAllActions();
    return NextResponse.json(actions);
  } catch (error) {
    console.error('Erro ao buscar Actions:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar Actions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validações básicas
    if (!body.controlId || !body.responsavel || !body.email || !body.prazo || !body.descricao) {
      return NextResponse.json(
        { error: 'Campos obrigatórios ausentes' },
        { status: 400 }
      );
    }

    // Criar nova ação
    const newAction: Action = {
      id: `action_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      controlId: body.controlId,
      controlName: body.controlName || '',
      responsavel: body.responsavel,
      email: body.email,
      prazo: body.prazo,
      descricao: body.descricao,
      contingencia: body.contingencia || '',
      criticidadeAcao: body.criticidadeAcao || 0,
      valorEstimado: body.valorEstimado || 0,
      status: 'Pendente',
      evidences: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: body.createdBy || 'Sistema',
      updatedBy: body.updatedBy || 'Sistema',
    };

    const savedAction = await addOrUpdateAction(newAction);
    return NextResponse.json(savedAction, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar Action:', error);
    return NextResponse.json(
      { error: 'Falha ao criar Action' },
      { status: 500 }
    );
  }
}
