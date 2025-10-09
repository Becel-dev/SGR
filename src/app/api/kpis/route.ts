import { NextRequest, NextResponse } from 'next/server';
import { getAllKpis, createKpi } from '@/lib/azure-table-storage';

export async function GET() {
  try {
    const kpis = await getAllKpis();
    return NextResponse.json(kpis);
  } catch (error) {
    console.error('Erro ao buscar KPIs:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar KPIs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newKpi = await createKpi(body);
    return NextResponse.json(newKpi, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar KPI:', error);
    return NextResponse.json(
      { error: 'Falha ao criar KPI' },
      { status: 500 }
    );
  }
}
