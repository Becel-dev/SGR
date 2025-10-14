# ✅ CHECKLIST DE VALIDAÇÃO - FASE 3

**Use este checklist para validar que tudo está funcionando!**

---

## 🚀 PRÉ-REQUISITOS

- [ ] Aplicação rodando: `npm run dev`
- [ ] Navegador aberto: `http://localhost:3000`
- [ ] Console do navegador aberto (F12)

---

## 📝 PARTE 1: SETUP INICIAL (Pedro)

### **Login**
- [ ] Tela de login carregou
- [ ] Opção "Teste Local" está visível
- [ ] Digitei: `pedro@teste.com`
- [ ] Cliquei em "Entrar"
- [ ] Login foi bem-sucedido
- [ ] Nome "Pedro Teste" aparece no header

### **Criar Perfil: Visualizador**
- [ ] Naveguei para: `/administration/access-profiles/capture`
- [ ] Preenchi:
  - Nome: `Visualizador`
  - Descrição: `Acesso apenas leitura`
- [ ] Marquei apenas "Visualizar" em todos os módulos
- [ ] Status: ✅ Ativo
- [ ] Cliquei em "Salvar"
- [ ] Toast de sucesso apareceu
- [ ] Perfil aparece na lista

### **Criar Perfil: Gestor de Riscos**
- [ ] Cliquei em "Novo Perfil"
- [ ] Preenchi:
  - Nome: `Gestor de Riscos`
  - Descrição: `Gestão completa de riscos`
- [ ] Marquei permissões:
  - Identificação: ✅ Todas
  - Análise: ✅ Todas
  - Controles: ✅ View, ✅ Create, ✅ Edit
  - Bowtie: ✅ View, ✅ Create
  - Escalação: ✅ View
  - Melhoria: ✅ View
  - Relatórios: ✅ View, ✅ Export
- [ ] Status: ✅ Ativo
- [ ] Cliquei em "Salvar"
- [ ] Toast de sucesso apareceu

### **Criar Perfil: Administrador**
- [ ] Cliquei em "Novo Perfil"
- [ ] Preenchi:
  - Nome: `Administrador`
  - Descrição: `Acesso total`
- [ ] Marquei ✅ em TODAS as permissões
- [ ] Status: ✅ Ativo
- [ ] Cliquei em "Salvar"
- [ ] Toast de sucesso apareceu

### **Vincular Maria (Visualizador)**
- [ ] Naveguei para: `/administration/access-control/capture`
- [ ] Campo de busca apareceu
- [ ] Digitei: `maria`
- [ ] Dropdown com sugestões apareceu
- [ ] Selecionei: `Maria Silva (maria@teste.com)`
- [ ] Selecionei perfil: `Visualizador`
- [ ] Data início: hoje
- [ ] Data fim: +1 ano
- [ ] Status: ✅ Ativo
- [ ] Cliquei em "Salvar"
- [ ] Toast de sucesso apareceu

### **Vincular João (Gestor)**
- [ ] Cliquei em "Novo Controle de Acesso"
- [ ] Busquei: `joao`
- [ ] Selecionei: `João Santos`
- [ ] Perfil: `Gestor de Riscos`
- [ ] Datas configuradas
- [ ] Salvei com sucesso

### **Vincular Ana (Administrador)**
- [ ] Cliquei em "Novo Controle de Acesso"
- [ ] Busquei: `ana`
- [ ] Selecionei: `Ana Costa`
- [ ] Perfil: `Administrador`
- [ ] Datas configuradas
- [ ] Salvei com sucesso

### **Logout**
- [ ] Cliquei no avatar (canto superior direito)
- [ ] Cliquei em "Sair"
- [ ] Voltou para tela de login

---

## 👁️ PARTE 2: TESTE MARIA (VISUALIZADOR)

### **Login Maria**
- [ ] Opção "Teste Local" visível
- [ ] Digitei: `maria@teste.com`
- [ ] Login bem-sucedido
- [ ] Nome "Maria Silva" no header

### **Teste: Identificação**
- [ ] Naveguei para: `/identification`
- [ ] Loading apareceu (0.5s)
- [ ] Página carregou normalmente
- [ ] Vejo lista de riscos (se houver)
- [ ] Botão "Identificar Novo Risco":
  - [ ] Está DESABILITADO (cinza) ou
  - [ ] Está OCULTO
