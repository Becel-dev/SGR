# Otimização de Performance - Validação de Permissões

## 📋 Problema Identificado

Nas páginas de **Perfis de Acesso** e **Controle de Acesso**, as validações de permissões nas ações disponíveis nas tabelas (botões de editar e excluir) estavam sendo validadas de forma **sequencial**.

### Impacto no Desempenho:

- **Antes:** Cada `PermissionButton` chamava `usePermission` individualmente
- **Resultado:** Para cada linha da tabela, eram feitas **2 chamadas sequenciais** ao hook
- **Exemplo:** Tabela com 10 usuários = **20 verificações de permissão sequenciais**
- **Problema:** Cada verificação carregava o perfil de acesso e access control separadamente

```tsx
// ❌ PROBLEMA: Validação sequencial
<PermissionButton module="perfis-acesso" action="edit" />  // Carrega perfil + access control
<PermissionButton module="perfis-acesso" action="delete" /> // Carrega perfil + access control NOVAMENTE
```

## ✅ Solução Implementada

### 1. Novo Hook: `usePermissions` (plural)

Criado o arquivo `src/hooks/use-permissions.ts` com um hook otimizado que:
- ✅ Carrega perfil e access control **UMA ÚNICA VEZ**
- ✅ Verifica **MÚLTIPLAS permissões simultaneamente**
- ✅ Retorna resultado **memoizado** para evitar recálculos
- ✅ Usa a mesma lógica de validação do `usePermission` original

```typescript
// ✅ SOLUÇÃO: Verificação em lote
const permissions = useModulePermissions('perfis-acesso');
// Carrega perfil + access control UMA VEZ
// Retorna: { loading, view, create, edit, delete, export }

<Button disabled={!permissions.edit?.allowed || permissions.loading}>Editar</Button>
<Button disabled={!permissions.delete?.allowed || permissions.loading}>Excluir</Button>
```

### 2. Hook Helper: `useModulePermissions`

Para facilitar o uso em tabelas CRUD, criamos um helper que verifica automaticamente todas as ações:

```typescript
export function useModulePermissions(module: SystemModule) {
  return usePermissions([
    { module, action: 'view', key: 'view' },
    { module, action: 'create', key: 'create' },
    { module, action: 'edit', key: 'edit' },
    { module, action: 'delete', key: 'delete' },
    { module, action: 'export', key: 'export' },
  ]);
}
```

## 🔧 Arquivos Modificados

### 1. **src/hooks/use-permissions.ts** (NOVO)
- `usePermissions()` - Hook genérico para múltiplas permissões
- `useModulePermissions()` - Helper para módulos CRUD

### 2. **src/app/(app)/administration/access-profiles/page.tsx**
- Adicionado import: `useModulePermissions`
- Substituído múltiplos `PermissionButton` por `Button` + verificação centralizada
- Verificação única no início do componente

### 3. **src/app/(app)/administration/access-control/page.tsx**
- Adicionado import: `useModulePermissions`
- Substituído múltiplos `PermissionButton` por `Button` + verificação centralizada
- Verificação única no início do componente

## 📊 Comparação de Performance

### Antes (Validação Sequencial):
```
Tabela com 10 linhas:
- 10 linhas × 2 botões (editar + excluir) = 20 hooks usePermission
- Cada hook faz:
  1. Busca access control (API call)
  2. Busca perfil (API call)
  3. Valida permissão

Total: ~20 chamadas de hook (potencial para 40 API calls se não cacheadas)
```

### Depois (Validação em Lote):
```
Tabela com 10 linhas:
- 1 hook useModulePermissions no componente pai
- Hook faz:
  1. Busca access control (1 API call)
  2. Busca perfil (1 API call)
  3. Valida TODAS as permissões de uma vez (memoizado)

Total: 1 chamada de hook (2 API calls)
```

### Ganho de Performance:
- **Redução de ~95% nas verificações de permissão**
- **Cache automático via useMemo** - recalcula apenas quando perfil/access control mudam
- **Renderização mais rápida** - todas as linhas da tabela usam o mesmo resultado

## 🎯 Uso do Novo Hook

