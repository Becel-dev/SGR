
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, GanttChartSquare, ArrowRight, Search } from "lucide-react";
import { kpisData, controlsData } from "@/lib/mock-data";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import type { Kpi } from "@/lib/types";

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    'Em dia': 'default',
    'Atrasado': 'destructive',
};

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
        return utcDate.toLocaleDateString('pt-BR');
    } catch(e) {
        return dateString;
    }
}

export default function KpisPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredKpis = kpisData.filter((kpi: Kpi) => {
    const term = searchTerm.toLowerCase();
    const control = controlsData.find(c => c.id === kpi.controlId);
    const controlName = control ? control.nomeControle.toLowerCase() : '';
    const kpiValues = Object.values(kpi).join(' ').toLowerCase();

    return kpiValues.includes(term) || controlName.includes(term);
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <GanttChartSquare />
                    Gestão de KPIs
                </CardTitle>
                <CardDescription>
                    Visualize, filtre e gerencie todos os KPIs e seus resultados.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-grow-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar KPIs..."
                        className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <Button size="sm" className="h-9 gap-1" asChild>
                  <Link href="/kpis/capture">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Novo KPI
                    </span>
                  </Link>
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID do KPI</TableHead>
                <TableHead>Controle Associado</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Frequência</TableHead>
                <TableHead>Próximo Registro</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKpis.map(kpi => {
                const control = controlsData.find(c => c.id === kpi.controlId);
                return (
                    <TableRow key={kpi.id}>
                    <TableCell className="font-mono">{kpi.id}</TableCell>
                    <TableCell className="font-medium">{control ? `[${control.id}] ${control.nomeControle}` : 'Controle não encontrado'}</TableCell>
                    <TableCell>{kpi.responsavel}</TableCell>
                    <TableCell>{kpi.frequencia}</TableCell>
                    <TableCell>{formatDate(kpi.prazoProximoRegistro)}</TableCell>
                     <TableCell>
                        <Badge variant={statusVariantMap[kpi.status] || 'default'}>{kpi.status}</Badge>
                     </TableCell>
                    <TableCell>
                        <Button variant="ghost" size="icon" asChild>
                        <Link href={`/kpis/${kpi.id}`}>
                            <ArrowRight className="h-4 w-4" />
                            <span className="sr-only">Ver Detalhes</span>
                        </Link>
                        </Button>
                    </TableCell>
                    </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
         {filteredKpis.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            Nenhum KPI encontrado para &quot;{searchTerm}&quot;.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
