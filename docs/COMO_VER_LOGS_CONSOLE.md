# 🔍 Como Ver os Logs de Debug no Console

**Data:** 14/10/2025  
**Problema:** Console não mostra os logs com emojis 🔐 ⏳ ✅ 🚫

---

## ✅ PASSO 1: Configurar Filtro do Console

No Console do Chrome (F12):

1. **Clique no dropdown "Default levels"** (ao lado de "No Issues")
2. **Marque todas as opções:**
   - ✅ Verbose
   - ✅ Info
   - ✅ Warnings
   - ✅ Errors

3. **Na caixa de filtro** (🔍 Filter), **LIMPE** qualquer filtro
   - Deve estar vazio ou apenas mostrar "riskFactor"
   - Se houver algo, apague

4. **Clique no ícone de configuração** (⚙️ Settings no console)
   - Verifique se **"Log XMLHttpRequests"** está MARCADO
   - Verifique se **"Preserve log"** está MARCADO (para não perder logs ao navegar)

---

## 🔄 PASSO 2: Reiniciar Servidor (GARANTIR LOGS)

**No terminal do VS Code:**

```powershell
# 1. Parar o servidor (Ctrl+C)
Ctrl+C

# 2. Limpar cache do Next.js
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# 3. Iniciar novamente
npm run dev

# 4. Aguardar até ver:
# ✓ Ready in 2s
# ○ Compiling / ...
```

**Aguarde até o servidor estar COMPLETAMENTE pronto** antes de recarregar o navegador.

---

## 🌐 PASSO 3: Recarregar Página Corretamente

**No navegador:**

```
1. Limpar console (🚫 Clear console)
2. HARD RELOAD: Ctrl+Shift+R (ou Ctrl+F5)
   - Isso ignora cache e recarrega tudo
3. Fazer login com Ana
4. Tentar acessar "Identificação de Risco"
```

---

## 📊 O QUE VOCÊ DEVE VER

### **Console Durante Login:**

```
🔐 usePermission: Carregando permissões para ana@teste.com
⏳ ProtectedRoute: Verificando permissões para identificacao.view...
🔍 Buscando controle de acesso para usuário: ana@teste.com
🧪 Usando dados mock para usuário de teste: ana@teste.com
🔐 usePermission: Access control recebido: {id: "mock-ac-ana", ...}
🔐 usePermission: Buscando perfil mock-profile-admin-full
🧪 Usando perfil mock: mock-profile-admin-full
✅ usePermission: Perfil carregado: Super Administrador (Mock)
✅ ProtectedRoute: Permissão concedida para identificacao.view
```

### **OU Se Race Condition:**

```
⏳ ProtectedRoute: Verificando permissões para identificacao.view...
🚫 ProtectedRoute: Sem permissão, redirecionando para /access-denied
(e NÃO aparece os logs de carregamento depois)
```

---

## 🎯 SE AINDA NÃO APARECER LOGS

### **Verificar se os logs estão no código:**

**Arquivo:** `src/hooks/use-permission.ts`

Deve ter estas linhas:
```typescript
console.log('🔐 usePermission: Carregando permissões para', user.email);
console.log('🔐 usePermission: Buscando access control...');
// ... mais logs
```

**Arquivo:** `src/components/auth/protected-route.tsx`

Deve ter estas linhas:
```typescript
console.log(`⏳ ProtectedRoute: Verificando permissões para ${module}.${action}...`);
console.log(`✅ ProtectedRoute: Permissão concedida para ${module}.${action}`);
// ... mais logs
```

**Se NÃO tiver esses logs, me avise que vou adicionar novamente.**

---

## 🚨 SOLUÇÃO ALTERNATIVA: Network Tab

Se os console.logs não aparecerem, use a aba **Network**:

```
1. Abrir DevTools (F12)
2. Ir para aba "Network"
3. Marcar "Preserve log"
4. Limpar (🚫 Clear)
5. Fazer login com Ana
6. Tentar acessar Identificação

7. Procurar por:
   - Requisição: GET /api/access-control?userId=ana@teste.com
   - Requisição: GET /api/access-profiles/mock-profile-admin-full

8. Clicar em cada requisição e ver a aba "Response"
   - Deve mostrar os dados mock
```

Se as requisições **NÃO aparecerem**, significa que o hook nem está sendo executado.

---

## ⚡ AÇÃO IMEDIATA

**Faça nesta ordem:**

1. ✅ **Reiniciar servidor** (Ctrl+C → Remove .next → npm run dev)
2. ✅ **Configurar console** (Default levels → All, Filter vazio)
3. ✅ **Hard reload** (Ctrl+Shift+R)
4. ✅ **Login Ana** → Ir para Identificação
5. ✅ **Copiar TODOS os logs** (clique direito no console → Save as...)

---

## 📸 OU ENVIE SCREENSHOTS

Se preferir, tire screenshots de:

1. **Console Tab** (com todos os logs visíveis)
2. **Network Tab** (mostrando requisições /api/access-control e /api/access-profiles)
3. **Página de erro** (Acesso Negado)

---

## 🎯 OBJETIVO

Precisamos ver **POR QUE** o ProtectedRoute está redirecionando, mesmo com permissões corretas.

**Possibilidades:**

1. **Race condition:** Redireciona antes de carregar
2. **API não está retornando dados:** Requisições falham silenciosamente
3. **Hook não executa:** usePermission não é chamado
4. **Cache do navegador:** Está usando código antigo

Os logs vão mostrar qual é o problema real.
