# 🔐 GUIA DA NOVA TELA DE LOGIN

**Data:** 14/10/2025  
**Atualização:** Adicionado seletor de múltiplos usuários de teste

---

## 🎨 Visual da Nova Tela

### **Layout Completo:**

```
┌────────────────────────────────────────────────┐
│              🛡️                                │
│    SGR - Sistema de Gestão de Riscos          │
│    Faça login com sua conta Microsoft...      │
│                                                │
│  ┌──────────────────────────────────────┐    │
│  │  🟦 Entrar com Microsoft              │    │  ← Azure AD (Produção)
│  └──────────────────────────────────────┘    │
│                                                │
│  ─────── AMBIENTE DE DESENVOLVIMENTO ──────   │
│                                                │
│  🧪 Usuários de Teste                         │
│                                                │
│  ┌──────────────────────────────────────┐    │
│  │ 👤 Pedro Teste                        │    │  ← Clique aqui
│  │    pedro@teste.com                    │    │
│  │    👨‍💼 Usuário base para setup inicial │    │
│  └──────────────────────────────────────┘    │
│                                                │
│  ┌──────────────────────────────────────┐    │
│  │ 👤 Maria Silva                        │    │  ← Clique aqui
│  │    maria@teste.com                    │    │
│  │    👁️ Perfil Visualizador (somente...) │    │
│  └──────────────────────────────────────┘    │
│                                                │
│  ┌──────────────────────────────────────┐    │
│  │ 👤 João Santos                        │    │  ← Clique aqui
│  │    joao@teste.com                     │    │
│  │    ⚙️ Gestor de Riscos (criar/editar)  │    │
│  └──────────────────────────────────────┘    │
│                                                │
│  ┌──────────────────────────────────────┐    │
│  │ 👤 Ana Costa                          │    │  ← Clique aqui
│  │    ana@teste.com                      │    │
│  │    👑 Administrador (acesso total)    │    │
│  └──────────────────────────────────────┘    │
│                                                │
│  💡 Use usuários de teste para validar...     │
└────────────────────────────────────────────────┘
```

---

## ✨ O Que Mudou?

### **ANTES (❌ Problema):**
```tsx
┌─────────────────────────────────────┐
│ 🟦 Entrar com Microsoft             │
│                                     │
│ ──── AMBIENTE DE DESENVOLVIMENTO ───│
│                                     │
│ 🧪 Login de Teste (pedro@teste.com) │  ← APENAS 1 OPÇÃO!
└─────────────────────────────────────┘
```
- ❌ Só tinha Pedro
- ❌ Precisava editar código para trocar usuário
- ❌ Difícil testar múltiplos perfis

### **DEPOIS (✅ Solução):**
```tsx
┌─────────────────────────────────────┐
│ 🟦 Entrar com Microsoft             │
│                                     │
│ ──── AMBIENTE DE DESENVOLVIMENTO ───│
│                                     │
│ 🧪 Usuários de Teste                │
│                                     │
│ 👤 Pedro Teste                      │  ← OPÇÃO 1
│ 👤 Maria Silva                      │  ← OPÇÃO 2
│ 👤 João Santos                      │  ← OPÇÃO 3
│ 👤 Ana Costa                        │  ← OPÇÃO 4
└─────────────────────────────────────┘
```
- ✅ 4 usuários disponíveis
- ✅ Clique direto para fazer login
- ✅ Descrição de cada perfil
- ✅ Ícones visuais

---

## 🎯 Como Usar

### **Passo 1: Abrir a Tela de Login**
```bash
# 1. Inicie o servidor (se não estiver rodando)
npm run dev

# 2. Abra no navegador
http://localhost:3000/auth/signin
```

### **Passo 2: Escolher Usuário**

**Opção A - Login Produção:**
```
Clique em: "Entrar com Microsoft"
→ Usa Azure AD (EntraID)
→ Para usuários reais da empresa
```

**Opção B - Login Teste:**
```
Clique em um dos 4 botões de teste:
→ Pedro, Maria, João ou Ana
→ Login instantâneo, sem senha
→ Apenas em desenvolvimento
```

### **Passo 3: Navegação Automática**
```
Após clicar:
→ Login processado automaticamente
→ Redirecionado para "/" (homepage)
→ Sistema carrega permissões
→ Pronto para usar!
```

---

## 👥 Descrição dos Usuários

### **1. Pedro Teste** 👨‍💼
```
Email: pedro@teste.com
Descrição: Usuário base para setup inicial
Uso: Configure perfis e vincule outros usuários
Cenário: Administrador inicial do sistema
```

**Quando usar:**
- ✅ Primeiro login
- ✅ Criar perfis de acesso
- ✅ Vincular outros usuários a perfis
- ✅ Setup inicial do sistema

