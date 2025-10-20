# ✅ Checklist Rápido - Verificação Pós-Limpeza

## 🔍 Como Verificar se Está Tudo Limpo

### 1. Rotas de Teste Removidas ✅

**Testar:**
```powershell
# Estas URLs devem retornar 404
curl http://localhost:3000/api/users/test-search
curl http://localhost:3000/api/users/test-auth
```

**Resultado Esperado:** 404 Not Found

---

### 2. Páginas de Debug Removidas ✅

**Testar:**
```powershell
# Estas URLs devem retornar 404
curl http://localhost:3000/debug-super-admin
curl http://localhost:3000/debug-permissions
```

**Resultado Esperado:** 404 Not Found

---

### 3. Mock Profiles Removidos ✅

**Verificar no Código:**
```powershell
# Não deve encontrar MOCK_PROFILES
Select-String -Path "src/app/api/access-profiles/[id]/route.ts" -Pattern "MOCK_PROFILES"
```

**Resultado Esperado:** Nenhum resultado

**Testar API:**
```powershell
# Deve buscar do Azure Table Storage (retornar 404 se não existir)
curl http://localhost:3000/api/access-profiles/mock-profile-admin
```

**Resultado Esperado:** 404 ou erro de Azure Table Storage (não retornar mock)

---

### 4. generateMockBowtie Removido ✅

**Verificar no Código:**
```powershell
Select-String -Path "src/lib/mock-data.ts" -Pattern "generateMockBowtie"
```

**Resultado Esperado:** Nenhum resultado

---

### 5. Console.logs Removidos ✅

**Verificar no Código:**
```powershell
# Verificar hooks de permissão
Select-String -Path "src/hooks/use-permission.ts" -Pattern "console\.(log|debug)" | Measure-Object
```

**Resultado Esperado:** 0 linhas (apenas console.error permitido)

**Testar no Navegador:**
1. Abra a aplicação
2. Abra o Console (F12)
3. Faça login
4. Navegue pela aplicação

**Resultado Esperado:** Não aparecer logs de "🔐 usePermission" ou "👑 Super Admin"

---

### 6. Arquivos Deletados ✅

**Verificar:**
```powershell
# Nenhum destes deve existir
Test-Path "src/app/api/users/test-search/route.ts"
Test-Path "src/app/api/users/test-auth/route.ts"
Test-Path "src/app/(app)/debug-super-admin"
Test-Path "src/app/(app)/debug-permissions"
```

**Resultado Esperado:** Todos devem retornar `False`

---

## 🚀 Teste Completo de Funcionalidade

### Passo 1: Login como Super Admin
```
1. Acesse http://localhost:3000
2. Faça login como: pedro.becel@rumolog.com
3. Verifique que tem acesso a todos os módulos
```

**✅ Esperado:** Acesso total sem erros no console

### Passo 2: Verificar Perfis de Acesso
```
1. Acesse "Administração" → "Perfis de Acesso"
2. Tente criar um novo perfil
3. Salve o perfil
```

**✅ Esperado:** 
- Perfil salvo no Azure Table Storage
- Não aparece "Mock" em nenhum lugar
- Console limpo (sem logs de debug)

### Passo 3: Verificar Controles de Acesso
```
1. Acesse "Administração" → "Controle de Acesso"
2. Associe um usuário a um perfil
3. Faça logout
4. Faça login com o usuário criado
```

**✅ Esperado:**
- Usuário tem apenas as permissões do perfil associado
- Super Admin continua com acesso total
- Console limpo

---

## 🔒 Verificação de Segurança

### Nenhuma Informação Sensível no Console
```
1. Abra Console (F12)
2. Navegue por toda a aplicação
3. Verifique a aba "Console"
```

**❌ NÃO deve aparecer:**
- Emails de usuários
- IDs de perfis
- Tokens de acesso
- Mensagens de "🔐" ou "👑"
- Objetos de accessControl completos

**✅ PODE aparecer:**
- Mensagens de erro genéricas
- "Erro ao carregar permissões" (sem detalhes)

---

## 📦 Build de Produção

### Teste de Build
```powershell
npm run build
```

**✅ Esperado:**
- Build completa sem erros
- Warnings apenas sobre dependências externas
- Nenhum warning sobre mock data ou test routes

### Tamanho do Bundle
```powershell
# Após o build
Get-ChildItem .next/static -Recurse | Measure-Object -Property Length -Sum
```

**✅ Esperado:** Tamanho razoável (sem código de debug aumentando bundle)

---

## 🌐 Variáveis de Ambiente

### Verificar Configuração
```powershell
# Verificar .env.local
Select-String -Path ".env.local" -Pattern "NEXT_PUBLIC_APP_ENV"
Select-String -Path ".env.local" -Pattern "NEXTAUTH_SECRET"
Select-String -Path ".env.local" -Pattern "AZURE_STORAGE_CONNECTION_STRING"
```

**✅ Esperado:**
- `NEXT_PUBLIC_APP_ENV=development` (em DEV)
- `NEXTAUTH_SECRET` configurado
- `AZURE_STORAGE_CONNECTION_STRING` configurado

---

## ✅ Checklist Final

Antes de fazer deploy, marque todos os itens:

### Código Limpo
- [ ] Nenhuma rota `/api/*/test-*` retorna 200
- [ ] Nenhuma página `/debug-*` retorna 200
- [ ] Busca de perfis não retorna mocks
- [ ] Console sem logs de debug
- [ ] Build completa sem warnings de mock

### Funcionalidade
- [ ] Super Admin funciona
- [ ] Login com Azure AD funciona
- [ ] Perfis de acesso salvam no Azure Table Storage
- [ ] Controles de acesso funcionam corretamente
- [ ] Permissões são respeitadas

### Segurança
- [ ] Nenhuma informação sensível no console
- [ ] Rotas de API têm autenticação
- [ ] Variáveis de ambiente configuradas
- [ ] NEXTAUTH_SECRET único em cada ambiente

### Documentação
- [ ] Leia `AUDITORIA_SEGURANCA_PRE_PRODUCAO.md`
- [ ] Leia `RESUMO_LIMPEZA_CODIGO.md`
- [ ] Leia `CONFIGURACAO_MULTI_AMBIENTE.md`
- [ ] Entenda os TODOs restantes (não críticos)

---

## 🎯 Comandos Úteis para Verificação

```powershell
# Procurar por mocks restantes
Select-String -Path "src/**/*.ts" -Pattern "MOCK_|mock[A-Z]" -Exclude "mock-data.ts"

# Procurar por console.log (exceto console.error)
Select-String -Path "src/**/*.ts" -Pattern "console\.(log|debug|info)" | Select-Object Path, LineNumber

# Procurar por TODOs críticos
Select-String -Path "src/**/*.ts" -Pattern "TODO.*crítico|TODO.*CRITICAL" -CaseSensitive

# Verificar rotas de API
Get-ChildItem -Path "src/app/api" -Recurse -Filter "route.ts" | Select-Object FullName

# Verificar tamanho do build
npm run build && Get-ChildItem .next -Recurse | Measure-Object -Property Length -Sum
```

---

## 📝 Notas

- ✅ **session-debug-card.tsx** foi mantido porque já tem proteção `NODE_ENV === 'production'`
- ✅ **mock-data.ts** foi mantido porque contém dados iniciais da aplicação (existingRisks)
- ⚠️ **Erros TypeScript** em mock-data.ts são pré-existentes (não bloqueiam build)

---

**Status:** ✅ PRONTO PARA VERIFICAÇÃO  
**Próximo Passo:** Executar este checklist e reportar resultados
