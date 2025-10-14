# 👥 Módulo de Controle de Acesso - Documentação

## ✨ Visão Geral

O **Módulo de Controle de Acesso** permite vincular usuários do Microsoft EntraID (Azure AD) aos perfis de acesso criados no sistema. Através deste módulo, administradores podem gerenciar quais usuários têm acesso ao sistema e quais permissões cada um possui.

**Data de Criação:** 14 de outubro de 2025  
**Localização:** Administração → Controle de Acesso

---

## 🎯 Funcionalidades

### 1. Listagem de Controles de Acesso
- ✅ Visualizar todos os vínculos usuário-perfil
- ✅ Buscar por usuário, email ou perfil
- ✅ Ver status do acesso (Ativo/Inativo/Expirado)
- ✅ Ver período de vigência do acesso
- ✅ Ver auditoria (criado por, modificado por)
- ✅ Editar vínculos existentes
- ✅ Excluir vínculos

### 2. Cadastro/Edição de Controles
- ✅ Buscar usuários do EntraID em tempo real
- ✅ Selecionar perfil de acesso
- ✅ Definir status ativo/inativo
- ✅ Configurar data de início (opcional)
- ✅ Configurar data de término (opcional)
- ✅ Auditoria automática

### 3. Integração com EntraID
- ✅ Busca em tempo real de usuários
- ✅ Exibição de nome, email e cargo
- ✅ Filtro por nome ou email
- ✅ Uso do Microsoft Graph API

---

## 🗄️ Estrutura de Dados

### Tipo: `UserAccessControl`

```typescript
export type UserAccessControl = {
  id: string;
  userId: string; // ID do usuário no EntraID
  userName: string; // Nome do usuário
  userEmail: string; // Email do usuário
  profileId: string; // ID do perfil de acesso vinculado
  profileName: string; // Nome do perfil (denormalizado)
  isActive: boolean; // Vínculo ativo ou inativo
  startDate?: string; // Data de início do acesso (ISO)
  endDate?: string; // Data de término do acesso (ISO)
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
};
```

### Tipo: `EntraIdUser` (Simplificado)

```typescript
export type EntraIdUser = {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
  jobTitle?: string;
  department?: string;
};
```

---

## 🔧 Implementação Técnica

### Arquivos Criados/Modificados

#### 1. **Tipos** (`src/lib/types.ts`)
- ✅ Adicionado `UserAccessControl`
- ✅ Adicionado `EntraIdUser`

#### 2. **Azure Table Storage** (`src/lib/azure-table-storage.ts`)
- ✅ Nova tabela: `useraccesscontrol`
- ✅ Função: `getAllUserAccessControls()`
- ✅ Função: `getUserAccessControlById(id: string)`
- ✅ Função: `getUserAccessControlByUserId(userId: string)`
- ✅ Função: `addOrUpdateUserAccessControl(control: UserAccessControl)`
- ✅ Função: `deleteUserAccessControl(id: string)`

#### 3. **API Route - EntraID Users**
- 📄 `src/app/api/entraid/users/route.ts`
- Recursos:
  - Busca usuários via Microsoft Graph API
  - Filtro por nome ou email
  - Autenticação via NextAuth token
  - Limite configurável de resultados

#### 4. **Página de Listagem**
- 📄 `src/app/(app)/administration/access-control/page.tsx`
- Recursos:
  - Listagem em tabela
  - Busca por usuário/email/perfil
  - Badge de status (Ativo/Inativo/Expirado)
  - Exibição de período de vigência
  - Botões de editar e excluir
  - Dialog de confirmação de exclusão

#### 5. **Página de Cadastro/Edição**
- 📄 `src/app/(app)/administration/access-control/capture/page.tsx`
- Recursos:
  - Busca de usuários do EntraID
  - Seleção de perfil de acesso
  - Toggle de status ativo/inativo
  - Campos de data início/término
  - Validações de campos e datas
  - Auditoria automática

#### 6. **Sidebar** (`src/components/layout/app-sidebar.tsx`)
- ✅ Adicionado submenu "Controle de Acesso" em Administração

#### 7. **Componentes UI**
- 📄 `src/components/ui/command.tsx` (criado para busca avançada)

---

## 📝 Como Usar

### Vincular um Novo Usuário

1. Acesse **Administração → Controle de Acesso**
2. Clique no botão **"Vincular Usuário"**
3. Buscar usuário:
   - Digite o nome ou email na caixa de busca
   - Aguarde os resultados carregarem
   - Clique no usuário desejado
