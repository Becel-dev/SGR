# 📋 SUMÁRIO: Páginas Que Precisam de Proteção ACL

**Data:** 14/10/2025  
**Status:** ✅ 1/7 módulos protegidos  

---

## ✅ PROTEGIDO

### **1. Identificação de Risco (identificacao)**
- [x] `/identification/page.tsx` - Lista (ProtectedRoute view)
- [x] `/identification/capture/page.tsx` - Criar/Editar (ProtectedRoute create/edit)
- [x] `/identification/[id]/page.tsx` - Detalhes (ProtectedRoute view + PermissionButton edit/delete)

---

## ⏳ PENDENTE

### **2. Análise de Riscos (analise)**
- [ ] `/analysis/page.tsx` - Verificar se tem ProtectedRoute
- [ ] `/analysis/[id]/page.tsx` - Verificar proteção
- [ ] `/analysis/capture/page.tsx` - PRECISA de ProtectedRoute
- [ ] `/analysis/risks/capture/page.tsx` - PRECISA de ProtectedRoute

### **3. Controles (controles)**
- [ ] `/controls/page.tsx` - Verificar se tem ProtectedRoute
- [ ] `/controls/[id]/page.tsx` - Verificar proteção
- [ ] `/controls/capture/page.tsx` - PRECISA de ProtectedRoute

### **4. Bowtie (bowtie)**
- [ ] `/bowtie/page.tsx` - Verificar se tem ProtectedRoute
- [ ] Verificar se há páginas de captura

### **5. Escalamento (escalation)**
- [ ] `/escalation/page.tsx` - Verificar se tem ProtectedRoute
- [ ] `/escalation/capture/page.tsx` - PRECISA de ProtectedRoute

### **6. Melhoria (melhoria)**
- [ ] `/improvement/page.tsx` - Verificar se tem ProtectedRoute
- [ ] Verificar se há páginas de captura

### **7. Relatórios (relatorios)**
- [ ] `/reports/generate/page.tsx` - Verificar se tem ProtectedRoute
- [ ] Pode precisar action="export" em vez de "view"

---

## 🚫 NÃO PROTEGER (Sem ACL)

### **Administração**
- `/administration/access-profiles/capture/page.tsx` - SEM proteção (admin precisa acessar sempre)
- `/administration/access-control/capture/page.tsx` - SEM proteção (admin precisa acessar sempre)
- `/administration/parameters/` - SEM proteção

### **Outros**
- `/actions/capture/page.tsx` - Verificar se é módulo do ACL
- `/kpis/capture/page.tsx` - Verificar se é módulo do ACL

---

## 🎯 PRIORIDADE

### **Alta (Usuário pode criar/editar sem permissão):**
1. ⚠️ `/controls/capture/page.tsx` - Controles são críticos
2. ⚠️ `/analysis/risks/capture/page.tsx` - Análise é crítica
3. ⚠️ `/escalation/capture/page.tsx` - Escalamento é importante

### **Média (Precisa verificar se já tem proteção):**
4. `/analysis/page.tsx` - Verificar lista
5. `/controls/page.tsx` - Verificar lista
6. `/bowtie/page.tsx` - Verificar lista

### **Baixa (Já tem ProtectedRoute mas verificar botões):**
7. Todas as páginas de detalhes `[id]/page.tsx`

---

## 🔍 COMANDOS PARA VERIFICAR

### **Verificar quais páginas já têm ProtectedRoute:**

```powershell
Get-ChildItem -Path "src\app\(app)" -Recurse -Filter "page.tsx" | Select-String -Pattern "ProtectedRoute" | Select-Object -Property Path, Line
```

### **Verificar quais páginas usam PermissionButton:**

```powershell
Get-ChildItem -Path "src\app\(app)" -Recurse -Filter "page.tsx" | Select-String -Pattern "PermissionButton" | Select-Object -Property Path, Line
```

---

## 📊 ESTATÍSTICAS

- **Total de módulos:** 10
- **Protegidos:** 1 (identificacao)
- **Pendentes:** 6 (analise, controles, bowtie, escalation, melhoria, relatorios)
- **Sem proteção intencional:** 3 (perfis-acesso, controle-acesso, parametros)

---

## ✅ PRÓXIMA AÇÃO

**Aplicar proteção nos módulos críticos:**

1. Controls (controles)
2. Analysis (analise)  
3. Escalation (escalation)

Usar o template de `docs/FIX_PAGE_PROTECTION.md`.
