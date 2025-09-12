
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Lightbulb, ArrowRight, Search } from "lucide-react";
import { identifiedRisksData } from "@/lib/identified-risks-data";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import type { IdentifiedRisk } from "@/lib/types";

export default function IdentificationPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredRisks = identifiedRisksData.filter((risk: IdentifiedRisk) => {
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
                  <Link href="/identification/capture">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Identificar Novo Risco
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
                <TableHead>ID</TableHead>
                <TableHead>Nome do Risco</TableHead>
                <TableHead>Top Risk Corporativo</TableHead>
                <TableHead>Tipo do Apontamento</TableHead>
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
         {filteredRisks.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            Nenhum risco encontrado para &quot;{searchTerm}&quot;.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
