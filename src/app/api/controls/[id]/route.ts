import { NextResponse } from 'next/server';
import { getControlById, getRisksByIds, getKpisByControlId, addOrUpdateControl, deleteControl } from '@/lib/azure-table-storage';
import { RiskAnalysis } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return new NextResponse(JSON.stringify({ message: 'Control ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const control = await getControlById(id);

    if (!control) {
      return new NextResponse(JSON.stringify({ message: 'Control not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let associatedRisks: RiskAnalysis[] = [];
    if (control.associatedRisks && control.associatedRisks.length > 0) {
      const riskIds = control.associatedRisks.map((r: any) => r.riskId);
      associatedRisks = await getRisksByIds(riskIds);
    }
    
    const relatedKpis = await getKpisByControlId(id);

    return NextResponse.json({ control, associatedRisks, relatedKpis });
  } catch (error) {
    console.error(`Error fetching control ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(JSON.stringify({ message: `Failed to fetch control ${id}`, error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return new NextResponse(JSON.stringify({ message: 'Control ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    
    // Busca o controle existente
    const existingControl = await getControlById(id);
    if (!existingControl) {
      return new NextResponse(JSON.stringify({ message: 'Control not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Atualiza o controle mantendo dados de criação
    const updatedControl = {
      ...existingControl,
      ...body,
      id, // Garante que o ID não seja alterado
    };

    const result = await addOrUpdateControl(updatedControl);
    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error updating control ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(JSON.stringify({ message: `Failed to update control ${id}`, error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return new NextResponse(JSON.stringify({ message: 'Control ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Busca o controle para verificar se existe e obter a partition key
    const existingControl = await getControlById(id);
    if (!existingControl) {
      return new NextResponse(JSON.stringify({ message: 'Control not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Use uma partition key baseada na área ou uma padrão
    const partitionKey = existingControl.area ? existingControl.area.replace(/[^a-zA-Z0-9]/g, '') : 'Default';
    
    await deleteControl(id, partitionKey);
    return new NextResponse(JSON.stringify({ message: 'Control deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(`Error deleting control ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(JSON.stringify({ message: `Failed to delete control ${id}`, error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
