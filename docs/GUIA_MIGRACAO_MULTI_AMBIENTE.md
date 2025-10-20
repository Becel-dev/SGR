# 🚀 Guia Rápido de Migração - Multi-Ambiente

## ⚡ Checklist de Migração

### 1. Atualizar Arquivo .env.local (DEV)

```bash
# Adicionar nova variável
NEXT_PUBLIC_APP_ENV=development

# Manter existentes
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<seu_secret_atual>
AZURE_STORAGE_CONNECTION_STRING=<sua_connection_atual>

# Azure AD (opcional para DEV)
AZURE_AD_CLIENT_ID=<seu_client_id>
AZURE_AD_CLIENT_SECRET=<seu_client_secret>
AZURE_AD_TENANT_ID=<seu_tenant_id>
```

### 2. Configurar Ambiente QA

Criar arquivo `.env` no servidor QA:

```bash
NEXT_PUBLIC_APP_ENV=qa
NEXTAUTH_URL=https://sgr-qa.rumolog.com
NEXTAUTH_SECRET=<gerar_novo_com: openssl rand -base64 32>
AZURE_STORAGE_CONNECTION_STRING=<mesma_do_dev>
AZURE_AD_CLIENT_ID=<seu_client_id>
AZURE_AD_CLIENT_SECRET=<seu_client_secret>
AZURE_AD_TENANT_ID=<seu_tenant_id>
```

**No Azure AD:**
- Adicionar Redirect URI: `https://sgr-qa.rumolog.com/api/auth/callback/azure-ad`

### 3. Configurar Ambiente PRD

Criar arquivo `.env` no servidor PRD:

```bash
NEXT_PUBLIC_APP_ENV=production
NEXTAUTH_URL=https://sgr.rumolog.com
NEXTAUTH_SECRET=<gerar_novo_diferente>
AZURE_STORAGE_CONNECTION_STRING_PRD=<connection_string_producao>
AZURE_AD_CLIENT_ID=<seu_client_id>
AZURE_AD_CLIENT_SECRET=<seu_client_secret>
AZURE_AD_TENANT_ID=<seu_tenant_id>
```

**No Azure AD:**
- Adicionar Redirect URI: `https://sgr.rumolog.com/api/auth/callback/azure-ad`

---

## 🧹 Limpeza de Dados Mock (se necessário)

### Remover usuários de teste do banco:

Se você tinha criado perfis para os usuários mock no banco:

```typescript
// Perfis a remover (se existirem):
- pedro@teste.com
- maria@teste.com  
- joao@teste.com
- ana@teste.com
```

Você pode removê-los através do módulo de Controle de Acesso na interface.

---

## 👑 Configurar Super Admin

### Login Inicial

1. Faça login com `pedro.becel@rumolog.com` (via Azure AD)
2. Sistema detectará automaticamente como Super Admin
3. Você terá acesso total sem precisar configurar perfil

### Logs de Verificação

Ao fazer login, verifique no console do navegador:

```
🔍 Buscando controle de acesso para usuário: pedro.becel@rumolog.com
👑 Super Admin detectado - bypass de permissões ativado
```

---

## 📝 Criar Perfis de Acesso

Agora que os dados mock foram removidos, você precisa criar perfis reais:

### 1. Login como Super Admin
```
pedro.becel@rumolog.com
```

### 2. Acessar módulo "Perfis de Acesso"
```
/administration/access-profiles
```

### 3. Criar perfis necessários:

**Exemplo: Administrador**
- Nome: Administrador
- Ativo: Sim
- Permissões: Todas marcadas (view, create, edit, delete, export)

**Exemplo: Gestor de Riscos**
- Nome: Gestor de Riscos  
- Ativo: Sim
- Permissões: view, create, edit (sem delete em módulos críticos)

**Exemplo: Visualizador**
- Nome: Visualizador
- Ativo: Sim
- Permissões: Apenas view e export

### 4. Vincular Usuários aos Perfis

Acesse "Controle de Acesso":
```
/administration/access-control
```

Para cada usuário:
1. Clique em "Novo Controle de Acesso"
2. Selecione o usuário (email)
3. Selecione o perfil criado
4. Defina data de início e fim (opcional)
5. Marque como "Ativo"
6. Salvar

