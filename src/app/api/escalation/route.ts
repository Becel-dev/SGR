import { NextResponse } from 'next/server';
import {
  getAllEscalations,
  addOrUpdateEscalation,
} from '../../../lib/azure-table-storage';
import { EscalationConfig } from '../../../lib/types';

export async function GET() {
  try {
    const escalations = await getAllEscalations();
    return NextResponse.json(escalations);
  } catch (error) {
    console.error('Error getting escalations:', error);
    return NextResponse.json(
      { error: 'Failed to get escalations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const escalation: EscalationConfig = await request.json();
    const result = await addOrUpdateEscalation(escalation);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating escalation:', error);
    return NextResponse.json(
      { error: 'Failed to create escalation' },
      { status: 500 }
    );
  }
}
