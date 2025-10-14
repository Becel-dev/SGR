# ⚡ GUIA RÁPIDO: Configurar Permissões Manualmente

**Objetivo:** Acessar as telas de administração para configurar perfis e vínculos  
**Tempo:** 5 minutos  
**Resultado:** Sistema ACL totalmente funcional com perfis reais

---

## 🎯 Passo 1: Acessar Página de Debug

### **URL:**
```
http://localhost:3000/debug-permissions
```

### **Como acessar:**
```
1. Login com Ana (ana@teste.com)
2. Menu lateral → Administração → 🔍 Debug Permissões
3. Ver estado completo das permissões
```

### **O que verificar:**
- ✅ Há um Access Control?
- ✅ Há um Profile?
- ✅ As permissões estão corretas?
- ❌ Algo está faltando ou errado?

**Se tudo estiver OK:** Sistema funcionando com mocks!  
**Se algo faltar:** Vá para Passo 2

---

## 🎯 Passo 2: Criar Perfis de Acesso

### **URL:**
```
http://localhost:3000/administration/access-profiles/capture
```

### **Como acessar:**
```
Menu lateral → Administração → Perfil de Acesso → Novo Perfil
```

### **Perfis a criar:**

#### **1. Super Admin**
```
Nome: Super Administrador
Descrição: Acesso total ao sistema

Permissões (MARCAR TUDO):
✅ Identificação: view, create, edit, delete, export
✅ Análise: view, create, edit, delete, export
✅ Controles: view, create, edit, delete, export
✅ Bowtie: view, create, edit, delete, export
✅ Escalation: view, create, edit, delete, export
✅ Melhoria: view, create, edit, delete, export
✅ Relatórios: view, create, edit, delete, export
✅ Perfis de Acesso: view, create, edit, delete, export
✅ Controle de Acesso: view, create, edit, delete, export
✅ Parâmetros: view, create, edit, delete, export

Status: ✅ Ativo
```

#### **2. Visualizador**
```
Nome: Visualizador
Descrição: Somente leitura

Permissões (MARCAR APENAS VIEW):
✅ Identificação: view, ❌ create, ❌ edit, ❌ delete, ✅ export
✅ Análise: view, ❌ create, ❌ edit, ❌ delete, ✅ export
✅ Controles: view, ❌ create, ❌ edit, ❌ delete, ✅ export
✅ Bowtie: view, ❌ create, ❌ edit, ❌ delete, ✅ export
✅ Escalation: view, ❌ create, ❌ edit, ❌ delete, ✅ export
✅ Melhoria: view, ❌ create, ❌ edit, ❌ delete, ✅ export
✅ Relatórios: view, ❌ create, ❌ edit, ❌ delete, ✅ export
❌ Perfis de Acesso: (tudo desmarcado)
❌ Controle de Acesso: (tudo desmarcado)
❌ Parâmetros: view apenas

Status: ✅ Ativo
```

#### **3. Gestor de Riscos**
```
Nome: Gestor de Riscos
Descrição: Pode criar e editar mas não excluir

Permissões:
✅ Identificação: view, create, edit, ❌ delete, export
✅ Análise: view, create, edit, ❌ delete, export
✅ Controles: view, create, edit, ❌ delete, export
✅ Bowtie: view, create, edit, ❌ delete, export
✅ Escalation: view, create, edit, ❌ delete, export
✅ Melhoria: view, create, edit, ❌ delete, export
✅ Relatórios: view, create, edit, ❌ delete, export
❌ Perfis de Acesso: (tudo desmarcado)
❌ Controle de Acesso: (tudo desmarcado)
✅ Parâmetros: view apenas

Status: ✅ Ativo
```

---

## 🎯 Passo 3: Vincular Usuários aos Perfis

### **URL:**
```
http://localhost:3000/administration/access-control/capture
```

### **Como acessar:**
```
Menu lateral → Administração → Controle de Acesso → Novo Vínculo
```

### **Vínculos a criar:**

#### **1. Ana → Super Admin**
```
Usuário: ana@teste.com (buscar no EntraID)
Perfil: Super Administrador
Data Início: Hoje
Data Fim: (deixar vazio ou 1 ano no futuro)
Status: ✅ Ativo
```

#### **2. Maria → Visualizador**
```
Usuário: maria@teste.com
Perfil: Visualizador
Data Início: Hoje
Data Fim: (vazio)
Status: ✅ Ativo
```

#### **3. João → Gestor de Riscos**
```
Usuário: joao@teste.com
Perfil: Gestor de Riscos
Data Início: Hoje
Data Fim: (vazio)
Status: ✅ Ativo
```

#### **4. Pedro → Super Admin**
```
Usuário: pedro@teste.com
Perfil: Super Administrador
Data Início: Hoje
Data Fim: (vazio)
Status: ✅ Ativo
```

