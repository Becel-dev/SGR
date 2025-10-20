# 🔒 Auditoria de Segurança - Preparação para Produção

**Data:** 20 de Outubro de 2025  
**Sistema:** SGR - Sistema de Gestão de Riscos  
**Ambiente:** Pré-Produção

---

## 📋 Sumário Executivo

Esta auditoria identifica todos os pontos de atenção de segurança, código de debug, mocks e vulnerabilidades que devem ser tratados antes do deploy em produção.

### ⚠️ Severidade das Descobertas

- 🔴 **CRÍTICO**: Vulnerabilidades de segurança graves
- 🟠 **ALTO**: Exposição de dados sensíveis ou mocks em produção
- 🟡 **MÉDIO**: Código de debug e logs excessivos
- 🟢 **BAIXO**: Melhorias de código e limpeza

---

## 🔴 CRÍTICO - Ação Imediata Necessária

### 1. Rotas de API sem Autenticação

**Arquivo:** `src/app/api/users/test-search/route.ts`  
**Problema:** Rota de teste que expõe informações de usuários do Azure AD sem autenticação  
**Risco:** Enumeração de usuários, vazamento de informações organizacionais  
**Ação:** ✅ **REMOVER COMPLETAMENTE**

**Arquivo:** `src/app/api/users/test-auth/route.ts`  
**Problema:** Rota de teste de autenticação Azure AD  
**Risco:** Expõe informações de configuração em produção  
**Ação:** ✅ **REMOVER COMPLETAMENTE**

### 2. Mock Data em API de Produção

**Arquivo:** `src/app/api/access-profiles/[id]/route.ts`  
**Problema:** Contém `MOCK_PROFILES` com 4 perfis hardcoded  
**Risco:** Em produção, perfis fictícios podem ser acessados  
**Código Problemático:**
```typescript
const MOCK_PROFILES: Record<string, AccessProfile> = {
  'mock-profile-admin': { ... },
  'mock-profile-viewer': { ... },
  'mock-profile-manager': { ... },
  'mock-profile-admin-full': { ... }
};
```
**Ação:** 
- ✅ Remover completamente `MOCK_PROFILES`
- ✅ Remover lógica que detecta `isMockProfile`
- ✅ Implementar busca real no Azure Table Storage

---

## 🟠 ALTO - Limpeza Necessária

### 3. Páginas de Debug em Produção

**Arquivos Identificados:**
- `src/app/(app)/debug-super-admin/page.tsx` - Página de teste de Super Admin
- `src/app/(app)/debug-permissions/page.tsx` - Página de teste de permissões
- `src/components/auth/session-debug-card.tsx` - Componente de debug de sessão

**Risco:** Exposição de informações internas da aplicação  
**Ação:** 
- ✅ **REMOVER** páginas `/debug-super-admin` e `/debug-permissions`
- ⚠️ **MANTER** `session-debug-card.tsx` (já tem proteção `NODE_ENV === 'production'`)

### 4. Funções Mock em Biblioteca

**Arquivo:** `src/lib/mock-data.ts`  
**Problema:** Função `generateMockBowtie()` que gera dados fictícios  
**Código Problemático:**
```typescript
export const generateMockBowtie = (riskId: string): BowtieData => {
  // ... gera bowtie fictício
};
```
**Risco:** Pode ser chamada acidentalmente em produção  
**Ação:** ✅ **REMOVER** a função `generateMockBowtie` ou adicionar guard de NODE_ENV

---

## 🟡 MÉDIO - Console.logs e Debug

### 5. Logs Excessivos em Hooks de Permissão

**Arquivos:**
- `src/hooks/use-permission.ts` - **16 console.log/console.error**
- `src/hooks/use-permissions.ts` - **15 console.log/console.error**

**Exemplos:**
```typescript
console.log('🔐 usePermission: Aguardando usuário carregar...');
console.log('👑 usePermission: Super Admin detectado - bypass ativado');
console.log('🔐 usePermission: Buscando access control...');
```

**Impacto:** 
- Performance (logs em cada render)
- Exposição de lógica interna no console do cliente
- Dificulta debug de problemas reais

**Ação:** 
- ✅ Remover TODOS os console.log de desenvolvimento
- ⚠️ Manter apenas console.error para erros críticos
- 💡 Considerar implementar logger condicional baseado em NODE_ENV

### 6. Console.logs em Rotas de API

**Distribuição:**
- Praticamente todas as rotas de API contêm logs de debug
- Exemplos: `console.log('🔍 Buscando perfil de acesso:', profileId);`

**Ação:** 
- ✅ Revisar e remover logs de debug
- ⚠️ Manter logs de erro estruturados para produção

---

## 🟢 BAIXO - Melhorias de Código

### 7. TODOs Pendentes

**Identificados:** 20+ comentários TODO/FIXME

**Exemplos Críticos:**

```typescript
// src/app/api/access-profiles/[id]/route.ts:149
// TODO: Buscar perfil real do Azure Table Storage

// src/app/api/parameters/*/route.ts
createdBy: 'Sistema', // TODO: Substituir pelo usuário logado
updatedBy: 'Sistema', // TODO: Substituir pelo usuário logado
```

**Ação:** 
- 🔴 **CRÍTICO**: Implementar busca real de perfis do Azure Table Storage
- 🟡 **MÉDIO**: Substituir 'Sistema' por usuário autenticado real em todas as APIs de parâmetros

### 8. Código Comentado

**Exemplos:**
```typescript
// TODO: Substituir pela chamada à API
// const profile = await getAccessProfileById(profileId);
```

**Ação:** 
- Remover código comentado que não será usado
- Implementar funcionalidades pendentes ou documentar decisão de não implementar

---

