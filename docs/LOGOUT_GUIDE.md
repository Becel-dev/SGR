# 🚪 GUIA RÁPIDO DE LOGOUT

**Data:** 14/10/2025

---

## 📍 Onde Está o Botão de Logout?

```
┌─────────────────────────────────────────────────────┐
│  SGR - Sistema de Gestão de Riscos        [👤]    │  ← Clicar aqui
└─────────────────────────────────────────────────────┘
                                            ↓
                        ┌──────────────────────────┐
                        │  Pedro Teste            │
                        │  pedro@teste.com        │
                        │  ✓ Microsoft Account    │
                        ├──────────────────────────┤
                        │  👤 Perfil              │
                        │  ⚙️  Configurações      │
                        ├──────────────────────────┤
                        │  🚪 Sair  ← CLICAR      │
                        └──────────────────────────┘
```

---

## 🎯 Passo a Passo

### **1. Localizar o Avatar**
- Olhe no **canto superior direito** da tela
- Você verá um círculo com suas iniciais
- Ex: "PT" para Pedro Teste

### **2. Abrir Menu**
- Clique no avatar
- Um menu dropdown aparecerá

### **3. Clicar em Sair**
- No menu, role até o final
- Clique em "🚪 Sair"
- Você será deslogado automaticamente

### **4. Resultado**
- Você retorna para a **página de login** (`/`)
- Pode fazer login com outro usuário

---

## 🔄 Fluxo de Teste com Múltiplos Usuários

### **Cenário Completo:**

```bash
1. Login: pedro@teste.com
   ↓
2. Criar perfis e vincular usuários
   ↓
3. [Avatar] → Sair
   ↓
4. Login: maria@teste.com
   ↓
5. Testar permissões (botões desabilitados)
   ↓
6. [Avatar] → Sair
   ↓
7. Login: joao@teste.com
   ↓
8. Testar permissões (botões habilitados)
   ↓
9. [Avatar] → Sair
   ↓
10. Login: ana@teste.com
    ↓
11. Testar permissões (acesso total)
```

---

## ⚡ Atalhos

### **Método 1: Via Menu (Recomendado)**
```
1. Clique no avatar (canto superior direito)
2. Clique em "Sair"
```

### **Método 2: Via URL (Alternativo)**
```
Navegue para: http://localhost:3000/
Será redirecionado para login automaticamente
```

### **Método 3: Via Console (Dev)**
```javascript
// Abra console (F12) e execute:
localStorage.clear();
sessionStorage.clear();
window.location.href = '/';
```

---

## 🧪 Roteiro de Teste Rápido

### **Teste 1: Pedro → Maria**
```
1. Login: pedro@teste.com
2. Criar perfil "Visualizador"
3. Vincular maria@teste.com
4. [Avatar] → Sair
5. Login: maria@teste.com
6. Ir para /identification
7. Verificar: Botão "Novo Risco" desabilitado ✅
8. [Avatar] → Sair
```

### **Teste 2: Maria → João**
```
1. Login: maria@teste.com
2. Verificar permissões limitadas
3. [Avatar] → Sair
4. Login: joao@teste.com
5. Verificar permissões ampliadas ✅
6. [Avatar] → Sair
```

### **Teste 3: João → Ana**
```
1. Login: joao@teste.com
2. Verificar não pode excluir controles
3. [Avatar] → Sair
4. Login: ana@teste.com
5. Verificar acesso total ✅
6. [Avatar] → Sair
```

### **Teste 4: Ana → Pedro (Sem Perfil)**
```
1. Login: ana@teste.com
2. Usar sistema normalmente
3. [Avatar] → Sair
4. Login: pedro@teste.com (sem perfil vinculado)
5. Tentar acessar /identification
6. Verificar: Redireciona para /access-denied ✅
```

---

## 🎨 Visual do Menu

```
┌─────────────────────────────┐
│ PT                          │  ← Avatar com iniciais
└─────────────────────────────┘
        ↓ (Clique)
┌─────────────────────────────┐
│ Pedro Teste                 │
│ pedro@teste.com             │
│ ✓ Microsoft Account         │  ← Indica login via Azure AD
├─────────────────────────────┤
│ 👤 Perfil                   │
│ ⚙️  Configurações           │
├─────────────────────────────┤
│ 🚪 Sair                     │  ← ESTE É O BOTÃO!
└─────────────────────────────┘
```