---

## 🎯 Passo 4: Testar

### **Ana (Super Admin):**
```
1. Logout (Avatar → Sair)
2. Login: ana@teste.com
3. Ir para: /identification
   ✅ Deve carregar sem "Acesso Negado"
   ✅ Botão "Identificar Novo Risco" habilitado
4. Ir para: /administration
   ✅ Acesso permitido
```

### **Maria (Visualizador):**
```
1. Logout
2. Login: maria@teste.com
3. Ir para: /identification
   ✅ Página carrega
   ❌ Botão "Identificar Novo Risco" desabilitado
   💬 Tooltip mostra "Sem permissão"
4. Ir para: /administration
   ❌ Acesso negado
```

### **João (Gestor):**
```
1. Logout
2. Login: joao@teste.com
3. Ir para: /controls
   ✅ Botão "Novo Controle" habilitado
   ✅ Pode criar controles
   ❌ Botão "Excluir" desabilitado
```

---

## 🔍 Verificar no Debug

### **Após configurar, volte para:**
```
http://localhost:3000/debug-permissions
```

### **Deve mostrar:**
```
✅ Access Control: 
   - ID: real-ac-001
   - Profile ID: real-profile-001
   - Status: Ativo

✅ Access Profile:
   - Nome: Super Administrador
   - Status: Ativo
   - Permissões: Todas marcadas

✅ Resumo:
   - identificacao.view: ✅
   - identificacao.create: ✅
   - (todas as outras também)
```

---

## 📊 Fluxo Completo

```
Login com Ana
    ↓
Menu → Administração → Perfil de Acesso → Novo
    ↓
Criar "Super Administrador" (todas permissões)
Criar "Visualizador" (só view)
Criar "Gestor de Riscos" (view/create/edit)
    ↓
Menu → Administração → Controle de Acesso → Novo
    ↓
Vincular Ana → Super Administrador
Vincular Maria → Visualizador
Vincular João → Gestor de Riscos
Vincular Pedro → Super Administrador
    ↓
Menu → Administração → 🔍 Debug Permissões
    ↓
Verificar que tudo está OK
    ↓
Logout → Testar com cada usuário
```

---

## ⚠️ Importante

### **Persistência dos Dados:**

**Com Azure configurado:**
- ✅ Dados salvos no Azure Table Storage
- ✅ Permanecem após reiniciar servidor
- ✅ Compartilhados entre ambientes

**Sem Azure (desenvolvimento local):**
- ❌ Dados podem não persistir
- ❌ Podem resetar ao reiniciar servidor
- ⚠️ Use mocks para desenvolvimento

### **Mocks vs Dados Reais:**

Os mocks que criamos funcionam assim:
- Se encontrar usuário @teste.com E não houver dado real → Usa mock
- Se houver dado real no banco → Usa dado real (ignora mock)
- **Portanto:** Criar dados reais SOBRESCREVE os mocks

---

## ✅ Checklist

Após configurar:

**Perfis criados:**
- [ ] Super Administrador (todas permissões)
- [ ] Visualizador (só view)
- [ ] Gestor de Riscos (view/create/edit)

**Vínculos criados:**
- [ ] Ana → Super Administrador
- [ ] Maria → Visualizador
- [ ] João → Gestor de Riscos
- [ ] Pedro → Super Administrador

**Testes:**
- [ ] Ana acessa /identification sem erro
- [ ] Maria vê página mas botões desabilitados
- [ ] João pode criar mas não excluir
- [ ] Debug mostra dados corretos

---

## 🎊 Resultado Final

Após completar todos os passos:

✅ Sistema ACL totalmente funcional  
✅ 3 perfis de acesso configurados  
✅ 4 usuários vinculados  
✅ Permissões testadas e funcionando  
✅ Pode manipular permissões via interface  
✅ Pode criar novos perfis e variações  
✅ Pode testar diferentes cenários  

**Tempo total:** ~10 minutos  
**Status:** ✅ Sistema pronto para uso!

---

## 🆘 Se Algo Der Errado

1. **Não consigo acessar /administration:**
   - Essas páginas NÃO têm proteção ACL
   - Se não carregar, é problema de servidor/rota

2. **Não consigo buscar usuário @teste.com:**
   - EntraID search só busca usuários reais
   - Digite o email manualmente no campo

3. **Perfil não salva:**
   - Verificar se todos os campos obrigatórios estão preenchidos
   - Verificar console (F12) para erros

4. **Vínculo não funciona:**
   - Verificar se data início é <= hoje
   - Verificar se status está "Ativo"
   - Verificar se perfil existe

5. **Debug mostra dados antigos:**
   - Fazer logout e login novamente
   - Limpar cache (Ctrl+Shift+R)

---

**Boa configuração! 🚀**
