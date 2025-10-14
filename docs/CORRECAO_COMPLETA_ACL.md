# 🚨 CORREÇÃO COMPLETA E DEFINITIVA - Sistema ACL

**Data:** 14/10/2025  
**Problema Crítico:** Maria consegue realizar ações sem permissão  
**Status:** 🔧 EM CORREÇÃO

---

## 🔍 PROBLEMAS IDENTIFICADOS

### **1. Módulos Sem Proteção:**
- ❌ **KPIs** - Maria pode criar/editar
- ❌ **Ações** - Maria pode criar/editar
- ❌ **Bowtie** - Precisa verificar
- ❌ **Análise** - Ainda tem brechas
- ❌ **Administração** - SEM proteção (INTENCIONAL mas precisa revisar)

### **2. Botões em Tabelas Desprotegidos:**
- ❌ Ícones de editar em linhas de tabelas
- ❌ Ícones de excluir em linhas de tabelas
- ❌ Botões de ação dentro de cards
- ❌ Links que redirecionam para edição

---

## ✅ CORREÇÕES APLICADAS

### **1. Adicionados Módulos ao ACL:**

```typescript
// src/lib/permissions.ts
export type SystemModule = 
  | 'identificacao'
  | 'analise'
  | 'controles'
  | 'kpis'        // ✅ NOVO
  | 'acoes'       // ✅ NOVO  
  | 'bowtie'
  | 'escalation'
  | 'melhoria'
  | 'relatorios'
  | 'perfis-acesso'
  | 'controle-acesso'
  | 'parametros';
```

### **2. Atualizados Perfis Mock:**

Todos os 4 perfis agora incluem KPIs e Ações:
- ✅ mock-profile-admin
- ✅ mock-profile-viewer (Maria - apenas VIEW)
- ✅ mock-profile-manager (João - VIEW/CREATE/EDIT)
- ✅ mock-profile-admin-full (Ana - TUDO)

---

## 🎯 ESTRATÉGIA DE PROTEÇÃO COMPLETA

### **Nível 1: Proteção de Páginas (ProtectedRoute)**
```typescript
// Impede acesso à URL
<ProtectedRoute module="kpis" action="view">
  <Content />
</ProtectedRoute>
```

### **Nível 2: Proteção de Botões Principais (PermissionButton)**
```typescript
// Botões de cabeçalho de página
<PermissionButton module="kpis" action="create">
  <PlusCircle /> Novo KPI
</PermissionButton>
```

### **Nível 3: Proteção de Botões em Tabelas (NOVO)**
```typescript
// Ícones de ação em linhas de tabela
<TableRow>
  <TableCell>
    <PermissionButton module="kpis" action="edit" size="icon" variant="ghost">
      <Edit />
    </PermissionButton>
    <PermissionButton module="kpis" action="delete" size="icon" variant="ghost">
      <Trash2 />
    </PermissionButton>
  </TableCell>
</TableRow>
```

### **Nível 4: Proteção de Links (NOVO)**
```typescript
// Links que levam para edição
<PermissionButton module="kpis" action="view" asChild>
  <Link href={`/kpis/${id}`}>
    <ArrowRight /> Ver Detalhes
  </Link>
</PermissionButton>
```

---

## 📋 PÁGINAS A PROTEGER

### **KPIs (kpis):**
- [ ] `/kpis/page.tsx` - Lista
- [ ] `/kpis/capture/page.tsx` - Criar/Editar
- [ ] `/kpis/[id]/page.tsx` - Detalhes
- [ ] Botões em tabelas

### **Ações (acoes):**
- [ ] `/actions/page.tsx` - Lista
- [ ] `/actions/capture/page.tsx` - Criar/Editar
- [ ] `/actions/[id]/page.tsx` - Detalhes
- [ ] Botões em tabelas

### **Bowtie (bowtie):**
- [ ] `/bowtie/page.tsx` - Visualização
- [ ] Verificar se tem captura

### **Análise (analise):**
- [ ] Verificar botões em tabelas
- [ ] Verificar links internos

---

## 🔧 TEMPLATE PARA PROTEGER TABELAS

### **ANTES (Vulnerável):**
```typescript
<TableBody>
  {items.map(item => (
    <TableRow key={item.id}>
      <TableCell>{item.name}</TableCell>
      <TableCell>
        <Button size="icon" asChild>
          <Link href={`/module/${item.id}`}>
            <Edit />
          </Link>
        </Button>
        <Button size="icon" onClick={() => handleDelete(item.id)}>
          <Trash2 />
        </Button>
      </TableCell>
    </TableRow>
  ))}
</TableBody>
```

