/**
 * Configuração de Ambiente
 * 
 * Gerencia configurações específicas para cada ambiente (QA e PRD)
 */

export type Environment = 'development' | 'qa' | 'production';

/**
 * Configuração do ambiente atual
 */
export const ENV: Environment = (process.env.NEXT_PUBLIC_APP_ENV as Environment) || 'development';

/**
 * Email do super administrador com bypass de permissões
 * Este usuário tem acesso total ao sistema em todos os ambientes
 */
export const SUPER_ADMIN_EMAIL = 'pedro.becel@rumolog.com';

/**
 * Verifica se o email é do super administrador
 */
export function isSuperAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

/**
 * Configurações específicas por ambiente
 */
interface EnvironmentConfig {
  name: string;
  isDevelopment: boolean;
  isQA: boolean;
  isProduction: boolean;
  azureStorageConnectionString: string;
  nextAuthUrl: string;
  nextAuthSecret: string;
  azureAdClientId: string;
  azureAdClientSecret: string;
  azureAdTenantId: string;
}

/**
 * Retorna a configuração do ambiente atual
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const isDevelopment = ENV === 'development';
  const isQA = ENV === 'qa';
  const isProduction = ENV === 'production';

  return {
    name: ENV,
    isDevelopment,
    isQA,
    isProduction,
    
    // Azure Storage (QA e DEV usam a mesma string de conexão)
    azureStorageConnectionString: isProduction 
      ? process.env.AZURE_STORAGE_CONNECTION_STRING_PRD || ''
      : process.env.AZURE_STORAGE_CONNECTION_STRING || '',
    
    // NextAuth URLs (diferentes para QA e PRD)
    nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    nextAuthSecret: process.env.NEXTAUTH_SECRET || '',
    
    // Azure AD
    azureAdClientId: process.env.AZURE_AD_CLIENT_ID || '',
    azureAdClientSecret: process.env.AZURE_AD_CLIENT_SECRET || '',
    azureAdTenantId: process.env.AZURE_AD_TENANT_ID || '',
  };
}

/**
 * Validação de configuração
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const config = getEnvironmentConfig();
  const errors: string[] = [];

  // Validações obrigatórias
  if (!config.azureStorageConnectionString) {
    errors.push('AZURE_STORAGE_CONNECTION_STRING não configurada');
  }

  if (!config.nextAuthSecret) {
    errors.push('NEXTAUTH_SECRET não configurada');
  }

  if (!config.nextAuthUrl) {
    errors.push('NEXTAUTH_URL não configurada');
  }

  // Validações específicas do Azure AD (apenas em produção e QA)
  if (!config.isDevelopment) {
    if (!config.azureAdClientId) {
      errors.push('AZURE_AD_CLIENT_ID não configurada');
    }
    if (!config.azureAdClientSecret) {
      errors.push('AZURE_AD_CLIENT_SECRET não configurada');
    }
    if (!config.azureAdTenantId) {
      errors.push('AZURE_AD_TENANT_ID não configurada');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Logs de inicialização
 */
if (typeof window === 'undefined') {
  console.log('🌍 Ambiente:', ENV);
  const validation = validateConfig();
  
  if (!validation.valid) {
    console.warn('⚠️ Problemas na configuração do ambiente:');
    validation.errors.forEach(error => console.warn(`  - ${error}`));
  } else {
    console.log('✅ Configuração do ambiente validada');
  }
  
  console.log('👤 Super Admin:', SUPER_ADMIN_EMAIL);
}