### **2. Maria Silva** 👁️
```
Email: maria@teste.com
Descrição: Perfil Visualizador (somente leitura)
Uso: Testar permissões de visualização
Cenário: Usuário que só pode ver, não pode criar/editar
```

**Quando usar:**
- ✅ Testar restrições de leitura
- ✅ Validar botões desabilitados
- ✅ Verificar tooltips de "sem permissão"
- ✅ Simular usuário com acesso limitado

### **3. João Santos** ⚙️
```
Email: joao@teste.com
Descrição: Gestor de Riscos (criar/editar)
Uso: Testar permissões operacionais
Cenário: Usuário que pode criar/editar mas não excluir
```

**Quando usar:**
- ✅ Testar criação de riscos
- ✅ Testar edição de controles
- ✅ Validar restrição de exclusão
- ✅ Simular perfil operacional

### **4. Ana Costa** 👑
```
Email: ana@teste.com
Descrição: Administrador (acesso total)
Uso: Testar permissões totais
Cenário: Usuário com todos os acessos
```

**Quando usar:**
- ✅ Testar funcionalidades completas
- ✅ Validar todos os botões habilitados
- ✅ Acessar módulo de administração
- ✅ Simular super usuário

---

## 🔄 Fluxo de Teste Completo

### **Cenário 1: Setup Inicial (5 minutos)**

```bash
# 1. Login com Pedro
Clique em: "👤 Pedro Teste"
↓
# 2. Criar Perfis
Navegue para: /administration/access-profiles/capture
Crie 3 perfis:
  - Visualizador (apenas view)
  - Gestor de Riscos (view, create, edit)
  - Administrador (todas as permissões)
↓
# 3. Vincular Usuários
Navegue para: /administration/access-control/capture
Vincule:
  - Maria → Visualizador
  - João → Gestor de Riscos
  - Ana → Administrador
↓
# 4. Logout
Avatar (canto direito) → Sair
```

### **Cenário 2: Testar Visualizador (3 minutos)**

```bash
# 1. Na tela de login
Clique em: "👤 Maria Silva"
↓
# 2. Testar Identificação
Navegue para: /identification
Verificar: Botão "Identificar Novo Risco" DESABILITADO ✅
Verificar: Tooltip mostra "Sem permissão" ✅
↓
# 3. Testar Controles
Navegue para: /controls
Verificar: Botão "Novo Controle" DESABILITADO ✅
↓
# 4. Testar Administração
Navegue para: /administration
Verificar: Redireciona para /access-denied ✅
↓
# 5. Logout
Avatar → Sair
```

### **Cenário 3: Testar Gestor (3 minutos)**

```bash
# 1. Na tela de login
Clique em: "👤 João Santos"
↓
# 2. Testar Criação
Navegue para: /identification
Verificar: Botão "Identificar Novo Risco" HABILITADO ✅
Clicar e testar criação ✅
↓
# 3. Testar Edição
Navegue para: /controls
Verificar: Pode editar controles existentes ✅
↓
# 4. Testar Exclusão
Tentar excluir um controle
Verificar: Botão "Excluir" DESABILITADO ✅
↓
# 5. Logout
Avatar → Sair
```

### **Cenário 4: Testar Admin (2 minutos)**

```bash
# 1. Na tela de login
Clique em: "👤 Ana Costa"
↓
# 2. Testar Acesso Total
Navegue para: /identification
Verificar: TODOS os botões HABILITADOS ✅
↓
# 3. Testar Administração
Navegue para: /administration
Verificar: ACESSO PERMITIDO ✅
↓
# 4. Testar Exclusão
Navegue para: /controls
Verificar: Pode excluir controles ✅
↓
# 5. Logout
Avatar → Sair
```

---

## 🎨 Cores e Estilo

### **Visual dos Botões:**

**Pedro (Azul):**
```css
Background: orange-50
Hover: orange-100
Border: orange-200
Text: orange-900
Icon: orange-600
```

**Maria (Roxo):**
```css
/* Mesma cor base (visual unificado) */
Background: orange-50
Text: orange-900
Description: "👁️ Perfil Visualizador"
```

**João (Verde):**
```css
/* Mesma cor base (visual unificado) */
Background: orange-50
Text: orange-900
Description: "⚙️ Gestor de Riscos"
```

**Ana (Laranja):**
```css
/* Mesma cor base (visual unificado) */
Background: orange-50
Text: orange-900
Description: "👑 Administrador"
```

**Todos os botões têm:**
- ✅ Hover suave (bg-orange-100)
- ✅ Borda laranja clara
- ✅ Ícone de usuário
- ✅ Nome em negrito
- ✅ Email em fonte menor
- ✅ Descrição do perfil

