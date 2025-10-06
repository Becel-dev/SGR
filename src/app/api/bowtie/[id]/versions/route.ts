import { NextResponse } from 'next/server';
import { getBowtieVersions } from '../../../../../lib/azure-table-storage';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // O id aqui é o riskId
    const versions = await getBowtieVersions(params.id);
    
    if (!versions || versions.length === 0) {
      return NextResponse.json({ error: 'No versions found' }, { status: 404 });
    }
    
    return NextResponse.json(versions);
  } catch (error) {
    console.error(`Error getting bowtie versions for riskId ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to get bowtie versions' },
      { status: 500 }
    );
  }
}
