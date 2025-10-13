# 🔍 Guia de Debug - Auto-Preenchimento de Hierarquia

## 🐛 Problema Reportado
"Não completou automaticamente os campos"

## ✅ Correções Implementadas

### 1. **Carregamento Síncrono dos Controles**
**Problema:** A função `autoFillHierarchy` estava sendo chamada ANTES dos controles serem carregados, resultando em `controls.find()` retornando `undefined`.

**Solução:** 
- Carrega os controles PRIMEIRO dentro do `useEffect`
- Passa o controle diretamente como objeto para a função
- Renomeada função: `autoFillHierarchyWithControl(control: Control)`

```typescript
// ANTES (❌ Não funcionava)
await loadControls();
await autoFillHierarchy(controlId); // controls ainda vazio!

// AGORA (✅ Funciona)
const loadedControls = await fetch('/api/controls').then(r => r.json());
setControls(loadedControls);
const control = loadedControls.find(c => c.id === controlId);
await autoFillHierarchyWithControl(control);
```

### 2. **Logs Detalhados de Debug**
Adicionados console.logs em cada etapa para facilitar debug:

```typescript
✅ Controles carregados: X
🔄 Iniciando auto-preenchimento de hierarquia...
🔍 autoFillHierarchyWithControl iniciado
📋 Controle: {...}
📧 Email do dono (bruto): "Nome (email@dominio.com)"
📧 Email extraído para busca: "email@dominio.com"
🌐 Fazendo requisição para /api/users/manager...
📥 Resposta N1 status: 200
📊 Dados N1 recebidos: {...}
✏️ Preenchendo N1 com: "Nome (email)"
✅ pctLevel1 atualizado: {...}
✅ daysLevel1 atualizado: {...}
🏁 Finalizando auto-preenchimento
```

### 3. **Mensagens Toast Informativas**
Adicionados feedbacks visuais para o usuário:

- ✅ **Sucesso:** "Hierarquia de supervisores carregada do Azure AD"
- ⚠️ **Aviso:** "O controle não possui email do dono configurado"
- ⚠️ **Aviso:** "O dono não possui superior imediato no Azure AD"
- ❌ **Erro:** "Erro ao buscar hierarquia de supervisores"

---

## 🧪 Como Testar

### Passo 1: Abrir Console do Navegador
**Chrome/Edge:** F12 → Aba "Console"

### Passo 2: Acessar Módulo de Escalonamento
1. Ir para: **Escalonamento**
2. Clicar em **"Configurar"** em um controle

### Passo 3: Observar Logs no Console

#### ✅ Cenário de Sucesso (Esperado)
```
✅ Controles carregados: 15
🔄 Iniciando auto-preenchimento de hierarquia...
🔍 autoFillHierarchyWithControl iniciado
📋 Controle: {id: "CTRL-001", nomeControle: "...", emailDono: "João (joao@empresa.com)"}
📧 Email do dono (bruto): João (joao@empresa.com)
📧 Email extraído para busca: joao@empresa.com
🌐 Fazendo requisição para /api/users/manager...
📥 Resposta N1 status: 200
📊 Dados N1 recebidos: {id: "...", name: "Maria Silva", email: "maria@empresa.com"}
✏️ Preenchendo N1 com: Maria Silva (maria@empresa.com)
✅ pctLevel1 atualizado: {threshold: 0, supervisor: "Maria Silva (maria@empresa.com)", supervisorEmail: "maria@empresa.com"}
✅ daysLevel1 atualizado: {threshold: 0, supervisor: "Maria Silva (maria@empresa.com)", supervisorEmail: "maria@empresa.com"}
... (N2 e N3 se houver)
✅ Hierarquia de supervisores preenchida automaticamente
🏁 Finalizando auto-preenchimento
```

**Toast Exibido:** ✅ "Hierarquia de supervisores carregada do Azure AD"

---

#### ⚠️ Cenário 1: Controle Sem Email
```
✅ Controles carregados: 15
🔄 Iniciando auto-preenchimento de hierarquia...
⚠️ Controle sem email do dono configurado
```

**Toast Exibido:** ⚠️ "O controle selecionado não possui email do dono configurado"

**Solução:** Edite o controle e adicione o email do dono usando UserAutocomplete.

---

#### ⚠️ Cenário 2: Usuário Sem Gerente no Azure AD
```
✅ Controles carregados: 15
🔄 Iniciando auto-preenchimento de hierarquia...
🔍 autoFillHierarchyWithControl iniciado
📧 Email extraído para busca: joao@empresa.com
🌐 Fazendo requisição para /api/users/manager...
📥 Resposta N1 status: 200
📊 Dados N1 recebidos: {manager: null}
⚠️ Dono do controle não possui superior imediato configurado no Azure AD
```

**Toast Exibido:** ⚠️ "O dono do controle não possui superior imediato configurado no Azure AD"

**Solução:** Configure o gerente (manager) do usuário no Azure AD.

