# 🤖 Configuração da IA para Relatórios

O módulo de relatórios de IA utiliza o **Google Gemini** para gerar análises baseadas nos dados do sistema.

## 📝 Passos para Configurar

### 1️⃣ Obter a API Key do Google Gemini

1. Acesse: **https://aistudio.google.com/app/apikey**
2. Faça login com sua conta Google
3. Clique em **"Create API Key"** ou **"Get API Key"**
4. Selecione um projeto existente ou crie um novo
5. Copie a chave gerada (formato: `AIza...`)

### 2️⃣ Configurar no Projeto

1. Abra o arquivo **`.env.local`** na raiz do projeto
2. Substitua `sua_api_key_aqui` pela sua chave:

```bash
GOOGLE_GENAI_API_KEY=AIzaSyD...sua_chave_completa_aqui
```

### 3️⃣ Reiniciar o Servidor

Após adicionar a chave, **reinicie o servidor de desenvolvimento**:

```bash
# Pare o servidor (Ctrl+C no terminal)
# E inicie novamente:
npm run dev
```

## ✅ Verificar se Está Funcionando

1. Acesse o módulo **Relatórios** (menu lateral)
2. Digite uma pergunta, exemplo:
   - "Liste os 5 principais riscos"
   - "Quais controles estão pendentes?"
3. Clique em **"Gerar Relatório"**
4. Se configurado corretamente, o relatório aparecerá em alguns segundos

## ❌ Problemas Comuns

### Erro: "FAILED_PRECONDITION"
- **Causa:** API Key não configurada ou inválida
- **Solução:** Verifique se copiou a chave completa no `.env.local`

### Erro: "API key not valid"
- **Causa:** Chave incorreta ou expirada
- **Solução:** Gere uma nova chave em https://aistudio.google.com/app/apikey

### Relatório não aparece
- **Causa:** Servidor não foi reiniciado após adicionar a chave
- **Solução:** Reinicie o servidor (`Ctrl+C` e `npm run dev`)

## 💡 Informações Adicionais

- **Modelo usado:** `gemini-2.5-flash` (rápido e eficiente)
- **Custo:** Free tier do Gemini (60 requisições/minuto)
- **Dados analisados:** Riscos, Controles, Escalonamentos, Riscos Identificados, Top Risks
- **Idioma:** Todas as respostas são em português (pt-BR)

## 🔒 Segurança

⚠️ **IMPORTANTE:**
- Nunca compartilhe sua API key publicamente
- Não faça commit do arquivo `.env.local` no Git
- O arquivo `.env.local` já está no `.gitignore`

## 📚 Links Úteis

- **Documentação Gemini:** https://ai.google.dev/docs
- **Genkit (Framework):** https://firebase.google.com/docs/genkit
- **Obter API Key:** https://aistudio.google.com/app/apikey
