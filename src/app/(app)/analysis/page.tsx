'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Siren, ArrowRight, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { getRisksForAnalysis } from "@/lib/azure-table-storage";
import { getIerRules, getIerClassification } from "@/lib/ier-utils";
import type { RiskAnalysis, IerRule } from "@/lib/types";

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    'Novo': 'destructive',
    'Em Análise': 'secondary',
    'Analisado': 'default', // Temporariamente 'default' para visualização
};

const statusOrder: { [key: string]: number } = {
  'Novo': 1,
  'Em Análise': 2,
  'Analisado': 3,
};

// Função para determinar a variante do Badge com base no status
const getBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'Novo':
      return 'destructive';
    case 'Em Análise':
      return 'secondary';
    case 'Analisado':
      return 'default'; // Será estilizado via className
    default:
      return 'default';
  }
};

export default function RiskAnalysisPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [risks, setRisks] = useState<RiskAnalysis[]>([]);
  const [ierRules, setIerRules] = useState<IerRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [fetchedRisks, fetchedIerRules] = await Promise.all([
          getRisksForAnalysis(),
          getIerRules()
        ]);
        setRisks(fetchedRisks);
        setIerRules(fetchedIerRules);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Falha ao carregar os dados. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  
  const filteredRisks = risks
    .filter((risk: RiskAnalysis) => {
        const term = searchTerm.toLowerCase();
        // Adaptar para os novos nomes de campo
        return (
            risk.riskName?.toLowerCase().includes(term) ||
            risk.id?.toLowerCase().includes(term) ||
            risk.topRisk?.toLowerCase().includes(term) ||
            risk.status?.toLowerCase().includes(term)
        );
    })
    .sort((a, b) => {
        const statusA = statusOrder[a.status] || 99;
        const statusB = statusOrder[b.status] || 99;
        if (statusA !== statusB) {
            return statusA - statusB;
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <Siren />
                    Análise de Riscos
                </CardTitle>
                <CardDescription>
                    Visualize, filtre e gerencie todos os riscos identificados e em análise.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-grow-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar por nome, ID, status..."
                        className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Nome do Risco</TableHead>
                <TableHead>Top Risk Corporativo</TableHead>
                <TableHead>IER (Calculado)</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-2">Carregando riscos...</p>
                  </TableCell>
                </TableRow>
              ) : error ? (
                 <TableRow>
                  <TableCell colSpan={6} className="text-center p-8 text-red-500">
                    {error}
                  </TableCell>
                </TableRow>
              ) : filteredRisks.length > 0 ? (
                filteredRisks.map(risk => {
                  const ierClassification = getIerClassification(risk.ier || 0, ierRules);
                  return (
                  <TableRow 
                      key={risk.id}
                      className={cn(risk.status === 'Novo' && 'bg-yellow-100/50 dark:bg-yellow-900/20 hover:bg-yellow-100/60 dark:hover:bg-yellow-900/30')}
                  >
                    <TableCell>
                      <Badge 
                        variant={getBadgeVariant(risk.status)}
                        className={cn({
                          'bg-green-600 text-white hover:bg-green-700': risk.status === 'Analisado',
                        })}
                      >
                        {risk.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{risk.id}</TableCell>
                    <TableCell>{risk.riskName}</TableCell>
                    <TableCell>{risk.topRisk}</TableCell>
                    <TableCell className="font-bold text-center">
                        <span 
                          className='p-2 rounded text-white font-semibold'
                          style={{ backgroundColor: risk.status === 'Novo' ? '#d1d5db' : ierClassification.color }}
                        >
                          {risk.status === 'Novo' ? 'N/A' : Math.round(risk.ier || 0)}
                        </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        {/* O link agora aponta para a página de captura de análise */}
                        <Link href={`/analysis/capture/${risk.id}`}>
                          <ArrowRight className="h-4 w-4" />
                          <span className="sr-only">Analisar Risco</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-8 text-muted-foreground">
                    Nenhum risco encontrado para &quot;{searchTerm}&quot;.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