---

#### ❌ Cenário 3: Usuário Não Encontrado no Azure AD
```
✅ Controles carregados: 15
🔄 Iniciando auto-preenchimento de hierarquia...
🔍 autoFillHierarchyWithControl iniciado
📧 Email extraído para busca: joao@empresa.com
🌐 Fazendo requisição para /api/users/manager...
📥 Resposta N1 status: 404
❌ Erro ao buscar N1: {"error":"Usuário não encontrado"}
```

**Toast Exibido:** ⚠️ "Não foi possível buscar o superior imediato no Azure AD"

**Solução:** Verifique se o email está correto e se o usuário existe no Azure AD.

---

#### ❌ Cenário 4: Erro de Permissões
```
✅ Controles carregados: 15
🔄 Iniciando auto-preenchimento de hierarquia...
🔍 autoFillHierarchyWithControl iniciado
📧 Email extraído para busca: joao@empresa.com
🌐 Fazendo requisição para /api/users/manager...
📥 Resposta N1 status: 401
❌ Erro ao buscar N1: {"error":"Token inválido"}
```

**Toast Exibido:** ⚠️ "Não foi possível buscar o superior imediato no Azure AD"

**Solução:** Verifique as permissões no Azure AD:
- `User.Read.All` (Application)
- `Directory.Read.All` (Application)
- Admin consent concedido

---

## 🔧 Troubleshooting

### Problema: Logs não aparecem
**Causa:** Console do navegador não está aberto ou filtros ativos  
**Solução:** Abra F12 e remova filtros no console

---

### Problema: "Controles carregados: 0"
**Causa:** API `/api/controls` não retornou dados  
**Solução:** 
1. Verificar se há controles cadastrados
2. Verificar logs do servidor
3. Testar endpoint: `/api/controls` diretamente

---

### Problema: "Controle sem email do dono configurado"
**Causa:** Campo `emailDono` vazio no controle  
**Solução:** 
1. Ir em **Controles → Editar**
2. Preencher campo "Dono do Controle" com UserAutocomplete
3. Salvar

---

### Problema: Status 404 na busca de gerente
**Causa:** Usuário não existe no Azure AD  
**Solução:**
1. Verificar se o email está correto
2. Verificar se usuário está ativo no Azure AD
3. Testar busca manual: `/api/users/search?q=email`

---

### Problema: Campos não são preenchidos visualmente
**Causa:** Estado atualizado mas UI não re-renderiza  
**Solução:** 
1. Verificar logs: "✅ pctLevel1 atualizado"
2. Se logs aparecem mas UI não muda, pode ser problema de React
3. Recarregar a página (Ctrl+F5)

---

## 📋 Checklist de Verificação

Antes de reportar um problema, verifique:

- [ ] Console do navegador está aberto (F12)
- [ ] Logs de "Controles carregados" aparecem
- [ ] Controle tem `emailDono` configurado
- [ ] Email do dono está no formato correto
- [ ] Usuário existe no Azure AD
- [ ] Usuário tem gerente configurado no Azure AD
- [ ] Permissões do Azure AD estão corretas
- [ ] Toast de sucesso ou erro é exibido

---

## 📊 Fluxo Completo (Diagrama)

```
1. Clicar em "Configurar"
   ↓
2. [Tela Loading] "Carregando dados..."
   ↓
3. Carregar controles da API
   ↓
4. Extrair controlId da URL
   ↓
5. Buscar controle nos dados carregados
   ↓
6. [Tela Loading] "Buscando hierarquia..."
   ↓
7. Extrair email do dono
   ↓
8. Buscar N1 (/api/users/manager)
   ↓
9. Preencher campos N1
   ↓
10. Buscar N2 (usando email do N1)
    ↓
11. Preencher campos N2
    ↓
12. Buscar N3 (usando email do N2)
    ↓
13. Preencher campos N3
    ↓
14. [Tela Principal] Campos preenchidos!
    ↓
15. Toast de sucesso exibido
```

---

## 🎯 O Que Observar

### Console do Navegador
- ✅ Todos os emojis dos logs (🔍 📧 ✅ etc)
- ✅ Status HTTP das requisições (200, 404, etc)
- ✅ Dados retornados da API
- ❌ Erros em vermelho

### Interface
- ✅ Tela de loading inicial aparece
- ✅ Campos de supervisor ficam verdes após preencher
- ✅ Badges "Superior imediato do dono" aparecem
- ✅ Mensagem de sucesso/erro em toast

---

## 📞 Se Ainda Não Funcionar

**Compartilhe:**
1. Screenshot do console completo
2. Screenshot da tela de escalonamento
3. ID do controle sendo configurado
4. Email do dono do controle
5. Toast exibido (se houver)

**Informações úteis:**
- Status HTTP das requisições
- Mensagem de erro específica
- Momento em que o processo para

---

**Atualizado:** 13 de outubro de 2025  
**Versão:** 2.1 (Com debug detalhado)