---

## 🚀 Atalhos de Teclado

### **Navegação Rápida:**
```
Tab → Move entre botões
Enter → Clica no botão selecionado
Space → Clica no botão selecionado
Esc → (futuro) Fecha modal se houver
```

---

## 🐛 Resolução de Problemas

### **Problema: Não vejo os usuários de teste**

**Causa:** Está em produção  
**Solução:**
```bash
# Verifique o ambiente
echo $NODE_ENV  # Deve ser 'development'

# Ou no package.json:
"dev": "next dev"  # ← Use este comando
```

### **Problema: Clico mas não loga**

**Causa:** Provider não configurado  
**Solução:**
```typescript
// Verifique src/lib/auth.ts
// Deve ter Credentials provider com id: 'test-credentials'
Credentials({
  id: 'test-credentials',  // ← Importante!
  name: 'Test Credentials',
  // ...
})
```

### **Problema: Erro "Invalid credentials"**

**Causa:** Email não existe na lista  
**Solução:**
```typescript
// Verifique src/lib/auth.ts
const testUsers = [
  { email: 'pedro@teste.com', name: 'Pedro Teste' },
  { email: 'maria@teste.com', name: 'Maria Silva' },
  { email: 'joao@teste.com', name: 'João Santos' },
  { email: 'ana@teste.com', name: 'Ana Costa' },
];
// ↑ Devem estar todos presentes
```

### **Problema: Redireciona mas não mostra nome**

**Causa:** Session não atualizada  
**Solução:**
```bash
# Limpe o cache do navegador
Ctrl+Shift+Del → Limpar cookies

# Ou use modo anônimo
Ctrl+Shift+N (Chrome)
Ctrl+Shift+P (Firefox)
```

---

## 📊 Comparação Visual

### **Antes vs Depois:**

| Aspecto | Antes ❌ | Depois ✅ |
|---------|----------|-----------|
| **Usuários disponíveis** | 1 (Pedro) | 4 (Pedro, Maria, João, Ana) |
| **Interface** | Botão único | 4 cards descritivos |
| **Troca de usuário** | Editar código | Clique no card |
| **Informações** | Só email | Nome + email + descrição |
| **Visual** | Simples | Cards com ícones e cores |
| **UX** | Confuso | Intuitivo e auto-explicativo |
| **Tempo de troca** | 2-3 minutos | 5 segundos |
| **Documentação** | Nenhuma | Este guia! |

---

## ✅ Checklist de Validação

Após fazer login com cada usuário, verifique:

**Pedro:**
- [ ] Consegue fazer login
- [ ] Nome aparece no avatar
- [ ] Pode criar perfis
- [ ] Pode vincular usuários

**Maria:**
- [ ] Consegue fazer login
- [ ] Vê a tela de identificação
- [ ] Botão "Criar" está desabilitado
- [ ] Tooltip mostra mensagem

**João:**
- [ ] Consegue fazer login
- [ ] Pode criar novos riscos
- [ ] Pode editar controles
- [ ] NÃO pode excluir

**Ana:**
- [ ] Consegue fazer login
- [ ] Acessa administração
- [ ] Pode criar/editar/excluir
- [ ] Tem todos os acessos

---

## 🎯 Próximos Passos

1. ✅ **Testar a nova interface** (agora mesmo!)
2. ✅ **Seguir o fluxo de teste completo** (15 minutos)
3. ✅ **Validar permissões** (use checklist)
4. ✅ **Reportar qualquer problema** (se houver)

---

## 📚 Documentação Relacionada

- 📖 `LOGIN_GUIDE.md` - Guia detalhado de login
- 🔐 `LOGOUT_GUIDE.md` - Como fazer logout
- ✅ `VALIDATION_CHECKLIST.md` - Checklist completo
- 🧪 `TESTING_GUIDE.md` - Guia de testes (600+ linhas)
- 📊 `EXECUTIVE_SUMMARY.md` - Visão geral do sistema

---

## 🎊 Resumo Final

### **Agora você pode:**
✅ Ver todos os 4 usuários de teste na tela de login  
✅ Clicar em qualquer um para fazer login instantâneo  
✅ Trocar de usuário em 5 segundos (logout + novo login)  
✅ Testar diferentes níveis de permissão facilmente  
✅ Validar o ACL completo sem editar código  

### **Tempo para testar tudo:**
- Setup inicial: 5 minutos
- Testar Maria: 3 minutos
- Testar João: 3 minutos
- Testar Ana: 2 minutos
- **TOTAL: ~15 minutos** ⚡

🚀 **Está pronto! Abra http://localhost:3000/auth/signin e comece!**

---

**Última atualização:** 14/10/2025  
**Versão:** 2.0 (Multi-usuário)