4. Selecione o perfil de acesso
5. Configure:
   - Status (ativo/inativo)
   - Data de início (opcional)
   - Data de término (opcional)
6. Clique em **"Salvar Controle"**

### Editar um Vínculo

1. Na listagem, clique no ícone de **lápis** (✏️) do vínculo desejado
2. Modifique os campos necessários
   - **Nota:** O usuário não pode ser alterado ao editar
3. Clique em **"Salvar Controle"**

### Remover Acesso de um Usuário

1. Na listagem, clique no ícone de **lixeira** (🗑️) do vínculo desejado
2. Confirme a exclusão no dialog
3. O usuário perderá o acesso ao sistema

---

## 🔐 Integração com Microsoft EntraID

### Microsoft Graph API

O módulo utiliza a **Microsoft Graph API** para buscar usuários do diretório organizacional.

#### Endpoint Utilizado:
```
GET https://graph.microsoft.com/v1.0/users
```

#### Parâmetros:
- `$top`: Limite de resultados (padrão: 50)
- `$select`: Campos retornados (id, displayName, mail, userPrincipalName, jobTitle, department)
- `$filter`: Filtro por nome ou email

#### Autenticação:
- Usa o `accessToken` do NextAuth do usuário logado
- Requer permissões no Azure AD:
  - `User.Read.All` ou `Directory.Read.All`

#### Exemplo de Requisição:
```typescript
const response = await fetch(
  `/api/entraid/users?search=pedro&top=20`
);
```

---

## 🎨 Fluxo de Uso

### 1. Buscar Usuário no EntraID

```
┌─────────────────────────────────────────────────┐
│ 🔍 Digite o nome ou email...                    │
├─────────────────────────────────────────────────┤
│                                                  │
│  🔄 Buscando usuários...                        │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 2. Selecionar Usuário

```
┌─────────────────────────────────────────────────┐
│ Resultados:                                      │
├─────────────────────────────────────────────────┤
│  Pedro Teste                                     │
│  pedro@teste.com                                 │
│  Gerente de Riscos                              │
├─────────────────────────────────────────────────┤
│  Pedro Silva                                     │
│  pedro.silva@empresa.com                        │
│  Analista de Compliance                         │
└─────────────────────────────────────────────────┘
```

### 3. Configurar Acesso

```
┌─────────────────────────────────────────────────┐
│ Usuário Selecionado:                            │
│ ✅ Pedro Teste (pedro@teste.com)                │
│                                                  │
│ Perfil: [Gestor de Riscos ▼]                   │
│ [✓] Acesso ativo                                │
│                                                  │
│ Data início: [📅 14/10/2025]                    │
│ Data término: [📅 14/10/2026]                   │
│                                                  │
│                      [Cancelar] [💾 Salvar]     │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Lógica de Status

### Status do Vínculo

| Condição | Status | Badge |
|----------|--------|-------|
| `isActive: true` e sem data de término | **Ativo** | 🟢 Verde |
| `isActive: true` e `endDate > hoje` | **Ativo** | 🟢 Verde |
| `isActive: false` | **Inativo** | ⚪ Cinza |
| `isActive: true` e `endDate < hoje` | **Expirado** | 🔴 Vermelho |

### Código de Verificação:

```typescript
const isAccessExpired = (control: UserAccessControl): boolean => {
  if (!control.endDate) return false;
  return new Date(control.endDate) < new Date();
};

const getAccessStatus = (control: UserAccessControl) => {
  if (!control.isActive) {
    return { label: 'Inativo', variant: 'secondary' };
  }
  if (isAccessExpired(control)) {
    return { label: 'Expirado', variant: 'destructive' };
  }
  return { label: 'Ativo', variant: 'default' };
};
```

---

## 💾 Armazenamento no Azure

### Tabela: `useraccesscontrol`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| PartitionKey | string | Sempre "global" |
| RowKey | string | ID único do controle |
| userId | string | ID do usuário no EntraID |
| userName | string | Nome do usuário |
| userEmail | string | Email do usuário |
| profileId | string | ID do perfil vinculado |
| profileName | string | Nome do perfil |
| isActive | boolean | Status do vínculo |
| startDate | string | Data de início (opcional) |
| endDate | string | Data de término (opcional) |
| createdBy | string | Usuário criador |
| createdAt | string | Data de criação (ISO) |
| updatedBy | string | Último usuário que editou |
| updatedAt | string | Data da última alteração (ISO) |

---

## 🔒 Segurança e Validações

### Validações de Formulário
- ✅ Usuário obrigatório
- ✅ Perfil obrigatório
- ✅ Data de término deve ser posterior à data de início
- ✅ Aguarda autenticação carregar antes de salvar

