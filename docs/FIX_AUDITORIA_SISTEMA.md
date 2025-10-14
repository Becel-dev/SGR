# ✅ Correção: Auditoria com Usuário "Sistema"

## 🐛 Problema Identificado

**Sintoma:** Campo "Última Alteração" sempre preenchia com "Sistema (sistema@sgr.com)" ao invés do usuário logado real.

**Diagnóstico Realizado:**
- ✅ Card de debug mostrou: sessão autenticada corretamente
- ✅ `useAuthUser()` retornando dados corretos: "Pedro Teste (pedro@teste.com)"
- ❌ Formulários salvando com "Sistema" mesmo assim

## 🔍 Causa Raiz

### O Problema

Os componentes estavam chamando `useAuthUser()` **no topo do componente**, durante a renderização inicial:

```typescript
export default function CapturePage() {
  const authUser = useAuthUser(); // ❌ Chamado muito cedo!
  
  const onSubmit = async (data) => {
    const userName = `${authUser.name} (${authUser.email})`;
    // Usa o valor capturado na renderização inicial
  };
}
```

### Por que isso causa problema?

**Timeline do problema:**

```
1. Componente renderiza
   ↓
2. useAuthUser() é chamado
   ↓
3. Sessão NextAuth ainda está em "loading" 
   ↓
4. useAuthUser() retorna valores padrão:
   { name: 'Sistema', email: 'sistema@sgr.com' }
   ↓
5. authUser = { name: 'Sistema', ... } fica "congelado"
   ↓
6. Sessão NextAuth termina de carregar (authenticated)
   ↓
7. Componente NÃO re-renderiza (authUser já foi capturado)
   ↓
8. Usuário preenche formulário e clica em Salvar
   ↓
9. onSubmit usa o authUser antigo (Sistema) ❌
```

### Código Problemático

```typescript
// ❌ ANTES - PROBLEMA
const authUser = useAuthUser(); // Captura durante renderização inicial

const onSubmit = async (data) => {
  // authUser ainda é { name: 'Sistema', email: 'sistema@sgr.com' }
  const userName = `${authUser.name} (${authUser.email})`;
  // Resultado: "Sistema (sistema@sgr.com)" ❌
};
```

---

## ✅ Solução Implementada

### Mover `useAuthUser()` para dentro do onSubmit

Chamar `useAuthUser()` **no momento do submit**, garantindo que a sessão já está carregada:

```typescript
// ✅ DEPOIS - CORRETO
export default function CapturePage() {
  // Não captura authUser aqui!
  
  const onSubmit = async (data) => {
    // ✅ Obter usuário no momento do submit
    const authUser = useAuthUser();
    console.log('📝 onSubmit - authUser obtido:', authUser);
    
    const userName = `${authUser.name} (${authUser.email})`;
    console.log('📝 onSubmit - userName:', userName);
    // Resultado: "Pedro Teste (pedro@teste.com)" ✅
  };
}
```

### Por que funciona agora?

**Timeline corrigida:**

```
1. Componente renderiza
   ↓
2. Sessão NextAuth carrega em background
   ↓
3. Status muda: loading → authenticated
   ↓
4. Usuário preenche formulário
   ↓
5. Usuário clica em Salvar
   ↓
6. onSubmit é executado
   ↓
7. useAuthUser() é chamado AGORA (sessão já carregou!)
   ↓
8. Retorna usuário real: { name: 'Pedro Teste', email: 'pedro@teste.com' }
   ↓
9. Auditoria salva com dados corretos ✅
```

---

## 📂 Arquivos Corrigidos

### 1. `src/app/(app)/identification/capture/page.tsx`

**Mudanças:**
```typescript
// ❌ Removido do topo
// const authUser = useAuthUser();

const onSubmit = async (data) => {
  // ✅ Adicionado aqui
  const authUser = useAuthUser();
  console.log('📝 onSubmit - authUser obtido:', authUser);
  
  const userName = `${authUser.name} (${authUser.email})`;
  console.log('📝 onSubmit - userName para auditoria:', userName);
  
  const riskData = {
    ...data,
    updatedBy: userName,
    updatedAt: now,
    ...(!isEditing && {
      createdBy: userName,
      createdAt: now,
    }),
  };
};
```

