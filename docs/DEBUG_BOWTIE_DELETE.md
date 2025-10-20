# 🐛 Debug: Erro ao Excluir Bowtie

**Data:** 20 de Janeiro de 2025  
**Problema:** "Bowtie not found" ao tentar excluir

---

## 🔍 Erros Relatados

### Erro 1:
```
Console Error
API error: {}
```

### Erro 2:
```
Console Error
Bowtie not found
```

**Diagnóstico:** O bowtie não está sendo encontrado no Azure Table Storage.

---

## 📊 Análise do Problema

### 1. Estrutura do BowtieData

```typescript
export type BowtieData = {
  id: string;           // partitionKey (ID único do bowtie)
  riskId: string;       // Risco associado
  version: number;      // Versão do bowtie
  // ... outros campos
}
```

### 2. Fluxo de Exclusão

#### Frontend (`bowtie/page.tsx`):
```typescript
// Linha 697 do bowtie-diagram.tsx
onDelete(localData.id)  // Passa o ID do bowtie

// Linha 221-240 do bowtie/page.tsx
const handleDeleteDiagram = async (diagramId: string) => {
  const response = await fetch(`/api/bowtie/${diagramId}`, {
    method: 'DELETE',
  });
  // ...
}
```

#### Backend (`api/bowtie/[id]/route.ts`):
```typescript
export async function DELETE(params: { id: string }) {
  // 1. Busca o bowtie por ID
  const latest = await getBowtieById(params.id);
  
  // 2. Se encontrado, deleta todas as versões
  if (latest) {
    await deleteBowtieAllVersions(latest.riskId, latest.id);
    return { message: 'success' };
  }
  
  // 3. Fallback: tenta por riskId
  // ...
}
```

### 3. Função `getBowtieById`

**Problema Potencial:** A função faz scan completo da tabela

```typescript
export async function getBowtieById(id: string) {
  const entities = client.listEntities(); // ⚠️ Scan completo!
  
  for await (const entity of entities) {
    if (entity.partitionKey === id || 
        entity.rowKey?.startsWith(id + '_v')) {
      // Retorna o bowtie com maior versão
    }
  }
}
```

**Problema:** 
- Se a tabela estiver vazia ou o bowtie não existir, retorna `undefined`
- Se houver erro na busca, também retorna `undefined`
- O DELETE então retorna 404, mas o erro JSON vem vazio `{}`

---

## ✅ Soluções Implementadas

### 1. Logs Detalhados na API

**Arquivo:** `src/app/api/bowtie/[id]/route.ts`

```typescript
export async function DELETE(params: { id: string }) {
  try {
    console.log('DELETE Bowtie - params.id:', params.id);
    
    const latest = await getBowtieById(params.id);
    console.log('DELETE Bowtie - latest found:', latest ? {...} : 'null');
    
    if (latest) {
      console.log('DELETE Bowtie - Deleting all versions...');
      const deletedCount = await deleteBowtieAllVersions(latest.riskId, latest.id);
      console.log('DELETE Bowtie - Deleted count:', deletedCount);
      
      return NextResponse.json({ 
        message: 'Bowtie deleted successfully',
        deletedCount,
        riskId: latest.riskId,
        id: latest.id
      });
    }

    // Fallback
    console.log('DELETE Bowtie - Trying fallback...');
    const versions = await getBowtieVersions(params.id);
    console.log('DELETE Bowtie - Versions found:', versions?.length);
    
    if (versions && versions.length > 0) {
      const deleted = await deleteBowtieAllForRisk(params.id);
      console.log('DELETE Bowtie - Fallback deleted count:', deleted);
      
      return NextResponse.json({ 
        message: 'Bowtie deleted successfully (by riskId fallback)',
        deletedCount: deleted,
        riskId: params.id
      });
    }

    console.log('DELETE Bowtie - Not found, returning 404');
    return NextResponse.json({ 
      error: 'Bowtie not found',
      details: `No bowtie found with id/riskId: ${params.id}`
    }, { status: 404 });
    
  } catch (error) {
    console.error(`Error deleting bowtie ${params.id}:`, error);
    return NextResponse.json(
      { 
        error: 'Failed to delete bowtie',
        details: error instanceof Error ? error.message : 'Unknown error',
        id: params.id
      },
      { status: 500 }
    );
  }
}
```

### 2. Melhorias no Response