- [ ] Ao passar mouse no botão:
  - [ ] Tooltip aparece
  - [ ] Mensagem: "Você não tem permissão para criar"

### **Teste: Controles**
- [ ] Naveguei para: `/controls`
- [ ] Página carregou
- [ ] Vejo lista de controles (se houver)
- [ ] Botão "Novo Controle":
  - [ ] Está DESABILITADO ou OCULTO

### **Teste: Administração**
- [ ] Tentei acessar: `/administration/access-profiles`
- [ ] Resultado:
  - [ ] Redireciona para `/access-denied` ou
  - [ ] Mostra página de acesso negado
  - [ ] Mensagem clara aparece

### **Logout**
- [ ] Fiz logout da Maria

---

## 🛠️ PARTE 3: TESTE JOÃO (GESTOR)

### **Login João**
- [ ] Digitei: `joao@teste.com`
- [ ] Login bem-sucedido
- [ ] Nome "João Santos" no header

### **Teste: Identificação**
- [ ] Naveguei para: `/identification`
- [ ] Página carregou
- [ ] Botão "Identificar Novo Risco":
  - [ ] Está HABILITADO (azul)
  - [ ] Cliquei no botão
  - [ ] Navega para `/identification/capture`
  - [ ] Formulário apareceu

### **Teste: Controles**
- [ ] Naveguei para: `/controls`
- [ ] Botão "Novo Controle":
  - [ ] Está HABILITADO
  - [ ] Cliquei no botão
  - [ ] Navega para `/controls/capture`

### **Teste: Bowtie**
- [ ] Naveguei para: `/bowtie`
- [ ] Página carregou normalmente
- [ ] Consigo visualizar diagramas

### **Logout**
- [ ] Fiz logout do João

---

## 👑 PARTE 4: TESTE ANA (ADMIN)

### **Login Ana**
- [ ] Digitei: `ana@teste.com`
- [ ] Login bem-sucedido
- [ ] Nome "Ana Costa" no header

### **Teste: Todas as Páginas**
- [ ] `/identification` → ✅ Acesso total
- [ ] `/analysis` → ✅ Acesso total
- [ ] `/controls` → ✅ Acesso total
- [ ] `/bowtie` → ✅ Acesso total
- [ ] `/escalation` → ✅ Acesso total
- [ ] `/improvement` → ✅ Acesso total
- [ ] `/reports/generate` → ✅ Acesso total

### **Teste: Administração**
- [ ] `/administration/access-profiles` → ✅ Acesso
- [ ] `/administration/access-control` → ✅ Acesso
- [ ] `/administration/parameters` → ✅ Acesso (se existir)

### **Teste: Todos os Botões**
- [ ] Todos os botões "Criar" → ✅ Habilitados
- [ ] Todos os botões "Editar" → ✅ Habilitados
- [ ] Todos os botões "Excluir" → ✅ Habilitados
- [ ] Todos os botões "Exportar" → ✅ Habilitados

### **Logout**
- [ ] Fiz logout da Ana

---

## ❌ PARTE 5: TESTE PEDRO (SEM PERFIL)

### **Login Pedro**
- [ ] Digitei: `pedro@teste.com`
- [ ] Login bem-sucedido

### **Teste: Access Denied**
- [ ] Tentei acessar: `/identification`
- [ ] Resultado:
  - [ ] Loading (0.5s)
  - [ ] Redireciona para `/access-denied`
  - [ ] Mensagem: "Você não possui um perfil de acesso ativo"
  - [ ] Botão "Voltar" funciona
  - [ ] Botão "Ir para Página Inicial" funciona

### **Teste: Outras Páginas**
- [ ] Tentei: `/controls` → ❌ Access denied
- [ ] Tentei: `/bowtie` → ❌ Access denied
- [ ] Tentei: `/analysis` → ❌ Access denied

---

## 🔍 PARTE 6: VALIDAÇÕES TÉCNICAS

### **Console do Navegador**
- [ ] Abri console (F12)
- [ ] Não há erros em vermelho
- [ ] Logs do sistema aparecem (🔍, ✅, ⚠️)

### **Network Tab**
- [ ] Abri Network (F12 → Network)
- [ ] Requisições `/api/access-control` → Status 200
- [ ] Requisições `/api/access-profiles` → Status 200
- [ ] Sem requisições com erro 500

