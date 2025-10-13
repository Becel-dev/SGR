import { NextResponse } from 'next/server';
import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import 'isomorphic-fetch';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    console.log('🔍 Test search request:', { query });

    const config = {
      tenantId: process.env.AZURE_AD_TENANT_ID,
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
    };

    if (!config.tenantId || !config.clientId || !config.clientSecret) {
      return NextResponse.json({ 
        success: false,
        error: 'Azure AD credentials not configured' 
      }, { status: 500 });
    }

    // Autenticação
    console.log('🔐 Getting credentials...');
    const credential = new ClientSecretCredential(
      config.tenantId,
      config.clientId,
      config.clientSecret
    );

    // Cliente Graph
    console.log('📡 Creating Graph client...');
    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const token = await credential.getToken('https://graph.microsoft.com/.default');
          return token.token;
        }
      }
    });

    // Teste 1: Listar todos os usuários (primeiros 5)
    console.log('📋 Test 1: Listing first 5 users...');
    const allUsersResponse = await client
      .api('/users')
      .select('id,displayName,userPrincipalName,mail,jobTitle,department')
      .top(5)
      .get();

    console.log('✅ All users response:', {
      count: allUsersResponse.value?.length || 0,
      users: allUsersResponse.value?.map((u: any) => ({
        name: u.displayName,
        email: u.mail || u.userPrincipalName
      }))
    });

    // Teste 2: Se foi fornecida uma query, fazer busca filtrada
    let searchResults = null;
    if (query.length >= 2) {
      console.log('🔎 Test 2: Searching with filter...');
      
      const filterQuery = `startswith(displayName,'${query}') or startswith(givenName,'${query}') or startswith(surname,'${query}') or startswith(userPrincipalName,'${query}')`;
      console.log('Filter:', filterQuery);

      const searchResponse = await client
        .api('/users')
        .select('id,displayName,userPrincipalName,mail,jobTitle,department')
        .filter(filterQuery)
        .top(10)
        .get();

      searchResults = {
        count: searchResponse.value?.length || 0,
        users: searchResponse.value?.map((u: any) => ({
          name: u.displayName,
          email: u.mail || u.userPrincipalName,
          jobTitle: u.jobTitle,
          department: u.department
        }))
      };

      console.log('✅ Search results:', searchResults);
    }

    return NextResponse.json({
      success: true,
      query: query || '(no query - listing all)',
      allUsers: {
        count: allUsersResponse.value?.length || 0,
        sample: allUsersResponse.value?.map((u: any) => ({
          id: u.id,
          name: u.displayName,
          email: u.mail || u.userPrincipalName,
          jobTitle: u.jobTitle,
          department: u.department
        }))
      },
      searchResults: searchResults
    });

  } catch (error: any) {
    console.error('❌ Test failed:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      body: error.body
    });

    return NextResponse.json({
      success: false,
      error: error.message,
      statusCode: error.statusCode,
      code: error.code,
      body: error.body
    }, { status: 500 });
  }
}
