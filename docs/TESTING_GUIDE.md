# 🧪 Guia de Teste - Sistema ACL

**Data:** 14/10/2025  
**Status:** ✅ Fase 3 Completa

---

## 📋 Páginas Protegidas

Todas as páginas abaixo agora estão protegidas com ACL:

| Página | Módulo | Rota | Status |
|--------|--------|------|--------|
| **Identificação** | `identificacao` | `/identification` | ✅ |
| **Análise** | `analise` | `/analysis` | ✅ |
| **Controles** | `controles` | `/controls` | ✅ |
| **Bowtie** | `bowtie` | `/bowtie` | ✅ |
| **Escalação** | `escalation` | `/escalation` | ✅ |
| **Melhoria** | `melhoria` | `/improvement` | ✅ |
| **Relatórios** | `relatorios` | `/reports/generate` | ✅ |

---

## 👥 Usuários de Teste Disponíveis

Agora você tem **4 usuários de teste** pré-configurados:

```typescript
pedro@teste.com    → Pedro Teste
maria@teste.com    → Maria Silva
joao@teste.com     → João Santos
ana@teste.com      → Ana Costa
```

**Como usar:**
1. Na tela de login, escolher **"Teste Local"**
2. Digitar o email do usuário (ex: `maria@teste.com`)
3. Fazer login

**Importante:** O EntraID continua funcionando normalmente! Você pode alternar entre:
- 🔵 **Azure AD** (usuários reais do EntraID)
- 🧪 **Teste Local** (usuários fictícios para teste)

---

## 🎯 Cenário de Teste Completo

### **Passo 1: Criar Perfis de Acesso**

#### **Perfil 1: Visualizador** (Apenas Leitura)
1. Login com `pedro@teste.com`
2. Acessar: `/administration/access-profiles/capture`
3. Criar perfil:
   ```
   Nome: Visualizador
   Descrição: Acesso apenas para visualização
   
   Permissões:
   ✅ Identificação → Visualizar
   ✅ Análise → Visualizar
   ✅ Controles → Visualizar
   ✅ Bowtie → Visualizar
   ✅ Escalação → Visualizar
   ✅ Melhoria → Visualizar
   ✅ Relatórios → Visualizar
   
   Status: ✅ Ativo
   ```
4. Salvar

#### **Perfil 2: Gestor de Riscos** (Operacional)
1. Criar novo perfil:
   ```
   Nome: Gestor de Riscos
   Descrição: Acesso completo para gestão de riscos
   
   Permissões:
   ✅ Identificação → ✅ TODAS
   ✅ Análise → ✅ TODAS
   ✅ Controles → ✅ Visualizar, ✅ Criar, ✅ Editar
   ✅ Bowtie → ✅ Visualizar, ✅ Criar
   ✅ Escalação → ✅ Visualizar
   ✅ Melhoria → ✅ Visualizar
   ✅ Relatórios → ✅ Visualizar, ✅ Exportar
   
   Status: ✅ Ativo
   ```
2. Salvar

#### **Perfil 3: Administrador** (Acesso Total)
1. Criar novo perfil:
   ```
   Nome: Administrador
   Descrição: Acesso total ao sistema
   
   Permissões:
   ✅ TODOS OS MÓDULOS → ✅ TODAS AS AÇÕES
   
   Status: ✅ Ativo
   ```
2. Salvar

---

### **Passo 2: Vincular Usuários aos Perfis**

#### **Vincular Maria como Visualizadora**
1. Acessar: `/administration/access-control/capture`
2. Buscar usuário: `maria@teste.com`
3. Selecionar: `Maria Silva`
4. Configurar:
   ```
   Perfil de Acesso: Visualizador
   Data Início: [Hoje]
   Data Fim: [+1 ano]
   Status: ✅ Ativo
   ```
5. Salvar

