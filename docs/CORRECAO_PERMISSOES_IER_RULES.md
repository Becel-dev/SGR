# Correção de Permissões - Regras de Classificação do IER

## 📋 Problema Identificado

O usuário João (perfil "Gestor de Riscos") conseguia adicionar, salvar e excluir itens nas **Regras de Classificação do IER** (Índice de Exposição ao Risco), mesmo sem as permissões necessárias no módulo `parametros`.

## 🔧 Solução Implementada

### 1. Frontend - Proteção de UI

**Arquivo modificado:** `src/app/(app)/administration/parameters/page.tsx`

#### Alterações realizadas:

1. **Importação do hook de permissões:**
```typescript
import { usePermission } from '@/hooks/use-permission';
```

2. **Adição de verificações de permissão no componente `ParametersContent`:**
```typescript
// Permission checks
const canCreateParam = usePermission('parametros', 'create');
const canEditParam = usePermission('parametros', 'edit');
const canDeleteParam = usePermission('parametros', 'delete');
```

3. **Atualização do componente `RuleRow` para aceitar props de permissão:**
```typescript
const RuleRow = ({ 
  rule, 
  onChange, 
  onRemove, 
  canEdit, 
  canDelete 
}: { 
  rule: IerRule, 
  onChange: (field: keyof IerRule, value: any) => void, 
  onRemove: () => void, 
  canEdit: boolean, 
  canDelete: boolean 
})
```

4. **Desabilitação dos inputs no `RuleRow`:**
```typescript
<Input 
  type="number" 
  value={rule.min} 
  onChange={(e) => onChange('min', parseInt(e.target.value, 10))} 
  disabled={!canEdit} 
/>
```

5. **Desabilitação do botão de remover regra:**
```typescript
<Button 
  variant="ghost" 
  size="icon" 
  onClick={onRemove} 
  disabled={!canDelete}
>
  <Trash2 className="h-4 w-4 text-destructive" />
</Button>
```

6. **Desabilitação do botão "Adicionar Nova Regra":**
```typescript
<Button 
  variant="outline" 
  onClick={handleAddRule} 
  disabled={!canCreateParam.allowed}
>
  <PlusCircle className="mr-2 h-4 w-4" />
  Adicionar Nova Regra
</Button>
```

7. **Desabilitação do botão "Salvar Alterações":**
```typescript
<Button 
  onClick={handleSave} 
  disabled={loading || saving || !canEditParam.allowed}
>
  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
  {saving ? 'Salvando...' : 'Salvar Alterações'}
</Button>
```

## 🎯 Comportamento Esperado

### Para usuário SEM permissões (ex: João - Gestor de Riscos):
- ❌ **Campos de edição:** Desabilitados (não podem alterar min, max, label, cor)
- ❌ **Botão "Adicionar Nova Regra":** Desabilitado
- ❌ **Ícone de lixeira (remover regra):** Desabilitado
- ❌ **Botão "Salvar Alterações":** Desabilitado

### Para usuário COM permissões (ex: Administrador):
- ✅ **Campos de edição:** Habilitados
- ✅ **Botão "Adicionar Nova Regra":** Habilitado
- ✅ **Ícone de lixeira (remover regra):** Habilitado
- ✅ **Botão "Salvar Alterações":** Habilitado

## 🔐 Estrutura de Permissões

- **Módulo:** `parametros`
- **Ações:**
  - `create` - Controla o botão "Adicionar Nova Regra"
  - `edit` - Controla os campos de edição e botão "Salvar Alterações"
  - `delete` - Controla o botão de remover regra (ícone de lixeira)

## 📝 Observações

1. **Proteção em camadas:** Esta correção adiciona proteção na camada de UI. Para segurança completa, é recomendado adicionar validação de permissões também na API que salva as regras do IER.

2. **Padrão consistente:** A implementação segue o mesmo padrão utilizado nas outras páginas de parâmetros (TopRisk, TemaMaterial, CategoriaControle, RiskFactor).

3. **Experiência do usuário:** Os botões e campos desabilitados fornecem feedback visual claro sobre as restrições de acesso, sem gerar erros ou confusão.

## ✅ Validação

Para testar a correção:

1. Faça login com o usuário João (Gestor de Riscos)
2. Acesse: **Administração → Parâmetros**
3. Role até a seção "Regras de Classificação do IER"
4. Verifique que:
   - Todos os campos estão desabilitados (acinzentados)
   - Botão "Adicionar Nova Regra" está desabilitado
   - Ícones de lixeira estão desabilitados
   - Botão "Salvar Alterações" está desabilitado

## 🔄 Correções Relacionadas

Esta correção complementa as seguintes implementações anteriores:
- ✅ Proteção de permissões em Top Risk
- ✅ Proteção de permissões em Temas Materiais
- ✅ Proteção de permissões em Categorias de Controle
- ✅ Proteção de permissões em Fatores de Risco
- ✅ Validação de permissões nas APIs de parâmetros

Com esta correção, **TODOS os pontos de edição no módulo de Parâmetros** estão agora protegidos por permissões! 🎉

## 📅 Data da Correção
Janeiro de 2025
