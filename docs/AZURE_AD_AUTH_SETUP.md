# Configuração de Autenticação Microsoft (Azure AD)

## ✅ Implementação Concluída

A autenticação Microsoft foi implementada no sistema SGR usando NextAuth.js v5 com Azure AD (Microsoft Entra ID).

## 📋 Arquivos Criados/Modificados

### Novos Arquivos:
- `src/lib/auth.ts` - Configuração do NextAuth com Azure AD
- `src/app/api/auth/[...nextauth]/route.ts` - API route do NextAuth
- `src/components/auth/session-provider.tsx` - Provider de sessão para client components
- `src/hooks/use-auth.ts` - Hook customizado para acessar usuário autenticado
- `src/types/next-auth.d.ts` - Type declarations para NextAuth
- `src/app/auth/signin/page.tsx` - Página de login

### Arquivos Modificados:
- `src/app/layout.tsx` - Adicionado SessionProvider
- `src/components/auth/user-menu.tsx` - Integrado com autenticação Microsoft
- `src/app/(app)/identification/capture/page.tsx` - Captura usuário real nos campos de auditoria
- `.env.local` - Adicionadas variáveis de ambiente do Azure AD

## 🔧 Configuração Necessária

### 1. Registrar Aplicação no Azure Portal

1. Acesse o [Azure Portal](https://portal.azure.com)
2. Vá para **Azure Active Directory** > **App registrations** > **New registration**
3. Configure:
   - **Name**: SGR - Sistema de Gestão de Riscos
   - **Supported account types**: Accounts in this organizational directory only (Single tenant)
   - **Redirect URI**: Web - `http://localhost:3000/api/auth/callback/azure-ad`
4. Após criar, anote:
   - **Application (client) ID**
   - **Directory (tenant) ID**
5. Vá em **Certificates & secrets** > **New client secret**
   - Crie um novo secret e anote o **Value** (só aparece uma vez!)
6. Vá em **API permissions**:
   - Adicione permissões: `User.Read`, `openid`, `profile`, `email`
   - Clique em "Grant admin consent"

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env.local` na raiz do projeto:

```env
# Azure AD Authentication
AZURE_AD_TENANT_ID=seu-tenant-id-aqui
AZURE_AD_CLIENT_ID=seu-client-id-aqui
AZURE_AD_CLIENT_SECRET=seu-client-secret-aqui

# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=gere-um-secret-seguro-aqui
```

### 3. Gerar NEXTAUTH_SECRET

Execute no terminal:

```bash
openssl rand -base64 32
```

Ou use o PowerShell:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Cole o resultado em `NEXTAUTH_SECRET`.

### 4. Configurar URL de Produção

Quando implantar em produção, atualize:

1. No `.env.local` de produção:
   ```env
   NEXTAUTH_URL=https://seu-dominio.com
   ```

2. No Azure Portal, adicione o Redirect URI de produção:
   ```
   https://seu-dominio.com/api/auth/callback/azure-ad
   ```

## 🎯 Como Funciona

### Login
- Usuário clica em "Entrar" no menu superior
- É redirecionado para login Microsoft
- Após autenticação, volta para a aplicação
- Dados do usuário (nome e email) ficam disponíveis via `useAuth()` hook

### Captura de Usuário
- No módulo de **Identificação de Riscos**, ao salvar:
  - `createdBy`: Definido automaticamente na criação com formato: `Nome (email@domain.com)`
  - `updatedBy`: Atualizado automaticamente em cada edição
  - `createdAt` e `updatedAt`: Timestamps ISO 8601

### Exemplo de Uso no Código

```tsx
import { useAuthUser } from '@/hooks/use-auth';

function MeuComponente() {
  const authUser = useAuthUser();
  
  // authUser.name = "João Silva"
  // authUser.email = "joao.silva@empresa.com"
  
  const data = {
    ...formData,
    createdBy: `${authUser.name} (${authUser.email})`,
    createdAt: new Date().toISOString(),
  };
}
```

## 🔐 Segurança

- ✅ Tokens JWT criptografados
- ✅ Sessões com validade de 30 dias
- ✅ Client Secret protegido em variáveis de ambiente
- ✅ HTTPS obrigatório em produção
- ✅ Callback URL validado pelo Azure AD

## 📝 Próximos Passos (Opcional)

Para estender a autenticação para outros módulos:

1. Importe `useAuthUser` no componente de captura/edição
2. Use `authUser.name` e `authUser.email` nos campos de auditoria
3. Formato padrão: `${authUser.name} (${authUser.email})`

### Exemplo para Controles:

```tsx
// src/app/(app)/controls/capture/page.tsx
import { useAuthUser } from '@/hooks/use-auth';

// No onSubmit:
const authUser = useAuthUser();
const controlData = {
  ...data,
  criadoPor: `${authUser.name} (${authUser.email})`,
  modificadoPor: `${authUser.name} (${authUser.email})`,
  criadoEm: new Date().toISOString(),
  modificadoEm: new Date().toISOString(),
};
```

## ✅ Status da Implementação

- ✅ Configuração NextAuth.js v5
- ✅ Integração com Azure AD
- ✅ SessionProvider no layout
- ✅ Hook useAuth customizado
- ✅ Página de login (/auth/signin)
- ✅ UserMenu com suporte a Microsoft Account
- ✅ **Módulo de Identificação de Riscos** - Captura usuário real
- ⏳ Módulo de Controles - Pendente
- ⏳ Módulo de Análise - Pendente
- ⏳ Módulo de Ações - Pendente
- ⏳ Módulo de KPIs - Pendente

## 🐛 Troubleshooting

### Erro: "Invalid callback URL"
- Verifique se o Redirect URI no Azure Portal está correto
- Deve ser: `http://localhost:3000/api/auth/callback/azure-ad`

### Erro: "NEXTAUTH_SECRET not set"
- Gere um secret com `openssl rand -base64 32`
- Adicione no `.env.local`

### Usuário não aparece no menu
- Verifique se o SessionProvider está no layout
- Confirme que as variáveis de ambiente estão carregadas
- Veja o console do navegador para erros

### Token expirou
- Sessão tem validade de 30 dias
- Usuário precisará fazer login novamente
- Tokens são renovados automaticamente durante uso ativo