### Segurança da API
- ✅ Verifica autenticação via NextAuth token
- ✅ Usa access token do usuário logado para Graph API
- ✅ Tratamento de erros 401/500
- ✅ Logs de erros para debugging

### Permissões Necessárias
- ⚠️ **Acesso ao módulo:** Apenas administradores (`hasRole(['admin'])`)
- ⚠️ **API do EntraID:** Requer `User.Read.All` ou `Directory.Read.All` no Azure AD

---

## 🎨 Interface de Usuário

### Listagem

```
┌──────────────────────────────────────────────────────────────┐
│  👥 Controle de Acesso                  [+ Vincular Usuário] │
├──────────────────────────────────────────────────────────────┤
│  🔍 [Buscar por usuário, email ou perfil...]                 │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Usuário          | Email          | Perfil    | Status      │
│  ──────────────────────────────────────────────────────────  │
│  Pedro Teste      | pedro@teste.com| Gestor    | 🟢 Ativo   │
│  Maria Silva      | maria@email.com| Auditor   | 🔴 Expirado│
│  João Santos      | joao@email.com | Consultor | ⚪ Inativo │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Próximas Funcionalidades (Sugestões)

### Fase 2 - Uso Efetivo dos Perfis
- [ ] Middleware para verificar permissões antes de acessar rotas
- [ ] Hook `usePermission()` para desabilitar botões baseado em permissões
- [ ] Página de "Acesso Negado" customizada
- [ ] Logs de acesso por usuário

### Fase 3 - Notificações
- [ ] Email de boas-vindas ao vincular usuário
- [ ] Email de notificação antes do acesso expirar
- [ ] Email de revogação de acesso

### Fase 4 - Relatórios
- [ ] Relatório de usuários com acesso ativo
- [ ] Relatório de acessos expirados
- [ ] Auditoria de alterações de vínculos
- [ ] Dashboard de usuários por perfil

### Fase 5 - Avançado
- [ ] Importação em lote de usuários (CSV)
- [ ] Sincronização automática com grupos do EntraID
- [ ] Aprovação de solicitações de acesso
- [ ] Acesso temporário com auto-revogação

---

## ✅ Checklist de Implementação

- [x] Criar tipos `UserAccessControl` e `EntraIdUser`
- [x] Adicionar funções CRUD no `azure-table-storage.ts`
- [x] Criar API route para buscar usuários do EntraID
- [x] Criar página de listagem
- [x] Criar página de cadastro/edição
- [x] Adicionar submenu no sidebar
- [x] Implementar busca de usuários em tempo real
- [x] Implementar validações de formulário
- [x] Implementar lógica de status (ativo/inativo/expirado)
- [x] Implementar auditoria automática
- [x] Adicionar confirmação de exclusão
- [x] Documentar módulo

---

## 🐛 Resolução de Problemas

### Erro: "Não foi possível buscar usuários do EntraID"

**Possíveis Causas:**
1. Token de acesso inválido ou expirado
2. Falta de permissões no Azure AD
3. Usuário não tem permissão para ler diretório

**Solução:**
1. Verificar se o usuário está autenticado
2. Verificar permissões da App Registration no Azure AD:
   - Ir em Azure Portal → App Registrations → Sua App
   - API Permissions → Add permission → Microsoft Graph
   - Adicionar `User.Read.All` (Application ou Delegated)
3. Conceder consentimento de administrador (Admin Consent)

### Erro: "Cannot find module 'cmdk'"

**Solução:**
```bash
npm install cmdk
```

### Usuários não aparecem na busca

**Verificar:**
1. Digite pelo menos 2 caracteres na busca
2. Verifique se há usuários no EntraID
3. Verifique logs do console (F12)
4. Teste a API diretamente: `/api/entraid/users?search=pedro`

### Vínculo não salva

**Verificar:**
1. Usuário foi selecionado?
2. Perfil foi selecionado?
3. Datas são válidas?
4. Connection string do Azure Table Storage está configurada?

---

## 📚 Referências

- [Microsoft Graph API - Users](https://learn.microsoft.com/en-us/graph/api/user-list)
- [NextAuth.js - Access Token](https://next-auth.js.org/tutorials/refresh-token-rotation)
- [Azure Table Storage SDK](https://docs.microsoft.com/azure/storage/tables/)
- [Module: Access Profiles](./MODULE_ACCESS_PROFILES.md)

---

**Autor:** Sistema SGR  
**Última Atualização:** 14 de outubro de 2025  
**Versão:** 1.0.0
