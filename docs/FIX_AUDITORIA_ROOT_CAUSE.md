# 🎯 FIX: Auditoria Sendo Sobrescrita com "Sistema"

## ✅ Problema Resolvido

**Data:** 14 de outubro de 2025  
**Status:** CORRIGIDO

---

## 🔍 Diagnóstico do Problema

### Sintoma
Todos os registros apareciam com:
- **Última alteração por:** Sistema
- **Criado por:** Sistema

Mesmo quando o frontend enviava os dados corretos do usuário logado (ex: "Pedro Teste (pedro@teste.com)").

### Root Cause Encontrado
O problema estava no arquivo `src/lib/azure-table-storage.ts`. As funções de salvar dados estavam **SOBRESCREVENDO** os valores de auditoria enviados pelo frontend com valores fixos "Sistema".

```typescript
// ❌ CÓDIGO PROBLEMÁTICO (ANTES)
export async function addOrUpdateIdentifiedRisk(riskData: IdentifiedRisk): Promise<IdentifiedRisk> {
    let risk = { ...riskData };
    if (!risk.createdAt) {
        risk.createdAt = now;
        risk.createdBy = "Sistema";  // ❌ Sobrescrevendo!
    }
    risk.updatedAt = now;
    risk.updatedBy = "Sistema";  // ❌ Sempre sobrescrevendo!
    // ...
}
```

### Por Que Aconteceu?
1. O **frontend** estava enviando os dados corretos
2. O **hook useAuthUser()** estava funcionando corretamente
3. Mas o **backend (Azure Table Storage)** ignorava os valores recebidos e sobrescrevia com "Sistema"

---

## ✅ Solução Implementada

### Mudança na Lógica
Agora as funções **respeitam os valores enviados** pelo frontend e só usam "Sistema" como **fallback** caso não sejam fornecidos.

```typescript
// ✅ CÓDIGO CORRIGIDO (DEPOIS)
export async function addOrUpdateIdentifiedRisk(riskData: IdentifiedRisk): Promise<IdentifiedRisk> {
    let risk = { ...riskData };
    
    // Mantém os valores de auditoria enviados pelo frontend
    // Só preenche com valores padrão se não foram fornecidos
    if (!risk.createdAt) {
        risk.createdAt = now;
    }
    if (!risk.createdBy) {
        risk.createdBy = "Sistema (sistema@sgr.com)";
    }
    if (!risk.updatedAt) {
        risk.updatedAt = now;
    }
    if (!risk.updatedBy) {
        risk.updatedBy = "Sistema (sistema@sgr.com)";
    }
    // ...
}
```

### Funções Corrigidas

Foram corrigidas **4 funções** em `src/lib/azure-table-storage.ts`:

1. ✅ **addOrUpdateIdentifiedRisk** (linha ~505) - Identificação de Riscos
2. ✅ **addOrUpdateBowtie** (linha ~825) - Bowtie
3. ✅ **addOrUpdateEscalation** (linha ~1697) - Escalonamento
4. ✅ **addOrUpdateAction** (linha ~1848) - Ações

---

## 🧪 Como Testar

### Teste 1: Novo Registro
1. Faça login com um usuário (ex: pedro@teste.com)
2. Crie um **novo registro** de identificação
3. Verifique que aparece:
   - **Criado por:** Pedro Teste (pedro@teste.com)
   - **Última alteração por:** Pedro Teste (pedro@teste.com)

### Teste 2: Edição de Registro
1. Edite um registro existente
2. Verifique que **updatedBy** e **updatedAt** são atualizados com seu usuário

### Teste 3: Outros Módulos
- Teste também nos módulos:
  - Controles
  - Bowtie
  - Escalonamento
  - Ações

---

## 📊 Fluxo Correto Agora

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. FRONTEND (identification/capture/page.tsx)                   │
│    - useAuthUser() obtém: Pedro Teste (pedro@teste.com)        │
│    - Cria userName: "Pedro Teste (pedro@teste.com)"            │
│    - Envia no riskData: { createdBy: userName, updatedBy: ... }│
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. BACKEND (azure-table-storage.ts)                            │
│    ✅ ANTES: Sobrescrevia com "Sistema"                         │
│    ✅ AGORA: Respeita valores recebidos                         │
│    - if (!risk.createdBy) → só então usa "Sistema" como fallback│
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. AZURE TABLE STORAGE                                          │
│    - Salva com os valores corretos do usuário logado           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Arquivos Modificados

### `src/lib/azure-table-storage.ts`
- **4 funções corrigidas** para respeitar valores de auditoria
- Lógica: apenas usa "Sistema" se valores não forem fornecidos

### `src/app/(app)/identification/capture/page.tsx`
- Removido log diagnóstico temporário
- Mantém lógica correta de enviar userName

---

## 📝 Notas Importantes

### 1. Registros Antigos
Os registros criados **antes desta correção** ainda terão "Sistema" nos campos de auditoria. Isso é esperado, pois foram salvos com a lógica antiga.

### 2. Fallback para "Sistema"
O valor "Sistema (sistema@sgr.com)" só será usado quando:
- A aplicação faz operações automáticas (ex: migrations)
- O frontend não envia valores de auditoria (erro de implementação)

### 3. Formato Padronizado
Agora usamos: `"Sistema (sistema@sgr.com)"` em vez de apenas `"Sistema"` para manter consistência.

---

## ✨ Resultado Final

✅ **Auditoria funcionando corretamente**  
✅ **Frontend e Backend alinhados**  
✅ **Rastreabilidade de quem cria/modifica registros**  
✅ **Todos os módulos corrigidos**

---

## 📚 Documentos Relacionados

- [FIX_HOOK_CALL_ERROR.md](./FIX_HOOK_CALL_ERROR.md) - Como corrigimos erro de hook
- [FIX_AUDITORIA_SISTEMA.md](./FIX_AUDITORIA_SISTEMA.md) - Primeiro diagnóstico do problema
- [DEBUG_AUDITORIA.md](./DEBUG_AUDITORIA.md) - Processo de debug