### Exemplo Básico:
```typescript
function MyComponent() {
  // Verifica todas as permissões do módulo de uma vez
  const permissions = useModulePermissions('perfis-acesso');

  return (
    <div>
      <Button disabled={!permissions.create?.allowed || permissions.loading}>
        Criar
      </Button>
      
      {/* Na tabela */}
      {items.map(item => (
        <tr key={item.id}>
          <td>
            <Button disabled={!permissions.edit?.allowed || permissions.loading}>
              Editar
            </Button>
            <Button disabled={!permissions.delete?.allowed || permissions.loading}>
              Excluir
            </Button>
          </td>
        </tr>
      ))}
    </div>
  );
}
```

### Exemplo Avançado (Permissões Customizadas):
```typescript
function MyComponent() {
  // Verificar permissões de múltiplos módulos
  const permissions = usePermissions([
    { module: 'perfis-acesso', action: 'edit', key: 'editProfile' },
    { module: 'controle-acesso', action: 'create', key: 'createAccess' },
    { module: 'parametros', action: 'delete', key: 'deleteParam' },
  ]);

  return (
    <Button disabled={!permissions.editProfile?.allowed}>
      Editar Perfil
    </Button>
  );
}
```

## 🔄 Compatibilidade

### O hook `usePermission` original (singular) CONTINUA FUNCIONANDO!

- ✅ `PermissionButton` continua funcionando normalmente
- ✅ Código legado não precisa ser alterado
- ✅ Use `useModulePermissions` para NOVOS componentes ou otimizações
- ✅ Use `usePermission` quando verificar apenas 1 permissão isolada

### Quando usar cada um:

| Cenário | Hook Recomendado |
|---------|-----------------|
| Tabela com múltiplos botões por linha | `useModulePermissions` |
| Formulário com vários botões de ação | `useModulePermissions` |
| Botão isolado (ex: fab button) | `usePermission` |
| Verificação única em condicional | `usePermission` |
| PermissionButton existente | Manter como está |

## 🧪 Como Testar

1. **Acesse a página de Perfis de Acesso:**
   - URL: `/administration/access-profiles`
   - Verifique que botões "Editar" e "Excluir" funcionam corretamente

2. **Acesse a página de Controle de Acesso:**
   - URL: `/administration/access-control`
   - Verifique que botões "Editar" e "Excluir" funcionam corretamente

3. **Teste com usuário SEM permissões:**
   - Login: João (Gestor de Riscos)
   - Verificar que botões estão desabilitados

4. **Teste com usuário COM permissões:**
   - Login: Administrador
   - Verificar que botões estão habilitados e funcionais

5. **Verifique performance no DevTools:**
   - Abra Network tab
   - Acesse páginas de Perfil/Controle de Acesso
   - Observe redução no número de chamadas API

## 📈 Métricas Esperadas

### Console Logs:
```
Antes (10 linhas):
🔐 usePermission: Carregando permissões... (20 vezes)
🔐 usePermission: Buscando access control... (20 vezes)
🔐 usePermission: Buscando perfil... (20 vezes)

Depois (10 linhas):
🔐 usePermissions: Carregando permissões... (1 vez)
🔐 usePermissions: Buscando access control... (1 vez)
🔐 usePermissions: Buscando perfil... (1 vez)
✅ usePermissions: Resultado calculado (1 vez)
```

### Network Tab:
```
Antes: 2 API calls × quantidade de PermissionButtons na tabela
Depois: 2 API calls total (access-control + profile)
```

## 🎉 Benefícios

1. **Performance:** ~95% menos verificações de permissão
2. **Escalabilidade:** Não importa quantas linhas na tabela
3. **Manutenibilidade:** Código mais limpo e centralizado
4. **Consistência:** Todas as linhas usam o mesmo resultado
5. **Cache:** Resultado memoizado evita recálculos desnecessários
6. **Compatibilidade:** Não quebra código existente

## 🚀 Próximos Passos (Opcional)

Para otimizar ainda mais:

1. **Cache em Context:** Criar um `PermissionsProvider` para cache global
2. **Pré-carregamento:** Carregar permissões no layout da aplicação
3. **Migrar outras páginas:** Aplicar em todas as tabelas com múltiplos botões
4. **Service Worker:** Cache de perfis/access control no lado do cliente

## 📅 Data da Otimização
Outubro de 2025
