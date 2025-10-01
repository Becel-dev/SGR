import { NextResponse } from 'next/server';
import {
  getBowtieById,
  addOrUpdateBowtie,
  deleteBowtie,
} from '../../../../lib/azure-table-storage';
import { BowtieData } from '../../../../lib/types';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bowtie = await getBowtieById(params.id);
    if (!bowtie) {
      return NextResponse.json({ error: 'Bowtie not found' }, { status: 404 });
    }
    return NextResponse.json(bowtie);
  } catch (error) {
    console.error(`Error getting bowtie ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to get bowtie' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bowtieData: BowtieData = await request.json();
    if (bowtieData.id !== params.id) {
      return NextResponse.json(
        { error: "ID in body does not match ID in URL" },
        { status: 400 }
      );
    }
    const result = await addOrUpdateBowtie(bowtieData);
    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error updating bowtie ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update bowtie' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Para deletar, precisamos do PartitionKey (id) e do RowKey (riskId)
    // Primeiro, buscamos o bowtie para obter o riskId
    const bowtie = await getBowtieById(params.id);
    if (!bowtie) {
      return NextResponse.json({ error: 'Bowtie not found' }, { status: 404 });
    }

    await deleteBowtie(bowtie.id, bowtie.riskId);
    return NextResponse.json({ message: 'Bowtie deleted successfully' });
  } catch (error) {
    console.error(`Error deleting bowtie ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete bowtie' },
      { status: 500 }
    );
  }
}
