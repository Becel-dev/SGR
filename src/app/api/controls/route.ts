import { NextResponse } from 'next/server';
import { getAllControls, createControlsTable, addOrUpdateControl } from '@/lib/azure-table-storage';

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Permite que o backend gere o ID sequencial se não for informado
    const result = await addOrUpdateControl(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating control:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(JSON.stringify({ message: 'Failed to create control', error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
