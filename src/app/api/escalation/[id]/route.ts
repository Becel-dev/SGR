import { NextResponse } from 'next/server';
import {
  getEscalationById,
  addOrUpdateEscalation,
  deleteEscalation,
} from '../../../../lib/azure-table-storage';
import { EscalationConfig } from '../../../../lib/types';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const escalation = await getEscalationById(params.id);
    if (!escalation) {
      return NextResponse.json({ error: 'Escalation not found' }, { status: 404 });
    }
    return NextResponse.json(escalation);
  } catch (error) {
    console.error(`Error getting escalation ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to get escalation' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const escalation: EscalationConfig = await request.json();
    if (escalation.id !== params.id) {
      return NextResponse.json(
        { error: "ID in body does not match ID in URL" },
        { status: 400 }
      );
    }
    const result = await addOrUpdateEscalation(escalation);
    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error updating escalation ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update escalation' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteEscalation(params.id);
    return NextResponse.json({ message: 'Escalation deleted successfully' });
  } catch (error) {
    console.error(`Error deleting escalation ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete escalation' },
      { status: 500 }
    );
  }
}
