import { NextResponse } from 'next/server';
import { ClientSecretCredential } from '@azure/identity';

export async function GET() {
  try {
    console.log('🔍 Testing Azure AD configuration...');

    // Verifica variáveis de ambiente
    const config = {
      tenantId: process.env.AZURE_AD_TENANT_ID,
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
    };

    console.log('📋 Configuration check:', {
      tenantId: config.tenantId ? `${config.tenantId.substring(0, 8)}...` : 'MISSING',
      clientId: config.clientId ? `${config.clientId.substring(0, 8)}...` : 'MISSING',
      clientSecret: config.clientSecret ? 'SET (hidden)' : 'MISSING',
    });

    if (!config.tenantId || !config.clientId || !config.clientSecret) {
      return NextResponse.json({
        success: false,
        error: 'Azure AD credentials not configured',
        configured: {
          tenantId: !!config.tenantId,
          clientId: !!config.clientId,
          clientSecret: !!config.clientSecret,
        },
        message: 'Please configure AZURE_AD_TENANT_ID, AZURE_AD_CLIENT_ID, and AZURE_AD_CLIENT_SECRET in .env.local'
      }, { status: 500 });
    }

    // Tenta obter um token
    console.log('🔐 Attempting to get access token...');
    const credential = new ClientSecretCredential(
      config.tenantId,
      config.clientId,
      config.clientSecret
    );

    const token = await credential.getToken('https://graph.microsoft.com/.default');
    
    console.log('✅ Token obtained successfully');

    return NextResponse.json({
      success: true,
      message: 'Azure AD is properly configured and authenticated',
      tokenExpiration: new Date(token.expiresOnTimestamp).toISOString(),
      scopes: 'https://graph.microsoft.com/.default',
    });

  } catch (error: any) {
    console.error('❌ Azure AD test failed:', error);

    return NextResponse.json({
      success: false,
      error: error.message,
      errorCode: error.code,
      errorType: error.constructor.name,
      details: 'Failed to authenticate with Azure AD. Check your credentials and permissions.',
      troubleshooting: [
        'Verify AZURE_AD_TENANT_ID is correct',
        'Verify AZURE_AD_CLIENT_ID is correct',
        'Verify AZURE_AD_CLIENT_SECRET is valid and not expired',
        'Check if the app has User.Read.All and Directory.Read.All permissions',
        'Ensure admin consent has been granted',
      ]
    }, { status: 500 });
  }
}
