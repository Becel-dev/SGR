# 🔧 CORREÇÃO: Erros de Runtime e Acesso Negado

**Data:** 14/10/2025  
**Problemas:** 
1. React.Children.only error com PermissionButton + asChild
2. Ana recebendo acesso negado

---

## ✅ Correções Aplicadas

### **1. PermissionButton com suporte a `asChild`**

**Problema:**
```tsx
// ❌ Antes: Não suportava asChild corretamente
<PermissionButton asChild>
  <Link href="/controls/capture">  {/* Causava erro */}
    Novo Controle
  </Link>
</PermissionButton>
```

**Solução:**
```tsx
// ✅ Agora: Passa asChild para o Button interno
export function PermissionButton({ asChild, ...props }) {
  // ...
  return (
    <Button asChild={asChild} {...props}>
      {children}
    </Button>
  );
}
```

### **2. Tooltip com span wrapper**

**Problema:**
- `TooltipTrigger asChild` esperava 1 elemento filho
- Mas estava recebendo `Button` com `asChild` também

**Solução:**
```tsx
// ✅ Usar span wrapper sem asChild no Trigger
<TooltipTrigger asChild>
  <span className="inline-flex">
    <Button disabled asChild={asChild}>
      {children}
    </Button>
  </span>
</TooltipTrigger>
```

---

## 🚀 Passos para Resolver

### **PASSO 1: Reiniciar o Servidor**

**IMPORTANTE:** O Next.js precisa recompilar as mudanças.

```powershell
# No terminal onde npm run dev está rodando:
Ctrl+C

# Aguarde 2 segundos

# Execute novamente:
npm run dev

# Aguarde mensagem: "✓ Ready in Xms"
```

### **PASSO 2: Limpar Cache do Navegador**

```
1. Abra DevTools (F12)
2. Clique com botão direito no botão Refresh
3. Escolha: "Empty Cache and Hard Reload"

OU

1. Pressione Ctrl+Shift+Del
2. Marque "Cached images and files"
3. Clique "Clear data"
4. Recarregue a página (F5)
```

### **PASSO 3: Fazer Login Novamente**

```
1. Se já estiver logado: Logout (Avatar → Sair)
2. Ir para: http://localhost:3000/auth/signin
3. Clicar em: "👤 Ana Costa"
4. Aguardar login automático
```

### **PASSO 4: Verificar Console**

**Abra console (F12) e procure por:**

```
✅ Deve aparecer:
🔍 Buscando controle de acesso para usuário: ana@teste.com
🧪 Usando dados mock para usuário de teste: ana@teste.com
🔍 Buscando perfil de acesso: mock-profile-admin-full
🧪 Usando perfil mock: mock-profile-admin-full

❌ Se não aparecer "🧪":
- Servidor não recarregou corretamente
- Volte ao PASSO 1
```

---

## 🧪 Como Testar

### **Teste 1: Ana - Página de Identification**
```
1. Login: ana@teste.com
2. Ir para: /identification
3. Verificar:
   ✅ Página carrega sem erro
   ✅ Botão "Identificar Novo Risco" habilitado
   ✅ Pode clicar no botão
```

### **Teste 2: Ana - Página de Controls**
```
1. Ainda logado como Ana
2. Ir para: /controls
3. Verificar:
   ✅ Página carrega sem erro
   ✅ Botão "Novo Controle" habilitado
   ✅ Link funciona corretamente
```

### **Teste 3: Maria - Botões Desabilitados**
```
1. Logout (Avatar → Sair)
2. Login: maria@teste.com
3. Ir para: /identification
4. Verificar:
   ✅ Página carrega sem erro
   ✅ Botão "Identificar Novo Risco" DESABILITADO
   ✅ Ao passar mouse: Tooltip mostra mensagem
```

---

## 🔍 Diagnóstico de Problemas

### **Problema: Ainda recebo React.Children.only**

**Causa:** Mudanças não foram recarregadas

**Solução:**
```bash
# 1. Pare COMPLETAMENTE o servidor
Ctrl+C

# 2. Verifique se o processo parou
# Deve voltar para prompt: PS C:\Users\...>

# 3. Inicie novamente
npm run dev

# 4. Aguarde mensagem "✓ Compiled in X ms"

# 5. Recarregue navegador (Ctrl+Shift+R)
```

### **Problema: Ana ainda recebe "Acesso Negado"**

