# 🔐 Autenticação - SGR

## Visão Geral

O SGR utiliza NextAuth.js v5 para autenticação, com suporte a dois métodos:

1. **Microsoft Azure AD** (Produção) - Login corporativo obrigatório
2. **Credentials** (Desenvolvimento) - Login de teste para ambiente local

## Configuração

### Variáveis de Ambiente

```env
# Azure AD (Obrigatório para produção)
AZURE_AD_CLIENT_ID=your_client_id
AZURE_AD_CLIENT_SECRET=your_client_secret
AZURE_AD_TENANT_ID=your_tenant_id

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Ambiente
NODE_ENV=development # ou production
```

### Microsoft Azure AD

**Permissões Necessárias:**
- `User.Read` - Ler perfil do usuário
- `User.Read.All` - Ler todos os usuários (para autocomplete)
- `Directory.Read.All` - Ler estrutura organizacional (para hierarquia de escalonamento)

**Configuração no Azure Portal:**
1. Registrar aplicação no Azure AD
2. Adicionar Redirect URI: `http://localhost:3000/api/auth/callback/azure-ad`
3. Criar Client Secret
4. Adicionar permissões de API (Microsoft Graph)
5. Conceder consentimento de administrador

## Métodos de Login

### 1. Login com Microsoft (Produção)

**Quando usar:**
- Ambiente de produção
- Acesso com credenciais corporativas
- Integração com Azure AD

**Fluxo:**
1. Usuário clica em "Entrar com Microsoft"
2. Redirecionado para login.microsoftonline.com
3. Autenticação com credenciais corporativas
4. Callback com token de acesso
5. Sessão criada com informações do usuário

**Dados da Sessão:**
```typescript
{
  user: {
    email: "usuario@empresa.com",
    name: "Nome do Usuário"
  },
  accessToken: "eyJ0eXAiOiJKV1...", // Para chamadas à Graph API
  expires: "2024-11-13T..."
}
```

### 2. Login de Teste (Desenvolvimento)

**Quando usar:**
- Desenvolvimento local (NODE_ENV !== 'production')
- Testes sem necessidade de Azure AD
- Demonstrações e protótipos

**Credenciais Padrão:**
- **Email:** pedro@teste.com
- **Nome:** Pedro Teste
- **Senha:** Não requerida (auto-autorizado)

**Comportamento:**
- Botão só aparece em ambiente de desenvolvimento
- Estilizado em laranja com ícone de laboratório 🧪
- Auto-autoriza qualquer email fornecido
- Cria sessão simulando formato do Azure AD

**Limitações:**
- ⚠️ NÃO disponível em produção (NODE_ENV === 'production')
- ⚠️ Não tem acesso real à Graph API
- ⚠️ Token fictício (não válido para APIs externas)
- ✅ Suficiente para desenvolvimento de UI e fluxos internos

## Páginas de Autenticação

### Sign In (`/auth/signin`)

**Recursos:**
- Design responsivo com Card centralizado
- Branding SGR com ícone Shield
- Botão Microsoft (sempre visível)
- Botão de Teste (apenas em desenvolvimento)
- Separador visual entre opções
- Aviso sobre ambiente de desenvolvimento

### Sign Out

**Uso:**
```tsx
import { signOut } from 'next-auth/react';

// Em componente
<button onClick={() => signOut()}>Sair</button>
```

## Uso no Código

### Hook useAuthUser (Componentes)

```tsx
'use client';
import { useAuthUser } from '@/hooks/use-user';

export default function MyComponent() {
  const authUser = useAuthUser(); // { email, name } ou null

  if (!authUser) {
    return <div>Não autenticado</div>;
  }

  return <div>Olá, {authUser.name}!</div>;
}
```

### Função auth() (Server Components/API Routes)

```tsx
import { auth } from '@/lib/auth';

export default async function ServerComponent() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return <div>Email: {session.user.email}</div>;
}
```

### API Routes

```typescript
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  // Usar session.accessToken para Graph API
  // Usar session.user.email, session.user.name
}
```

## Integração com Graph API

O token de acesso (`accessToken`) na sessão permite chamadas à Microsoft Graph API:

