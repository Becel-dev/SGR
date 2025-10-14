# 📋 Módulo de Perfil de Acesso - Documentação

## ✨ Visão Geral

O **Módulo de Perfil de Acesso** permite gerenciar perfis de acesso e permissões de usuários no sistema SGR. Através deste módulo, administradores podem criar perfis personalizados com permissões específicas para cada módulo do sistema.

**Data de Criação:** 14 de outubro de 2025  
**Localização:** Administração → Perfil de Acesso

---

## 🎯 Funcionalidades

### 1. Listagem de Perfis
- ✅ Visualizar todos os perfis cadastrados
- ✅ Ver quantidade de permissões por perfil
- ✅ Ver status (Ativo/Inativo)
- ✅ Ver auditoria (criado por, modificado por)
- ✅ Editar perfis existentes
- ✅ Excluir perfis

### 2. Cadastro/Edição de Perfis
- ✅ Nome do perfil (obrigatório)
- ✅ Descrição do perfil (opcional)
- ✅ Status ativo/inativo
- ✅ Configuração de permissões por módulo
- ✅ Botões para marcar/desmarcar todas as permissões de um módulo

### 3. Permissões por Módulo
Cada perfil pode ter as seguintes permissões configuradas para cada módulo:

- **Visualizar** - Permite ver os dados do módulo
- **Criar** - Permite criar novos registros
- **Editar** - Permite editar registros existentes
- **Excluir** - Permite excluir registros
- **Exportar** - Permite exportar dados (quando aplicável)

---

## 📊 Módulos Disponíveis

O sistema possui os seguintes módulos com permissões configuráveis:

| Módulo | Exportação Disponível |
|--------|----------------------|
| Painel | ✅ Sim |
| Identificação de Risco | ✅ Sim |
| Análise de Riscos | ✅ Sim |
| Governança de Controles | ✅ Sim |
| Gestão de KPI's | ✅ Sim |
| Controle de Ações | ✅ Sim |
| Escalonamento | ✅ Sim |
| Visualização Bowtie | ✅ Sim |
| Gerador de Relatório IA | ❌ Não |
| Administração | ❌ Não |

---

## 🗄️ Estrutura de Dados

### Tipo: `AccessProfile`

```typescript
export type AccessProfile = {
  id: string;
  name: string; // Nome do perfil
  description?: string; // Descrição opcional
  permissions: ModulePermission[]; // Permissões por módulo
  isActive: boolean; // Status ativo/inativo
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
};
```

### Tipo: `ModulePermission`

```typescript
export type ModulePermission = {
  module: string; // Nome do módulo
  actions: {
    view: boolean; // Visualizar
    create: boolean; // Criar
    edit: boolean; // Editar
    delete: boolean; // Excluir
    export: boolean; // Exportar
  };
};
```

---

## 🔧 Implementação Técnica

### Arquivos Criados/Modificados

#### 1. **Tipos** (`src/lib/types.ts`)
- ✅ Adicionado `AccessProfile`
- ✅ Adicionado `ModulePermission`

#### 2. **Azure Table Storage** (`src/lib/azure-table-storage.ts`)
- ✅ Nova tabela: `accessprofiles`
- ✅ Função: `getAllAccessProfiles()`
- ✅ Função: `getAccessProfileById(id: string)`
- ✅ Função: `addOrUpdateAccessProfile(profile: AccessProfile)`
- ✅ Função: `deleteAccessProfile(id: string)`

#### 3. **Página de Listagem**
- 📄 `src/app/(app)/administration/access-profiles/page.tsx`
- Recursos:
  - Listagem em tabela
  - Botão "Novo Perfil"
  - Editar/Excluir perfis
  - Dialog de confirmação de exclusão
  - Badge de status e contagem de permissões

#### 4. **Página de Cadastro/Edição**
- 📄 `src/app/(app)/administration/access-profiles/capture/page.tsx`
- Recursos:
  - Formulário de informações básicas
  - Grid de permissões por módulo
  - Switches para cada ação
  - Botões "Marcar/Desmarcar todas"
  - Validação de campos obrigatórios
  - Auditoria automática

#### 5. **Sidebar** (`src/components/layout/app-sidebar.tsx`)
- ✅ Adicionado submenu "Perfil de Acesso" em Administração

---

## 📝 Como Usar

### Criar um Novo Perfil

1. Acesse **Administração → Perfil de Acesso**
2. Clique no botão **"Novo Perfil"**
3. Preencha:
   - Nome do perfil (ex: "Gestor de Riscos")
   - Descrição (opcional)
   - Marque se o perfil estará ativo
4. Configure as permissões:
   - Selecione os módulos que o perfil terá acesso
   - Para cada módulo, marque as ações permitidas
   - Use "Marcar todas" para dar permissão total em um módulo
5. Clique em **"Salvar Perfil"**

### Editar um Perfil