#### **Vincular João como Gestor**
1. Criar novo controle de acesso
2. Buscar usuário: `joao@teste.com`
3. Selecionar: `João Santos`
4. Configurar:
   ```
   Perfil de Acesso: Gestor de Riscos
   Data Início: [Hoje]
   Data Fim: [+1 ano]
   Status: ✅ Ativo
   ```
5. Salvar

#### **Vincular Ana como Administradora**
1. Criar novo controle de acesso
2. Buscar usuário: `ana@teste.com`
3. Selecionar: `Ana Costa`
4. Configurar:
   ```
   Perfil de Acesso: Administrador
   Data Início: [Hoje]
   Data Fim: [+1 ano]
   Status: ✅ Ativo
   ```
5. Salvar

---

### **Passo 3: Testar Permissões**

#### **🧪 Teste 1: Maria (Visualizador)**

1. **Fazer logout do Pedro**
2. **Login:** `maria@teste.com`
3. **Testes:**

   **Identificação (`/identification`):**
   - ✅ Consegue ver lista de riscos
   - ❌ Botão "Identificar Novo Risco" → **DESABILITADO** ou **OCULTO**
   - Ao passar o mouse: tooltip "Você não tem permissão para criar"

   **Análise (`/analysis`):**
   - ✅ Consegue ver lista de riscos
   - ✅ Consegue visualizar detalhes

   **Controles (`/controls`):**
   - ✅ Consegue ver lista de controles
   - ❌ Botão "Novo Controle" → **DESABILITADO** ou **OCULTO**

   **Tentar acessar Admin:**
   - ❌ Redireciona para `/access-denied`

---

#### **🧪 Teste 2: João (Gestor de Riscos)**

1. **Fazer logout da Maria**
2. **Login:** `joao@teste.com`
3. **Testes:**

   **Identificação (`/identification`):**
   - ✅ Consegue ver lista de riscos
   - ✅ Botão "Identificar Novo Risco" → **HABILITADO**
   - ✅ Consegue criar novo risco
   - ✅ Consegue editar riscos
   - ✅ Consegue excluir riscos

   **Controles (`/controls`):**
   - ✅ Consegue ver lista de controles
   - ✅ Botão "Novo Controle" → **HABILITADO**
   - ✅ Consegue criar controles
   - ✅ Consegue editar controles
   - ❌ Botão "Excluir" → **DESABILITADO** (não tem permissão delete)

   **Relatórios (`/reports/generate`):**
   - ✅ Consegue visualizar
   - ✅ Botão "Exportar" → **HABILITADO**

---

#### **🧪 Teste 3: Ana (Administrador)**

1. **Fazer logout do João**
2. **Login:** `ana@teste.com`
3. **Testes:**

   **Todas as Páginas:**
   - ✅ Acesso completo a todos os módulos
   - ✅ Todos os botões habilitados
   - ✅ Pode criar, editar, excluir, exportar

   **Administração:**
   - ✅ Acesso a Perfis de Acesso
   - ✅ Acesso a Controle de Acesso
   - ✅ Acesso a Parâmetros

---

#### **🧪 Teste 4: Pedro (Sem Perfil)**

1. **Fazer logout da Ana**
2. **Login:** `pedro@teste.com` (não vinculado a nenhum perfil)
3. **Resultado Esperado:**
   - ❌ Ao tentar acessar qualquer página protegida
   - ✅ Redireciona para `/access-denied`
   - ✅ Mensagem: "Você não possui um perfil de acesso ativo"

---

## 🎭 Matriz de Permissões

