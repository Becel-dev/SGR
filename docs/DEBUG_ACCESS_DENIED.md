# 🔍 DEBUG: Acesso Negado na Página Inicial

**Data:** 14/10/2025  
**Problema:** Ana cai em página de "Acesso Negado" mesmo tendo permissões
**Causa:** Race condition entre carregamento de permissões e redirecionamento

---

## 🐛 Problema Identificado

### **Fluxo com Bug:**

```
1. Login com Ana → Redirect para "/"
   ↓
2. src/app/page.tsx → router.replace('/identification')
   ↓
3. /identification carrega com <ProtectedRoute>
   ↓
4. ProtectedRoute verifica permissões (loading = true)
   ↓
5. usePermission busca:
   - /api/access-control?userId=ana@teste.com (demora ~100ms)
   - /api/access-profiles/mock-profile-admin-full (demora ~50ms)
   ↓
6. Durante esse tempo (150ms total):
   - loading = true
   - allowed = false (ainda não carregou)
   ↓
7. ❌ useEffect em ProtectedRoute vê:
   - loading = false (começou como false)
   - allowed = false (ainda não atualizou)
   - Redireciona IMEDIATAMENTE para /access-denied
   ↓
8. ANTES das permissões carregarem completamente
```

### **Por que acontecia:**

1. **Estado inicial do hook:**
   ```typescript
   const [loading, setLoading] = useState(true);  // Começa true
   const [allowed, setAllowed] = useState(false); // Começa false
   ```

2. **Mas no primeiro render:**
   - Hook retorna `{ loading: true, allowed: false }`
   - ProtectedRoute vê isso

3. **No segundo render (após useEffect):**
   - Hook começa a buscar permissões
   - `setLoading(true)` é chamado
   - Mas já pode ter acontecido um redirect

4. **Race condition:**
   - Se o redirect acontecer ANTES do loading virar true
   - Usuário é bloqueado incorretamente

---

## ✅ Solução Implementada

### **1. Logs Detalhados**

**Em `usePermission`:**
```typescript
console.log('🔐 usePermission: Carregando permissões para', user.email);
console.log('🔐 usePermission: Buscando access control...');
console.log('🔐 usePermission: Access control recebido:', data);
console.log('🔐 usePermission: Buscando perfil', profileId);
console.log('✅ usePermission: Perfil carregado:', profile.name);
```

**Em `ProtectedRoute`:**
```typescript
console.log(`⏳ ProtectedRoute: Verificando permissões para ${module}.${action}...`);
console.log(`✅ ProtectedRoute: Permissão concedida para ${module}.${action}`);
console.log(`🚫 ProtectedRoute: Sem permissão para ${module}.${action}`);
```

### **2. Loading State Garantido**

```typescript
// No início do useEffect, garante que loading = true
console.log('🔐 usePermission: Carregando permissões para', user.email);
setLoading(true);  // ← Força loading = true IMEDIATAMENTE
```

### **3. Condições de Redirecionamento Explícitas**

```typescript
// Só redireciona se:
// 1. NÃO estiver carregando (loading = false)
// 2. NÃO tiver permissão (allowed = false)
// 3. redirectOnDenied estiver habilitado
if (!loading && !allowed && redirectOnDenied) {
  console.log('🚫 Redirecionando...');
  router.push('/access-denied');
}
```

---

## 🧪 Como Testar

### **1. Abrir Console (F12)**

Após login, você deve ver esta sequência:

```
✅ SEQUÊNCIA CORRETA:
🔐 usePermission: Carregando permissões para ana@teste.com
⏳ ProtectedRoute: Verificando permissões para identificacao.view...
⏳ ProtectedRoute render: Loading (identificacao.view)
🔍 Buscando controle de acesso para usuário: ana@teste.com
🧪 Usando dados mock para usuário de teste: ana@teste.com
🔐 usePermission: Access control recebido: { accessControl: {...} }
🔐 usePermission: Buscando perfil mock-profile-admin-full
🔍 Buscando perfil de acesso: mock-profile-admin-full
🧪 Usando perfil mock: mock-profile-admin-full
✅ usePermission: Perfil carregado: Super Administrador (Mock)
✅ ProtectedRoute: Permissão concedida para identificacao.view
✅ ProtectedRoute render: Renderizando conteúdo (identificacao.view)
```

```
❌ SEQUÊNCIA COM BUG (antes da correção):
⏳ ProtectedRoute: Verificando permissões para identificacao.view...
🚫 ProtectedRoute: Sem permissão para identificacao.view, redirecionando...
(redirecionou ANTES de carregar permissões)
```

### **2. Reiniciar o Servidor**

```powershell
# OBRIGATÓRIO para aplicar as mudanças:
Ctrl+C
npm run dev
```

