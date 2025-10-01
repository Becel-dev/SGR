import { NextResponse } from 'next/server';
import { getRisksForAssociation } from '@/lib/azure-table-storage';

export async function GET() {
  try {
    const risks = await getRisksForAssociation();
    return NextResponse.json(risks);
  } catch (error) {
    console.error('Error fetching risks for association:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(JSON.stringify({ message: 'Failed to fetch risks for association', error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
