'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Siren, ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { RiskAnalysis } from "@/lib/types";

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    'Novo': 'destructive',
    'Em Análise': 'secondary',
    'Analisado': 'default',
};

const statusOrder: { [key: string]: number } = {
  'Novo': 1,
  'Em Análise': 2,
  'Analisado': 3,
};

export default function RisksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [risks, setRisks] = useState<RiskAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRisks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/analysis/risks');
        
        if (!response.ok) {
          throw new Error('Erro ao buscar riscos');
        }
        
        const data = await response.json();
        setRisks(data);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar riscos:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar riscos');
      } finally {
        setLoading(false);
      }
    };

    fetchRisks();
  }, []);
  
  const filteredRisks = risks
    .filter((risk: RiskAnalysis) => {
        const term = searchTerm.toLowerCase();
        return Object.values(risk).some(value => 
        String(value).toLowerCase().includes(term)
        );
    })
    .sort((a, b) => {
        const statusA = statusOrder[a.status] || 99;
        const statusB = statusOrder[b.status] || 99;
        return statusA - statusB;
    });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <Siren className="h-6 w-6" />
                    Análise de Riscos
                </CardTitle>
                <CardDescription>
                    Lista de riscos identificados para análise
                </CardDescription>
            </div>
            <Button asChild>
                <Link href="/identification">
                    <PlusCircle className="mr-2 h-4 w-4" /> Novo Risco
                </Link>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
         <div className="mb-4">
          <div className="flex gap-4 items-center">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Buscar riscos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
            />
          </div>
        </div>

        {loading && (
          <div className="text-center p-8 text-muted-foreground flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            Carregando riscos...
          </div>
        )}

        {error && (
          <div className="text-center p-8 text-red-500 border border-red-200 rounded-lg bg-red-50">
            <p className="font-semibold">Erro ao carregar riscos</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && filteredRisks.length === 0 && (
          <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg">
            {searchTerm ? (
              <p>Nenhum risco encontrado para &quot;{searchTerm}&quot;.</p>
            ) : (
              <div className="space-y-2">
                <p>Nenhum risco cadastrado ainda.</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/identification">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Criar Primeiro Risco
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {!loading && !error && filteredRisks.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome do Risco</TableHead>
                  <TableHead>IER</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRisks.map(risk => (
                  <TableRow 
                      key={risk.id}
                      className={cn(risk.status === 'Novo' && 'bg-yellow-100/50 dark:bg-yellow-900/20 hover:bg-yellow-100/60 dark:hover:bg-yellow-900/30')}
                  >
                    <TableCell>
                      <Badge variant={statusVariantMap[risk.status] || 'default'}>{risk.status}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">{risk.id}</TableCell>
                    <TableCell className="font-medium">{risk.taxonomia || '-'}</TableCell>
                    <TableCell>{risk.riskName}</TableCell>
                     <TableCell className="font-bold">
                          <span className={cn('p-2 rounded', {
                              'bg-red-500 text-white': (risk.ier || 0) > 800,
                              'bg-orange-400 text-white': (risk.ier || 0) > 750 && (risk.ier || 0) <= 800,
                              'bg-yellow-400 text-black': (risk.ier || 0) <= 750
                          })}>{risk.ier || '-'}</span>
                      </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/analysis/risks/${risk.id}`}>
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
      </CardContent>
    </Card>
  );
}
