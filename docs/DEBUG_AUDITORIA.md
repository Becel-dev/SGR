# 🔧 Debug: Problema de Auditoria com useAuthUser

## 🐛 Problema Reportado

**Sintoma:** O campo "Última Alteração" na auditoria não está sendo atualizado com o usuário logado correto.

**Comportamento Esperado:**
```
Última alteração por: Pedro Teste (pedro@teste.com)
```

**Comportamento Possível:**
```
Última alteração por: Sistema (sistema@sgr.com)
```

---

## 🔍 Análise do Problema

### Causa Raiz Possível

O `useAuthUser()` hook pode estar retornando valores padrão porque a sessão NextAuth não está sendo carregada corretamente no componente.

### Código do useAuthUser

```typescript
export function useAuthUser() {
  const { data: session, status } = useSession();
  
  if (!session?.user) {
    // ❌ Retorna valores padrão quando não há sessão
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

### Cenários Possíveis

1. **Sessão não carregada ainda (loading)** - `useSession()` retorna `status: 'loading'`
2. **Sessão expirada** - `useSession()` retorna `status: 'unauthenticated'`
3. **Callbacks do NextAuth não persistindo dados** - JWT ou Session callback com problema
4. **SessionProvider não envolvendo o componente** - Falta de contexto

---

## ✅ Soluções Implementadas

### 1. **Logs de Debug Adicionados**

#### Em `src/hooks/use-auth.ts`:
```typescript
export function useAuthUser() {
  const { data: session, status } = useSession();
  
  // ✅ Logs para debug
  console.log('🔍 useAuthUser - Status:', status);
  console.log('🔍 useAuthUser - Session:', session);
  
  if (!session?.user) {
    console.warn('⚠️ useAuthUser: Nenhuma sessão encontrada!');
    return {
      name: 'Sistema',
      email: 'sistema@sgr.com',
    };
  }

  const authUser = {
    name: session.user.name || 'Usuário',
    email: session.user.email || 'usuario@email.com',
  };
  
  console.log('✅ useAuthUser - Retornando:', authUser);
  return authUser;
}
```

#### Em `src/lib/auth.ts`:
```typescript
callbacks: {
  async jwt({ token, account, profile, user }: any) {
    // ✅ Logs para debug
    if (account) {
      console.log('🔐 JWT Callback - Account:', { 
        provider: account.provider,
        type: account.type 
      });
    }
    
    if (profile) {
      console.log('👤 JWT Callback - Profile:', { 
        email: profile.email, 
        name: profile.name 
      });
    }
    
    // Para provider Credentials
    if (user && !profile) {
      console.log('👤 JWT Callback - User (Credentials):', { 
        email: user.email, 
        name: user.name 
      });
      token.email = user.email;
      token.name = user.name;
    }
    
    console.log('✅ JWT Callback - Token Final:', { 
      email: token.email, 
      name: token.name 
    });
    
    return token;
  },
  
  async session({ session, token }: any) {
    // ✅ Logs para debug
    if (token) {
      session.user.email = token.email as string;
      session.user.name = token.name as string;
      session.accessToken = token.accessToken as string;
      
      console.log('📋 Session Callback - Session criada:', { 
        email: session.user.email, 
        name: session.user.name 
      });
    }
    
    return session;
  },
}
```

### 2. **Componente de Debug Visual**

Criado `src/components/auth/session-debug-card.tsx`:

```typescript
export function SessionDebugCard() {
  const { data: session, status } = useSession();
  const authUser = useAuthUser();

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle>🔍 Debug: Sessão e Autenticação</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Exibe status, session data, e authUser */}
        {/* Mostra warning se estiver usando valores padrão */}
      </CardContent>
    </Card>
  );
}
```

### 3. **Debug Card na Página de Identificação**

Adicionado ao topo da página `/identification`:

```typescript
import { SessionDebugCard } from "@/components/auth/session-debug-card";

export default function IdentificationPage() {
  return (
    <div className="space-y-4">
      <SessionDebugCard />  {/* ✅ Card de debug */}
      <Card>
        {/* ... resto da página */}
      </Card>
    </div>
  );
}
```

---

## 🧪 Como Testar

### 1. **Reiniciar Servidor**
```powershell
# Parar (Ctrl+C)
npm run dev
```

### 2. **Fazer Login**
- Acessar: `http://localhost:3000/auth/signin`
- Clicar em "🧪 Login de Teste"
- Autenticar como Pedro Teste

### 3. **Verificar Console do Navegador (F12)**

**Logs esperados ao fazer login:**
```
🔐 JWT Callback - Account: { provider: 'test-credentials', type: 'credentials' }
👤 JWT Callback - User (Credentials): { email: 'pedro@teste.com', name: 'Pedro Teste' }
✅ JWT Callback - Token Final: { email: 'pedro@teste.com', name: 'Pedro Teste', hasAccessToken: false }
📋 Session Callback - Session criada: { email: 'pedro@teste.com', name: 'Pedro Teste', hasAccessToken: false }
```

**Logs esperados ao carregar página:**
```
🔍 useAuthUser - Status: authenticated
🔍 useAuthUser - Session: { user: { email: 'pedro@teste.com', name: 'Pedro Teste' } }
✅ useAuthUser - Retornando: { name: 'Pedro Teste', email: 'pedro@teste.com' }
```

