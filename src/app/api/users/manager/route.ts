import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import 'isomorphic-fetch';

const credential = new ClientSecretCredential(
  process.env.AZURE_AD_TENANT_ID!,
  process.env.AZURE_AD_CLIENT_ID!,
  process.env.AZURE_AD_CLIENT_SECRET!
);

async function getAccessToken(): Promise<string> {
  const tokenResponse = await credential.getToken('https://graph.microsoft.com/.default');
  return tokenResponse.token;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🔍 Buscando gerente para:', email);

    const accessToken = await getAccessToken();
    const client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });

    // Busca o usuário pelo email
    const users = await client
      .api('/users')
      .filter(`mail eq '${email}' or userPrincipalName eq '${email}'`)
      .select('id,displayName,mail,userPrincipalName')
      .get();

    if (!users.value || users.value.length === 0) {
      console.log('⚠️ Usuário não encontrado:', email);
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const userId = users.value[0].id;
    console.log('✅ Usuário encontrado:', userId);

    // Busca o gerente do usuário
    try {
      const manager = await client
        .api(`/users/${userId}/manager`)
        .select('id,displayName,mail,userPrincipalName,jobTitle,department')
        .get();

      const managerData = {
        id: manager.id,
        name: manager.displayName,
        email: manager.mail || manager.userPrincipalName,
        jobTitle: manager.jobTitle || '',
        department: manager.department || '',
      };

      console.log('✅ Gerente encontrado:', managerData.email);
      return NextResponse.json(managerData);
    } catch (managerError: any) {
      // Se não encontrar gerente, retorna null (sem erro)
      if (managerError.statusCode === 404) {
        console.log('⚠️ Nenhum gerente configurado para:', email);
        return NextResponse.json({ manager: null });
      }
      throw managerError;
    }
  } catch (error: any) {
    console.error('❌ Erro ao buscar gerente:', error);
    return NextResponse.json(
      {
        error: 'Erro ao buscar gerente',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
