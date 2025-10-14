# 🧪 GUIA DE TESTE COMPLETO - PROTEÇÃO ACL

**Usuário de Teste:** maria@teste.com (Visualizadora)  
**Senha:** 123456  
**Objetivo:** Verificar que Maria NÃO consegue realizar ações não autorizadas

---

## 📋 CHECKLIST DE TESTES

### ✅ TESTE 1: Acesso Direto às URLs (CRÍTICO)

**O que testar:** Maria tentando acessar diretamente URLs protegidas via barra de endereços.

**Passos:**
1. Faça login como `maria@teste.com`
2. Cole cada URL abaixo **diretamente na barra de endereços**:

```
❌ http://localhost:3000/kpis/capture
❌ http://localhost:3000/actions/capture
❌ http://localhost:3000/administration/access-profiles
❌ http://localhost:3000/administration/access-profiles/capture
❌ http://localhost:3000/administration/access-control
❌ http://localhost:3000/administration/access-control/capture
❌ http://localhost:3000/administration/parameters
❌ http://localhost:3000/identification/capture
❌ http://localhost:3000/controls/capture
❌ http://localhost:3000/analysis/risks/capture
```

**Resultado Esperado:**
- ✅ TODAS as URLs acima devem mostrar a tela: **"Acesso Negado"**
- ✅ Mensagem: "Você não tem permissão para acessar esta página"
- ✅ Botão "Voltar" presente

**Se der errado:**
- ❌ Se Maria conseguir ver alguma dessas páginas → **VULNERABILIDADE**
- ❌ Se aparecer erro 404 → **URL incorreta, verificar rota**
- ❌ Se aparecer tela de loading infinito → **Race condition, reportar**

---

### ✅ TESTE 2: Botões no Módulo KPIs

**O que testar:** Todos os botões interativos devem estar desabilitados.

**Passos:**
1. Login como `maria@teste.com`
2. Acesse: `http://localhost:3000/kpis`

**Verificações:**

#### 2.1 - Botões na Tabela
```
Estado dos Botões:
- [ ] Botão "Anexar" → DESABILITADO/CINZA (não clicável)
- [ ] Botão "Ver" → HABILITADO (Maria pode ver detalhes)
- [ ] Botão "Excluir" (🗑️) → DESABILITADO/CINZA
```

#### 2.2 - Página de Detalhes
3. Clique no botão "Ver" de algum KPI
4. Você deve ser redirecionado para `/kpis/[id]`

```
Estado dos Botões:
- [ ] Botão "Excluir" (vermelho) → DESABILITADO
- [ ] Botão "Adicionar Responsável" → DESABILITADO
- [ ] Botão "X" ao lado de responsáveis → DESABILITADO
- [ ] Botão "Voltar" → HABILITADO (sempre permitido)
```

**Resultado Esperado:**
- ✅ Maria pode VER listas e detalhes
- ✅ Todos os botões de EDIÇÃO/EXCLUSÃO aparecem DESABILITADOS (cinza, cursor "not-allowed")
- ✅ Clicar em botão desabilitado NÃO faz nada

---

### ✅ TESTE 3: Botões no Módulo Actions

**Passos:**
1. Login como `maria@teste.com`
2. Acesse: `http://localhost:3000/actions`

**Verificações:**

#### 3.1 - Tabela de Ações
```
Estado dos Botões:
- [ ] Botão "Ver" → HABILITADO (Maria pode visualizar)
```

#### 3.2 - Página de Detalhes
3. Clique em "Ver" de alguma ação
4. Acesse `/actions/[id]`

```
Estado dos Botões:
- [ ] Upload de evidência → DESABILITADO (área de upload deve estar cinza/bloqueada)
- [ ] Botão "Download" de evidências → HABILITADO (Maria pode baixar)
```

**Resultado Esperado:**
- ✅ Maria pode baixar evidências existentes
- ✅ Maria NÃO pode fazer upload de novas evidências

---

### ✅ TESTE 4: Módulo Bowtie

**Passos:**
1. Login como `maria@teste.com`
2. Acesse: `http://localhost:3000/bowtie`

**Verificações:**
```
Estado dos Botões:
- [ ] Botão "Criar Novo Diagrama" (header) → DESABILITADO
- [ ] Botão "Visualizar" (👁️) na tabela → HABILITADO
- [ ] Botão "Aprovar" (✓) na tabela → DESABILITADO
```