### 4. **Verificar Card de Debug na Tela**

Na página `/identification`, no topo, deve aparecer:

```
┌─────────────────────────────────────┐
│ 🔍 Debug: Sessão e Autenticação     │
├─────────────────────────────────────┤
│ Status: [authenticated]             │
│                                     │
│ Session User:                       │
│   • Name: Pedro Teste               │
│   • Email: pedro@teste.com          │
│                                     │
│ useAuthUser() retorna:              │
│   • Name: Pedro Teste               │
│   • Email: pedro@teste.com          │
│                                     │
│ Formato de Auditoria:               │
│   Pedro Teste (pedro@teste.com)     │
└─────────────────────────────────────┘
```

**⚠️ Se aparecer warning vermelho:**
```
⚠️ ATENÇÃO: useAuthUser() está retornando valores padrão!
Isso significa que a sessão NextAuth não está sendo carregada corretamente.
```

### 5. **Testar Auditoria em Formulário**

1. Ir para `/identification/capture`
2. Preencher formulário
3. Salvar
4. Verificar console ao salvar:
   ```
   onSubmit - userName: Pedro Teste (pedro@teste.com)
   createdBy: Pedro Teste (pedro@teste.com)
   updatedBy: Pedro Teste (pedro@teste.com)
   ```

---

## 🐛 Diagnósticos Possíveis

### Caso 1: Status = "loading" (permanentemente)

**Sintoma:** Card mostra `Status: loading` e nunca muda

**Causa:** SessionProvider não está envolvendo o componente

**Verificação:**
```bash
# Verificar se SessionProvider está no layout
grep -r "SessionProvider" src/app/layout.tsx
```

**Solução:** Já está implementado em `layout.tsx`:
```typescript
<SessionProvider>
  <UserProvider>
    {children}
  </UserProvider>
</SessionProvider>
```

### Caso 2: Status = "unauthenticated"

**Sintoma:** Card mostra `Status: unauthenticated`

**Causa:** Sessão não foi criada ou expirou

**Solução:**
1. Fazer logout: `signOut()`
2. Limpar cookies do navegador
3. Fazer login novamente

### Caso 3: Session existe mas sem email/name

**Sintoma:** 
```
Session User:
  • Name: (não definido)
  • Email: (não definido)
```

**Causa:** JWT callback não está persistindo dados

**Verificação nos logs do console:**
```
🔐 JWT Callback - Account: ...
✅ JWT Callback - Token Final: { email: undefined, name: undefined }  ❌
```

**Solução:** Verificar se callbacks em `auth.ts` estão corretos

### Caso 4: useAuthUser retorna "Sistema"

**Sintoma:** 
```
useAuthUser() retorna:
  • Name: Sistema
  • Email: sistema@sgr.com
```

**Causa:** `session?.user` é `undefined` no hook

**Verificação:**
- Checar se `status === 'authenticated'`
- Checar se `session` não é `null`

---

## 📋 Checklist de Diagnóstico

Execute na ordem:

- [ ] 1. Reiniciar servidor (`npm run dev`)
- [ ] 2. Limpar cache do navegador (Ctrl+Shift+Delete)
- [ ] 3. Fazer login novamente
- [ ] 4. Abrir console (F12) e verificar logs
- [ ] 5. Verificar card de debug na página `/identification`
- [ ] 6. Anotar qual cenário se aplica (1, 2, 3 ou 4 acima)
- [ ] 7. Testar criar/editar registro e verificar auditoria

---

## 📊 Informações para Report

Se o problema persistir, forneça:

1. **Screenshot do card de debug** (na página `/identification`)
2. **Logs do console** (copiar todos que começam com 🔍, 🔐, 👤, ✅, ⚠️)
3. **Logs do servidor** (terminal onde roda `npm run dev`)
4. **Qual login foi usado** (Microsoft ou Teste)
5. **Navegador e versão** (Chrome 120, Edge 119, etc.)

---

## 🔄 Próximos Passos

Após diagnóstico:

### Se sessão estiver carregando corretamente:
- ✅ Remover logs de debug excessivos
- ✅ Remover SessionDebugCard da página
- ✅ Manter apenas logs críticos

### Se sessão NÃO estiver carregando:
- 🔧 Investigar SessionProvider no layout
- 🔧 Verificar conflitos com UserProvider
- 🔧 Testar com outro provider (Microsoft vs Credentials)
- 🔧 Verificar variáveis de ambiente (NEXTAUTH_SECRET, NEXTAUTH_URL)

---

## 📚 Arquivos Modificados

1. ✅ `src/hooks/use-auth.ts` - Logs de debug adicionados
2. ✅ `src/lib/auth.ts` - Logs nos callbacks JWT e Session
3. ✅ `src/components/auth/session-debug-card.tsx` - Componente de debug criado
4. ✅ `src/app/(app)/identification/page.tsx` - Debug card adicionado

---

**Status:** 🔍 **EM DIAGNÓSTICO**  
**Data:** 14/10/2025  
**Próximo Passo:** Testar e verificar logs no console + card de debug
