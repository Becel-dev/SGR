# Correção de Permissões no Módulo de Parâmetros

## 📋 Resumo
Implementada proteção completa de permissões no módulo de **Parâmetros**, incluindo validações tanto no **frontend** quanto no **backend**.

## 🎯 Problema Identificado
Com o perfil do João (Gestor de Riscos), era possível criar e excluir itens no módulo de parâmetros sem ter as permissões necessárias:
- ✅ TopRisks
- ✅ Temas Materiais
- ✅ Categorias de Controle
- ✅ Regras de Classificação de IER (Risk Factors)

## ✅ Solução Implementada

### 1. **Frontend - Controle de Interface (4 páginas)**

#### Arquivos Modificados:
- `src/app/(app)/administration/parameters/toprisk/page.tsx`
- `src/app/(app)/administration/parameters/temamaterial/page.tsx`
- `src/app/(app)/administration/parameters/categoriacontrole/page.tsx`
- `src/app/(app)/administration/parameters/riskfactor/page.tsx` *(já estava protegido)*

#### Alterações Aplicadas:
1. **Import do hook de permissões**:
   ```typescript
   import { usePermission } from '@/hooks/use-permission';
   ```

2. **Verificação de permissões no componente**:
   ```typescript
   const canCreateParam = usePermission('parametros', 'create');
   const canEditParam = usePermission('parametros', 'edit');
   const canDeleteParam = usePermission('parametros', 'delete');
   ```

3. **Botão "Adicionar" desabilitado sem permissão**:
   ```typescript
   <Button disabled={!canCreateParam.allowed}>
     <PlusCircle className="mr-2 h-4 w-4" />
     Adicionar {Item}
   </Button>
   ```

4. **Ícones de ação (editar/excluir) desabilitados sem permissão**:
   ```typescript
   <Button variant="ghost" size="sm" onClick={onEdit} disabled={!canEdit}>
     <Edit className="h-4 w-4" />
   </Button>
   <Button variant="ghost" size="sm" onClick={onDelete} disabled={!canDelete}>
     <Trash2 className="h-4 w-4 text-destructive" />
   </Button>
   ```

### 2. **Backend - Validação de APIs (4 rotas)**

#### Novo Arquivo Criado:
- `src/lib/api-permissions.ts` - **Helper de validação de permissões para APIs**

#### Função Principal:
```typescript
export async function validateApiPermission(
  request: NextRequest,
  module: SystemModule,
  action: Permission
): Promise<NextResponse | null>
```

**O que ela faz:**
1. ✅ Verifica autenticação do usuário (NextAuth token)
2. ✅ Busca o controle de acesso do usuário
3. ✅ Valida se o controle de acesso está ativo e dentro da validade
4. ✅ Busca o perfil de acesso vinculado
5. ✅ Verifica se o perfil está ativo
6. ✅ Valida a permissão específica (create/edit/delete)
7. ✅ Retorna erro 401/403 se não autorizado ou null se permitido

#### APIs Protegidas:
- `src/app/api/parameters/toprisk/route.ts`
- `src/app/api/parameters/temamaterial/route.ts`
- `src/app/api/parameters/categoriacontrole/route.ts`
- `src/app/api/parameters/riskfactor/route.ts`

#### Métodos Protegidos em Cada API:
```typescript
// POST - Criar novo item
export async function POST(request: NextRequest) {
  const permissionError = await validateApiPermission(request, 'parametros', 'create');
  if (permissionError) return permissionError;
  // ... lógica de criação
}

// PUT - Editar item existente
export async function PUT(request: NextRequest) {
  const permissionError = await validateApiPermission(request, 'parametros', 'edit');
  if (permissionError) return permissionError;
  // ... lógica de edição
}

// DELETE - Excluir item
export async function DELETE(request: NextRequest) {
  const permissionError = await validateApiPermission(request, 'parametros', 'delete');
  if (permissionError) return permissionError;
  // ... lógica de exclusão
}
```

### 3. **Respostas de Erro Padronizadas**

#### 401 - Não Autenticado:
```json
{
  "error": "Não autenticado. Faça login para continuar."
}
```

#### 403 - Sem Permissão:
```json
{
  "error": "Você não tem permissão para criar/editar/excluir neste módulo.",
  "module": "parametros",
  "action": "create"
}
```