### **DEPOIS (Protegido):**
```typescript
<TableBody>
  {items.map(item => (
    <TableRow key={item.id}>
      <TableCell>{item.name}</TableCell>
      <TableCell>
        <PermissionButton 
          module="nome-modulo" 
          action="edit" 
          size="icon" 
          variant="ghost"
          asChild
        >
          <Link href={`/module/${item.id}`}>
            <Edit />
          </Link>
        </PermissionButton>
        
        <PermissionButton 
          module="nome-modulo" 
          action="delete" 
          size="icon" 
          variant="ghost"
          onClick={() => handleDelete(item.id)}
        >
          <Trash2 />
        </PermissionButton>
      </TableCell>
    </TableRow>
  ))}
</TableBody>
```

---

## ⚠️ ADMINISTRAÇÃO - DECISÃO IMPORTANTE

### **Situação Atual:**
- Maria consegue acessar `/administration/*`
- Pode ver e editar parâmetros
- Pode ver perfis e controles de acesso

### **Opções:**

#### **Opção A: Proteger Administração (Recomendado)**
```
Apenas Super Admins podem acessar:
- ✅ Ana pode configurar tudo
- 🚫 Maria NÃO vê administração
- 🚫 João NÃO vê administração
- ✅ Mais seguro
```

**Implementação:**
```typescript
// Proteger módulos admin
<ProtectedRoute module="parametros" action="view">
<ProtectedRoute module="perfis-acesso" action="view">
<ProtectedRoute module="controle-acesso" action="view">
```

#### **Opção B: Deixar Aberto (Atual)**
```
Qualquer usuário autenticado acessa:
- ✅ Facilita debug
- ✅ Todos podem configurar perfis
- ❌ RISCO de segurança
- ❌ Maria pode dar permissões a si mesma!
```

### **RECOMENDAÇÃO FORTE:**
**Proteger Administração!** Maria pode:
1. Criar novo perfil com todas as permissões
2. Vincular ela mesma ao novo perfil
3. Ter acesso total ao sistema

---

## 🎯 PLANO DE AÇÃO IMEDIATO

### **Fase 1: Proteger Páginas (20 min)**
1. Proteger `/kpis/page.tsx`
2. Proteger `/kpis/capture/page.tsx`
3. Proteger `/kpis/[id]/page.tsx`
4. Proteger `/actions/page.tsx`
5. Proteger `/actions/capture/page.tsx`
6. Proteger `/actions/[id]/page.tsx`
7. Proteger `/bowtie/page.tsx`
8. Proteger `/administration/*` (se decidir)

### **Fase 2: Proteger Botões em Tabelas (30 min)**
1. Identificar TODAS as tabelas com botões de ação
2. Substituir Button por PermissionButton em cada linha
3. Testar com Maria

### **Fase 3: Testes Completos (15 min)**
1. Login Maria
2. Tentar TODAS as ações em TODOS os módulos
3. Verificar se botões estão desabilitados
4. Verificar se URLs são bloqueadas

---

## 📊 CHECKLIST COMPLETO

### **Módulos:**
- [x] Identificação - Protegido
- [x] Análise - Parcialmente (falta botões)
- [x] Controles - Protegido
- [x] Escalamento - Protegido
- [x] Melhoria - Protegido
- [ ] KPIs - **PENDENTE**
- [ ] Ações - **PENDENTE**
- [ ] Bowtie - **PENDENTE**
- [ ] Administração - **DECISÃO NECESSÁRIA**

### **Botões:**
- [ ] Identificação - Verificar tabelas
- [ ] Análise - Verificar tabelas
- [ ] Controles - Verificar tabelas
- [ ] KPIs - Proteger todos
- [ ] Ações - Proteger todos

---

## 🚀 PRÓXIMOS PASSOS

**VOCÊ DECIDE:**

1. **Proteger Administração?**
   - Sim → Apenas Ana acessa
   - Não → Deixar aberto (risco!)

2. **Prioridade:**
   - Alta: KPIs e Ações (Maria está criando)
   - Média: Botões em tabelas (UX ruim mas sem impacto)
   - Baixa: Administração (se proteger)

**Me avise:**
- Quer que eu proteja Administração?
- Começar com KPIs e Ações agora?
- Ou fazer TUDO de uma vez?

---

## 💡 RECOMENDAÇÃO FINAL

**Fazer TUDO de uma vez!**

1. Proteger KPIs completo
2. Proteger Ações completo
3. Proteger Bowtie
4. Proteger Administração (FORTE RECOMENDAÇÃO)
5. Revisar e proteger TODOS os botões em tabelas

**Tempo estimado:** 1h de trabalho
**Resultado:** Sistema 100% seguro

**Quer que eu faça isso agora?**
