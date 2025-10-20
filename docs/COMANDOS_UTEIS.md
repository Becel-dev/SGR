# 🛠️ Comandos Úteis - Multi-Ambiente

## 🔧 Setup Inicial

### Clonar e Instalar
```powershell
# Clonar repositório
git clone <url-do-repo>
cd SGR

# Instalar dependências
npm install

# Copiar arquivo de exemplo
copy .env.example .env.local
```

### Gerar Secrets
```powershell
# Gerar NEXTAUTH_SECRET (usar em cada ambiente)
openssl rand -base64 32
```

---

## 🌍 Comandos por Ambiente

### Development (Local)

#### Iniciar aplicação
```powershell
npm run dev
```

#### Configurar variáveis
```powershell
# No arquivo .env.local
NEXT_PUBLIC_APP_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<seu-secret>
AZURE_STORAGE_CONNECTION_STRING=<connection-string>
```

#### Verificar configuração
```powershell
# Abrir no navegador e verificar console
http://localhost:3000
# Deve aparecer: "🌍 Ambiente: development"
```

---

### QA (Homologação)

#### Build para QA
```powershell
# Build de produção
npm run build

# Iniciar servidor
npm start
```

#### Configurar variáveis (no servidor QA)
```powershell
# No arquivo .env ou variáveis do host
NEXT_PUBLIC_APP_ENV=qa
NEXTAUTH_URL=https://sgr-qa.rumolog.com
NEXTAUTH_SECRET=<secret-diferente-do-dev>
AZURE_STORAGE_CONNECTION_STRING=<mesma-do-dev>
AZURE_AD_CLIENT_ID=<client-id>
AZURE_AD_CLIENT_SECRET=<client-secret>
AZURE_AD_TENANT_ID=<tenant-id>
```

---

### Production (Produção)

#### Build para PRD
```powershell
# Build otimizado
npm run build

# Iniciar servidor
npm start
```

#### Configurar variáveis (no servidor PRD)
```powershell
# No arquivo .env ou variáveis do host
NEXT_PUBLIC_APP_ENV=production
NEXTAUTH_URL=https://sgr.rumolog.com
NEXTAUTH_SECRET=<secret-unico-prd>
AZURE_STORAGE_CONNECTION_STRING_PRD=<connection-string-prd>
AZURE_AD_CLIENT_ID=<client-id>
AZURE_AD_CLIENT_SECRET=<client-secret>
AZURE_AD_TENANT_ID=<tenant-id>
```

---

## 🧪 Testes

### Testes Unitários
```powershell
# Executar todos os testes
npm test

# Modo watch
npm test -- --watch

# Com coverage
npm test -- --coverage
```

### Testes E2E
```powershell
# Instalar Playwright (primeira vez)
npx playwright install

# Executar testes E2E
npm run test:e2e

# Modo UI
npm run test:e2e:ui
```

### Verificar TypeScript
```powershell
# Verificar tipos
npm run type-check

# Modo watch
npm run type-check -- --watch
```

### Linting
```powershell
# Verificar código
npm run lint

# Corrigir automaticamente
npm run lint -- --fix
```

---

## 🔍 Debugging

### Verificar Ambiente
```powershell
# Via Node.js script
node -e "console.log('ENV:', process.env.NEXT_PUBLIC_APP_ENV)"
node -e "console.log('URL:', process.env.NEXTAUTH_URL)"
```

### Logs Detalhados
```powershell
# Iniciar com logs de debug
$env:DEBUG="*"; npm run dev

# Logs do NextAuth
$env:NEXTAUTH_DEBUG="true"; npm run dev
```

### Console do Navegador
```javascript
// Verificar configuração
import { getEnvironmentConfig } from '@/lib/config';
console.log(getEnvironmentConfig());

// Verificar Super Admin
import { isSuperAdmin } from '@/lib/config';
console.log('É Super Admin?', isSuperAdmin('pedro.becel@rumolog.com'));
```

---

## 📊 Azure CLI

### Listar Storage Accounts
```powershell
# Listar todas as contas
az storage account list --output table

# Mostrar keys
az storage account keys list --account-name <nome-conta> --output table
```

### Gerenciar Tables
```powershell
# Listar tabelas
az storage table list --account-name <nome> --account-key <key>

# Ver entidades de uma tabela
az storage entity query --table-name identifiedrisks --account-name <nome> --account-key <key>
```

### Backup
```powershell
# Exportar tabela (requer Azure Storage Explorer ou script)
# Usar Azure Storage Explorer GUI para backup completo
```

---

## 🚀 Deploy

### Vercel
```powershell
# Instalar CLI
npm i -g vercel

# Deploy para preview
vercel

# Deploy para produção
vercel --prod

# Configurar variáveis
vercel env add NEXT_PUBLIC_APP_ENV production
vercel env add NEXTAUTH_URL https://sgr.rumolog.com
# ... adicionar todas as variáveis
```

