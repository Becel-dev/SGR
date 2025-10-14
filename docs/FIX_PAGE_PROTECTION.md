# 🚨 CORREÇÃO CRÍTICA: Proteção de Páginas de Ação (CREATE, EDIT, DELETE)

**Data:** 14/10/2025  
**Problema:** Usuários sem permissão conseguiam acessar páginas de criação/edição diretamente pela URL  
**Status:** ✅ CORRIGIDO PARA MÓDULO IDENTIFICAÇÃO

---

## 🔍 PROBLEMA IDENTIFICADO

### **Situação Reportada:**

Maria (perfil Visualizador) conseguiu **criar** uma identificação de risco mesmo sem ter permissão de `create`.

### **Root Cause:**

```
1. ✅ Botão "Identificar Novo Risco" estava protegido
   - Usa PermissionButton
   - Desabilitado visualmente para Maria
   
2. ❌ Página /identification/capture NÃO tinha ProtectedRoute
   - Maria podia acessar digitando URL diretamente
   - Nenhuma verificação de permissão na página
   - Formulário funcionava normalmente
   
3. ❌ Página /identification/[id] (detalhes) não protegia ações
   - Botões "Editar" e "Excluir" não verificavam permissões
   - Usuário sem permissão podia editar/excluir
```

### **Falha de Segurança:**

**Proteção de Botão ≠ Proteção de Página**

- `PermissionButton` apenas **desabilita visualmente** o botão
- NÃO impede navegação direta via URL
- NÃO impede uso de ferramentas como Postman/curl
- É apenas **UX**, não **segurança**

**A segurança real vem de:**
1. ✅ `ProtectedRoute` na página
2. ✅ Verificação de permissões no servidor (APIs)

---

## ✅ CORREÇÃO APLICADA

### **Arquivos Modificados:**

1. **`src/app/(app)/identification/capture/page.tsx`**
   - Adicionado `ProtectedRoute` verificando `create` ou `edit`
   
2. **`src/app/(app)/identification/[id]/page.tsx`**
   - Adicionado `ProtectedRoute` verificando `view`
   - Adicionado `PermissionButton` nos botões "Editar" e "Excluir"

---

### **1. Proteção da Página de Captura (CREATE/EDIT)**

**ANTES (vulnerável):**
```typescript
export default function CaptureIdentifiedRiskPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const riskId = searchParams ? searchParams.get('id') : null;
    const isEditing = !!riskId;
    
    // ❌ Nenhuma proteção!
    return <form>...</form>;
}
```

**DEPOIS (protegido):**
```typescript
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function CaptureIdentifiedRiskPage() {
    const searchParams = useSearchParams();
    const riskId = searchParams ? searchParams.get('id') : null;
    const isEditing = !!riskId;
    
    // ✅ Protege com ACL
    // Se editando: precisa de 'edit'
    // Se criando: precisa de 'create'
    return (
        <ProtectedRoute 
            module="identificacao" 
            action={isEditing ? 'edit' : 'create'}
        >
            <CaptureIdentifiedRiskContent />
        </ProtectedRoute>
    );
}

function CaptureIdentifiedRiskContent() {
    // Conteúdo do formulário aqui
}
```

**Resultado:**
- ✅ Maria tenta acessar `/identification/capture` → **Redireciona para /access-denied**
- ✅ João (Gestor) acessa `/identification/capture` → **Carrega normalmente**
- ✅ Maria tenta editar `/identification/capture?id=123` → **Redireciona para /access-denied**

---

### **2. Proteção da Página de Detalhes (VIEW/DELETE)**

**ANTES (vulnerável):**
```typescript
export default function IdentifiedRiskDetailPage() {
    // ...
    return (
        <Card>
            {/* ... */}
            <CardFooter>
                <Button variant="destructive" onClick={handleDelete}>
                    Excluir Risco
                </Button>
                <Button asChild>
                    <Link href={`/identification/capture?id=${risk.id}`}>
                        Editar Ficha
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
```

**DEPOIS (protegido):**
```typescript
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PermissionButton } from '@/components/auth/permission-button';

export default function IdentifiedRiskDetailPage() {
    return (
        <ProtectedRoute module="identificacao" action="view">
            <IdentifiedRiskDetailContent />
        </ProtectedRoute>
    );
}

function IdentifiedRiskDetailContent() {
    // ...
    return (
        <Card>
            {/* ... */}
            <CardFooter>
                {/* Botão de excluir protegido */}
                <PermissionButton 
                    module="identificacao" 
                    action="delete"
                    variant="destructive"
                >
                    <Trash2 /> Excluir Risco
                </PermissionButton>
                
                {/* Botão de editar protegido */}
                <PermissionButton 
                    module="identificacao" 
                    action="edit"
                    asChild
                >
                    <Link href={`/identification/capture?id=${risk.id}`}>
                        Editar Ficha
                    </Link>
                </PermissionButton>
            </CardFooter>
        </Card>
    );
}
```

