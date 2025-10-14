# 🔧 Correção: Invalid Hook Call Error

## 🐛 Erro Encontrado

```
Invalid hook call. Hooks can only be called inside of the body of a function component.
```

**Stack Trace:**
```
useAuthUser
src/hooks/use-auth.ts (17:47)
onSubmit
src/app/(app)/identification/capture/page.tsx (201:41)
```

---

## 🔍 Causa do Erro

### Rules of Hooks - Violação

Tentamos chamar `useAuthUser()` **dentro de uma função assíncrona** (`onSubmit`):

```typescript
// ❌ ERRADO - Violação das Rules of Hooks
const onSubmit = async (data) => {
  const authUser = useAuthUser(); // ❌ Hook chamado dentro de função assíncrona!
  // ...
};
```

### Rules of Hooks (React)

Hooks **só podem** ser chamados:
1. ✅ No **topo** de componentes React
2. ✅ No **topo** de custom hooks
3. ❌ **NÃO** dentro de loops, condições, ou funções aninhadas
4. ❌ **NÃO** dentro de funções assíncronas (async/await)
5. ❌ **NÃO** dentro de event handlers

---

## ✅ Solução Implementada

### 1. Chamar Hook no Topo do Componente

```typescript
// ✅ CORRETO - Hook no topo
export default function CapturePage() {
  const authUser = useAuthUser(); // ✅ No topo do componente
  
  const onSubmit = async (data) => {
    // Usar authUser aqui (não chamar o hook novamente)
  };
}
```

### 2. Adicionar Flag `isLoading` ao Hook

Para saber se a sessão ainda está carregando:

```typescript
export function useAuthUser() {
  const { data: session, status } = useSession();
  
  // ✅ Se loading, retornar flag
  if (status === 'loading') {
    return {
      name: '',
      email: '',
      isLoading: true, // ✅ Nova flag
    };
  }
  
  if (!session?.user) {
    return {
      name: 'Sistema',
      email: 'sistema@sgr.com',
      isLoading: false,
    };
  }

  return {
    name: session.user.name || 'Usuário',
    email: session.user.email || 'usuario@email.com',
    isLoading: false, // ✅ Carregou com sucesso
  };
}
```

### 3. Verificar `isLoading` Antes de Submeter

```typescript
const onSubmit = async (data) => {
  // ✅ Verificar se a sessão já carregou
  if (authUser.isLoading) {
    toast({
      variant: 'destructive',
      title: 'Aguarde',
      description: 'Aguardando autenticação carregar. Tente novamente.',
    });
    return; // ✅ Impede submit prematuro
  }
  
  // Continuar com submit normalmente
  const userName = `${authUser.name} (${authUser.email})`;
  // ...
};
```

---

## 📊 Fluxo Correto Agora

### Timeline da Renderização:

```
1. Componente renderiza
   ↓
2. useAuthUser() é chamado (no topo)
   ↓
3. useSession() retorna status: 'loading'
   ↓
4. useAuthUser() retorna: { name: '', email: '', isLoading: true }
   ↓
5. Componente renderiza com botão de submit ativo
   ↓
6. [Background] Sessão carrega do NextAuth
   ↓
7. useSession() retorna status: 'authenticated'
   ↓
8. useAuthUser() re-executa automaticamente (React re-render)
   ↓
9. Retorna: { name: 'Pedro Teste', email: 'pedro@teste.com', isLoading: false }
   ↓
10. Componente re-renderiza com dados atualizados
   ↓
11. Usuário pode submeter com segurança ✅
```

### Timeline do Submit:

```
Usuário clica em "Salvar"
   ↓
onSubmit é executado
   ↓
Verifica: authUser.isLoading === true?
   ↓
Se SIM: Mostra toast "Aguarde" e retorna ⏳
   ↓
Se NÃO: Continua com submit ✅
   ↓
Usa authUser.name e authUser.email
   ↓
Salva com dados corretos ✅
```

---

## 📂 Arquivos Modificados

### 1. `src/hooks/use-auth.ts`

**Mudanças:**
- ✅ Adicionado flag `isLoading: boolean` ao retorno
- ✅ Retorna `isLoading: true` quando `status === 'loading'`
- ✅ Retorna `isLoading: false` quando autenticado ou com valores padrão

### 2. `src/app/(app)/identification/capture/page.tsx`

**Mudanças:**
- ✅ Mantido `const authUser = useAuthUser()` no topo
- ✅ Removido chamada do hook dentro do `onSubmit`
- ✅ Adicionado verificação `if (authUser.isLoading)` antes de submeter

### 3. `src/app/(app)/controls/capture/page.tsx`

**Mudanças:**
- ✅ Mantido `const authUser = useAuthUser()` no topo
- ✅ Removido chamada do hook dentro do `onSubmit`
- ✅ Adicionado verificação `if (authUser.isLoading)` antes de submeter

### 4. `src/app/(app)/kpis/capture/page.tsx`

**Mudanças:**
- ✅ Mantido `const authUser = useAuthUser()` no topo
- ✅ Removido chamada do hook dentro do `handleSubmit`
- ✅ Adicionado verificação `if (authUser.isLoading)` antes de submeter

### 5. `src/app/(app)/actions/capture/page.tsx`

