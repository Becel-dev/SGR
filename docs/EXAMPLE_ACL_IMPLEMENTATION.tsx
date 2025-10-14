/**
 * EXEMPLO: Implementação de ACL na página de Identificação
 * 
 * Este arquivo demonstra todas as formas de usar o sistema de permissões
 */

'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Lightbulb, Search, Pencil, Trash2, FileDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { IdentifiedRisk } from "@/lib/types";

// ============================================================================
// IMPORTAÇÕES DO SISTEMA ACL
// ============================================================================
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PermissionButton, PermissionGuard } from '@/components/auth/permission-button';
import { useCanCreate, useCanEdit, useCanDelete, useCanExport } from '@/hooks/use-permission';

export default function IdentificationPageWithACL() {
  // ============================================================================
  // 1. PROTEGER A PÁGINA INTEIRA (obrigatório)
  // ============================================================================
  return (
    <ProtectedRoute module="identificacao" action="view">
      <IdentificationContent />
    </ProtectedRoute>
  );
}

function IdentificationContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [risks, setRisks] = useState<IdentifiedRisk[]>([]);
  const [loading, setLoading] = useState(true);

  // ============================================================================
  // 2. VERIFICAR PERMISSÕES ESPECÍFICAS (recomendado para múltiplas ações)
  // ============================================================================
  const { allowed: canCreate, loading: loadingCreate } = useCanCreate('identificacao');
  const { allowed: canEdit, loading: loadingEdit } = useCanEdit('identificacao');
  const { allowed: canDelete, loading: loadingDelete } = useCanDelete('identificacao');
  const { allowed: canExport, loading: loadingExport } = useCanExport('identificacao');

  const permissionsLoading = loadingCreate || loadingEdit || loadingDelete || loadingExport;

  useEffect(() => {
    fetchRisks();
  }, []);

  const fetchRisks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/identified-risks');
      const data = await response.json();
      setRisks(data.risks || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar riscos",
        description: "Não foi possível conectar ao banco de dados."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/identification/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este risco?')) return;
    
    try {
      const response = await fetch(`/api/identified-risks/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast({
          title: "Risco excluído",
          description: "O risco foi excluído com sucesso."
        });
        fetchRisks();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Não foi possível excluir o risco."
      });
    }
  };

  const handleExport = () => {
    // Lógica de exportação
    toast({
      title: "Exportando dados",
      description: "Os dados serão exportados em breve."
    });
  };

  const filteredRisks = risks.filter((risk: IdentifiedRisk) => {
    const term = searchTerm.toLowerCase();
    return Object.values(risk).some(value => 
      String(value).toLowerCase().includes(term)
    );
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb />
              Identificação de Risco
            </CardTitle>
            <CardDescription>
              Visualize e gerencie as fichas de identificação de novos riscos.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Barra de Busca */}
            <div className="relative flex-1 sm:flex-grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar riscos..."
                className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading || permissionsLoading}
              />
            </div>

            {/* ============================================================ */}
            {/* 3. MÉTODO 1: PermissionButton (botão desabilitado)          */}
            {/* - Mais simples                                              */}
            {/* - Mostra tooltip explicativo quando desabilitado            */}
            {/* ============================================================ */}
            <PermissionButton
              module="identificacao"
              action="export"
              size="sm"
              variant="outline"
              onClick={handleExport}
            >
              <FileDown className="h-3.5 w-3.5 mr-1" />
              Exportar
            </PermissionButton>

            {/* ============================================================ */}
            {/* 4. MÉTODO 2: PermissionGuard (oculta completamente)         */}
            {/* - Mais limpo visualmente                                    */}
            {/* - Não mostra botão se não tiver permissão                   */}
            {/* ============================================================ */}
            <PermissionGuard module="identificacao" action="create">
              <Button 
                size="sm" 
                className="h-9 gap-1"
                onClick={() => router.push('/identification/capture')}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Identificar Novo Risco
                </span>
              </Button>
            </PermissionGuard>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading || permissionsLoading ? (
          <div className="text-center py-10">
            <p>Carregando...</p>
          </div>
        ) : filteredRisks.length === 0 ? (
          <div className="text-center py-10">
            <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Nenhum risco identificado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm ? "Nenhum resultado encontrado para sua busca." : "Comece identificando um novo risco."}
            </p>
            
            {/* Botão "Criar Primeiro Risco" também protegido */}
            <PermissionGuard module="identificacao" action="create">
              <Button onClick={() => router.push('/identification/capture')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Identificar Primeiro Risco
              </Button>
            </PermissionGuard>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código MUE</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRisks.map((risk) => (
                <TableRow key={risk.id}>
                  <TableCell className="font-medium">{risk.codigoMUE}</TableCell>
                  <TableCell>{risk.titulo}</TableCell>
                  <TableCell>{risk.categoria}</TableCell>
                  <TableCell>
                    <Badge variant={risk.status === 'Novo' ? 'default' : 'secondary'}>
                      {risk.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* ============================================== */}
                      {/* 5. MÉTODO 3: Verificação manual com hook      */}
                      {/* - Mais flexível                                */}
                      {/* - Permite lógica condicional customizada       */}
                      {/* ============================================== */}
                      
                      {/* Botão Editar - desabilitado se não tiver permissão */}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!canEdit}
                        onClick={() => handleEdit(risk.id)}
                        title={!canEdit ? 'Você não tem permissão para editar' : 'Editar risco'}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>

                      {/* Botão Excluir - oculto se não tiver permissão */}
                      {canDelete && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(risk.id)}
                          title="Excluir risco"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* ============================================================ */}
      {/* 6. RESUMO DAS PERMISSÕES (útil para debug)                  */}
      {/* ============================================================ */}
      {process.env.NODE_ENV === 'development' && (
        <CardContent className="border-t pt-4">
          <div className="text-xs text-muted-foreground">
            <strong>Debug - Suas permissões neste módulo:</strong>
            <ul className="list-disc list-inside mt-2">
              <li>Visualizar: ✅ (você está vendo esta página)</li>
              <li>Criar: {canCreate ? '✅' : '❌'}</li>
              <li>Editar: {canEdit ? '✅' : '❌'}</li>
              <li>Excluir: {canDelete ? '✅' : '❌'}</li>
              <li>Exportar: {canExport ? '✅' : '❌'}</li>
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ============================================================================
// RESUMO DOS MÉTODOS DE PROTEÇÃO:
// ============================================================================
//
// 1. ProtectedRoute (obrigatório)
//    - Protege a página inteira
//    - Redireciona para /access-denied se não tiver permissão
//
// 2. PermissionButton (recomendado para botões)
//    - Desabilita automaticamente
//    - Mostra tooltip explicativo
//    - Mantém botão visível (melhor UX)
//
// 3. PermissionGuard (recomendado para ocultação)
//    - Oculta elemento completamente
//    - Interface mais limpa
//    - Não dá pistas sobre funcionalidades
//
// 4. Hooks useCanXxx (recomendado para lógica customizada)
//    - Máxima flexibilidade
//    - Permite lógica condicional
//    - Melhor performance (reutiliza resultado)
//
// ============================================================================
