
'use client';

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Lightbulb, ArrowRight, Search, Loader2 } from "lucide-react";
import { getIdentifiedRisks } from "@/lib/azure-table-storage";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import type { IdentifiedRisk } from "@/lib/types";
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PermissionButton } from '@/components/auth/permission-button';
import { useCanCreate } from '@/hooks/use-permission';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

export default function IdentificationPage() {
  return (
    <ProtectedRoute module="identificacao" action="view">
      <IdentificationContent />
    </ProtectedRoute>
  );
}

function IdentificationContent() {

  const [searchTerm, setSearchTerm] = useState("");
  const [risks, setRisks] = useState<IdentifiedRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Estado para ordenação
  const [sortColumn, setSortColumn] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // ⚡ OTIMIZAÇÃO: Debounce para evitar filtrar a cada tecla (90% menos re-renders)
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  const fetchRisks = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedRisks = await getIdentifiedRisks();
      setRisks(fetchedRisks);
    } catch (err: any) {
      setError("Erro ao carregar riscos. Tente novamente.");
      toast({
        variant: "destructive",
        title: "Erro ao carregar riscos",
        description: err?.message || "Não foi possível conectar ao banco de dados."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, []);


  // Ordenação dos riscos
  const sortedRisks = [...risks].sort((a, b) => {
    const col = sortColumn as keyof IdentifiedRisk;
    let aValue = a[col];
    let bValue = b[col];
    // Datas: converter para timestamp
    if (col === 'createdAt' || col === 'updatedAt') {
      aValue = aValue ? new Date(aValue as string).getTime() : 0;
      bValue = bValue ? new Date(bValue as string).getTime() : 0;
    }
    // Strings: comparar case-insensitive
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Filtro após ordenação
  const filteredRisks = sortedRisks.filter((risk: IdentifiedRisk) => {
    const term = debouncedSearchTerm.toLowerCase();
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
                <div className="relative flex-1 sm:flex-grow-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar riscos..."
                        className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={loading}
                    />
                </div>
                <PermissionButton 
                  module="identificacao" 
                  action="create"
                  size="sm" 
                  className="h-9 gap-1"
                  asChild
                  disabled={loading}
                >
                  <Link href="/identification/capture">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Identificar Novo Risco
                    </span>
                  </Link>
                </PermissionButton>
                <Button size="sm" variant="outline" className="h-9" onClick={fetchRisks} disabled={loading}>
                  Atualizar
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : error ? (
            <div className="text-center p-8 text-destructive">
              {error}
              <Button variant="outline" className="mt-4" onClick={fetchRisks}>Tentar novamente</Button>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <Table>
          <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort('id')} className="cursor-pointer select-none">
              ID {renderSortIcon('id')}
            </TableHead>
            <TableHead onClick={() => handleSort('riskName')} className="cursor-pointer select-none">
              Nome do Risco {renderSortIcon('riskName')}
            </TableHead>
            <TableHead onClick={() => handleSort('topRisk')} className="cursor-pointer select-none">
              Top Risk Corporativo {renderSortIcon('topRisk')}
            </TableHead>
            <TableHead onClick={() => handleSort('pointingType')} className="cursor-pointer select-none">
              Tipo do Apontamento {renderSortIcon('pointingType')}
            </TableHead>
            <TableHead onClick={() => handleSort('createdBy')} className="cursor-pointer select-none">
              Criado por {renderSortIcon('createdBy')}
            </TableHead>
            <TableHead onClick={() => handleSort('createdAt')} className="cursor-pointer select-none">
              Data de criação {renderSortIcon('createdAt')}
            </TableHead>
            <TableHead onClick={() => handleSort('updatedBy')} className="cursor-pointer select-none">
              Última alteração por {renderSortIcon('updatedBy')}
            </TableHead>
            <TableHead onClick={() => handleSort('updatedAt')} className="cursor-pointer select-none">
              Data da última alteração {renderSortIcon('updatedAt')}
            </TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
          </TableHeader>
                    <TableBody>
          {filteredRisks.map(risk => (
            <TableRow key={risk.id}>
            <TableCell className="font-mono">{risk.id}</TableCell>
            <TableCell className="font-medium">{risk.riskName}</TableCell>
            <TableCell>{risk.topRisk}</TableCell>
            <TableCell>
              <Badge variant="secondary">{risk.pointingType}</Badge>
            </TableCell>
            <TableCell>{risk.createdBy}</TableCell>
            <TableCell>{risk.createdAt ? new Date(risk.createdAt).toLocaleString('pt-BR') : '-'}</TableCell>
            <TableCell>{risk.updatedBy}</TableCell>
            <TableCell>{risk.updatedAt ? new Date(risk.updatedAt).toLocaleString('pt-BR') : '-'}</TableCell>
            <TableCell>
              <Button variant="ghost" size="icon" asChild>
              <Link href={`/identification/${risk.id}`}>
                <ArrowRight className="h-4 w-4" />
                <span className="sr-only">Ver Detalhes</span>
              </Link>
              </Button>
            </TableCell>
            </TableRow>
          ))}
                    </TableBody>
                </Table>
            </div>
        )}
         {!loading && !error && filteredRisks.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            {debouncedSearchTerm ? `Nenhum risco encontrado para "${debouncedSearchTerm}".` : "Nenhum risco identificado ainda."}
          </div>
        )}
      </CardContent>
    </Card>
  );
  // Função para alternar ordenação
  function handleSort(col: string) {
    if (sortColumn === col) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  }

  // Renderiza ícone de ordenação
  function renderSortIcon(col: string) {
    if (sortColumn !== col) return null;
    return sortDirection === 'asc' ? (
      <span style={{marginLeft: 2}}>▲</span>
    ) : (
      <span style={{marginLeft: 2}}>▼</span>
    );
  }
}