#### 403 - Sem Perfil:
```json
{
  "error": "Você não possui um perfil de acesso ativo."
}
```

#### 403 - Perfil Inativo/Expirado:
```json
{
  "error": "Seu acesso está inativo ou expirado."
}
```

## 🧪 Como Testar

### Teste 1: Usuário SEM Permissões (João)
1. Faça login com o usuário **João** (Gestor de Riscos)
2. Acesse qualquer tela de parâmetros:
   - Administração → Parâmetros → Top Risks
   - Administração → Parâmetros → Temas Materiais
   - Administração → Parâmetros → Categorias de Controle
   - Administração → Parâmetros → Regras de Classificação IER

**Resultado Esperado:**
- ❌ Botão "Adicionar" **desabilitado**
- ❌ Ícones de editar (lápis) **desabilitados**
- ❌ Ícones de excluir (lixeira) **desabilitados**
- ❌ Se tentar chamar a API diretamente (via console/Postman), retorna **403 Forbidden**

### Teste 2: Usuário COM Permissões (Pedro/Ana)
1. Faça login com o usuário **Pedro** ou **Ana** (Administradores)
2. Acesse as mesmas telas de parâmetros

**Resultado Esperado:**
- ✅ Botão "Adicionar" **habilitado** e funcional
- ✅ Ícones de editar **habilitados** e funcionais
- ✅ Ícones de excluir **habilitados** e funcionais
- ✅ Operações via API funcionam normalmente

### Teste 3: Tentativa de Bypass (API Direta)
Mesmo que o usuário tente burlar o frontend e chamar a API diretamente:

```bash
# Exemplo com cURL (deve retornar 403)
curl -X POST http://localhost:3000/api/parameters/toprisk \
  -H "Content-Type: application/json" \
  -d '{"nome": "Teste Bypass"}' \
  --cookie "session_token_do_joao"
```

**Resultado Esperado:**
```json
{
  "error": "Você não tem permissão para criar neste módulo.",
  "module": "parametros",
  "action": "create"
}
```

## 📊 Impacto

### Segurança:
- ✅ **100%** das operações de criação protegidas
- ✅ **100%** das operações de edição protegidas
- ✅ **100%** das operações de exclusão protegidas
- ✅ Proteção em **2 camadas** (frontend + backend)

### Arquivos Modificados:
- **8 arquivos** no total
  - **1 novo arquivo** criado (`api-permissions.ts`)
  - **3 páginas frontend** corrigidas
  - **4 APIs backend** protegidas

### Compatibilidade:
- ✅ Não quebra funcionalidade existente
- ✅ Usuários com permissões continuam operando normalmente
- ✅ Seguindo o mesmo padrão usado em outros módulos (RiskFactor)

## 🔐 Permissões Necessárias

Para operar no módulo de Parâmetros, o usuário precisa ter no seu **Perfil de Acesso**:

| Operação | Permissão Necessária |
|----------|---------------------|
| Visualizar listas | `parametros.view` |
| Criar novo item | `parametros.create` |
| Editar item existente | `parametros.edit` |
| Excluir item | `parametros.delete` |

## 📝 Notas Técnicas

1. **Hook `usePermission`**: Carrega as permissões do usuário uma única vez e retorna objeto com `{ allowed: boolean, loading: boolean, message?: string }`

2. **Função `validateApiPermission`**: 
   - É assíncrona e deve ser chamada no início de cada método da API
   - Retorna `NextResponse` com erro ou `null` se permitido
   - Registra logs detalhados para auditoria

3. **Otimização**: As permissões são carregadas uma única vez por componente, evitando múltiplas requisições

4. **Logs**: Todas as tentativas de acesso (permitidas ou negadas) são registradas no console com prefixos:
   - 🔐 Para verificações de permissão
   - ✅ Para permissões concedidas
   - ❌ Para erros
   - ⚠️ Para avisos (sem perfil, inativo, etc.)

## ✨ Conclusão

O módulo de **Parâmetros** agora está completamente protegido, seguindo o mesmo padrão de segurança aplicado nos demais módulos do sistema. Usuários sem as permissões adequadas não conseguirão mais criar, editar ou excluir itens, nem via interface nem via API direta.

---

**Data da Correção**: 15/10/2025  
**Desenvolvedor**: GitHub Copilot  
**Status**: ✅ Concluído e Testado
