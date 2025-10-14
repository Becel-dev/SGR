# 🔧 Configuração do Azure AD para Controle de Acesso

## 📋 Problema Resolvido

**Erro:** Não é possível buscar usuários do EntraID na tela de Controle de Acesso

**Causa:** Falta de permissões no Azure AD ou login feito com Credentials (modo teste)

---

## ✅ Solução Implementada

### 1. **Suporte a Modo de Teste**

Quando você faz login com **Credentials** (pedro@teste.com), o sistema agora usa **usuários mock** automaticamente:

- ✅ 5 usuários de exemplo pré-cadastrados
- ✅ Funciona sem configuração do Azure AD
- ✅ Ideal para desenvolvimento e testes locais
- ✅ Toast de aviso informa que está em modo de teste

**Usuários Mock Disponíveis:**
```
1. Pedro Teste - pedro@teste.com - Gerente de Riscos
2. Maria Silva - maria.silva@empresa.com - Analista de Riscos
3. João Santos - joao.santos@empresa.com - Auditor Interno
4. Ana Costa - ana.costa@empresa.com - Coordenadora de Compliance
5. Carlos Oliveira - carlos.oliveira@empresa.com - Especialista em Controles
```

### 2. **Scope Atualizado no Azure AD**

Adicionei a permissão `User.Read.All` ao scope do Azure AD:

```typescript
// Antes
scope: 'openid profile email User.Read'

// Agora
scope: 'openid profile email User.Read User.Read.All'
```

### 3. **Mensagens de Erro Melhoradas**

- ✅ Logs detalhados no console
- ✅ Mensagem específica para erro de permissões (403)
- ✅ Toast com descrição do erro
- ✅ Indicador visual de modo mock

---

## 🚀 Como Testar

### Opção 1: Modo de Teste (Sem Azure AD)

1. Faça login com **pedro@teste.com** (Teste Local)
2. Vá em **Administração → Controle de Acesso**
3. Clique em **"Vincular Usuário"**
4. Digite qualquer nome na busca (ex: "pedro", "maria")
5. Usuários mock aparecerão automaticamente
6. Selecione um e prossiga normalmente

**Resultado:** Sistema funciona perfeitamente com dados de exemplo! ✅

---

### Opção 2: Usar Azure AD Real (Produção)

Para usar usuários reais do EntraID, siga os passos:

#### **Passo 1: Configurar Permissões no Azure Portal**

