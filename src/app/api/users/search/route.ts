import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import 'isomorphic-fetch';

// Configuração do cliente Microsoft Graph
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
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    console.log('🔍 User search request:', { query });

    // Se não houver query, retorna lista vazia
    if (!query || query.length < 2) {
      console.log('⚠️ Query too short, returning empty list');
      return NextResponse.json([]);
    }

    // Verifica se as variáveis de ambiente estão configuradas
    if (!process.env.AZURE_AD_TENANT_ID || !process.env.AZURE_AD_CLIENT_ID || !process.env.AZURE_AD_CLIENT_SECRET) {
      console.error('❌ Azure AD credentials not configured in environment variables');
      return NextResponse.json({ 
        error: 'Azure AD not configured',
        configured: {
          tenantId: !!process.env.AZURE_AD_TENANT_ID,
          clientId: !!process.env.AZURE_AD_CLIENT_ID,
          clientSecret: !!process.env.AZURE_AD_CLIENT_SECRET,
        }
      }, { status: 500 });
    }

    console.log('✅ Azure AD credentials found, attempting to get Graph client...');
    const client = getGraphClient();

    console.log('📡 Making request to Microsoft Graph API...');
    
    // Busca usuários que correspondem à query
    // Filtra por displayName ou userPrincipalName (email)
    const filterQuery = `startswith(displayName,'${query}') or startswith(givenName,'${query}') or startswith(surname,'${query}') or startswith(userPrincipalName,'${query}')`;
    console.log('🔎 Filter query:', filterQuery);

    const response = await client
      .api('/users')
      .filter(filterQuery)
      .select('id,displayName,userPrincipalName,mail,jobTitle,department')
      .top(10)
      .get();

    console.log('✅ Graph API response:', {
      resultCount: response.value?.length || 0,
      hasResults: !!response.value && response.value.length > 0
    });

    // Mapeia para formato simplificado
    const users = response.value.map((user: any) => ({
      id: user.id,
      name: user.displayName,
      email: user.userPrincipalName || user.mail,
      jobTitle: user.jobTitle || '',
      department: user.department || '',
    }));

    console.log('📤 Returning users:', users.length);
    return NextResponse.json(users);
  } catch (error: any) {
    console.error('❌ Error searching users:', {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      stack: error.stack,
      body: error.body,
    });
    
    // Se houver erro de autenticação, retorna informação detalhada
    if (error.statusCode === 401 || error.statusCode === 403) {
      console.warn('⚠️ Authentication/Authorization error - check Azure AD permissions');
      return NextResponse.json({ 
        error: 'Authentication failed',
        details: 'Azure AD permissions not configured. Please add User.Read.All and Directory.Read.All permissions.',
        statusCode: error.statusCode
      }, { status: 403 });
    }

    return NextResponse.json(
      { 
        error: 'Failed to search users', 
        details: error.message,
        statusCode: error.statusCode,
        code: error.code 
      },
      { status: 500 }
    );
  }
}
