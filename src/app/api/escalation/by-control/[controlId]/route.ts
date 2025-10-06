import { NextResponse } from 'next/server';
import { getEscalationByControlId } from '../../../../../lib/azure-table-storage';

export async function GET(
  request: Request,
  { params }: { params: { controlId: string } }
) {
  try {
    const escalation = await getEscalationByControlId(params.controlId);
    if (!escalation) {
      return NextResponse.json({ error: 'Escalation not found for this control' }, { status: 404 });
    }
    return NextResponse.json(escalation);
  } catch (error) {
    console.error(`Error getting escalation for control ${params.controlId}:`, error);
    return NextResponse.json(
      { error: 'Failed to get escalation' },
      { status: 500 }
    );
  }
}
