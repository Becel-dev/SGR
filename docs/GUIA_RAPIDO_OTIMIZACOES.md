# Guia Rápido de Implementação - Otimizações Prioritárias

## 🚀 Quick Wins - Implementação em 2 Horas

Este guia contém as **3 otimizações mais impactantes** que podem ser implementadas rapidamente.

---

## 1️⃣ KPIs - Lista Principal (10 minutos)

### Arquivo: `src/app/(app)/kpis/page.tsx`

### ANTES (Linhas 41-43):
```tsx
const canViewKpis = usePermission('kpis', 'view');
const canEditKpis = usePermission('kpis', 'edit');
const canDeleteKpis = usePermission('kpis', 'delete');
```

### DEPOIS:
```tsx
// Adicionar import
import { useModulePermissions } from '@/hooks/use-permissions';

// Substituir os 3 hooks por 1
const permissions = useModulePermissions('kpis');
```

### Substituir usos (3 locais):
```tsx
// ANTES:
disabled={!canViewKpis.allowed}
disabled={!canEditKpis.allowed}
disabled={!canDeleteKpis.allowed}

// DEPOIS:
disabled={!permissions.view?.allowed || permissions.loading}
disabled={!permissions.edit?.allowed || permissions.loading}
disabled={!permissions.delete?.allowed || permissions.loading}
```

**Ganho:** 66% menos verificações | Tempo: 10 min

---

## 2️⃣ Análise - Página de Detalhe (30 minutos) ⭐ MAIOR IMPACTO

### Arquivo: `src/app/(app)/analysis/capture/[id]/page.tsx`

### ANTES (6 PermissionButtons espalhados):
```tsx
<PermissionButton module="analise" action="edit" />     // linha ~511
<PermissionButton module="analise" action="delete" />   // linha ~538
<PermissionButton module="analise" action="edit" />     // linha ~551
<PermissionButton module="analise" action="create" />   // linha ~774
<PermissionButton module="analise" action="edit" />     // linha ~801
<PermissionButton module="analise" action="delete" />   // linha ~813
```

### ETAPAS:

#### 1. Adicionar imports (no topo):
```tsx
import { useModulePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
```

#### 2. Adicionar hook no componente (após outros hooks):
```tsx
function AnalysisCaptureContent() {
  // ... outros hooks ...
  
  // ADICIONAR AQUI:
  const permissions = useModulePermissions('analise');
  
  // ... resto do código ...
}
```

#### 3. Substituir cada PermissionButton:

**Exemplo para botão de Editar (linha ~511):**
```tsx
// ANTES:
<PermissionButton 
  module="analise" 
  action="edit"
  variant="outline"
  onClick={handleEdit}
>
  <Pencil className="h-4 w-4 mr-2" />
  Editar
</PermissionButton>

// DEPOIS:
<Button 
  variant="outline"
  disabled={!permissions.edit?.allowed || permissions.loading}
  onClick={handleEdit}
>
  <Pencil className="h-4 w-4 mr-2" />
  Editar
</Button>
```

**Exemplo para botão de Deletar (linha ~538):**
```tsx
// ANTES:
<PermissionButton 
  module="analise" 
  action="delete"
  variant="destructive"
  onClick={handleDelete}
>
  <Trash2 className="h-4 w-4 mr-2" />
  Excluir
</PermissionButton>

// DEPOIS:
<Button 
  variant="destructive"
  disabled={!permissions.delete?.allowed || permissions.loading}
  onClick={handleDelete}
>
  <Trash2 className="h-4 w-4 mr-2" />
  Excluir
</Button>
```

**Repetir para os outros 4 botões seguindo o mesmo padrão.**

**Ganho:** 83% menos verificações | Tempo: 30 min

---

## 3️⃣ Debounce em Filtros (40 minutos)

### Criar Hook de Debounce (5 min)

**Arquivo:** `src/hooks/use-debounced-value.ts` (NOVO)
```typescript
import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### Aplicar em Filtros (5 min por página)

#### Exemplo: KPIs (`src/app/(app)/kpis/page.tsx`)

**ANTES:**
```tsx
import { useState, useEffect } from 'react';

function KpisContent() {
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    if (search) {
      const filtered = kpis.filter(/* ... */);
      setFilteredKpis(filtered);
    } else {
      setFilteredKpis(kpis);
    }
  }, [search, kpis]); // ❌ Executa a cada tecla!
  
  return (
    <Input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  );
}
```

**DEPOIS:**
```tsx
import { useState, useEffect } from 'react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

