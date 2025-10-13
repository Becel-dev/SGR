# 🔓 Sistema SGR - Autenticação Opcional

## ✅ Configuração Atual

O sistema SGR foi configurado para **funcionar sem login obrigatório**. A autenticação Microsoft (Azure AD) é **totalmente opcional** e pode ser configurada diretamente no Azure posteriormente.

## 🎯 Como Funciona

### **1. Acesso Sem Login**
- ✅ Todas as páginas e funcionalidades estão acessíveis sem autenticação
- ✅ Não há redirecionamento forçado para tela de login
- ✅ Não há middleware bloqueando rotas

### **2. Usuário Padrão (Sem Autenticação)**
Quando nenhum usuário está autenticado via Azure AD, o sistema usa um **usuário padrão**:

```typescript
{
  name: "Sistema",
  email: "sistema@sgr.com"
}
```

Este usuário será registrado nos campos de auditoria (`createdBy`, `updatedBy`) quando não houver autenticação.

### **3. Integração com Azure AD (Opcional)**
Quando você configurar o Azure AD no futuro:

#### **Opção 1: Login via Botão (não implementado)**
- Você pode adicionar um botão de login manualmente se desejar

#### **Opção 2: Login Automático via Azure (Recomendado)**
- Configure o Azure App Service para autenticação automática
- Não precisa de código adicional na aplicação
- O Azure injeta headers com informações do usuário
- Leia os headers no servidor para obter dados do usuário

## 📁 Arquivos Modificados

### **1. `src/middleware.ts` (NOVO)**
```typescript
// Middleware que permite acesso sem login
// Não bloqueia nenhuma rota
export function middleware(request: NextRequest) {
  return NextResponse.next();
}
```

### **2. `src/hooks/use-auth.ts`**
```typescript
export function useAuthUser() {
  const { data: session } = useSession();
  
  // Retorna usuário padrão se não autenticado
  if (!session?.user) {
    return {
      name: 'Sistema',
      email: 'sistema@sgr.com',
    };
  }

  return {
    name: session.user.name || 'Usuário',
    email: session.user.email || 'usuario@email.com',
  };
}
```

### **3. `src/components/auth/user-menu.tsx`**
```typescript
// Não mostra botão de "Entrar" quando sem login
// Simplesmente não renderiza nada se não houver usuário
if (!displayUser && !isLoading) {
  return null;
}
```

## 🚀 Como Usar Agora

### **Desenvolvimento Local**
```bash
npm run dev
```

1. Acesse http://localhost:9002
2. Use o sistema normalmente **sem fazer login**
3. Todos os registros serão criados por "Sistema (sistema@sgr.com)"

### **Módulos Funcionais**
Todos os módulos funcionam sem autenticação:
- ✅ Identificação de Riscos
- ✅ Análise de Riscos
- ✅ Governança de Controles
- ✅ Gestão de KPIs
- ✅ Controle de Ações
- ✅ Escalonamento
- ✅ Visualização Bowtie
- ✅ Painel de Gestão
- ✅ Gerador de Relatórios IA

## 🔐 Configuração Futura do Azure AD

Quando você quiser ativar a autenticação Microsoft, há duas abordagens:

### **Opção 1: NextAuth.js (Já Implementado)**

As configurações já estão prontas no código:
- `src/lib/auth.ts` - Configuração NextAuth
- `src/app/api/auth/[...nextauth]/route.ts` - API routes
- `.env.local` - Variáveis já configuradas

**Para ativar:**
1. Configure o Redirect URI no Azure Portal:
   ```
   http://localhost:9002/api/auth/callback/azure-ad
   ```
2. Adicione um botão de login onde desejar:
   ```tsx
   import { signIn } from 'next-auth/react';
   
   <Button onClick={() => signIn('azure-ad')}>
     Entrar com Microsoft
   </Button>
   ```

### **Opção 2: Azure App Service Authentication (Recomendado para Produção)**

Configuração direto no Azure, sem código:

1. No Azure Portal, vá para seu App Service
2. **Authentication** > **Add identity provider** > **Microsoft**
3. Configure:
   - Client ID: `5e99e04d-66d0-451c-9c4a-6b393dea9996`
   - Client Secret: Seu secret
   - Tenant ID: `837ce9c2-30fa-4613-b9ee-1f114ce71ff1`
4. **Restrict access**: "Require authentication"

Depois, no código, leia os headers:
```typescript
// No servidor (API routes ou Server Components)
const userName = request.headers.get('x-ms-client-principal-name');
const userEmail = request.headers.get('x-ms-client-principal-email');
```

## 📊 Campos de Auditoria

### **Sem Autenticação (Atual)**
```json
{
  "createdBy": "Sistema (sistema@sgr.com)",
  "updatedBy": "Sistema (sistema@sgr.com)",
  "createdAt": "2025-10-13T10:30:00.000Z",
  "updatedAt": "2025-10-13T10:30:00.000Z"
}
```

### **Com Autenticação (Futura)**
```json
{
  "createdBy": "João Silva (joao.silva@empresa.com)",
  "updatedBy": "Maria Santos (maria.santos@empresa.com)",
  "createdAt": "2025-10-13T10:30:00.000Z",
  "updatedAt": "2025-10-13T11:45:00.000Z"
}
```

## ✅ Resumo

- 🔓 **Sistema funciona SEM login**
- 🔐 **Autenticação é opcional**
- 👤 **Usuário padrão: "Sistema (sistema@sgr.com)"**
- 🚀 **Configure Azure AD quando quiser**
- 📝 **Auditoria funciona em ambos os casos**

**Você pode usar o sistema imediatamente sem nenhuma configuração adicional!** 🎉
