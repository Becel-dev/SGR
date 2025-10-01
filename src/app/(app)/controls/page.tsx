'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Shield, ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import type { Control } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    'Implementado': 'default',
    'Implementado com Pendência': 'secondary',
    'Implementação Futura': 'outline',
    'Não Implementado': 'destructive',
};

// Helper function to format date consistently
const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        // Checa se a data é válida
        if (isNaN(date.getTime())) {
            return dateString; // Retorna a string original se a data for inválida
        }
        return new Intl.DateTimeFormat('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'UTC' // Usar UTC para evitar problemas de fuso horário
        }).format(date);
    } catch(e) {
        return dateString; // fallback to original string if format is unexpected
    }
}

export default function ControlsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [controls, setControls] = useState<Control[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchControls = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/controls');
        if (!response.ok) {
          throw new Error('Failed to fetch controls');
        }
        const data = await response.json();
        setControls(data);
      } catch (error) {
        console.error("Error fetching controls:", error);
        // Optionally, set an error state to show in the UI
      } finally {
        setLoading(false);
      }
    };

    fetchControls();
  }, []);
  
  const filteredControls = controls.filter((control: Control) => {
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
                <TableHead>Nome do Controle</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Dono do Controle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Próxima Verificação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredControls.length > 0 ? (
                filteredControls.map(control => (
                  <TableRow key={control.id}>
                    <TableCell className="font-mono">{control.id}</TableCell>
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
                          <span className="sr-only">Ver Detalhes</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center p-8 text-muted-foreground">
                    {searchTerm ? `Nenhum controle encontrado para "${searchTerm}".` : "Nenhum controle encontrado."}
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
