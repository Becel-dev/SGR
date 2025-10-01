import { NextResponse } from 'next/server';
import { getAllControls, createControlsTable } from '@/lib/azure-table-storage';

export async function GET() {
  try {
    await createControlsTable(); // Ensure table exists
    const controls = await getAllControls();
    return NextResponse.json(controls);
  } catch (error) {
    console.error('Error fetching controls:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(JSON.stringify({ message: 'Failed to fetch controls', error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