**Resultado Esperado:**
- ✅ Maria pode visualizar diagramas existentes
- ✅ Maria NÃO pode criar novos diagramas
- ✅ Maria NÃO pode aprovar diagramas

---

### ✅ TESTE 5: Módulo Administração (CRÍTICO)

**O que testar:** Maria não deve ter acesso a NADA de administração.

**Passos:**
1. Login como `maria@teste.com`
2. No menu lateral, procure "Administração"

**Verificações:**

#### 5.1 - Menu Lateral
```
- [ ] Item "Administração" no menu → Pode estar visível OU oculto
- [ ] Se visível, ao clicar → "Acesso Negado"
```

#### 5.2 - Acesso Direto (MAIS IMPORTANTE)
3. Cole cada URL diretamente:

```
❌ http://localhost:3000/administration
❌ http://localhost:3000/administration/access-profiles
❌ http://localhost:3000/administration/access-control
❌ http://localhost:3000/administration/parameters
❌ http://localhost:3000/administration/parameters/riskfactor
```

**Resultado Esperado:**
- ✅ **TODAS** devem mostrar "Acesso Negado"
- ✅ Maria NÃO consegue acessar nenhuma página de administração
- ✅ Impossível criar perfis de acesso
- ✅ Impossível se vincular a perfis

**ESTE É O TESTE MAIS IMPORTANTE! Se falhar aqui, há vulnerabilidade crítica.**

---

### ✅ TESTE 6: Tentativa de Escalação de Privilégios

**Cenário:** Maria tenta se auto-promover a admin (deve FALHAR).

**Passos:**
1. Login como `maria@teste.com`
2. Tente: `http://localhost:3000/administration/access-profiles/capture`

**Resultado Esperado:**
- ✅ Página **"Acesso Negado"** aparece IMEDIATAMENTE
- ✅ Maria NÃO vê o formulário de criação de perfis
- ✅ **VULNERABILIDADE CRÍTICA RESOLVIDA** ✅

**O que Maria tentaria fazer (agora impossível):**
```
❌ 1. Criar perfil "Maria Admin" com todas as permissões
❌ 2. Acessar /administration/access-control/capture
❌ 3. Se vincular ao perfil "Maria Admin"
❌ 4. Recarregar → ganhar permissões de admin

✅ AGORA: Maria é bloqueada no passo 1, impossível prosseguir
```

---

### ✅ TESTE 7: Comparação com Ana (Super Admin)

**O que testar:** Ana deve ter acesso completo que Maria não tem.

**Passos:**
1. Faça logout de Maria
2. Login como `ana@teste.com` (senha: 123456)
3. Teste as mesmas URLs:

```
✅ http://localhost:3000/administration/access-profiles → ACESSO PERMITIDO
✅ http://localhost:3000/administration/access-control → ACESSO PERMITIDO
✅ http://localhost:3000/kpis/capture → ACESSO PERMITIDO
```

**Resultado Esperado:**
- ✅ Ana acessa TODAS as páginas sem "Acesso Negado"
- ✅ Todos os botões aparecem HABILITADOS para Ana
- ✅ Ana pode criar/editar/excluir em qualquer módulo

**Comparação:**
```
Página                                | Maria      | Ana
--------------------------------------|------------|----------
/kpis (lista)                        | ✅ Pode    | ✅ Pode
/kpis/capture                        | ❌ Negado  | ✅ Pode
/administration/access-profiles      | ❌ Negado  | ✅ Pode
Botão "Excluir" em KPIs             | ❌ Disabled| ✅ Enabled
Botão "Criar Novo Diagrama" Bowtie  | ❌ Disabled| ✅ Enabled
```

---

## 📊 TEMPLATE DE RELATÓRIO DE TESTES

Use este template para reportar os resultados:

