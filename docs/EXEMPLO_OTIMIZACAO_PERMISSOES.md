# Exemplo Prático: Antes vs Depois

## 🔴 ANTES: Validação Sequencial (Ineficiente)

```tsx
'use client';

import { PermissionButton } from '@/components/auth/permission-button';

function AccessProfilesPage() {
  const [profiles, setProfiles] = useState([]);

  return (
    <Table>
      <TableBody>
        {profiles.map((profile) => (
          <TableRow key={profile.id}>
            <TableCell>{profile.name}</TableCell>
            <TableCell>
              {/* ❌ PROBLEMA: Cada botão chama usePermission separadamente */}
              <PermissionButton
                module="perfis-acesso"
                action="edit"
                onClick={() => handleEdit(profile)}
              >
                Editar
              </PermissionButton>
              
              {/* ❌ PROBLEMA: Outra chamada usePermission para o mesmo módulo */}
              <PermissionButton
                module="perfis-acesso"
                action="delete"
                onClick={() => handleDelete(profile)}
              >
                Excluir
              </PermissionButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Fluxo de Execução (10 linhas na tabela):
```
1. Renderiza linha 1
   - PermissionButton (edit) → usePermission → fetch access-control → fetch profile
   - PermissionButton (delete) → usePermission → fetch access-control → fetch profile
   
2. Renderiza linha 2
   - PermissionButton (edit) → usePermission → fetch access-control → fetch profile
   - PermissionButton (delete) → usePermission → fetch access-control → fetch profile

... (repete para cada linha)

Total: 20 execuções de usePermission
Chamadas API: ~40 requests (se não cacheadas)
Tempo estimado: ~2-3 segundos (com API lenta)
```

---

## 🟢 DEPOIS: Validação em Lote (Otimizada)

```tsx
'use client';

import { Button } from '@/components/ui/button';
import { useModulePermissions } from '@/hooks/use-permissions';

