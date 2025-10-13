# 🔐 Configurar Permissões do Azure AD

## Problema Identificado
```
Authorization_RequestDenied: Insufficient privileges to complete the operation.
```

Isso significa que o aplicativo está autenticado, mas não tem permissão para ler usuários do Azure AD.

## ✅ Solução: Adicionar Permissões

### Passo 1: Acessar o Azure Portal
1. Acesse: https://portal.azure.com
2. Entre com uma conta que tenha permissões de administrador

### Passo 2: Navegar até o App Registration
1. No menu lateral, clique em **"Azure Active Directory"** (ou **"Microsoft Entra ID"**)
2. No menu lateral, clique em **"App registrations"**
3. Clique em **"All applications"**
4. Procure pelo seu aplicativo usando o Client ID: `5e99e04d-66d0-451c-9c4a-6b393dea9996`
   - Ou procure pelo nome do aplicativo

### Passo 3: Adicionar Permissões da API
1. No menu lateral do aplicativo, clique em **"API permissions"**
2. Clique no botão **"+ Add a permission"**
3. Selecione **"Microsoft Graph"**
4. Selecione **"Application permissions"** (NÃO "Delegated permissions")
5. Na caixa de busca, digite: **User.Read.All**
6. Marque a checkbox **User.Read.All**
7. Na caixa de busca, digite: **Directory.Read.All**
8. Marque a checkbox **Directory.Read.All**
9. Clique em **"Add permissions"** no rodapé

### Passo 4: Conceder Consentimento de Administrador (CRÍTICO!)
1. Ainda na página **"API permissions"**
2. Clique no botão **"✓ Grant admin consent for [Nome do Tenant]"**
3. Confirme clicando em **"Yes"**
4. Aguarde até que apareça uma marca verde (✓) ao lado das permissões

### Passo 5: Verificar Permissões Configuradas
Você deve ver algo assim na lista de permissões:

| API / Permission name | Type | Status |
|----------------------|------|--------|
| Microsoft Graph / User.Read.All | Application | ✓ Granted for [Tenant] |
| Microsoft Graph / Directory.Read.All | Application | ✓ Granted for [Tenant] |

## 🧪 Testar Após Configuração

Após configurar as permissões, aguarde 2-5 minutos e teste:

1. **Teste de listagem:**
   ```
   http://localhost:9002/api/users/test-search
   ```

2. **Teste de busca:**
   ```
   http://localhost:9002/api/users/test-search?q=a
   ```

3. **Teste no componente:**
   - Vá para Análise → Editar um risco
   - Campo "Responsável pelo Bowtie"
   - Digite algumas letras de um nome de usuário
   - Deve aparecer a lista de usuários

## 📋 Informações do Seu Tenant

- **Tenant ID:** `837ce9c2-30fa-4613-b9ee-1f114ce71ff1`
- **Client ID:** `5e99e04d-66d0-451c-9c4a-6b393dea9996`
- **Portal:** https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/CallAnAPI/appId/5e99e04d-66d0-451c-9c4a-6b393dea9996

## ❓ Perguntas Frequentes

### Por que preciso de "Application permissions" e não "Delegated permissions"?
- **Delegated:** requer que um usuário esteja logado (usando NextAuth)
- **Application:** permite que o app acesse dados sem usuário logado (nosso caso)

### Por que preciso de consentimento de administrador?
Permissões de aplicativo (Application permissions) afetam toda a organização, então precisam de aprovação de um administrador.

### E se eu não for administrador?
Você precisará pedir para um administrador do Azure AD fazer esse processo para você.

## 🔍 Troubleshooting

### Erro persiste após configurar
- Aguarde 2-5 minutos para as permissões propagarem
- Reinicie o servidor Next.js (`Ctrl+C` e `npm run dev` novamente)
- Limpe o cache do navegador

### Não encontro meu aplicativo
- Certifique-se de estar no tenant correto (canto superior direito do portal)
- Use o filtro "All applications" em App registrations
- Procure pelo Client ID: `5e99e04d-66d0-451c-9c4a-6b393dea9996`

### Como sei se as permissões estão ativas?
Vá em API permissions e verifique se há uma marca verde (✓) ao lado de cada permissão com o texto "Granted for [Nome do Tenant]".