### **Loading States**
- [ ] Loading aparece ao acessar páginas
- [ ] Skeleton/spinner é exibido
- [ ] Duração: ~0.5 segundos
- [ ] Transição suave

### **Tooltips**
- [ ] Passei mouse em botão desabilitado
- [ ] Tooltip apareceu
- [ ] Mensagem em português
- [ ] Mensagem clara e explicativa

---

## 📊 PARTE 7: VALIDAÇÃO FINAL

### **Matriz de Permissões**
Preencha conforme testes:

| Ação | Maria | João | Ana | Pedro |
|------|-------|------|-----|-------|
| Ver Identificação | ✅ / ❌ | ✅ / ❌ | ✅ / ❌ | ✅ / ❌ |
| Criar Risco | ✅ / ❌ | ✅ / ❌ | ✅ / ❌ | ✅ / ❌ |
| Ver Controles | ✅ / ❌ | ✅ / ❌ | ✅ / ❌ | ✅ / ❌ |
| Criar Controle | ✅ / ❌ | ✅ / ❌ | ✅ / ❌ | ✅ / ❌ |
| Acessar Admin | ✅ / ❌ | ✅ / ❌ | ✅ / ❌ | ✅ / ❌ |

**Resultado Esperado:**
```
Maria: ✅ ❌ ✅ ❌ ❌
João:  ✅ ✅ ✅ ✅ ❌
Ana:   ✅ ✅ ✅ ✅ ✅
Pedro: ❌ ❌ ❌ ❌ ❌
```

---

## 🎯 RESULTADO FINAL

### **Todos os checkboxes marcados?**

- [ ] ✅ **SIM** → Sistema ACL funcionando perfeitamente! 🎉
- [ ] ❌ **NÃO** → Veja "Troubleshooting" abaixo

---

## 🐛 TROUBLESHOOTING

### **Problema: Botão não desabilita**
**Solução:**
1. Verificar se componente usa `<PermissionButton>`
2. Verificar props: `module` e `action`
3. Verificar console para erros

### **Problema: Não redireciona para access-denied**
**Solução:**
1. Verificar se página tem `<ProtectedRoute>`
2. Verificar se usuário tem controle de acesso
3. Verificar console para erros de API

### **Problema: Loading infinito**
**Solução:**
1. Abrir console (F12)
2. Ver tab Network
3. Verificar se APIs respondem
4. Verificar erros 500/404

### **Problema: Usuário não encontrado**
**Solução:**
1. Verificar se digitou email correto
2. Emails disponíveis:
   - `pedro@teste.com`
   - `maria@teste.com`
   - `joao@teste.com`
   - `ana@teste.com`

### **Problema: "Não autenticado"**
**Solução:**
1. Fazer logout completo
2. Fechar navegador
3. Limpar cache (Ctrl+Shift+Del)
4. Tentar login novamente

---

## ✅ CRITÉRIOS DE SUCESSO

Para considerar o teste **APROVADO**, todos devem ser ✅:

- [ ] **Maria vê páginas mas não cria** (Visualizador)
- [ ] **João cria riscos e controles** (Gestor)
- [ ] **Ana tem acesso total** (Administrador)
- [ ] **Pedro é bloqueado** (Sem perfil)
- [ ] **Tooltips aparecem** em botões desabilitados
- [ ] **Loading funciona** suavemente
- [ ] **Mensagens em português** e claras
- [ ] **Console sem erros** críticos
- [ ] **APIs respondem** (Status 200)
- [ ] **Redirecionamentos** funcionam

---

## 🎉 PARABÉNS!

Se você chegou aqui e marcou todos os checkboxes:

### ✅ **SISTEMA ACL VALIDADO COM SUCESSO!**

**O que você comprovou:**
- ✅ Controle de acesso granular funcionando
- ✅ Múltiplos perfis com diferentes permissões
- ✅ UX profissional e intuitiva
- ✅ Sistema robusto e sem erros
- ✅ Pronto para produção

**Próximos passos:**
1. Documentar perfis da sua empresa
2. Migrar usuários reais do EntraID
3. Treinar administradores
4. Deploy em produção

---

**Data do Teste:** ___/___/2025  
**Testador:** ________________________  
**Resultado:** ✅ APROVADO / ❌ REPROVADO  
**Observações:** ________________________

---

**Tempo estimado para completar checklist:** 20-30 minutos

🎯 **Sistema ACL - Validação Completa!**