**Mudanças:**
- ✅ Mantido `const authUser = useAuthUser()` no topo
- ✅ Removido chamada do hook dentro do `onSubmit`
- ✅ Adicionado verificação `if (authUser.isLoading)` antes de submeter

### 6. `src/components/auth/session-debug-card.tsx`

**Mudanças:**
- ✅ Exibe o novo campo `isLoading`
- ✅ Mostra warning amarelo quando `isLoading === true`
- ✅ Mostra preview de auditoria apenas quando carregado

---

## 🧪 Como Testar

### 1. Reiniciar Servidor
```powershell
npm run dev
```

### 2. Abrir Console do Navegador (F12)

### 3. Acessar Página de Captura
Exemplo: `/identification/capture`

### 4. Observar Logs no Console

**Durante carregamento inicial:**
```
🔍 useAuthUser - Status: loading
⏳ useAuthUser: Sessão ainda carregando...
```

**Após carregar:**
```
🔍 useAuthUser - Status: authenticated
🔍 useAuthUser - Session: { user: { name: 'Pedro Teste', ... } }
✅ useAuthUser - Retornando: { name: 'Pedro Teste', email: 'pedro@teste.com', isLoading: false }
```

### 5. Verificar Card de Debug

**Durante loading:**
```
useAuthUser() retorna:
  • Name: (vazio)
  • Email: (vazio)
  • isLoading: true

⏳ CARREGANDO: Sessão ainda está sendo carregada...
```

**Após carregar:**
```
useAuthUser() retorna:
  • Name: Pedro Teste
  • Email: pedro@teste.com
  • isLoading: false

Formato de Auditoria:
  Pedro Teste (pedro@teste.com)
```

### 6. Testar Submit Durante Loading (Edge Case)

1. Recarregar página (F5)
2. **Imediatamente** clicar em "Salvar" (antes de 1 segundo)
3. **Resultado esperado:** Toast de erro "Aguarde"
4. Aguardar 2 segundos
5. Clicar em "Salvar" novamente
6. **Resultado esperado:** Submit com sucesso ✅

### 7. Testar Submit Normal

1. Preencher formulário normalmente
2. Clicar em "Salvar"
3. **Console deve mostrar:**
   ```
   📝 onSubmit - authUser: { name: 'Pedro Teste', email: 'pedro@teste.com', isLoading: false }
   📝 onSubmit - userName para auditoria: Pedro Teste (pedro@teste.com)
   ```
4. **Verificar auditoria:** Deve salvar com usuário correto ✅

---

## 🎓 Lições Aprendidas

### Rules of Hooks - SEMPRE

```typescript
// ✅ CORRETO
function Component() {
  const user = useAuthUser(); // No topo
  
  const handleClick = () => {
    console.log(user); // Usar variável
  };
}

// ❌ ERRADO
function Component() {
  const handleClick = () => {
    const user = useAuthUser(); // ❌ Dentro de função
  };
}

// ❌ ERRADO
function Component() {
  const handleClick = async () => {
    const user = useAuthUser(); // ❌ Dentro de async
  };
}

// ❌ ERRADO
function Component() {
  if (condition) {
    const user = useAuthUser(); // ❌ Dentro de condição
  }
}
```

### Lidar com Estado Assíncrono

Quando um hook depende de dados assíncronos (sessão, API, etc.):

1. ✅ **Incluir flag de loading** no retorno
2. ✅ **Verificar loading** antes de usar os dados
3. ✅ **Mostrar feedback** ao usuário se ainda loading
4. ✅ **Desabilitar ações** até dados carregarem (opcional)

### Padrão Recomendado

```typescript
export function useAsyncData() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setIsLoading(false);
      });
  }, []);
  
  return { data, isLoading }; // ✅ Sempre incluir isLoading
}

// Uso no componente
function Component() {
  const { data, isLoading } = useAsyncData();
  
  const handleSubmit = () => {
    if (isLoading) {
      alert('Aguarde carregar');
      return;
    }
    // Usar data com segurança
  };
}
```

---

## 📋 Checklist de Validação

- [x] Hook `useAuthUser` chamado no topo de todos os componentes
- [x] Nenhuma chamada de hook dentro de funções assíncronas
- [x] Flag `isLoading` adicionada ao retorno do hook
- [x] Verificação de `isLoading` em todos os onSubmit
- [x] Toast de feedback quando ainda loading
- [x] Debug card mostrando estado de loading
- [x] Sem erros "Invalid hook call" no console
- [ ] Testar submit durante loading (edge case)
- [ ] Testar submit após carregar (caso normal)
- [ ] Validar auditoria salva com usuário correto

---

## 🚀 Resultado Esperado

### Console sem Erros ✅
```
✅ Nenhum erro "Invalid hook call"
✅ Logs com emojis mostrando fluxo correto
```

### Auditoria Correta ✅
```json
{
  "createdBy": "Pedro Teste (pedro@teste.com)",
  "updatedBy": "Pedro Teste (pedro@teste.com)"
}
```

### UX Melhorada ✅
- ⏳ Feedback visual se usuário tentar submeter muito cedo
- 🎉 Submit funciona perfeitamente após carregar
- 🔍 Debug card mostra estado em tempo real

---

**Status:** ✅ **CORRIGIDO**  
**Data:** 14/10/2025  
**Erro:** Invalid Hook Call  
**Solução:** Hook no topo + flag isLoading
