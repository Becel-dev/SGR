import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import 'isomorphic-fetch';

// Configuração do cliente Microsoft Graph usando credenciais da aplicação
function getGraphClient() {
  const credential = new ClientSecretCredential(
    process.env.AZURE_AD_TENANT_ID!,
    process.env.AZURE_AD_CLIENT_ID!,
    process.env.AZURE_AD_CLIENT_SECRET!
  );

  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => {
        const token = await credential.getToken('https://graph.microsoft.com/.default');
        return token.token;
      },
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação do usuário
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar parâmetros da query
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const top = parseInt(searchParams.get('top') || '50');

    console.log('🔍 Buscando usuários do EntraID:', { search, top });

    // Se não houver query, retorna lista vazia
    if (!search || search.length < 2) {
      console.log('⚠️ Termo de busca muito curto, retornando lista vazia');
      return NextResponse.json({
        users: [],
        count: 0,
      });
    }

    // Verifica se as variáveis de ambiente estão configuradas
    if (!process.env.AZURE_AD_TENANT_ID || !process.env.AZURE_AD_CLIENT_ID || !process.env.AZURE_AD_CLIENT_SECRET) {
      console.error('❌ Credenciais do Azure AD não configuradas');
      return NextResponse.json({ 
        error: 'Azure AD não configurado. Verifique as variáveis de ambiente.',
        configured: {
          tenantId: !!process.env.AZURE_AD_TENANT_ID,
          clientId: !!process.env.AZURE_AD_CLIENT_ID,
          clientSecret: !!process.env.AZURE_AD_CLIENT_SECRET,
        }
      }, { status: 500 });
    }

    console.log('✅ Credenciais do Azure AD encontradas, obtendo cliente Graph...');
    const client = getGraphClient();

    console.log('📡 Fazendo requisição ao Microsoft Graph API...');
    
    // Busca usuários que correspondem à query
    const filterQuery = `startswith(displayName,'${search}') or startswith(givenName,'${search}') or startswith(surname,'${search}') or startswith(userPrincipalName,'${search}')`;
    console.log('� Filtro:', filterQuery);

    const response = await client
      .api('/users')
      .filter(filterQuery)
      .select('id,displayName,userPrincipalName,mail,jobTitle,department')
      .top(top)
      .get();

    console.log('✅ Resposta do Graph API:', {
      totalResults: response.value?.length || 0,
      hasResults: !!response.value && response.value.length > 0
    });

    // Formata resposta
    const users = response.value || [];
    
    return NextResponse.json({
      users: users,
      count: users.length,
    });

  } catch (error: any) {
    console.error('❌ Erro ao buscar usuários:', {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
    });
    
    // Se houver erro de autenticação/autorização
    if (error.statusCode === 401 || error.statusCode === 403) {
      console.warn('⚠️ Erro de autenticação/autorização - verificar permissões do Azure AD');
      return NextResponse.json({ 
        error: 'Falha na autenticação',
        details: 'As permissões do Azure AD não estão configuradas. Adicione User.Read.All e Directory.Read.All.',
        statusCode: error.statusCode
      }, { status: 403 });
    }

    return NextResponse.json(
      { 
        error: 'Falha ao buscar usuários', 
        details: error.message,
        statusCode: error.statusCode,
        code: error.code 
      },
      { status: 500 }
    );
  }
}
