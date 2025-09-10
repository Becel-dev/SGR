
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ListFilter, PlusCircle, Siren } from "lucide-react";
import { risksData } from "@/lib/mock-data";
import Link from "next/link";
import { cn } from "@/lib/utils";

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    'Aprovado': 'default',
    'Em Revisão': 'secondary',
    'Rascunho': 'outline',
};

const criticalityVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    'Crítico': 'destructive',
    'Alto': 'default',
    'Médio': 'secondary',
    'Baixo': 'outline',
};


export default function RisksPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <Siren />
                    Captura de Riscos
                </CardTitle>
                <CardDescription>
                    Visualize, filtre e gerencie todos os riscos reportados.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                        <ListFilter className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filtro
                        </span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                        Status
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Criticidade</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                        Área
                    </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                
                    <Button size="sm" className="h-8 gap-1" asChild>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criticidade</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Última Atualização</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {risksData.map(risk => (
              <TableRow key={risk.id}>
                <TableCell className="font-medium">{risk.title}</TableCell>
                <TableCell>
                  <Badge variant={statusVariantMap[risk.status]}>{risk.status}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={criticalityVariantMap[risk.criticality]}
                    className={cn(risk.criticality === 'Alto' && 'bg-orange-500 text-white')}>
                    {risk.criticality}
                  </Badge>
                </TableCell>
                <TableCell>{risk.area}</TableCell>
                <TableCell>{risk.responsible}</TableCell>
                <TableCell>{risk.lastUpdate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