### **3. Limpar Cache e Fazer Login**

```
1. Ctrl+Shift+R (limpar cache)
2. Logout se estiver logado
3. Login: ana@teste.com
4. Observar console (F12)
```

### **4. Validar Resultado**

**Esperado:**
- ✅ Login bem-sucedido
- ✅ Carrega página /identification
- ✅ Mostra loading skeleton por ~150ms
- ✅ Depois mostra conteúdo da página
- ✅ Console mostra sequência correta
- ✅ **NÃO** redireciona para /access-denied

---

## 🔍 Diagnóstico de Problemas

### **Problema: Ainda cai em acesso negado**

**Verificar no console:**

1. **Se aparece `🧪 Usando dados mock`:**
   - ✅ Mocks funcionando
   - Problema é no hook ou ProtectedRoute

2. **Se NÃO aparece `🧪`:**
   - ❌ Mocks não estão funcionando
   - Verificar se servidor reiniciou
   - Verificar se `NODE_ENV !== 'production'`

3. **Se aparece `🚫 Sem permissão` ANTES de `✅ Perfil carregado`:**
   - ❌ Race condition ainda existe
   - Verificar se código foi salvo corretamente
   - Verificar se servidor recarregou

### **Logs Esperados vs Reais**

**Esperado (ordem):**
1. 🔐 Carregando permissões
2. ⏳ Verificando permissões
3. 🔍 Buscando controle de acesso
4. 🧪 Usando dados mock (access control)
5. 🔐 Access control recebido
6. 🔐 Buscando perfil
7. 🔍 Buscando perfil de acesso
8. 🧪 Usando perfil mock
9. ✅ Perfil carregado
10. ✅ Permissão concedida
11. ✅ Renderizando conteúdo

**Se aparecer 🚫 em qualquer momento ANTES do passo 10:**
- ❌ Há um problema

---

## 📊 Arquivos Modificados

| Arquivo | Mudança | Motivo |
|---------|---------|--------|
| `src/hooks/use-permission.ts` | Adicionado logs + `setLoading(true)` explícito | Garantir loading state + debug |
| `src/components/auth/protected-route.tsx` | Adicionado logs + condições explícitas | Debug + melhor controle de redirecionamento |

---

## 🎯 Checklist de Validação

Após reiniciar servidor:

**Ana:**
- [ ] Login bem-sucedido
- [ ] Console mostra sequência correta (veja acima)
- [ ] Página /identification carrega
- [ ] Loading skeleton aparece brevemente
- [ ] Conteúdo da página aparece
- [ ] **NÃO** redireciona para /access-denied
- [ ] Botões habilitados

**Maria:**
- [ ] Login bem-sucedido
- [ ] Página carrega (não bloqueia)
- [ ] Botões desabilitados com tooltip
- [ ] Console mostra permissões carregadas

---

## 🚀 Ação Imediata

```powershell
# 1. PARAR servidor
Ctrl+C

# 2. INICIAR servidor
npm run dev

# 3. LIMPAR cache navegador
Ctrl+Shift+R

# 4. FAZER login com Ana
# Deve carregar /identification corretamente

# 5. ABRIR console (F12)
# Verificar sequência de logs
```

---

## 💡 Entendendo o Problema

### **Antes:**
```
Login → "/" → "/identification"
           ↓
      ProtectedRoute (loading = true inicialmente)
           ↓
      useEffect verifica: loading = false? allowed = false?
           ↓
      ❌ Pode redirecionar ANTES de carregar permissões
```

### **Depois:**
```
Login → "/" → "/identification"
           ↓
      ProtectedRoute (loading = true inicialmente)
           ↓
      usePermission: setLoading(true) EXPLICITAMENTE
           ↓
      Busca permissões (150ms)
           ↓
      setLoading(false) + setUserProfile(...)
           ↓
      useEffect verifica: loading = false? allowed = true?
           ↓
      ✅ Renderiza conteúdo (não redireciona)
```

---

## 📚 Documentação Relacionada

- `MOCK_PROFILES_SOLUTION.md` - Como os mocks funcionam
- `TROUBLESHOOTING_RUNTIME_ERROR.md` - Outros problemas resolvidos
- `TESTING_GUIDE.md` - Guia completo de testes

---

## ✅ Status Esperado

Após reiniciar e testar:

```
✅ Ana faz login
✅ Redireciona para /identification
✅ Loading skeleton (150ms)
✅ Página carrega corretamente
✅ Botões habilitados
✅ Console mostra sequência correta
✅ NÃO redireciona para /access-denied
```

---

**Última atualização:** 14/10/2025  
**Versão:** 3.2 (Debug logs + race condition fix)  
**Status:** ✅ Correções aplicadas, aguardando teste