function KpisContent() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300); // ✅ Aguarda 300ms
  
  useEffect(() => {
    if (debouncedSearch) {
      const filtered = kpis.filter(/* ... */);
      setFilteredKpis(filtered);
    } else {
      setFilteredKpis(kpis);
    }
  }, [debouncedSearch, kpis]); // ✅ Executa só após parar de digitar
  
  return (
    <Input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  );
}
```

### Páginas para aplicar debounce (em ordem de prioridade):
1. ✅ `src/app/(app)/kpis/page.tsx`
2. ✅ `src/app/(app)/controls/page.tsx`
3. ✅ `src/app/(app)/identification/page.tsx`
4. ✅ `src/app/(app)/actions/page.tsx`
5. ✅ `src/app/(app)/access-control/page.tsx`

**Ganho:** 90% menos re-renders durante digitação | Tempo: 5 min × 5 páginas = 25 min

---

## 📊 Resumo da Sessão de 2 Horas

### Checklist de Implementação:

#### Fase 1: Otimização de Permissões (40 min)
- [ ] **KPIs Lista** - useModulePermissions (10 min)
- [ ] **Análise Detalhe** - useModulePermissions (30 min)

#### Fase 2: Debounce em Filtros (30 min)
- [ ] Criar hook useDebouncedValue (5 min)
- [ ] Aplicar em KPIs (5 min)
- [ ] Aplicar em Controls (5 min)
- [ ] Aplicar em Identification (5 min)
- [ ] Aplicar em Actions (5 min)
- [ ] Aplicar em Access Control (5 min)

#### Fase 3: Testes (50 min)
- [ ] Testar KPIs - verificar permissões (10 min)
- [ ] Testar Análise - verificar botões (10 min)
- [ ] Testar filtros com debounce (15 min)
- [ ] Validar no console (logs de performance) (5 min)
- [ ] Documentar mudanças (10 min)

### Ganhos Esperados:

| Otimização | Antes | Depois | Ganho |
|------------|-------|--------|-------|
| **KPIs Permissões** | 3 hooks | 1 hook | 66% ⚡ |
| **Análise Permissões** | 6 hooks | 1 hook | 83% 🚀 |
| **Filtros com Debounce** | ~15 renders | ~2 renders | 87% 🎯 |

### Total de Performance Gain:
**~70-80% de melhoria nas páginas otimizadas** 🎉

---

## 🔍 Como Validar as Otimizações

### 1. Console Logs (DevTools)
```javascript
// ANTES da otimização
🔐 usePermission: Carregando... (múltiplas vezes)
🔐 usePermission: Buscando access control... (múltiplas vezes)

// DEPOIS da otimização
🔐 usePermissions: Carregando... (1 vez)
✅ usePermissions: Resultado calculado (1 vez)
```

### 2. Network Tab (DevTools)
```
ANTES: 6-10 requests de permissão
DEPOIS: 2 requests (access-control + profile)
```

### 3. React DevTools Profiler
```
ANTES: 15-20 renders durante digitação no filtro
DEPOIS: 1-2 renders (só após parar de digitar)
```

### 4. Performance Timeline
```
ANTES: Carregamento ~2.5s
DEPOIS: Carregamento ~0.8s
```

---

## ⚠️ Troubleshooting

### Problema: "permissions.view is undefined"
**Solução:** Adicionar verificação de loading
```tsx
disabled={!permissions.view?.allowed || permissions.loading}
```

### Problema: "Botão fica desabilitado sempre"
**Solução:** Verificar se o módulo está correto
```tsx
// Verificar nome do módulo
const permissions = useModulePermissions('kpis'); // ✅ correto
const permissions = useModulePermissions('KPIs'); // ❌ errado
```

### Problema: "Filtro não funciona com debounce"
**Solução:** Usar debouncedValue no useEffect, não no filter direto
```tsx
// ❌ Errado
const filtered = items.filter(item => 
  item.name.includes(useDebouncedValue(search, 300))
);

// ✅ Correto
const debouncedSearch = useDebouncedValue(search, 300);
const filtered = items.filter(item => 
  item.name.includes(debouncedSearch)
);
```

---

## 📝 Template de Commit

Após implementar, commitar com:

```bash
git add .
git commit -m "perf: otimizar verificações de permissão e filtros

- Substituir múltiplos usePermission por useModulePermissions em KPIs e Análise
- Adicionar debounce em filtros de busca (5 páginas)
- Criar hook useDebouncedValue para reutilização
- Reduzir verificações de permissão em ~75%
- Reduzir re-renders durante digitação em ~85%

Closes #ISSUE_NUMBER"
```

---

## 🎯 Próximos Passos (Após Quick Wins)

1. **Otimizar Identificação Detalhe** (2 PermissionButton → 15 min)
2. **Otimizar KPIs Detalhe** (3 PermissionButton → 15 min)
3. **Adicionar useMemo em cálculos** (Actions página → 20 min)
4. **Memoizar componentes de tabela** (opcional → 30 min)

---

## 📅 Data
Outubro de 2025
