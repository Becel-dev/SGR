import { NextResponse } from 'next/server';
import { getControlById, getRisksByIds, getKpisByControlId } from '@/lib/azure-table-storage';
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