## 🔐 Validações de Segurança Específicas

### 9. Autenticação em Rotas de API

**Status:** ✅ **BOM**

Rotas verificadas que têm autenticação adequada:
- ✅ `/api/access-control/route.ts` - usa `getToken`
- ✅ `/api/access-profiles/[id]/route.ts` - usa `getToken`
- ✅ `/api/entraid/users/route.ts` - usa `getToken`

**Descoberta:** A maioria das rotas usa o helper `api-permissions.ts` que valida token.

### 10. Variáveis de Ambiente Sensíveis

**Arquivo:** `.env.example`  
**Status:** ✅ **BOM** - Não contém valores reais

**Variáveis Sensíveis Identificadas:**
- `NEXTAUTH_SECRET` ✅ (não exposta)
- `AZURE_AD_CLIENT_SECRET` ✅ (não exposta)
- `AZURE_STORAGE_CONNECTION_STRING` ✅ (não exposta)

**Verificação de Exposição no Código:**
- ✅ Nenhum secret hardcoded encontrado
- ✅ Todas as secrets vêm de `process.env`
- ✅ Não há variáveis `NEXT_PUBLIC_` com dados sensíveis

### 11. Validação de Inputs

**Descoberta:** Várias rotas aceitam dados sem validação adequada

**Exemplo Problemático:**
```typescript
// Sem validação de tipo/formato
const { name, description } = await request.json();
```

**Ação Recomendada:**
- Implementar validação com Zod ou similar
- Sanitizar inputs antes de salvar no banco
- Adicionar rate limiting para APIs públicas

---

## 📝 Plano de Ação - Priorizado

### Fase 1 - CRÍTICO (Fazer AGORA)

1. ✅ **Remover rotas de teste:**
   - `src/app/api/users/test-search/route.ts`
   - `src/app/api/users/test-auth/route.ts`

2. ✅ **Remover páginas de debug:**
   - `src/app/(app)/debug-super-admin/page.tsx`
   - `src/app/(app)/debug-permissions/page.tsx`

3. ✅ **Limpar Mock Profiles:**
   - Remover `MOCK_PROFILES` de `access-profiles/[id]/route.ts`
   - Implementar busca real no Azure Table Storage

4. ✅ **Remover generateMockBowtie:**
   - De `src/lib/mock-data.ts`

### Fase 2 - ALTO (Antes do Deploy)

5. ✅ **Limpar Console.logs:**
   - Remover logs de `use-permission.ts`
   - Remover logs de `use-permissions.ts`
   - Criar logger condicional

6. ✅ **Implementar TODOs Críticos:**
   - Busca real de perfis de acesso
   - Substituir 'Sistema' por usuário real

### Fase 3 - MÉDIO (Melhorias)

7. ⏳ **Validação de Inputs:**
   - Implementar Zod schemas
   - Adicionar sanitização

8. ⏳ **Rate Limiting:**
   - Proteger APIs contra abuso

### Fase 4 - BAIXO (Pós-Deploy)

9. ⏳ **Limpeza Geral:**
   - Remover TODOs resolvidos
   - Remover código comentado
   - Otimizar imports

---

## ✅ Checklist de Deploy

Antes de fazer deploy para PRODUÇÃO, verificar:

- [ ] ❌ Nenhuma rota `/api/*/test-*` presente
- [ ] ❌ Nenhuma página `/debug-*` acessível
- [ ] ❌ Nenhum `MOCK_` ou `mock` em código de produção
- [ ] ❌ Console.logs removidos de código crítico
- [ ] ✅ Todas as variáveis de ambiente configuradas
- [ ] ✅ `NEXTAUTH_SECRET` único e seguro em PRD
- [ ] ✅ Azure AD configurado para produção
- [ ] ✅ Connection String de PRD separada
- [ ] ❌ TODOs críticos resolvidos
- [ ] ⏳ Testes de autenticação funcionando
- [ ] ⏳ Super Admin testado em PRD

---

## 📊 Estatísticas

- **Rotas de API Total:** ~50+
- **Rotas de Teste Encontradas:** 2 (para remover)
- **Páginas de Debug:** 2 (para remover)
- **Console.logs em Hooks:** 31
- **TODOs Críticos:** 3
- **TODOs Totais:** 20+
- **Mocks Encontrados:** 5 instâncias

---

## 🎯 Recomendações Adicionais

### Segurança em Camadas

1. **Autenticação:**
   - ✅ NextAuth implementado
   - ✅ Azure AD integrado
   - ⏳ Refresh token rotation (considerar)

2. **Autorização:**
   - ✅ Sistema ACL implementado
   - ✅ Super Admin configurado
   - ⏳ Audit log de acessos (considerar)

3. **Dados:**
   - ✅ Azure Table Storage com connection string segura
   - ⏳ Encriptação em repouso (verificar configuração Azure)
   - ⏳ Backup automatizado (verificar política)

### Monitoramento

1. **Logs de Produção:**
   - Implementar Winston ou Pino para logging estruturado
   - Enviar logs para Azure Monitor ou similar
   - Alertas para erros críticos

2. **Performance:**
   - Implementar APM (Application Performance Monitoring)
   - Monitorar tempos de resposta de API
   - Alertas para degradação de performance

3. **Segurança:**
   - Monitorar tentativas de acesso não autorizado
   - Rate limiting em endpoints públicos
   - WAF (Web Application Firewall) no Azure

---

## 📅 Histórico de Alterações

| Data | Autor | Descrição |
|------|-------|-----------|
| 2025-10-20 | Copilot | Auditoria inicial pré-produção |

---

**Status da Auditoria:** 🟡 EM PROGRESSO  
**Próxima Revisão:** Após implementação da Fase 1 e 2