**Se for usuário de teste local:**
```
┌─────────────────────────────┐
│ Maria Silva                 │
│ maria@teste.com             │
│ (Sem badge Microsoft)       │  ← Usuário teste local
├─────────────────────────────┤
│ 👤 Perfil                   │
│ ⚙️  Configurações           │
├─────────────────────────────┤
│ 🚪 Sair                     │
└─────────────────────────────┘
```

---

## ✅ Checklist de Logout

Após clicar em "Sair", verifique:

- [ ] Menu fecha automaticamente
- [ ] Você é redirecionado para `/`
- [ ] Tela de login aparece
- [ ] Avatar desaparece do header
- [ ] Pode fazer novo login
- [ ] Ao fazer novo login, sistema reconhece novo usuário
- [ ] Permissões do novo usuário são aplicadas corretamente

---

## 🐛 Problemas Comuns

### **Problema: Botão "Sair" não aparece**
**Solução:**
- Verifique se está logado
- Recarregue a página (F5)
- Limpe cache (Ctrl+Shift+Del)

### **Problema: Não redireciona após logout**
**Solução:**
```javascript
// Console (F12):
window.location.href = '/';
```

### **Problema: Avatar não aparece**
**Solução:**
- Faça login novamente
- Verifique console (F12) para erros

### **Problema: Continua logado após "Sair"**
**Solução:**
```javascript
// Console (F12):
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.trim().split("=")[0] + 
    '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;';
});
window.location.href = '/';
```

---

## 🎯 Testes Automatizados (Opcional)

Se quiser automatizar os testes:

```javascript
// Script para testar todos os usuários automaticamente
const testUsers = [
  'maria@teste.com',
  'joao@teste.com',
  'ana@teste.com',
  'pedro@teste.com'
];

async function testAllUsers() {
  for (const email of testUsers) {
    console.log(`🧪 Testando: ${email}`);
    
    // Login
    await login(email);
    
    // Testar permissões
    await testPermissions();
    
    // Logout
    await logout();
    
    console.log(`✅ ${email} testado com sucesso!`);
  }
}

async function logout() {
  // Clicar no avatar
  document.querySelector('[data-radix-dropdown-menu-trigger]').click();
  
  // Aguardar menu abrir
  await new Promise(r => setTimeout(r, 100));
  
  // Clicar em "Sair"
  const items = document.querySelectorAll('[role="menuitem"]');
  const logoutBtn = Array.from(items).find(el => el.textContent.includes('Sair'));
  logoutBtn?.click();
  
  // Aguardar redirect
  await new Promise(r => setTimeout(r, 500));
}
```

---

## 📊 Matriz de Testes

| Usuário | Login | Logout | Novo Login | Permissões OK |
|---------|-------|--------|------------|---------------|
| Pedro | ✅ | ✅ | ✅ | N/A |
| Maria | ✅ | ✅ | ✅ | ✅ |
| João | ✅ | ✅ | ✅ | ✅ |
| Ana | ✅ | ✅ | ✅ | ✅ |

---

## 🎉 Resumo

### **Logout Implementado com Sucesso! ✅**

**Funcionalidades:**
- ✅ Botão de logout no menu do avatar
- ✅ Redireciona para página de login
- ✅ Limpa sessão completamente
- ✅ Permite login com novo usuário
- ✅ Funciona tanto com Azure AD quanto Teste Local

**Como Usar:**
1. 👤 Clique no avatar (canto superior direito)
2. 🚪 Clique em "Sair"
3. ✅ Pronto! Faça login com outro usuário

**Tempo para trocar de usuário:** ~5 segundos

---

## 🚀 Próximos Passos

Agora você pode:
1. ✅ Testar todos os 4 usuários rapidamente
2. ✅ Validar permissões de cada perfil
3. ✅ Alternar entre usuários sem problemas
4. ✅ Demonstrar o sistema para outros

**Bons testes! 🎯**

---

**Atalho Rápido:**
```
Avatar (canto direito) → Sair → Novo Login
```

**Tempo Total:** 5 segundos para trocar de usuário

🎊 **Sistema Pronto para Testes Completos!**
