
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ListFilter, PlusCircle, Siren, ArrowRight, Search } from "lucide-react";
import { risksData } from "@/lib/mock-data";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { Risk } from "@/lib/types";

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    'Aberto': 'secondary',
    'Em Tratamento': 'default',
    'Fechado': 'outline',
    'Mitigado': 'outline',
};

const riskLevelVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    'Crítico': 'destructive',
    'Alto': 'default',
    'Médio': 'secondary',
    'Baixo': 'outline',
};

export default function RisksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredRisks = risksData.filter((risk: Risk) => {
    const values = Object.values(risk).join(" ").toLowerCase();
    return values.includes(searchTerm.toLowerCase());
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <Siren />
                    Captura de Riscos
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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 gap-1">
                        <ListFilter className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filtro
                        </span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>Status</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Nível de Risco</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Gerência</DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                
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
                <TableHead>Risco</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Nível de Risco Residual</TableHead>
                <TableHead>Gerência</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Última Revisão</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRisks.map(risk => (
                <TableRow key={risk.id}>
                  <TableCell className="font-medium">{risk.risco}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariantMap[risk.statusDoRisco]}>{risk.statusDoRisco}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={riskLevelVariantMap[risk.nivelDeRiscoResidual]}
                      className={cn(risk.nivelDeRiscoResidual === 'Alto' && 'bg-orange-500 text-white dark:bg-orange-500 dark:text-white')}
                    >
                      {risk.nivelDeRiscoResidual}
                    </Badge>
                  </TableCell>
                  <TableCell>{risk.gerencia}</TableCell>
                  <TableCell>{risk.responsavelPeloRisco}</TableCell>
                  <TableCell>{risk.dataDaUltimaRevisao}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/risks/${risk.id}`}>
                        <ArrowRight className="h-4 w-4" />
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