**Antes:**
```json
{ "error": "Bowtie not found" }
```

**Depois:**
```json
{ 
  "error": "Bowtie not found",
  "details": "No bowtie found with id/riskId: abc-123",
  "id": "abc-123"
}
```

---

## 🧪 Como Testar

### 1. Abrir Console do Navegador
- F12 → Aba Console
- Aba Network

### 2. Tentar Excluir um Bowtie
1. Acesse `/bowtie`
2. Clique em "Visualizar" em qualquer bowtie
3. Clique em "Excluir Diagrama"
4. Confirme a exclusão

### 3. Verificar Logs

**Console do Navegador:**
```
DELETE /api/bowtie/[id] - Status: 200/404/500
Response: { ... }
```

**Terminal do Servidor (onde roda npm run dev):**
```
DELETE Bowtie - params.id: abc-123
DELETE Bowtie - latest found: { id: 'abc-123', riskId: 'risk-001', version: 1 }
DELETE Bowtie - Deleting all versions...
DELETE Bowtie - Deleted count: 2
```

---

## 🔍 Possíveis Causas do Erro

### 1. ⚠️ ID vs RiskID - Provável Causa
**Problema:** Confusão entre `id` (partitionKey) e `riskId`

**Estrutura do Bowtie no Azure:**
```
PartitionKey: riskId (ex: "RISK-001")
RowKey: {id}_v{version} (ex: "abc-123_v1")
```

**No código:**
- `bowtie.id` = ID único do bowtie (ex: "abc-123")
- `bowtie.riskId` = ID do risco associado (ex: "RISK-001")

**O que pode estar acontecendo:**
- Frontend passa `diagram.id` (ID do bowtie)
- API busca por partitionKey = `diagram.id`
- ❌ Mas o partitionKey é o `riskId`!

### 2. Bowtie Não Existe
- ✅ **Solução:** Agora retorna 404 com detalhes
- Mensagem: "Bowtie not found" com ID

### 3. Erro no Azure Table Storage
- ✅ **Solução:** Catch detalhado com mensagem de erro
- Logs no console do servidor

### 4. Problema de Permissão
- ⚠️ **Verificar:** Se usuário tem permissão de delete no módulo "bowtie"
- Use super admin (pedro.becel@rumolog.com) para testar

---

## 📝 Próximos Passos de Debug

Se o erro persistir após essas mudanças:

### 1. Verificar Logs do Servidor
```powershell
# No terminal onde roda npm run dev
# Procurar por:
DELETE Bowtie - params.id: ...
```

### 2. Verificar Network Tab
```
Request URL: http://localhost:3000/api/bowtie/[ID]
Method: DELETE
Status: ???
Response: { ... }
```

### 3. Verificar Azure Table Storage
- Acessar Azure Portal
- Verificar se a tabela `Bowtie` existe
- Ver se há registros com o ID sendo excluído

### 4. Testar com Super Admin
```
Email: pedro.becel@rumolog.com
```

---

## ⚠️ Nota Importante

### Estrutura da Tabela Bowtie

**PartitionKey:** `id` do bowtie (único)  
**RowKey:** `{id}_v{version}` ou `{riskId}_v{version}`

**Exemplo:**
```
PartitionKey: "bowtie-123"
RowKey: "bowtie-123_v1"

PartitionKey: "bowtie-123"
RowKey: "bowtie-123_v2"
```

A função `getBowtieById` busca por:
1. `partitionKey === id`
2. OU `rowKey.startsWith(id + '_v')`

Se nenhum encontrado → `undefined` → 404

---

## 🎯 Resultado Esperado

Após essas mudanças, ao tentar excluir um bowtie:

### Se Bowtie Existe:
```json
{
  "message": "Bowtie deleted successfully",
  "deletedCount": 2,
  "riskId": "risk-001",
  "id": "bowtie-123"
}
```

### Se Bowtie Não Existe:
```json
{
  "error": "Bowtie not found",
  "details": "No bowtie found with id/riskId: bowtie-999",
  "id": "bowtie-999"
}
```

### Se Erro no Servidor:
```json
{
  "error": "Failed to delete bowtie",
  "details": "Connection timeout to Azure Table Storage",
  "id": "bowtie-123"
}
```

---

**Última atualização:** 20/01/2025  
**Status:** ✅ Logs adicionados, aguardando novo teste