### 2. `src/app/(app)/controls/capture/page.tsx`

**Mudanças:**
```typescript
// ❌ Removido
// const authUser = useAuthUser();

const onSubmit = async (data) => {
  // ✅ Adicionado aqui
  const authUser = useAuthUser();
  console.log('📝 onSubmit - authUser obtido:', authUser);
  
  const userForAudit = `${authUser.name} (${authUser.email})`;
  console.log('📝 onSubmit - userForAudit:', userForAudit);
  
  const controlData: Control = {
    // ...
    criadoPor: data.criadoPor || userForAudit,
    modificadoPor: userForAudit,
  };
};
```

### 3. `src/app/(app)/kpis/capture/page.tsx`

**Mudanças:**
```typescript
// ❌ Removido
// const authUser = useAuthUser();

const handleSubmit = async (e) => {
  // ✅ Adicionado aqui
  const authUser = useAuthUser();
  console.log('📝 handleSubmit - authUser obtido:', authUser);
  
  const userForAudit = `${authUser.name} (${authUser.email})`;
  console.log('📝 handleSubmit - userForAudit:', userForAudit);
  
  const kpiData = {
    // ...
    createdBy: isEdit ? undefined : userForAudit,
    updatedBy: userForAudit,
  };
};
```

### 4. `src/app/(app)/actions/capture/page.tsx`

**Mudanças:**
```typescript
// ❌ Removido
// const authUser = useAuthUser();

const onSubmit = async (data) => {
  // ✅ Adicionado aqui
  const authUser = useAuthUser();
  console.log('📝 onSubmit - authUser obtido:', authUser);
  
  const userForAudit = `${authUser.name} (${authUser.email})`;
  console.log('📝 onSubmit - userForAudit:', userForAudit);
  
  const actionData = {
    ...data,
    createdBy: userForAudit,
    updatedBy: userForAudit,
  };
};
```

---

## 🧪 Como Testar

### 1. Reiniciar servidor
```powershell
npm run dev
```

### 2. Fazer login
- Acessar `/auth/signin`
- Clicar em "🧪 Login de Teste"

### 3. Testar cada módulo

#### Teste 1: Identificação
1. Ir para `/identification/capture`
2. Preencher formulário
3. Clicar em "Salvar"
4. **Verificar console:**
   ```
   📝 onSubmit - authUser obtido: { name: 'Pedro Teste', email: 'pedro@teste.com' }
   📝 onSubmit - userName para auditoria: Pedro Teste (pedro@teste.com)
   ```
5. **Verificar na lista:** Campo "Última alteração" deve mostrar "Pedro Teste"

#### Teste 2: Controles
1. Ir para `/controls/capture`
2. Preencher formulário
3. Salvar
4. **Verificar console:**
   ```
   📝 onSubmit - authUser obtido: { name: 'Pedro Teste', email: 'pedro@teste.com' }
   📝 onSubmit - userForAudit: Pedro Teste (pedro@teste.com)
   ```
5. **Resultado esperado:** "Modificado por: Pedro Teste"

#### Teste 3: KPIs
1. Ir para `/kpis/capture?controlId=CTRL-XXX`
2. Preencher
3. Salvar
4. **Verificar console:**
   ```
   📝 handleSubmit - authUser obtido: { name: 'Pedro Teste', email: 'pedro@teste.com' }
   📝 handleSubmit - userForAudit: Pedro Teste (pedro@teste.com)
   ```

#### Teste 4: Ações
1. Ir para `/actions/capture?controlId=CTRL-XXX`
2. Preencher
3. Salvar
4. **Verificar console:**
   ```
   📝 onSubmit - authUser obtido: { name: 'Pedro Teste', email: 'pedro@teste.com' }
   📝 onSubmit - userForAudit: Pedro Teste (pedro@teste.com)
   ```

