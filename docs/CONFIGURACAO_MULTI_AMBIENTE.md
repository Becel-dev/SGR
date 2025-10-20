# Configuração Multi-Ambiente (DEV, QA, PRD)

## 📋 Resumo das Alterações

A aplicação foi preparada para trabalhar com múltiplos ambientes (Development, QA e Production), com as seguintes melhorias:

1. ✅ Remoção de usuários e permissões mock
2. ✅ Sistema de configuração por ambiente
3. ✅ Super Admin com bypass de permissões
4. ✅ Separação de bancos de dados (QA/DEV compartilham, PRD separado)
5. ✅ URLs de redirecionamento específicas por ambiente

---

## 🔧 Configuração de Ambientes

### Variável de Ambiente Principal

```bash
NEXT_PUBLIC_APP_ENV=development  # ou 'qa' ou 'production'
```

### Estrutura de Configuração

**DEV (Development):**
- Provider de login local disponível
- Compartilha banco de dados com QA
- Azure AD opcional
- URL: `http://localhost:3000`

**QA (Quality Assurance):**
- Azure AD obrigatório
- Compartilha banco de dados com DEV
- URL específica (ex: `https://sgr-qa.rumolog.com`)

**PRD (Production):**
- Azure AD obrigatório
- Banco de dados separado
- URL específica (ex: `https://sgr.rumolog.com`)

---

## 👑 Super Administrador

### Email do Super Admin
```
pedro.becel@rumolog.com
```

### Características
- ✅ Bypass automático de TODAS as permissões
- ✅ Funciona em TODOS os ambientes (DEV, QA, PRD)
- ✅ Não precisa de perfil de acesso configurado
- ✅ Não precisa de controle de acesso no banco
- ✅ Acesso total a todos os módulos e ações

### Como Funciona
O sistema verifica automaticamente se o email do usuário é do super admin e, se for, todas as verificações de permissão retornam `true`.

---

## 🗄️ Configuração de Banco de Dados

### Azure Storage Connection Strings

**Para DEV e QA (compartilhado):**
```bash
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
```

**Para PRD (separado):**
```bash
AZURE_STORAGE_CONNECTION_STRING_PRD=DefaultEndpointsProtocol=https;AccountName=...
```

A aplicação automaticamente usa a connection string correta baseada no `NEXT_PUBLIC_APP_ENV`.

---

## 🔐 Configuração de Autenticação

### NextAuth URLs

**DEV:**
```bash
NEXTAUTH_URL=http://localhost:3000
```

**QA:**
```bash
NEXTAUTH_URL=https://sgr-qa.rumolog.com
```

**PRD:**
```bash
NEXTAUTH_URL=https://sgr.rumolog.com
```

### Azure AD Configuration

```bash
AZURE_AD_CLIENT_ID=your_client_id
AZURE_AD_CLIENT_SECRET=your_client_secret
AZURE_AD_TENANT_ID=your_tenant_id
```

**Redirect URIs no Azure AD:**
- DEV: `http://localhost:3000/api/auth/callback/azure-ad`
- QA: `https://sgr-qa.rumolog.com/api/auth/callback/azure-ad`
- PRD: `https://sgr.rumolog.com/api/auth/callback/azure-ad`

---

## 📝 Arquivos Modificados

### Novos Arquivos

1. **`src/lib/config.ts`**
   - Configuração centralizada de ambientes
   - Função `isSuperAdmin(email)`
   - Validação de configuração
   - Logs de inicialização

### Arquivos Modificados

1. **`src/lib/auth.ts`**
   - Removidos usuários mock hardcoded
   - Provider de desenvolvimento simplificado
   - Apenas disponível em `NODE_ENV=development`

2. **`src/lib/permissions.ts`**
   - Adicionado suporte a Super Admin
   - Todas as funções agora aceitam `userEmail` opcional
   - Verificação de `isSuperAdmin()` antes de checar permissões

3. **`src/app/api/access-control/route.ts`**
   - Removido `MOCK_ACCESS_CONTROLS`
   - Implementado bypass para Super Admin
   - Retorna `isSuperAdmin: true` quando aplicável

4. **`src/hooks/use-permission.ts`**
   - Atualizado para passar email do usuário nas verificações
   - Mantém compatibilidade com código existente

5. **`src/app/auth/signin/page.tsx`**
   - Removida lista de usuários de teste
   - Form simples para login de desenvolvimento
   - Disponível apenas em `NODE_ENV=development`