---

## 🧪 Testes Pós-Migração

### Teste 1: Super Admin

```bash
# Login: pedro.becel@rumolog.com
# Verificar: Acesso a todos os módulos
# Verificar: Pode criar/editar/deletar tudo
# Verificar: Não aparece erro de permissão
```

**✅ Resultado esperado:** Acesso total sem restrições

### Teste 2: Usuário com Perfil

```bash
# Criar perfil "Visualizador" (apenas view)
# Vincular a um usuário teste
# Login com esse usuário
# Verificar: Vê os dados mas botões de ação estão desabilitados
```

**✅ Resultado esperado:** Botões desabilitados, apenas visualização

### Teste 3: Usuário sem Perfil

```bash
# Login com usuário que não tem perfil configurado
# Verificar: Redirecionado para página de acesso negado
```

**✅ Resultado esperado:** Acesso negado

### Teste 4: Login de Desenvolvimento (apenas DEV)

```bash
# Em ambiente local (NODE_ENV=development)
# Abrir /auth/signin
# Verificar: Form de desenvolvimento aparece
# Preencher email e nome
# Clicar "Entrar como Desenvolvedor"
```

**✅ Resultado esperado:** Login funcionando (sem perfil = sem acesso)

---

## ⚠️ Problemas Comuns

### "Bowtie not found" ao deletar

**Causa:** Bug corrigido na deleção de Bowties  
**Solução:** Já corrigido no código

### "Usuário não autenticado"

**Causa:** NEXTAUTH_URL incorreta ou sessão expirada  
**Solução:** 
1. Verificar NEXTAUTH_URL no .env
2. Limpar cookies do navegador
3. Fazer logout e login novamente

### "Configuração do ambiente com erros"

**Causa:** Variáveis de ambiente faltando  
**Solução:**
1. Verificar console do servidor
2. Comparar com .env.example
3. Adicionar variáveis faltantes

### Provider de desenvolvimento não aparece

**Causa:** NODE_ENV não é 'development'  
**Solução:**
- Em desenvolvimento local, NODE_ENV deve ser 'development'
- Em QA/PRD, não deve aparecer (comportamento esperado)

---

## 📊 Monitoramento

### Logs Importantes

**Backend (console do servidor):**
```
🌍 Ambiente: development
✅ Configuração do ambiente validada
👤 Super Admin: pedro.becel@rumolog.com
```

**Frontend (console do navegador):**
```
🔍 Buscando controle de acesso para usuário: ...
👑 Super Admin detectado - bypass de permissões ativado
✅ Controle de acesso ativo encontrado: ...
```

### Métricas de Sucesso

- ✅ Super Admin acessa tudo sem erros
- ✅ Usuários com perfil veem módulos permitidos
- ✅ Usuários sem perfil recebem acesso negado
- ✅ Botões aparecem/desaparecem conforme permissões
- ✅ Não há erros 401/403 para ações permitidas

---

## 🆘 Rollback (se necessário)

Se precisar voltar atrás temporariamente:

1. Restaurar arquivo `src/lib/auth.ts` antigo
2. Restaurar arquivo `src/app/api/access-control/route.ts` antigo
3. Manter `NEXT_PUBLIC_APP_ENV=development`
4. Reiniciar servidor

**Nota:** Não recomendado - melhor corrigir o problema específico

---

## ✅ Validação Final

Execute este checklist:

- [ ] NEXT_PUBLIC_APP_ENV configurado em todos os ambientes
- [ ] Super Admin consegue fazer login
- [ ] Super Admin tem acesso total
- [ ] Perfis de acesso criados
- [ ] Usuários vinculados aos perfis
- [ ] Usuários comuns respeitam permissões
- [ ] Provider de dev só aparece em desenvolvimento
- [ ] Azure AD funciona em QA e PRD
- [ ] Logs de ambiente aparecem corretamente
- [ ] Não há erros de compilação

---

**Data da Migração:** ___/___/_____  
**Responsável:** _________________  
**Ambiente Testado:** [ ] DEV [ ] QA [ ] PRD  
**Status:** [ ] Sucesso [ ] Pendente [ ] Com Problemas