1. Na listagem, clique no ícone de **lápis** (✏️) do perfil desejado
2. Modifique os campos necessários
3. Clique em **"Salvar Perfil"**

### Excluir um Perfil

1. Na listagem, clique no ícone de **lixeira** (🗑️) do perfil desejado
2. Confirme a exclusão no dialog que aparecer
3. O perfil será removido permanentemente

---

## 🔐 Segurança e Auditoria

### Auditoria Completa
Todos os perfis registram:
- ✅ **Criado por:** Nome e email do usuário que criou
- ✅ **Data de criação:** Timestamp ISO
- ✅ **Última alteração por:** Nome e email do último usuário que editou
- ✅ **Data da última alteração:** Timestamp ISO

### Validações
- ✅ Nome do perfil é obrigatório
- ✅ Aguarda autenticação carregar antes de salvar
- ✅ Confirmação antes de excluir perfis

### Permissões de Acesso
- ⚠️ **Apenas administradores** podem acessar este módulo
- ⚠️ Controlado pelo `hasRole(['admin'])` no sidebar

---

## 💾 Armazenamento no Azure

### Tabela: `accessprofiles`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| PartitionKey | string | Sempre "global" |
| RowKey | string | ID único do perfil |
| name | string | Nome do perfil |
| description | string | Descrição (opcional) |
| permissions | string (JSON) | Array serializado de permissões |
| isActive | boolean | Status do perfil |
| createdBy | string | Usuário criador |
| createdAt | string | Data de criação (ISO) |
| updatedBy | string | Último usuário que editou |
| updatedAt | string | Data da última alteração (ISO) |

**Observação:** O campo `permissions` é serializado como JSON string no Azure Table Storage e desserializado automaticamente ao recuperar os dados.

---

## 🎨 Interface de Usuário

### Componentes Utilizados
- ✅ `Card` - Container principal
- ✅ `Table` - Listagem de perfis
- ✅ `Badge` - Status e contadores
- ✅ `AlertDialog` - Confirmação de exclusão
- ✅ `Switch` - Toggle de permissões
- ✅ `Input` - Campo de texto
- ✅ `Textarea` - Campo de descrição
- ✅ `Button` - Ações diversas
- ✅ `Separator` - Divisor entre módulos

### Ícones Utilizados
- 🛡️ `Shield` - Ícone principal do módulo
- ➕ `Plus` - Novo perfil
- ✏️ `Pencil` - Editar
- 🗑️ `Trash2` - Excluir
- 💾 `Save` - Salvar
- ⬅️ `ArrowLeft` - Voltar
- ✅ `Check` - Marcar todas
- ⚠️ `AlertCircle` - Estado vazio

---

## 🚀 Próximas Funcionalidades (Sugestões)

### Fase 2 - Atribuição de Perfis
- [ ] Vincular perfis a usuários
- [ ] Middleware de verificação de permissões
- [ ] Hook `usePermission()` para checar permissões em componentes
- [ ] Desabilitar botões baseado em permissões do usuário logado

### Fase 3 - Relatórios
- [ ] Relatório de usuários por perfil
- [ ] Relatório de permissões concedidas
- [ ] Log de alterações de perfis

### Fase 4 - Avançado
- [ ] Herança de perfis (perfil base + extensões)
- [ ] Permissões temporárias
- [ ] Aprovação de mudanças de perfil
- [ ] Histórico de versões de perfis

---

## ✅ Checklist de Implementação

- [x] Criar tipos `AccessProfile` e `ModulePermission`
- [x] Adicionar funções CRUD no `azure-table-storage.ts`
- [x] Criar página de listagem
- [x] Criar página de cadastro/edição
- [x] Adicionar submenu no sidebar
- [x] Implementar auditoria automática
- [x] Adicionar validações
- [x] Implementar confirmação de exclusão
- [x] Testar criação de perfil
- [x] Testar edição de perfil
- [x] Testar exclusão de perfil
- [x] Documentar módulo

---

## 🐛 Resolução de Problemas

### Erro: "searchParams is possibly null"
**Solução:** Usar optional chaining: `searchParams?.get('id')`

### Erro: "Type undefined is not assignable to type string"
**Solução:** Garantir que `createdBy` e `createdAt` sempre tenham valores ao criar o objeto `AccessProfile`.

### Perfis não aparecem na listagem
**Verificar:**
1. Tabela `accessprofiles` foi criada no Azure?
2. Connection string está configurada?
3. Console do navegador mostra erros?

---

## 📚 Referências

- [Azure Table Storage SDK](https://docs.microsoft.com/azure/storage/tables/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Shadcn UI Components](https://ui.shadcn.com/)
- [Documentação do Sistema SGR](./README.md)

---

**Autor:** Sistema SGR  
**Última Atualização:** 14 de outubro de 2025  
**Versão:** 1.0.0
