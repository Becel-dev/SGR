# 👥 Busca de Usuários do Azure AD - Campo "Responsável pelo Bowtie"

## ✅ Implementação Concluída

O campo "Responsável pelo Bowtie" no módulo de Análise de Riscos agora busca usuários reais do Azure AD com autocomplete.

## 🎯 Funcionalidades

### **Autocomplete Inteligente**
- ✅ Digite pelo menos 2 caracteres para buscar
- ✅ Busca em tempo real no Azure AD
- ✅ Debounce de 300ms para otimizar performance
- ✅ Exibe nome, email, cargo e departamento
- ✅ Seleção fácil com clique
- ✅ Botão "Limpar seleção"

### **Campos de Busca**
O sistema busca usuários que correspondam em:
- Nome completo (displayName)
- Nome (givenName)  
- Sobrenome (surname)
- Email (userPrincipalName)

### **Formato de Salvamento**
Quando um usuário é selecionado, o valor salvo é:
```
Nome Completo (email@empresa.com)
```

Exemplo:
```
João Silva (joao.silva@empresa.com)
```

## 📁 Arquivos Implementados

### **1. API Route: `/api/users/search`**
```typescript
// src/app/api/users/search/route.ts
GET /api/users/search?q=joao
```

**Parâmetros:**
- `q` (query): Termo de busca (mínimo 2 caracteres)

**Resposta:**
```json
[
  {
    "id": "guid-do-usuario",
    "name": "João Silva",
    "email": "joao.silva@empresa.com",
    "jobTitle": "Gerente de Riscos",
    "department": "Compliance"
  }
]
```

### **2. Componente: `UserAutocomplete`**
```typescript
// src/components/ui/user-autocomplete.tsx
<UserAutocomplete
  value="João Silva (joao.silva@empresa.com)"
  onSelect={(value) => console.log(value)}
  placeholder="Buscar usuário..."
  disabled={false}
/>
```

### **3. Integração: Análise de Riscos**
```typescript
// src/app/(app)/analysis/capture/[id]/page.tsx
<Controller 
  name="responsavelBowtie" 
  control={control} 
  render={({ field }) => (
    <UserAutocomplete 
      value={field.value} 
      onSelect={field.onChange}
      placeholder="Buscar usuário..."
    />
  )} 
/>
```

## 🔐 Configuração Necessária no Azure Portal

### **Permissões do Microsoft Graph API**

Para a busca funcionar, você precisa adicionar permissões ao seu App Registration:

1. **Acesse o Azure Portal**
   - Vá para **Azure Active Directory** > **App registrations**
   - Selecione sua aplicação (Client ID: `5e99e04d-66d0-451c-9c4a-6b393dea9996`)

2. **Adicione Permissões**
   - Vá em **API permissions** > **Add a permission**
   - Selecione **Microsoft Graph** > **Application permissions**
   - Adicione:
     - ✅ `User.Read.All` - Ler perfis de usuários
     - ✅ `Directory.Read.All` - Ler dados do diretório
   
3. **Conceda Consentimento de Administrador**
   - Clique em **Grant admin consent for [Seu Tenant]**
   - Confirme a concessão

### **⚠️ Importante: Application Permissions vs Delegated**

Este sistema usa **Application Permissions** (não Delegated):
- ✅ Funciona sem usuário logado
- ✅ Usa Client Secret para autenticação
- ✅ Requer consentimento de administrador
- ✅ Acesso em nome da aplicação, não do usuário

## 🚀 Como Usar

### **No Formulário de Análise de Riscos**

1. Vá para **Análise de Riscos** > Selecione um risco > **Editar**
2. Na seção "Gestão e Prazos", localize o campo **"Responsável pelo Bowtie"**
3. Comece a digitar o nome ou email do usuário
4. Aguarde a lista de sugestões aparecer (300ms de delay)
5. Clique no usuário desejado para selecionar
6. O valor será salvo como "Nome (email)"

### **Exemplo de Uso**

1. Digite: `joao`
2. Aparecerão sugestões como:
   ```
   João Silva
   joao.silva@empresa.com
   Gerente de Riscos | Compliance
   ```
3. Clique para selecionar
4. Campo será preenchido com: `João Silva (joao.silva@empresa.com)`

## 🔧 Comportamento Sem Azure AD Configurado

Se o Azure AD não estiver configurado ou houver erro de permissões:
- ✅ O campo **não quebra** a aplicação
- ✅ Retorna lista vazia silenciosamente
- ✅ Usuário pode digitar manualmente
- ✅ Log de aviso no console do servidor

## 📊 Tecnologias Utilizadas

- **@microsoft/microsoft-graph-client** - SDK oficial do Microsoft Graph
- **@azure/identity** - Autenticação com Client Secret
- **React Hook Form** - Gerenciamento de formulário
- **Shadcn/ui** - Componentes UI (Popover, Input, Button, Badge, ScrollArea)

## 🎨 Interface

### **Estado Inicial**
```
┌─────────────────────────────────────────┐
│ Buscar usuário...            [▼]        │
└─────────────────────────────────────────┘
```

### **Digitando (após 2 caracteres)**
```
┌─────────────────────────────────────────┐
│ Digite para buscar usuário...           │
│ joao                                     │
├─────────────────────────────────────────┤
│ ✓ 👤 João Silva                         │
│    joao.silva@empresa.com               │
│    [Gerente de Riscos] [Compliance]     │
│                                          │
│ ✓ 👤 João Pedro Santos                  │
│    joao.pedro@empresa.com               │
│    [Analista] [TI]                      │
├─────────────────────────────────────────┤
│ [X Limpar seleção]                      │
└─────────────────────────────────────────┘
```

### **Selecionado**
```
┌─────────────────────────────────────────┐
│ 👤 João Silva (joao.silva@empresa.com) │
└─────────────────────────────────────────┘
```

## 🐛 Troubleshooting

### **Erro: "Failed to search users"**
- Verifique se as variáveis de ambiente estão corretas
- Confirme que as permissões foram concedidas no Azure Portal
- Verifique se o consentimento de administrador foi dado

### **Lista vazia sempre**
- Digite pelo menos 2 caracteres
- Verifique se há usuários no tenant que correspondam à busca
- Confirme as permissões `User.Read.All` e `Directory.Read.All`

### **Erro 401/403**
- Client Secret pode ter expirado
- Permissões insuficientes
- Tenant ID incorreto

### **Performance lenta**
- Normal: há um debounce de 300ms proposital
- Se persistir, verifique conectividade com Microsoft Graph API

## ✅ Checklist de Configuração

- [ ] Variáveis de ambiente configuradas (.env.local)
- [ ] Permissões adicionadas no Azure Portal:
  - [ ] User.Read.All
  - [ ] Directory.Read.All
- [ ] Consentimento de administrador concedido
- [ ] Client Secret válido (não expirado)
- [ ] Testado busca de usuários no formulário

## 🔮 Próximas Melhorias Possíveis

- Adicionar foto do usuário (Microsoft Graph: `/users/{id}/photo`)
- Cache de resultados recentes
- Favoritos/usuários mais usados
- Busca por grupos/equipes
- Integração com outros campos de responsável no sistema

## 📚 Referências

- [Microsoft Graph API - List Users](https://learn.microsoft.com/en-us/graph/api/user-list)
- [Azure AD Application Permissions](https://learn.microsoft.com/en-us/graph/auth-v2-service)
- [Microsoft Graph SDK for JavaScript](https://github.com/microsoftgraph/msgraph-sdk-javascript)