**Causa:** Mocks não estão sendo retornados

**Diagnóstico:**

1. **Verifique NODE_ENV:**
```bash
# No console do navegador (F12):
console.log('NODE_ENV:', process.env.NODE_ENV);

# Deve mostrar: undefined ou 'development'
# Se mostrar 'production', o servidor está em modo produção
```

2. **Verifique logs do servidor:**
```bash
# No terminal onde npm run dev está rodando, procure:
🔍 Buscando controle de acesso para usuário: ana@teste.com

# Se aparecer isso mas NÃO aparecer:
🧪 Usando dados mock para usuário de teste: ana@teste.com

# Então o problema é que:
# - isDevEnvironment é false
# - OU isTestUser é false
# - OU MOCK_ACCESS_CONTROLS[userId] é undefined
```

3. **Solução:**
```bash
# Parar servidor
Ctrl+C

# Verificar que não está em modo produção
# Deve usar: npm run dev (NÃO npm start)

# Reiniciar
npm run dev
```

### **Problema: Erro 500 na API**

**Causa:** Azure Table Storage connection string inválida

**Solução:**
```bash
# Os mocks devem funcionar MESMO sem Azure configurado
# Se não funcionar, adicione debug:

# Edite src/app/api/access-control/route.ts
# Adicione logo após console.log('🔍 Buscando...'):

console.log('DEBUG isDevEnvironment:', isDevEnvironment);
console.log('DEBUG isTestUser:', isTestUser);
console.log('DEBUG userId:', userId);
console.log('DEBUG mock exists:', !!MOCK_ACCESS_CONTROLS[userId]);

# Reinicie servidor e veja os logs
```

---

## 📊 Arquivos Modificados

| Arquivo | Mudança | Status |
|---------|---------|--------|
| `src/components/auth/permission-button.tsx` | Adicionado suporte a `asChild` | ✅ |
| `src/app/api/access-control/route.ts` | Mocks criados anteriormente | ✅ |
| `src/app/api/access-profiles/[id]/route.ts` | Mocks criados anteriormente | ✅ |

---

## 🎯 Checklist Final

Após reiniciar servidor e limpar cache:

**Ana (Super Admin):**
- [ ] Login bem-sucedido
- [ ] Console mostra "🧪 Usando dados mock"
- [ ] Página /identification carrega
- [ ] Botão "Identificar Novo Risco" habilitado
- [ ] Página /controls carrega
- [ ] Botão "Novo Controle" habilitado (Link)
- [ ] Sem erros de React.Children.only

**Maria (Visualizador):**
- [ ] Login bem-sucedido
- [ ] Botões desabilitados com tooltip
- [ ] Sem erros de runtime

---

## 🆘 Se Nada Funcionar

### **Opção 1: Reset Completo**
```bash
# 1. Parar servidor
Ctrl+C

# 2. Limpar .next
Remove-Item -Recurse -Force .next

# 3. Reinstalar (opcional, se suspeitar de cache de node_modules)
npm install

# 4. Iniciar
npm run dev

# 5. Limpar cache do navegador (Ctrl+Shift+Del)

# 6. Login novamente
```

### **Opção 2: Verificar Código**
```bash
# Verificar se os arquivos foram salvos corretamente:
Get-Content src\components\auth\permission-button.tsx | Select-String "asChild"

# Deve mostrar múltiplas linhas com "asChild"
```

### **Opção 3: Logs Detalhados**
```typescript
// Adicione no início de PermissionButton:
console.log('🔍 PermissionButton render:', { 
  module, 
  action, 
  asChild, 
  allowed, 
  loading 
});

// Depois reinicie servidor e veja logs no console do navegador
```

---

## 📚 Documentação Relacionada

- `MOCK_PROFILES_SOLUTION.md` - Como os mocks funcionam
- `QUICK_FIX_ANA.md` - Resumo da implementação
- `TESTING_GUIDE.md` - Guia completo de testes

---

## ✅ Status Esperado

Após seguir todos os passos:

```
✅ Servidor reiniciado
✅ Cache limpo
✅ Ana com acesso total
✅ Sem erros de React.Children.only
✅ Botões funcionando (normal e asChild)
✅ Tooltips funcionando para usuários sem permissão
✅ Console mostrando "🧪 Usando dados mock"
```

---

**Última atualização:** 14/10/2025  
**Versão:** 3.1 (Bug fix asChild + troubleshooting)
