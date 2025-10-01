import { NextResponse } from 'next/server';
import { getParameter, setParameter } from '@/lib/azure-table-storage';
import { IerParameter } from '@/lib/types';

// GET /api/parameters/{name}
export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  const { name } = params;
  try {
    const value = await getParameter<IerParameter>(name);
    if (value === null) {
      return new NextResponse(JSON.stringify({ message: `Parâmetro '${name}' não encontrado.` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return NextResponse.json(value);
  } catch (error) {
    console.error(`Erro ao buscar o parâmetro '${name}':`, error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido';
    return new NextResponse(JSON.stringify({ message: `Falha ao buscar o parâmetro '${name}'`, error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST /api/parameters/{name}
export async function POST(
  request: Request,
  { params }: { params: { name: string } }
) {
  const { name } = params;
  try {
    const body = await request.json();
    await setParameter(name, body);
    return NextResponse.json({ message: `Parâmetro '${name}' salvo com sucesso.` });
  } catch (error) {
    console.error(`Erro ao salvar o parâmetro '${name}':`, error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido';
    return new NextResponse(JSON.stringify({ message: `Falha ao salvar o parâmetro '${name}'`, error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