```typescript
import { auth } from '@/lib/auth';

const session = await auth();
const accessToken = session?.accessToken;

// Buscar dados do usuário
const response = await fetch('https://graph.microsoft.com/v1.0/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

**Exemplos de uso no SGR:**
- Buscar manager (superior) - `/api/users/manager`
- Buscar usuários para autocomplete - `/api/users/search`
- Estrutura organizacional para escalonamento

## Sessão

**Estratégia:** JWT (token assinado, não armazenado em DB)

**Duração:** 30 dias

**Renovação:** Automática durante uso ativo

**Expiração:** 
- Token expira após 30 dias de inatividade
- Usuário redirecionado para `/auth/signin`

## Auditoria

Todas as ações registram informações de auditoria:

```typescript
{
  createdBy: "Nome (email@empresa.com)",
  createdAt: "2024-10-14T10:30:00.000Z",
  updatedBy: "Nome (email@empresa.com)",
  updatedAt: "2024-10-14T15:45:00.000Z"
}
```

**Fonte dos dados:**
- `session.user.email` - Email do usuário
- `session.user.name` - Nome do usuário

## Troubleshooting

### Login com Microsoft não funciona

**Verificar:**
1. ✅ Variáveis AZURE_AD_* estão configuradas
2. ✅ Redirect URI configurada no Azure Portal
3. ✅ Client Secret válido (não expirado)
4. ✅ Permissões concedidas (consentimento admin)
5. ✅ NEXTAUTH_SECRET configurado

**Console errors comuns:**
- `invalid_client` → Client ID ou Secret incorretos
- `redirect_uri_mismatch` → URI não cadastrada no Azure
- `invalid_scope` → Permissão não concedida

### Login de teste não aparece

**Verificar:**
1. ✅ NODE_ENV !== 'production'
2. ✅ Executando em localhost (não build de produção)
3. ✅ Browser cache limpo

### Sessão expira rapidamente

**Possíveis causas:**
- Clock skew (relógio do servidor/cliente dessincronizado)
- NEXTAUTH_SECRET mudou (invalida tokens existentes)
- Bug no código: signOut() sendo chamado indevidamente

### Graph API retorna 401

**Verificar:**
1. ✅ Token válido (session.accessToken existe)
2. ✅ Permissões corretas no Azure AD
3. ✅ Scope correto no provider ('User.Read')
4. ✅ Token não expirado

## Segurança

### Boas Práticas Implementadas

✅ **HTTPS obrigatório em produção**
✅ **NEXTAUTH_SECRET forte** (gerado com openssl rand)
✅ **JWT assinado** (não adulterável)
✅ **Session maxAge limitado** (30 dias)
✅ **Credentials provider apenas em dev** (NODE_ENV check)
✅ **Client Secret em .env** (não commitado)
✅ **Redirect URI whitelist** (configurada no Azure)

### ⚠️ Avisos de Segurança

- **NUNCA** commitar `.env` ou `.env.local`
- **NUNCA** usar login de teste em produção
- **NUNCA** expor NEXTAUTH_SECRET publicamente
- **SEMPRE** usar HTTPS em produção
- **SEMPRE** rotacionar Client Secrets periodicamente

## Migração para Produção

**Checklist:**

1. [ ] Configurar variáveis de ambiente de produção
2. [ ] Atualizar NEXTAUTH_URL para domínio real
3. [ ] Registrar Redirect URI de produção no Azure
4. [ ] Verificar NODE_ENV === 'production'
5. [ ] Confirmar que login de teste não aparece
6. [ ] Testar login com Microsoft em produção
7. [ ] Testar renovação de sessão
8. [ ] Testar logout

## Referências

- [NextAuth.js v5 Documentation](https://next-auth.js.org/)
- [Microsoft Graph API](https://learn.microsoft.com/en-us/graph/)
- [Azure AD App Registration](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app)
- [OAuth 2.0 Flow](https://oauth.net/2/)

---

**Última atualização:** 14/10/2024  
**Versão NextAuth:** 5.0.0-beta  
**Versão Node:** 18+