function AccessProfilesPage() {
  const [profiles, setProfiles] = useState([]);
  
  // ✅ SOLUÇÃO: Verifica todas as permissões UMA VEZ
  const permissions = useModulePermissions('perfis-acesso');

  return (
    <Table>
      <TableBody>
        {profiles.map((profile) => (
          <TableRow key={profile.id}>
            <TableCell>{profile.name}</TableCell>
            <TableCell>
              {/* ✅ Usa o resultado já carregado */}
              <Button
                disabled={!permissions.edit?.allowed || permissions.loading}
                onClick={() => handleEdit(profile)}
              >
                Editar
              </Button>
              
              {/* ✅ Usa o resultado já carregado (mesma verificação) */}
              <Button
                disabled={!permissions.delete?.allowed || permissions.loading}
                onClick={() => handleDelete(profile)}
              >
                Excluir
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Fluxo de Execução (10 linhas na tabela):
```
1. Componente monta
   - useModulePermissions → fetch access-control → fetch profile → calcula TODAS as permissões
   
2. Renderiza linha 1
   - Button (edit) → usa permissions.edit (já calculado)
   - Button (delete) → usa permissions.delete (já calculado)
   
3. Renderiza linha 2
   - Button (edit) → usa permissions.edit (já calculado)
   - Button (delete) → usa permissions.delete (já calculado)

... (repete para cada linha - SEM refazer validações)

Total: 1 execução de useModulePermissions
Chamadas API: 2 requests (access-control + profile)
Tempo estimado: ~200-300ms
```

---

## 📊 Comparação Visual

### Timeline de Requests:

#### ANTES (Sequencial):
```
0ms    100ms   200ms   300ms   400ms   500ms   ...   2000ms
|------||------||------||------||------||------|     |------|
 req1    req2    req3    req4    req5    req6   ...   req40
 ❌ Muitas chamadas API sequenciais
```

#### DEPOIS (Em Lote):
```
0ms    100ms   200ms
|------||------|
 req1    req2
 ✅ Apenas 2 chamadas API
```

---

## 🔍 Logs do Console

### ANTES:
```javascript
🔐 usePermission: Carregando permissões para admin@example.com
🔐 usePermission: Buscando access control...
🔐 usePermission: Access control recebido
🔐 usePermission: Buscando perfil abc123
✅ usePermission: Perfil carregado: Administrador

🔐 usePermission: Carregando permissões para admin@example.com
🔐 usePermission: Buscando access control...
🔐 usePermission: Access control recebido
🔐 usePermission: Buscando perfil abc123
✅ usePermission: Perfil carregado: Administrador

// ... repete 18 vezes para 10 linhas (2 botões por linha)
```

### DEPOIS:
```javascript
🔐 usePermissions: Carregando permissões para admin@example.com
🔐 usePermissions: Buscando access control...
🔐 usePermissions: Access control recebido
🔐 usePermissions: Buscando perfil abc123
✅ usePermissions: Perfil carregado: Administrador
✅ usePermissions: Resultado calculado: {
  loading: false,
  view: { allowed: true },
  create: { allowed: true },
  edit: { allowed: true },
  delete: { allowed: true },
  export: { allowed: true }
}

// Pronto! Não precisa verificar novamente
```

---

## 🎯 Comparação de Código

### Quantidade de Código:

#### ANTES:
```tsx
// 15 linhas por botão com PermissionButton
<PermissionButton
  module="perfis-acesso"
  action="edit"
  variant="ghost"
  size="icon"
  onClick={() => router.push(`/path/${id}`)}
>
  <Pencil className="h-4 w-4" />
</PermissionButton>

<PermissionButton
  module="perfis-acesso"
  action="delete"
  variant="ghost"
  size="icon"
  onClick={() => openDialog(item)}
>
  <Trash2 className="h-4 w-4" />
</PermissionButton>

// Sem verificação centralizada
```

#### DEPOIS:
```tsx
// 1 linha no início do componente
const permissions = useModulePermissions('perfis-acesso');

// Botões mais simples (9 linhas cada)
<Button
  variant="ghost"
  size="icon"
  disabled={!permissions.edit?.allowed || permissions.loading}
  onClick={() => router.push(`/path/${id}`)}
>
  <Pencil className="h-4 w-4" />
</Button>

<Button
  variant="ghost"
  size="icon"
  disabled={!permissions.delete?.allowed || permissions.loading}
  onClick={() => openDialog(item)}
>
  <Trash2 className="h-4 w-4" />
</Button>
```

### Resultado:
- ✅ Menos código repetitivo
- ✅ Lógica centralizada
- ✅ Mais fácil de manter
- ✅ Performance muito melhor

---

## 📈 Benchmark Simulado

### Teste: Tabela com 50 linhas, 2 botões por linha

| Métrica | ANTES | DEPOIS | Melhoria |
|---------|-------|--------|----------|
| Hooks executados | 100 | 1 | **99% redução** |
| Chamadas API | ~200 | 2 | **99% redução** |
| Tempo de carregamento | ~5s | ~300ms | **94% mais rápido** |
| Re-renders | 100 | 1 | **99% redução** |
| Memória usada | ~50MB | ~5MB | **90% redução** |

---

## 🎓 Lições Aprendidas

### ❌ Anti-pattern:
```tsx
// Não faça isso em loops/tabelas
{items.map(item => (
  <div key={item.id}>
    {/* Cada hook é executado PARA CADA ITEM */}
    <PermissionButton module="..." action="edit" />
    <PermissionButton module="..." action="delete" />
  </div>
))}
```

### ✅ Best Practice:
```tsx
// Faça isso: verificação fora do loop
const permissions = useModulePermissions('...');

{items.map(item => (
  <div key={item.id}>
    {/* Reutiliza o resultado calculado */}
    <Button disabled={!permissions.edit?.allowed} />
    <Button disabled={!permissions.delete?.allowed} />
  </div>
))}
```

---

## 🚀 Quando Aplicar Esta Otimização

### ✅ Use `useModulePermissions` quando:
- Tabelas com múltiplas ações por linha
- Formulários com vários botões
- Dashboards com múltiplos componentes
- Qualquer componente com 2+ verificações do mesmo módulo

### ⚠️ Mantenha `usePermission` quando:
- Verificação única e isolada
- Componente simples com 1 botão
- PermissionButton existente funcionando bem

---

## 📅 Data
Outubro de 2025