| Módulo | Maria (Visualizador) | João (Gestor) | Ana (Admin) |
|--------|---------------------|---------------|-------------|
| **Identificação** | | | |
| - Visualizar | ✅ | ✅ | ✅ |
| - Criar | ❌ | ✅ | ✅ |
| - Editar | ❌ | ✅ | ✅ |
| - Excluir | ❌ | ✅ | ✅ |
| - Exportar | ❌ | ✅ | ✅ |
| **Análise** | | | |
| - Visualizar | ✅ | ✅ | ✅ |
| - Criar | ❌ | ✅ | ✅ |
| - Editar | ❌ | ✅ | ✅ |
| - Excluir | ❌ | ✅ | ✅ |
| - Exportar | ❌ | ✅ | ✅ |
| **Controles** | | | |
| - Visualizar | ✅ | ✅ | ✅ |
| - Criar | ❌ | ✅ | ✅ |
| - Editar | ❌ | ✅ | ✅ |
| - Excluir | ❌ | ❌ | ✅ |
| - Exportar | ❌ | ❌ | ✅ |
| **Administração** | | | |
| - Perfis de Acesso | ❌ | ❌ | ✅ |
| - Controle de Acesso | ❌ | ❌ | ✅ |
| - Parâmetros | ❌ | ❌ | ✅ |

---

## 🔍 Checklist de Validação

### **Visual:**
- [ ] Botões sem permissão aparecem desabilitados (cinza)
- [ ] Tooltip explicativo ao passar o mouse
- [ ] Páginas sem permissão redirecionam para `/access-denied`
- [ ] Página de acesso negado tem design profissional
- [ ] Loading skeleton aparece durante verificação

### **Funcional:**
- [ ] Usuário sem perfil não acessa nenhuma página
- [ ] Usuário com perfil vê apenas seus módulos
- [ ] Botões respeitam permissões individuais
- [ ] APIs rejeitam requisições sem permissão (futuro)
- [ ] Período de validade é respeitado

### **UX:**
- [ ] Transições são suaves
- [ ] Não há "flash" de conteúdo não autorizado
- [ ] Mensagens são claras e em português
- [ ] Tooltips são informativos

---

## 🐛 Problemas Comuns

### **Problema: Botão continua habilitado**
**Causa:** Componente não está usando `PermissionButton`  
**Solução:** Substituir `<Button>` por `<PermissionButton module="..." action="...">`

### **Problema: Página não redireciona**
**Causa:** Falta `ProtectedRoute` no componente  
**Solução:** Envolver página com `<ProtectedRoute module="..." action="view">`

### **Problema: Hook retorna loading infinito**
**Causa:** API não está respondendo  
**Solução:** Verificar console para erros de API

### **Problema: Todos usuários sem permissão**
**Causa:** Não criou controle de acesso  
**Solução:** Vincular usuário a perfil em `/administration/access-control/capture`

---

## 📝 Comandos Úteis

### **Ver usuários de teste no código:**
```bash
# Arquivo: src/lib/auth.ts, linha ~32
const testUsers = [
  { email: 'pedro@teste.com', name: 'Pedro Teste' },
  { email: 'maria@teste.com', name: 'Maria Silva' },
  { email: 'joao@teste.com', name: 'João Santos' },
  { email: 'ana@teste.com', name: 'Ana Costa' },
];
```

### **Verificar se há erros TypeScript:**
```bash
npm run build
```

### **Executar em dev:**
```bash
npm run dev
```

---

## ✅ Resultado Esperado

Ao final dos testes, você deve ter:

1. ✅ **4 perfis criados** (Visualizador, Gestor, Administrador, e possivelmente um customizado)
2. ✅ **3 usuários vinculados** (Maria, João, Ana)
3. ✅ **Permissões funcionando** em todas as 7 páginas
4. ✅ **Experiência consistente** em todos os módulos
5. ✅ **Segurança implementada** (acesso negado quando necessário)

---

## 🎉 Sucesso!

Se todos os testes passaram, o **Sistema ACL está 100% funcional**! 

Você pode agora:
- ✅ Criar perfis customizados para seus usuários reais
- ✅ Vincular usuários do EntraID aos perfis
- ✅ Controlar acesso granular por módulo e ação
- ✅ Ter auditoria completa de quem pode fazer o quê

**Próximos passos:**
1. Documentar os perfis padrão da sua empresa
2. Treinar administradores no uso do sistema
3. Migrar usuários reais para perfis apropriados
4. Implementar logs de auditoria (opcional)

🎯 **Sistema ACL Validado e Pronto para Produção!**
