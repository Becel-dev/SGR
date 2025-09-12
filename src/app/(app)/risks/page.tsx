

'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Siren, ArrowRight, Search } from "lucide-react";
import { risksData } from "@/lib/mock-data";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { Risk } from "@/lib/types";

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
  
  const filteredRisks = risksData
    .filter((risk: Risk) => {
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
                    <Siren />
                    Análise de Riscos
                </CardTitle>
                <CardDescription>
                    Visualize, filtre e gerencie todos os riscos reportados.
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
                    />
                </div>
                
                <Button size="sm" className="h-9 gap-1" asChild>
                  <Link href="/risks/capture">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Novo Risco
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
                <TableRow key={risk.id}>
                  <TableCell>
                    <Badge variant={statusVariantMap[risk.status] || 'default'}>{risk.status}</Badge>
                  </TableCell>
                  <TableCell className="font-mono">{risk.id}</TableCell>
                  <TableCell className="font-medium">{risk.taxonomia}</TableCell>
                  <TableCell>{risk.risco}</TableCell>
                   <TableCell className="font-bold">
                        <span className={cn('p-2 rounded', {
                            'bg-red-500 text-white': risk.ier > 800,
                            'bg-orange-400 text-white': risk.ier > 750 && risk.ier <= 800,
                            'bg-yellow-400 text-black': risk.ier <= 750
                        })}>{risk.ier}</span>
                    </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/risks/${risk.id}`}>
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
         {filteredRisks.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            Nenhum risco encontrado para &quot;{searchTerm}&quot;.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
