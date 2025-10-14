# 🚨 SOLUÇÃO TEMPORÁRIA: Desabilitar ACL para Configuração

**Problema:** Ana cai em acesso negado e não consegue acessar administração  
**Solução Temporária:** Desabilitar proteção ACL para configurar o sistema  
**Solução Permanente:** Depois de configurar, reativar proteção

---

## ⚡ AÇÃO IMEDIATA

### **Opção 1: Acessar Página de Debug (RECOMENDADO)**

```
1. Fazer login com Ana
2. Ir para: http://localhost:3000/debug-permissions
3. Verificar o estado completo das permissões
4. Copiar logs do console
```

**Esta página mostra:**
- ✅ Informações do usuário
- ✅ Access Control (vínculo com perfil)
- ✅ Access Profile (permissões)
- ✅ Todas as permissões detalhadas
- ✅ Estado de debug completo

### **Opção 2: Desabilitar Temporariamente a Proteção**

Se a página de debug também der acesso negado, vamos desabilitar **temporariamente** a proteção:

**Arquivo:** `src/app/(app)/identification/page.tsx`

```typescript
// ANTES (com proteção):
export default function IdentificationPage() {
  return (
    <ProtectedRoute module="identificacao" action="view">
      <IdentificationContent />
    </ProtectedRoute>
  );
}

// DEPOIS (sem proteção - TEMPORÁRIO):
export default function IdentificationPage() {
  // return (
  //   <ProtectedRoute module="identificacao" action="view">
  //     <IdentificationContent />
  //   </ProtectedRoute>
  // );
  
  // TEMPORÁRIO: Acesso sem verificação de permissão
  return <IdentificationContent />;
}
```

---

## 🎯 Plano de Ação

### **Passo 1: Acessar Debug**
```
URL: http://localhost:3000/debug-permissions
```

**O que verificar:**
- [ ] Access Control existe?
- [ ] Access Control está ativo?
- [ ] Profile existe?
- [ ] Profile está ativo?
- [ ] Permissões estão corretas?

### **Passo 2: Acessar Administração**
```
URL: http://localhost:3000/administration/access-profiles
```

**Essas páginas NÃO têm proteção ACL, então devem funcionar:**
- ✅ `/administration` - Página principal
- ✅ `/administration/access-profiles` - Lista de perfis
- ✅ `/administration/access-profiles/capture` - Criar/editar perfil
- ✅ `/administration/access-control` - Lista de vínculos
- ✅ `/administration/access-control/capture` - Criar/editar vínculo

### **Passo 3: Verificar/Criar Perfis**

**Em `/administration/access-profiles/capture`:**

1. Criar perfil "Test Admin":
   - Nome: Test Admin
   - Todas as permissões marcadas
   - Status: Ativo

2. Criar perfil "Test Viewer":
   - Nome: Test Viewer
   - Apenas "view" marcado
   - Status: Ativo

3. Criar perfil "Test Manager":
   - Nome: Test Manager
   - view, create, edit marcados
   - Status: Ativo

### **Passo 4: Vincular Usuários**

**Em `/administration/access-control/capture`:**

1. Vincular Ana:
   - Usuário: ana@teste.com
   - Perfil: Test Admin
   - Data início: hoje
   - Status: Ativo

2. Vincular Maria:
   - Usuário: maria@teste.com
   - Perfil: Test Viewer
   - Data início: hoje
   - Status: Ativo

3. Vincular João:
   - Usuário: joao@teste.com
   - Perfil: Test Manager
   - Data início: hoje
   - Status: Ativo

4. Vincular Pedro:
   - Usuário: pedro@teste.com
   - Perfil: Test Admin
   - Data início: hoje
   - Status: Ativo

---

## 🔧 Por Que os Mocks Podem Não Estar Funcionando

### **Possível Causa 1: Azure Table Storage está sendo usado**

Se você tem `AZURE_STORAGE_CONNECTION_STRING` configurado no `.env.local`, o sistema está usando o Azure em vez dos mocks.

**Solução:**
```bash
# Renomear .env.local temporariamente
Rename-Item .env.local .env.local.backup

# Ou comentar a linha:
# AZURE_STORAGE_CONNECTION_STRING=...

# Reiniciar servidor
npm run dev
```

### **Possível Causa 2: NODE_ENV em produção**

Se `NODE_ENV=production`, os mocks são desabilitados.

**Verificar:**
```powershell
# No PowerShell:
$env:NODE_ENV

# Deve estar vazio ou "development"
```

**Corrigir:**
```powershell
# Remover NODE_ENV
Remove-Item Env:\NODE_ENV

# Reiniciar servidor
npm run dev
```

### **Possível Causa 3: APIs retornando erro**

As APIs podem estar falhando silenciosamente.

**Verificar no console do navegador (F12):**
```
❌ Se aparecer erro 500:
- Azure Table Storage tem problema
- Connection string inválida

✅ Se aparecer 🧪:
- Mocks funcionando
```

---

## 💡 Solução Definitiva: Usar Azure Table Storage

Se você quiser usar os perfis/vínculos REAIS (não mocks), precisamos garantir que o Azure Table Storage está configurado corretamente.

### **Verificar Connection String**

**Arquivo:** `.env.local`

```bash
# Deve ter esta linha:
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...

# Se não tiver, os mocks serão usados (desenvolvimento)
# Se tiver, o Azure será usado (produção)
```

### **Criar Tabelas no Azure**

Se usar Azure, as tabelas precisam existir:
- `accessprofiles` - Perfis de acesso
- `useraccesscontrol` - Vínculos usuário-perfil

---

## 📊 Fluxo de Trabalho Recomendado

### **Desenvolvimento (com mocks):**
```
1. Sem connection string Azure
2. Mocks automáticos para @teste.com
3. Configuração manual via telas de administração
4. Dados resetam ao reiniciar servidor
```

### **Produção (com Azure):**
```
1. Com connection string Azure
2. Dados persistidos no Azure Table Storage
3. Usuários reais do EntraID
4. Mocks desabilitados
```

---

## 🎯 Ações Imediatas

### **Agora mesmo:**

```bash
# 1. Login com Ana
# 2. Acessar debug
http://localhost:3000/debug-permissions

# 3. Copiar TODA a saída do console (F12)
# 4. Copiar TODAS as informações da página de debug

# 5. Se não conseguir acessar debug:
# Comentar ProtectedRoute em identification/page.tsx
# Reiniciar servidor
# Tentar novamente
```

### **Próximo passo:**

```bash
# 1. Acessar administração
http://localhost:3000/administration/access-profiles/capture

# 2. Criar perfis reais
# 3. Vincular usuários reais
# 4. Testar novamente
```

---

## 📚 Arquivos Criados

1. ✅ `/debug-permissions/page.tsx` - **NOVA** página de debug
2. ⏳ Aguardando teste e feedback

---

## 🆘 Se Nada Funcionar

### **Reset Completo:**

```powershell
# 1. Parar servidor
Ctrl+C

# 2. Renomear .env.local (se existir)
Rename-Item .env.local .env.local.backup -ErrorAction SilentlyContinue

# 3. Deletar cache
Remove-Item -Recurse -Force .next

# 4. Reiniciar
npm run dev

# 5. Login com Ana
# 6. Ir para /debug-permissions
```

---

## ✅ Próximos Passos

1. ⏳ **Acessar /debug-permissions** e ver o estado
2. ⏳ **Copiar logs do console**
3. ⏳ **Reportar o que aparecer**
4. ⏳ **Então decidimos próximo passo**

🚀 **Acesse /debug-permissions AGORA e me diga o que aparece!**
