import { NextRequest, NextResponse } from 'next/server';
import { addOrUpdateTopRisk } from '@/lib/azure-table-storage';
import { TopRisk } from '@/lib/types';

export async function PUT(request: NextRequest) {
  try {
    const topRisks: TopRisk[] = await request.json();
    
    if (!Array.isArray(topRisks)) {
      return NextResponse.json(
        { error: 'Dados inválidos: esperado array de Top Risks' },
        { status: 400 }
      );
    }

    // Atualiza cada Top Risk com a nova ordem
    const updatePromises = topRisks.map(topRisk => 
      addOrUpdateTopRisk({
        ...topRisk,
        updatedBy: 'Sistema', // TODO: Substituir pelo usuário logado
        updatedAt: new Date().toISOString(),
      })
    );

    await Promise.all(updatePromises);
    
    return NextResponse.json(
      { message: 'Ordem dos Top Risks atualizada com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar ordem dos Top Risks:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao atualizar ordem' },
      { status: 500 }
    );
  }
}