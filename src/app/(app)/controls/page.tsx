
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Shield, ArrowRight, Search } from "lucide-react";
import { controlsData } from "@/lib/mock-data";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import type { Control } from "@/lib/types";

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    'Implementado': 'default',
    'Implementado com Pendência': 'secondary',
    'Implementação Futura': 'outline',
    'Não Implementado': 'destructive',
};

// Helper function to format date consistently
const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    // Adjust for timezone offset to prevent date changes
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const correctedDate = new Date(date.getTime() + userTimezoneOffset);
    return correctedDate.toLocaleDateString('pt-BR');
}

export default function ControlsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredControls = controlsData.filter((control: Control) => {
    const term = searchTerm.toLowerCase();
    return Object.values(control).some(value => 
      String(value).toLowerCase().includes(term)
    );
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <Shield />
                    Governança de Controles
                </CardTitle>
                <CardDescription>
                    Visualize, filtre e gerencie todos os controles do sistema.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-grow-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar controles..."
                        className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <Button size="sm" className="h-9 gap-1" asChild>
                  <Link href="/controls/capture">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Novo Controle
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
                <TableHead>Título</TableHead>
                <TableHead>Nome do Controle</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Dono do Controle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Próxima Verificação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredControls.map(control => (
                <TableRow key={control.id}>
                  <TableCell className="font-mono">{control.id}</TableCell>
                  <TableCell className="font-medium">{control.titulo}</TableCell>
                  <TableCell>{control.nomeControle}</TableCell>
                  <TableCell>{control.area}</TableCell>
                  <TableCell>{control.donoControle}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariantMap[control.status] || 'default'}>{control.status}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(control.proximaVerificacao)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/controls/${control.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
         {filteredControls.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            Nenhum controle encontrado para &quot;{searchTerm}&quot;.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
