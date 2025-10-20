import { NextResponse } from 'next/server';
import {
  getBowtieById,
  addOrUpdateBowtie,
  deleteBowtieAllVersions,
  deleteBowtieAllForRisk,
  getBowtieVersions,
} from '../../../../lib/azure-table-storage';
import { BowtieData } from '../../../../lib/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bowtie = await getBowtieById(id);
    if (!bowtie) {
      return NextResponse.json({ error: 'Bowtie not found' }, { status: 404 });
    }
    return NextResponse.json(bowtie);
  } catch (error) {
    const { id } = await params;
    console.error(`Error getting bowtie ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to get bowtie' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bowtieData: BowtieData = await request.json();
    if (bowtieData.id !== id) {
      return NextResponse.json(
        { error: "ID in body does not match ID in URL" },
        { status: 400 }
      );
    }
    const result = await addOrUpdateBowtie(bowtieData);
    return NextResponse.json(result);
  } catch (error) {
    const { id } = await params;
    console.error(`Error updating bowtie ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update bowtie' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15: params precisa ser await
    const { id } = await params;
    console.log('DELETE Bowtie - params.id:', id);
    
    // O params.id é o Bowtie id (partitionKey)
    // Buscamos o bowtie mais recente para obter riskId, id e version
    const latest = await getBowtieById(id);
    console.log('DELETE Bowtie - latest found:', latest ? { id: latest.id, riskId: latest.riskId, version: latest.version } : 'null');
    if (latest) {
      console.log('DELETE Bowtie - Deleting all versions for riskId:', latest.riskId, 'id:', latest.id);
      const deletedCount = await deleteBowtieAllVersions(latest.riskId, latest.id);
      console.log('DELETE Bowtie - Deleted count:', deletedCount);
      return NextResponse.json({ 
        message: 'Bowtie deleted successfully',
        deletedCount,
        riskId: latest.riskId,
        id: latest.id
      });
    }

    // Fallback: tratar params.id como riskId (dados legados ou chamadas antigas)
    console.log('DELETE Bowtie - Trying fallback with riskId:', id);
    const versions = await getBowtieVersions(id);
    console.log('DELETE Bowtie - Versions found:', versions?.length || 0);
    
    if (versions && versions.length > 0) {
      // Remove tudo da partição do risco
      const deleted = await deleteBowtieAllForRisk(id);
      console.log('DELETE Bowtie - Fallback deleted count:', deleted);
      
      if (deleted > 0) {
        return NextResponse.json({ 
          message: 'Bowtie deleted successfully (by riskId fallback)',
          deletedCount: deleted,
          riskId: id
        });
      }
    }

    console.log('DELETE Bowtie - Not found, returning 404');
    return NextResponse.json({ 
      error: 'Bowtie not found',
      details: `No bowtie found with id/riskId: ${id}`
    }, { status: 404 });
    
  } catch (error) {
    const { id } = await params;
    console.error(`Error deleting bowtie ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to delete bowtie',
        details: errorMessage,
        id: id
      },
      { status: 500 }
    );
  }
}