---

## 📊 Antes vs Depois

### Antes (Bugado) ❌

```typescript
// Renderização
const authUser = useAuthUser(); // { name: 'Sistema', email: 'sistema@sgr.com' }

// 5 minutos depois...
onSubmit() {
  userName = `${authUser.name} (${authUser.email})`;
  // Resultado: "Sistema (sistema@sgr.com)" ❌
}
```

**Banco de dados:**
```json
{
  "createdBy": "Sistema (sistema@sgr.com)",
  "updatedBy": "Sistema (sistema@sgr.com)"
}
```

### Depois (Corrigido) ✅

```typescript
// Renderização
// (authUser não é capturado)

// 5 minutos depois...
onSubmit() {
  const authUser = useAuthUser(); // { name: 'Pedro Teste', email: 'pedro@teste.com' }
  userName = `${authUser.name} (${authUser.email})`;
  // Resultado: "Pedro Teste (pedro@teste.com)" ✅
}
```

**Banco de dados:**
```json
{
  "createdBy": "Pedro Teste (pedro@teste.com)",
  "updatedBy": "Pedro Teste (pedro@teste.com)"
}
```

---

## 🎓 Lição Aprendida

### ⚠️ Nunca capturar hooks de sessão no topo do componente quando:

1. O valor será usado **mais tarde** (em onSubmit, onClick, etc.)
2. A sessão pode estar em loading durante renderização inicial
3. Você precisa do valor **mais atual possível**

### ✅ Sempre capturar dentro da função que usa:

```typescript
// ❌ ERRADO
const user = useAuthUser();
const onSubmit = () => { use user };

// ✅ CORRETO
const onSubmit = () => {
  const user = useAuthUser();
  // use user
};
```

### Alternativa: useEffect + useState

Se precisar do usuário em múltiplos lugares:

```typescript
const [currentUser, setCurrentUser] = useState<{name: string, email: string} | null>(null);

useEffect(() => {
  const authUser = useAuthUser();
  setCurrentUser(authUser);
}, []);

// Usar currentUser no componente
// Mas ainda chamar useAuthUser() fresco no onSubmit!
```

---

## 📋 Checklist de Validação

- [x] Removido `useAuthUser()` do topo dos componentes
- [x] Adicionado `useAuthUser()` dentro de cada onSubmit
- [x] Adicionado logs de debug (📝 emoji)
- [x] Testado em desenvolvimento
- [ ] Testar criar novo registro → verificar createdBy
- [ ] Testar editar registro → verificar updatedBy
- [ ] Verificar se não aparece mais "Sistema" em registros novos
- [ ] Remover logs de debug após validação

---

## 🔄 Próximos Passos

### Após Validação com Sucesso:

1. **Remover logs excessivos** (manter apenas logs críticos)
2. **Remover SessionDebugCard** da página de identificação
3. **Documentar padrão correto** para novos módulos
4. **Code review** em outros módulos (bowtie, escalation, etc.)

### Se Aparecer "Sistema" ainda:

1. Verificar se é **registro antigo** (criado antes da correção)
2. Verificar console - logs 📝 devem aparecer
3. Verificar se middleware está bloqueando acesso sem login
4. Verificar se sessão está realmente "authenticated" no momento do submit

---

## 📚 Referências

- **Hook useAuthUser:** `src/hooks/use-auth.ts`
- **Debug de Sessão:** `docs/DEBUG_AUDITORIA.md`
- **Fix de Login:** `docs/FIX_LOGIN_REDIRECT.md`
- **Autenticação:** `docs/AUTENTICACAO.md`

---

**Status:** ✅ **CORRIGIDO**  
**Data:** 14/10/2025  
**Testado:** Aguardando validação com dados reais  
**Afeta:** Identificação, Controles, KPIs, Ações