6. **`.env.example`**
   - Atualizado com todas as novas variáveis
   - Documentação de setup por ambiente
   - Notas sobre Super Admin

---

## 🚀 Como Configurar Cada Ambiente

### Ambiente de Desenvolvimento (Local)

1. Copiar `.env.example` para `.env.local`
2. Configurar variáveis:
   ```bash
   NEXT_PUBLIC_APP_ENV=development
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=<gerar com: openssl rand -base64 32>
   AZURE_STORAGE_CONNECTION_STRING=<sua connection string>
   ```
3. Azure AD é opcional (pode usar provider local)
4. Executar: `npm run dev`

### Ambiente QA

1. Configurar variáveis de ambiente no servidor:
   ```bash
   NEXT_PUBLIC_APP_ENV=qa
   NEXTAUTH_URL=https://sgr-qa.rumolog.com
   NEXTAUTH_SECRET=<gerar novo, diferente do DEV>
   AZURE_STORAGE_CONNECTION_STRING=<mesma do DEV>
   AZURE_AD_CLIENT_ID=...
   AZURE_AD_CLIENT_SECRET=...
   AZURE_AD_TENANT_ID=...
   ```
2. Configurar Redirect URI no Azure AD
3. Deploy da aplicação

### Ambiente PRD

1. Configurar variáveis de ambiente no servidor:
   ```bash
   NEXT_PUBLIC_APP_ENV=production
   NEXTAUTH_URL=https://sgr.rumolog.com
   NEXTAUTH_SECRET=<gerar novo, diferente do DEV e QA>
   AZURE_STORAGE_CONNECTION_STRING_PRD=<connection string separada>
   AZURE_AD_CLIENT_ID=...
   AZURE_AD_CLIENT_SECRET=...
   AZURE_AD_TENANT_ID=...
   ```
2. Configurar Redirect URI no Azure AD
3. Deploy da aplicação

---

## 🧪 Testando as Mudanças

### 1. Testar Super Admin

```bash
# Login com pedro.becel@rumolog.com
# Verificar que tem acesso a todos os módulos
# Não precisa criar perfil ou controle de acesso
```

### 2. Testar Usuário Normal

```bash
# Login com qualquer outro email
# Deve seguir sistema normal de permissões
# Precisa ter perfil e controle de acesso configurados
```

### 3. Verificar Ambiente

Abra o console do navegador ao iniciar a aplicação:
```
🌍 Ambiente: development
✅ Configuração do ambiente validada
👤 Super Admin: pedro.becel@rumolog.com
```

---

## ⚠️ Notas Importantes

1. **Super Admin sempre tem acesso total** - mesmo sem perfil configurado
2. **QA e DEV compartilham banco** - mudanças em um afetam o outro
3. **PRD usa banco separado** - necessário migrar dados manualmente se necessário
4. **NEXTAUTH_SECRET deve ser diferente** em cada ambiente
5. **Provider de desenvolvimento** só funciona quando `NODE_ENV=development`
6. **Azure AD é obrigatório** em QA e PRD

---

## 🔍 Debugging

### Verificar configuração atual:
```typescript
import { getEnvironmentConfig } from '@/lib/config';

const config = getEnvironmentConfig();
console.log('Ambiente:', config.name);
console.log('É desenvolvimento?', config.isDevelopment);
console.log('É QA?', config.isQA);
console.log('É produção?', config.isProduction);
```

### Verificar se é Super Admin:
```typescript
import { isSuperAdmin } from '@/lib/config';

const email = 'pedro.becel@rumolog.com';
console.log('É Super Admin?', isSuperAdmin(email)); // true
```

### Logs no console (backend):
- `🌍 Ambiente: <env>` - ambiente detectado
- `✅ Configuração do ambiente validada` - config OK
- `⚠️ Problemas na configuração` - config com erros
- `👤 Super Admin: <email>` - email do super admin

---

## 📚 Próximos Passos

1. ✅ Configurar ambiente QA com suas URLs reais
2. ✅ Configurar banco de dados de produção
3. ✅ Fazer primeiro login com Super Admin para validar
4. ✅ Criar perfis de acesso necessários
5. ✅ Vincular usuários aos perfis através do Controle de Acesso
6. ✅ Testar permissões com usuários normais

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs do console (frontend e backend)
2. Valide as variáveis de ambiente com `validateConfig()`
3. Confirme que o Super Admin funciona primeiro
4. Verifique se os Redirect URIs estão corretos no Azure AD
5. Confirme que as connection strings estão corretas

---

**Última atualização:** 2025-10-20
**Versão:** 1.0.0
