

'use client';

import { BowtieDiagram } from "@/components/bowtie/bowtie-diagram";
import { initialBowtieData as diagrams, risksData, getEmptyBowtie } from "@/lib/mock-data";
import { useEffect, useState } from "react";
import type { BowtieData, Risk } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button";
import { PlusCircle, Eye, CheckCircle, GitFork } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";


const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  'Aprovado': 'default',
  'Em aprovação': 'secondary',
};

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};


export default function BowtiePage() {
  const [bowtieDiagrams, setBowtieDiagrams] = useState<BowtieData[]>(diagrams);
  const [selectedDiagram, setSelectedDiagram] = useState<BowtieData | null>(null);
  
  const searchParams = useSearchParams();
  const riskIdFromQuery = searchParams.get('riskId');
  const createNewFromQuery = searchParams.get('create') === 'true';

  useEffect(() => {
    if (riskIdFromQuery && createNewFromQuery) {
        const riskForNewDiagram = risksData.find(r => r.id === riskIdFromQuery);
        if(riskForNewDiagram && !bowtieDiagrams.some(d => d.riskId === riskIdFromQuery)) {
            const newDiagram = getEmptyBowtie(riskForNewDiagram);
            setBowtieDiagrams(prev => [...prev, newDiagram]);
            setSelectedDiagram(newDiagram);
        }
    }
  }, [riskIdFromQuery, createNewFromQuery, bowtieDiagrams]);


  const handleUpdate = (updatedData: BowtieData) => {
    setBowtieDiagrams(prevDiagrams => 
      prevDiagrams.map(d => d.id === updatedData.id ? { ...updatedData, approvalStatus: 'Em aprovação' } : d)
    );
     // Update the selected diagram as well if it's the one being edited
    if (selectedDiagram && selectedDiagram.id === updatedData.id) {
        setSelectedDiagram({ ...updatedData, approvalStatus: 'Em aprovação' });
    }
    console.log("Bowtie data updated, status set to 'Em aprovação':", updatedData);
  };

  const handleCreateNew = (riskId: string) => {
    const risk = risksData.find(r => r.id === riskId);
    if (risk) {
        const newDiagram = getEmptyBowtie(risk);
        setBowtieDiagrams(prev => [...prev, newDiagram]);
        setSelectedDiagram(newDiagram);
    }
  };

  const handleDeleteDiagram = (diagramId: string) => {
    setBowtieDiagrams(bowtieDiagrams.filter(d => d.id !== diagramId));
    if (selectedDiagram && selectedDiagram.id === diagramId) {
        setSelectedDiagram(null);
    }
  }

  const handleApprove = (diagramId: string) => {
    setBowtieDiagrams(prev => prev.map(d => d.id === diagramId ? {
        ...d,
        approvalStatus: 'Aprovado',
        version: d.version + 1
    } : d));
  };
  
  const unassignedRisks = risksData.filter(r => !bowtieDiagrams.some(d => d.riskId === r.id));


  if (selectedDiagram) {
    return (
        <div className="space-y-4">
             <Button onClick={() => setSelectedDiagram(null)}>Voltar para a Lista</Button>
             <BowtieDiagram 
                key={selectedDiagram.id} 
                data={selectedDiagram} 
                onUpdate={handleUpdate} 
                onDelete={handleDeleteDiagram}
            />
        </div>
    )
  }

  return (
    <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <GitFork />
                        Gerenciamento de Bowties
                    </CardTitle>
                    <CardDescription>Crie, visualize e aprove os diagramas Bowtie para os riscos.</CardDescription>
                </div>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Criar Novo Diagrama
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Criar Novo Diagrama Bowtie</AlertDialogTitle>
                        <AlertDialogDescription>
                            Selecione um risco existente que ainda não possui um diagrama para criar um novo Bowtie.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Select onValueChange={handleCreateNew}>
                            <SelectTrigger>
                            <SelectValue placeholder="Selecione um risco..." />
                            </SelectTrigger>
                            <SelectContent>
                            {unassignedRisks.length > 0 ? (
                                unassignedRisks.map(risk => (
                                <SelectItem key={risk.id} value={risk.id}>
                                    {`[${risk.id}] ${risk.risco}`}
                                </SelectItem>
                                ))
                            ) : (
                                <div className="p-4 text-center text-sm text-muted-foreground">Todos os riscos já possuem um diagrama.</div>
                            )}
                            </SelectContent>
                        </Select>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Button disabled={unassignedRisks.length === 0}>Visualizar ao Criar</Button>
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Risco Associado</TableHead>
                        <TableHead>Data de Criação</TableHead>
                        <TableHead>Responsável</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Versão</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bowtieDiagrams.map(diagram => {
                        const risk = risksData.find(r => r.id === diagram.riskId);
                        return (
                             <TableRow key={diagram.id}>
                                <TableCell className="font-medium">{risk ? `[${risk.id}] ${risk.risco}` : 'Risco não encontrado'}</TableCell>
                                <TableCell>{formatDate(diagram.createdAt)}</TableCell>
                                <TableCell>{diagram.responsible}</TableCell>
                                <TableCell>
                                    <Badge variant={statusVariantMap[diagram.approvalStatus] || 'outline'}>
                                        {diagram.approvalStatus}
                                    </Badge>
                                </TableCell>
                                <TableCell>v{diagram.version}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedDiagram(diagram)}>
                                        <Eye className="h-4 w-4" />
                                        <span className="sr-only">Visualizar</span>
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => handleApprove(diagram.id)}
                                        disabled={diagram.approvalStatus === 'Aprovado'}
                                    >
                                        <CheckCircle className={cn("h-4 w-4", diagram.approvalStatus === 'Aprovado' ? 'text-green-500' : '')} />
                                        <span className="sr-only">Aprovar</span>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}