**Resultado:**
- ✅ Maria vê detalhes (tem permissão `view`)
- ✅ Botão "Excluir" **DESABILITADO** (não tem `delete`)
- ✅ Botão "Editar" **DESABILITADO** (não tem `edit`)
- ✅ Se clicar (mesmo desabilitado), página de edição bloqueia (ProtectedRoute)

---

## 🎯 MATRIZ DE PERMISSÕES

### **Maria (Visualizador - Apenas VIEW):**

| Página | URL | Permissão | Resultado |
|--------|-----|-----------|-----------|
| Lista | `/identification` | `view` | ✅ Acessa |
| Detalhes | `/identification/123` | `view` | ✅ Acessa |
| Criar | `/identification/capture` | `create` | 🚫 Access Denied |
| Editar | `/identification/capture?id=123` | `edit` | 🚫 Access Denied |
| Botão Criar | Lista → "+ Novo" | `create` | 🔒 Desabilitado |
| Botão Editar | Detalhes → "Editar" | `edit` | 🔒 Desabilitado |
| Botão Excluir | Detalhes → "Excluir" | `delete` | 🔒 Desabilitado |

### **João (Gestor - VIEW, CREATE, EDIT):**

| Página | URL | Permissão | Resultado |
|--------|-----|-----------|-----------|
| Lista | `/identification` | `view` | ✅ Acessa |
| Detalhes | `/identification/123` | `view` | ✅ Acessa |
| Criar | `/identification/capture` | `create` | ✅ Acessa |
| Editar | `/identification/capture?id=123` | `edit` | ✅ Acessa |
| Botão Criar | Lista → "+ Novo" | `create` | ✅ Habilitado |
| Botão Editar | Detalhes → "Editar" | `edit` | ✅ Habilitado |
| Botão Excluir | Detalhes → "Excluir" | `delete` | 🔒 Desabilitado |

### **Ana (Super Admin - TUDO):**

| Página | URL | Permissão | Resultado |
|--------|-----|-----------|-----------|
| Tudo | Todas | Todas | ✅ Acesso Total |

---

## 🚨 OUTRAS PÁGINAS QUE PRECISAM SER CORRIGIDAS

### **Páginas Identificadas (Precisam de Proteção):**

1. **Análise de Riscos:**
   - `/analysis/capture` → Precisa de `ProtectedRoute action="create"`
   - `/analysis/[id]` → Proteger botões edit/delete
   - `/analysis/risks/capture` → Precisa de proteção

2. **Controles:**
   - `/controls/capture` → Precisa de `ProtectedRoute action="create"`
   - `/controls/[id]` → Proteger botões edit/delete

3. **Escalamento:**
   - `/escalation` → Verificar se permite criação sem permissão

4. **Melhoria:**
   - `/improvement` → Verificar formulários

5. **Relatórios:**
   - `/reports/generate` → Já tem `ProtectedRoute action="view"`
   - Mas pode precisar de `action="export"`

---

## 📋 CHECKLIST DE PROTEÇÃO (POR MÓDULO)

Para cada módulo, verificar:

- [ ] **Página de Lista** (`/module/page.tsx`)
  - [ ] Tem `ProtectedRoute module="..." action="view"`
  - [ ] Botão "Criar" usa `PermissionButton action="create"`
  
- [ ] **Página de Detalhes** (`/module/[id]/page.tsx`)
  - [ ] Tem `ProtectedRoute module="..." action="view"`
  - [ ] Botão "Editar" usa `PermissionButton action="edit"`
  - [ ] Botão "Excluir" usa `PermissionButton action="delete"`
  
- [ ] **Página de Captura/Criação** (`/module/capture/page.tsx`)
  - [ ] Tem `ProtectedRoute` verificando:
    - `action="create"` se novo registro
    - `action="edit"` se edição (baseado em `id` na URL)
  
- [ ] **APIs** (`/api/module/route.ts`)
  - [ ] POST verifica permissão `create`
  - [ ] PUT/PATCH verifica permissão `edit`
  - [ ] DELETE verifica permissão `delete`
  - [ ] GET verifica permissão `view`

---

## 🔧 TEMPLATE PARA APLICAR EM OUTRAS PÁGINAS

### **1. Página de Captura (CREATE/EDIT):**

```typescript
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function CaptureModulePage() {
    const searchParams = useSearchParams();
    const id = searchParams?.get('id');
    const isEditing = !!id;
    
    return (
        <ProtectedRoute 
            module="nome-do-modulo" 
            action={isEditing ? 'edit' : 'create'}
        >
            <CaptureModuleContent />
        </ProtectedRoute>
    );
}

function CaptureModuleContent() {
    // Seu conteúdo aqui
}
```