### Azure App Service
```powershell
# Login
az login

# Criar App Service
az webapp create --name sgr-app --resource-group sgr-rg --plan sgr-plan

# Configurar variáveis
az webapp config appsettings set --name sgr-app --resource-group sgr-rg --settings NEXT_PUBLIC_APP_ENV=production

# Deploy
az webapp deployment source config-zip --name sgr-app --resource-group sgr-rg --src ./build.zip
```

### Docker
```powershell
# Build da imagem
docker build -t sgr:latest .

# Executar container
docker run -p 3000:3000 `
  -e NEXT_PUBLIC_APP_ENV=development `
  -e NEXTAUTH_URL=http://localhost:3000 `
  -e NEXTAUTH_SECRET=<secret> `
  -e AZURE_STORAGE_CONNECTION_STRING=<connection> `
  sgr:latest

# Docker Compose
docker-compose up -d
```

---

## 🔐 Segurança

### Rotacionar Secrets
```powershell
# Gerar novo secret
$newSecret = openssl rand -base64 32

# Atualizar no ambiente
# 1. Parar aplicação
# 2. Atualizar variável NEXTAUTH_SECRET
# 3. Reiniciar aplicação
# 4. Todos os usuários precisarão fazer login novamente
```

### Verificar Permissões
```powershell
# Testar acesso ao Storage
az storage account show --name <nome> --query "primaryEndpoints"

# Testar Azure AD
az ad app show --id <client-id>
```

---

## 🗄️ Banco de Dados

### Backup Manual (via script)
```powershell
# Criar script de backup
node scripts/backup-tables.js

# Restaurar backup
node scripts/restore-tables.js backup-2025-10-20.json
```

### Limpar Cache
```powershell
# Limpar cache do Next.js
Remove-Item -Recurse -Force .next

# Rebuild
npm run build
```

---

## 📝 Manutenção

### Atualizar Dependências
```powershell
# Verificar updates
npm outdated

# Atualizar todas
npm update

# Atualizar major versions
npm install <package>@latest
```

### Logs de Produção
```powershell
# Vercel
vercel logs

# Azure
az webapp log tail --name sgr-app --resource-group sgr-rg

# Docker
docker logs sgr-container -f
```

### Health Check
```powershell
# Verificar se app está up
curl https://sgr.rumolog.com/api/health

# Verificar autenticação
curl https://sgr.rumolog.com/api/auth/providers
```

---

## 🆘 Troubleshooting

### App não inicia
```powershell
# Verificar porta em uso
netstat -ano | findstr :3000

# Matar processo
taskkill /PID <pid> /F

# Limpar e reinstalar
Remove-Item -Recurse node_modules
Remove-Item package-lock.json
npm install
```

### Erro de autenticação
```powershell
# Limpar sessões
# No navegador: Clear cookies para o domínio

# Verificar Redirect URI
# Azure Portal > App Registration > Authentication > Redirect URIs
```

### Erro de conexão Azure
```powershell
# Testar connection string
node -e "
const { TableServiceClient } = require('@azure/data-tables');
const client = TableServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
client.listTables().next().then(() => console.log('OK')).catch(console.error);
"
```

### Build falha
```powershell
# Limpar cache
Remove-Item -Recurse -Force .next

# Verificar tipos
npm run type-check

# Build com verbose
npm run build -- --debug
```

---

## 📚 Scripts Úteis

### Criar Super Admin (já configurado)
```javascript
// Não precisa criar - pedro.becel@rumolog.com tem bypass automático
// Apenas faça login com esse email
```

### Listar Usuários sem Perfil
```javascript
// Execute no console do navegador em /administration/access-control
fetch('/api/users/without-profile')
  .then(r => r.json())
  .then(console.log);
```

### Verificar Permissões de um Usuário
```javascript
// Execute no console do navegador
fetch('/api/access-control?userId=user@example.com')
  .then(r => r.json())
  .then(data => console.log(data.accessControl));
```

---

## 🎯 Quick Reference

### Variáveis Essenciais
```powershell
# Mínimo para DEV
NEXT_PUBLIC_APP_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<secret>
AZURE_STORAGE_CONNECTION_STRING=<connection>

# Adicional para QA/PRD
AZURE_AD_CLIENT_ID=<id>
AZURE_AD_CLIENT_SECRET=<secret>
AZURE_AD_TENANT_ID=<tenant>
```

### Comandos Mais Usados
```powershell
npm run dev              # Desenvolvimento
npm run build           # Build de produção
npm start               # Iniciar produção
npm run lint            # Verificar código
npm test                # Executar testes
```

### URLs Importantes
- Dev: http://localhost:3000
- Login: /auth/signin
- Admin: /administration/access-profiles
- API Health: /api/health

---

**Última atualização:** 2025-10-20  
**Documentação completa:** [/docs](../docs/)
