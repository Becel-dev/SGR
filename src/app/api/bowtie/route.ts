import { NextResponse } from 'next/server';
import {
  addOrUpdateBowtie,
  getAllBowties,
} from '../../../lib/azure-table-storage';
import { BowtieData } from '../../../lib/types';

export async function GET() {
  try {
    const bowties = await getAllBowties();
    return NextResponse.json(bowties);
  } catch (error) {
    console.error('Error getting bowties:', error);
    return NextResponse.json(
      { error: 'Failed to get bowties' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const bowtieData: BowtieData = await request.json();
    const result = await addOrUpdateBowtie(bowtieData);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating bowtie:', error);
    return NextResponse.json(
      { error: 'Failed to create bowtie' },
      { status: 500 }
    );
  }
}