### **2. Página de Detalhes:**

```typescript
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PermissionButton } from '@/components/auth/permission-button';

export default function ModuleDetailPage() {
    return (
        <ProtectedRoute module="nome-do-modulo" action="view">
            <ModuleDetailContent />
        </ProtectedRoute>
    );
}

function ModuleDetailContent() {
    return (
        <Card>
            {/* Conteúdo */}
            <CardFooter>
                {/* Botão Excluir */}
                <PermissionButton 
                    module="nome-do-modulo" 
                    action="delete"
                    variant="destructive"
                >
                    Excluir
                </PermissionButton>
                
                {/* Botão Editar */}
                <PermissionButton 
                    module="nome-do-modulo" 
                    action="edit"
                    asChild
                >
                    <Link href="/module/capture?id=...">Editar</Link>
                </PermissionButton>
            </CardFooter>
        </Card>
    );
}
```

---

## 🧪 TESTANDO AS CORREÇÕES

### **1. Teste com Maria (Visualizador):**

```
1. Login: maria@teste.com / 123456
2. Ir para Identificação de Risco
3. ✅ Lista carrega normalmente
4. ✅ Botão "Identificar Novo Risco" DESABILITADO
5. Tentar acessar URL direta: http://localhost:3000/identification/capture
6. ✅ Deve redirecionar para "Acesso Negado"
7. Clicar em um risco existente
8. ✅ Detalhes carregam
9. ✅ Botões "Editar" e "Excluir" DESABILITADOS
```

### **2. Teste com João (Gestor):**

```
1. Login: joao@teste.com / 123456
2. Ir para Identificação de Risco
3. ✅ Botão "Identificar Novo Risco" HABILITADO
4. Clicar no botão
5. ✅ Página de captura carrega
6. Criar um risco de teste
7. ✅ Risco criado com sucesso
8. Ir para detalhes
9. ✅ Botão "Editar" HABILITADO
10. ✅ Botão "Excluir" DESABILITADO (João não tem delete)
11. Tentar acessar URL de edição diretamente
12. ✅ Página carrega normalmente
```

### **3. Teste com Ana (Super Admin):**

```
1. Login: ana@teste.com / 123456
2. ✅ TUDO habilitado e funcionando
3. Pode criar, editar, excluir
4. Todas as URLs acessíveis
```

---

## ⚠️ IMPORTANTE: PROTEÇÃO DE APIs

**As páginas estão protegidas, MAS as APIs também precisam de proteção!**

Exemplo de API vulnerável:

```typescript
// ❌ VULNERÁVEL
export async function POST(request: Request) {
    const data = await request.json();
    // Qualquer usuário autenticado pode criar!
    await createRisk(data);
    return NextResponse.json({ success: true });
}
```

Exemplo de API protegida:

```typescript
// ✅ PROTEGIDA
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    
    // Buscar perfil do usuário
    const userProfile = await getUserProfile(session.user.email);
    
    // Verificar permissão
    if (!hasPermission(userProfile, 'identificacao', 'create')) {
        return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }
    
    // Agora sim, criar
    const data = await request.json();
    await createRisk(data);
    return NextResponse.json({ success: true });
}
```

---

## ✅ PRÓXIMOS PASSOS

### **Imediato:**
1. ✅ Identificação protegida
2. [ ] Proteger módulo Análise
3. [ ] Proteger módulo Controles
4. [ ] Proteger módulo Bowtie
5. [ ] Proteger módulo Escalamento
6. [ ] Proteger módulo Melhoria
7. [ ] Proteger módulo Relatórios

### **Médio Prazo:**
- [ ] Adicionar proteção nas APIs
- [ ] Criar testes automatizados para verificar permissões
- [ ] Documentar matriz de permissões completa

### **Longo Prazo:**
- [ ] Implementar auditoria de tentativas de acesso negado
- [ ] Dashboard de acessos por usuário
- [ ] Relatório de uso de permissões

---

## 🎯 RESUMO

**Problema:** Proteção de botões (PermissionButton) não impede acesso direto via URL.

**Solução:** 
1. ✅ Adicionar `ProtectedRoute` em TODAS as páginas de ação (create/edit/delete)
2. ✅ Usar `PermissionButton` para UX (desabilitar botões visualmente)
3. ✅ Verificar permissões nas APIs (próximo passo)

**Status:** 
- ✅ Módulo Identificação protegido
- ⏳ Outros módulos precisam da mesma correção

**Teste Agora:**
```
1. Reiniciar servidor (npm run dev)
2. Login com Maria
3. Tentar acessar: http://localhost:3000/identification/capture
4. Deve mostrar "Acesso Negado" ✅
```