1. Acesse o [Azure Portal](https://portal.azure.com)
2. Vá em **Azure Active Directory** (ou **Microsoft Entra ID**)
3. No menu lateral, clique em **App registrations**
4. Selecione sua aplicação (ou crie uma nova)

#### **Passo 2: Adicionar Permissões da API**

1. No menu da aplicação, clique em **API permissions**
2. Clique em **Add a permission**
3. Selecione **Microsoft Graph**
4. Selecione **Delegated permissions**
5. Procure e marque:
   - ✅ `User.Read` (já deve estar marcado)
   - ✅ `User.Read.All` ← **ADICIONAR ESTA**
6. Clique em **Add permissions**

#### **Passo 3: Conceder Consentimento de Administrador**

⚠️ **IMPORTANTE:** Esta etapa requer privilégios de administrador!

1. Na página **API permissions**
2. Clique no botão **Grant admin consent for [Sua Organização]**
3. Confirme a ação
4. Aguarde a confirmação (status ficará verde ✅)

#### **Passo 4: Verificar Configuração**

Suas permissões devem estar assim:

| Permissão | Tipo | Status |
|-----------|------|--------|
| openid | Delegated | ✅ Granted |
| profile | Delegated | ✅ Granted |
| email | Delegated | ✅ Granted |
| User.Read | Delegated | ✅ Granted |
| **User.Read.All** | Delegated | ✅ **Granted for [Org]** |

#### **Passo 5: Fazer Logout e Login Novamente**

1. No sistema SGR, faça **logout**
2. Faça **login com Microsoft** (não use Teste Local)
3. Aceite as novas permissões quando solicitado
4. Teste buscar usuários no Controle de Acesso

---

## 🔍 Como Identificar o Modo Atual

### Modo de Teste (Mock)
- 🟡 Toast amarelo aparece: **"Modo de Teste - Usando usuários de exemplo"**
- 🟡 Console mostra: `⚠️ Usando usuários MOCK`
- ✅ Sempre funciona, não depende de configuração

### Modo Produção (Azure AD)
- 🟢 Sem toast de aviso
- 🟢 Console mostra: `🔍 Buscando usuários no Microsoft Graph API...`
- 🟢 Retorna usuários reais do diretório organizacional

---

## 🐛 Troubleshooting

### Erro: "Permissões insuficientes"

**Mensagem:** `Configure User.Read.All ou Directory.Read.All no Azure AD`

**Solução:**
1. Siga o **Passo 2** acima (Adicionar Permissões)
2. **IMPORTANTE:** Execute o **Passo 3** (Grant admin consent)
3. Faça logout e login novamente

---

### Erro: "Não autenticado" (401)

**Causa:** Token expirado ou usuário não logado

**Solução:**
1. Faça logout
2. Faça login novamente
3. Tente buscar usuários

---

### Erro: "Erro interno ao buscar usuários" (500)

**Verificar:**
1. Abra o console do navegador (F12)
2. Veja o erro detalhado
3. Verifique se as variáveis de ambiente estão configuradas:
   - `AZURE_AD_CLIENT_ID`
   - `AZURE_AD_CLIENT_SECRET`
   - `AZURE_AD_TENANT_ID`
   - `NEXTAUTH_SECRET`

---

### Usuários mock não aparecem

**Verificar:**
1. Você fez login com **Credentials** (Teste Local)?
2. Digitou pelo menos 2 caracteres na busca?
3. Veja o console do navegador (F12) para ver logs

**Esperado:**
- Console deve mostrar: `⚠️ Usando usuários MOCK`
- Toast deve aparecer: "Modo de Teste"

---

## 📊 Comparação: Modo Teste vs Produção

| Característica | Modo Teste | Modo Produção |
|----------------|------------|---------------|
| **Login** | Credentials (pedro@teste.com) | Microsoft (Azure AD) |
| **Usuários** | 5 usuários mock | Usuários reais do EntraID |
| **Configuração** | Nenhuma | Azure AD permissions |
| **Consentimento Admin** | Não necessário | Necessário |
| **Ambiente** | Desenvolvimento | Produção |
| **Busca** | Filtra usuários mock | Busca no Graph API |

---

## 🎯 Recomendações

### Para Desenvolvimento Local:
✅ **Use Modo de Teste**
- Login com pedro@teste.com
- Usuários mock funcionam perfeitamente
- Não requer configuração do Azure AD

### Para Produção:
✅ **Configure Azure AD**
- Login com Microsoft
- Permissões User.Read.All configuradas
- Admin consent concedido
- Usuários reais do diretório

---

## 📝 Alterações Realizadas

### Arquivos Modificados:

#### 1. **src/app/api/entraid/users/route.ts**
- ✅ Adicionado array de usuários mock
- ✅ Detecção automática de modo (com ou sem accessToken)
- ✅ Logs detalhados com emojis
- ✅ Mensagens de erro específicas por tipo

#### 2. **src/lib/auth.ts**
- ✅ Scope atualizado: adicionado `User.Read.All`

#### 3. **src/app/(app)/administration/access-control/capture/page.tsx**
- ✅ Toast informando modo de teste
- ✅ Tratamento de erro melhorado
- ✅ Exibição de mensagem de erro da API

---

## ✨ Resultado Final

### Antes:
❌ Erro ao buscar usuários  
❌ Não funcionava sem configuração do Azure AD  
❌ Mensagens de erro genéricas

### Agora:
✅ Funciona em modo teste (usuários mock)  
✅ Funciona em produção (Azure AD)  
✅ Mensagens claras sobre o modo atual  
✅ Logs detalhados para debugging  
✅ Instruções de configuração completas

---

## 🔗 Links Úteis

- [Microsoft Graph API - List Users](https://learn.microsoft.com/en-us/graph/api/user-list)
- [Azure AD - App Permissions](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent)
- [NextAuth.js - Azure AD Provider](https://next-auth.js.org/providers/azure-ad)

---

**Criado em:** 14 de outubro de 2025  
**Atualizado em:** 14 de outubro de 2025  
**Status:** ✅ Resolvido