```markdown
## RESULTADOS DOS TESTES - PROTEÇÃO ACL

**Data:** ___/___/2025
**Testador:** [Seu Nome]

### TESTE 1: Acesso Direto às URLs
- [ ] ✅ Todas as URLs retornaram "Acesso Negado"
- [ ] ❌ Alguma URL permitiu acesso → QUAL: _______________

### TESTE 2: Botões KPIs
- [ ] ✅ Botões de edição/exclusão desabilitados
- [ ] ❌ Algum botão permitiu ação → QUAL: _______________

### TESTE 3: Botões Actions
- [ ] ✅ Upload de evidência bloqueado
- [ ] ✅ Download de evidência permitido
- [ ] ❌ Problema encontrado: _______________

### TESTE 4: Bowtie
- [ ] ✅ "Criar Novo Diagrama" desabilitado
- [ ] ✅ Visualização permitida
- [ ] ❌ Problema encontrado: _______________

### TESTE 5: Administração (CRÍTICO)
- [ ] ✅ Todas as páginas de admin bloqueadas
- [ ] ❌ VULNERABILIDADE: Maria acessou _____________

### TESTE 6: Escalação de Privilégios
- [ ] ✅ RESOLVIDO: Maria não consegue criar perfis
- [ ] ❌ VULNERABILIDADE: Maria conseguiu _______________

### TESTE 7: Ana (Super Admin)
- [ ] ✅ Ana tem acesso completo
- [ ] ❌ Ana foi bloqueada em: _______________

---

### RESUMO GERAL:
- **Testes Passados:** ___/7
- **Testes Falhados:** ___/7
- **Vulnerabilidades Encontradas:** [ ] Sim [ ] Não
- **Sistema Seguro:** [ ] Sim [ ] Não

### OBSERVAÇÕES:
[Escreva aqui qualquer comportamento inesperado]

```

---

## 🚨 O QUE FAZER SE ENCONTRAR PROBLEMAS

### Problema: Maria vê "Loading infinito"
**Causa:** Race condition no ProtectedRoute  
**Solução temporária:** Recarregue a página (F5)  
**Solução permanente:** Reportar ao desenvolvedor

### Problema: Maria acessa alguma URL que deveria estar bloqueada
**CRÍTICO:** Vulnerabilidade de segurança  
**Ação imediata:**
1. Anote a URL exata
2. Tire screenshot
3. Reporte: "Maria acessou [URL] mas deveria estar bloqueada"

### Problema: Botão aparece habilitado mas não funciona ao clicar
**Não é problema:** Comportamento esperado  
Maria vê o botão (UI consistency) mas ele está desabilitado na lógica

### Problema: Erro 404 "Page Not Found"
**Causa:** URL incorreta ou módulo não implementado  
**Ação:** Verifique se digitou a URL corretamente

---

## ✅ CRITÉRIOS DE SUCESSO

O sistema está **100% seguro** se:

1. ✅ **Todas** as URLs de captura retornam "Acesso Negado" para Maria
2. ✅ **Todas** as páginas de administração estão bloqueadas para Maria
3. ✅ **Todos** os botões de edição/exclusão aparecem desabilitados
4. ✅ Maria **NÃO consegue** criar/editar/excluir em nenhum módulo
5. ✅ Maria **CONSEGUE** visualizar listas e detalhes (read-only)
6. ✅ Ana **CONSEGUE** acessar tudo que Maria não pode

---

## 🎯 FOCO DO TESTE

### PRIORIDADE MÁXIMA (TESTE OBRIGATÓRIO):
- 🔴 TESTE 5: Administração
- 🔴 TESTE 6: Escalação de Privilégios
- 🔴 TESTE 1: Acesso Direto às URLs

### PRIORIDADE ALTA:
- 🟡 TESTE 2: Botões KPIs
- 🟡 TESTE 3: Botões Actions
- 🟡 TESTE 4: Bowtie

### PRIORIDADE MÉDIA:
- 🟢 TESTE 7: Comparação com Ana

---

## 🎬 COMEÇANDO OS TESTES

### Passo a Passo Rápido:

```powershell
# 1. Certifique-se que o servidor está rodando
npm run dev

# 2. Abra o navegador
http://localhost:3000

# 3. Login
Email: maria@teste.com
Senha: 123456

# 4. Comece pelos testes críticos (TESTE 5 e 6)
```

---

**BOA SORTE NOS TESTES! 🚀**

Se tudo passar, o sistema está **completamente protegido** contra:
- ✅ Acesso não autorizado
- ✅ Auto-promoção de privilégios
- ✅ Modificação indevida de dados
- ✅ Escalação de permissões

**Tempo estimado de teste:** 20-30 minutos

---

**Documento gerado em:** 14 de Outubro de 2025  
**Versão:** 1.0 - Guia Completo de Testes

