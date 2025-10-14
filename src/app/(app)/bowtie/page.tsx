'use client';

import { BowtieDiagram } from "@/components/bowtie/bowtie-diagram";
import { BowtieVersionHistory } from "@/components/bowtie/bowtie-version-history";
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
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PermissionButton } from '@/components/auth/permission-button';
import { usePermission } from '@/hooks/use-permission';
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
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';


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
  return (
    <ProtectedRoute module="bowtie" action="view">
      <BowtieContent />
    </ProtectedRoute>
  );
}

function BowtieContent() {
  // ⚡ OTIMIZAÇÃO: Carregar permissões UMA VEZ no componente pai
  const canViewBowtie = usePermission('bowtie', 'view');
  const canCreateBowtie = usePermission('bowtie', 'create');
  const canEditBowtie = usePermission('bowtie', 'edit');
  
  const [bowtieDiagrams, setBowtieDiagrams] = useState<BowtieData[]>([]);
  const [risksData, setRisksData] = useState<Risk[]>([]);
  const [selectedDiagram, setSelectedDiagram] = useState<BowtieData | null>(null);
  const { toast } = useToast();
  
  const searchParams = useSearchParams();
  const riskIdFromQuery = searchParams?.get('riskId');
  const createNewFromQuery = searchParams?.get('create') === 'true';

  const fetchData = async () => {
    try {
      const [bowtiesRes, risksRes] = await Promise.all([
        fetch('/api/bowtie'),
        fetch('/api/risks/for-association')
      ]);

      if (!bowtiesRes.ok || !risksRes.ok) {
        throw new Error('Falha ao buscar dados');
      }

      const bowties: BowtieData[] = await bowtiesRes.json();
      const risks = await risksRes.json();

      // Filtrar apenas a última versão de cada riskId
      const latestBowtiesMap = new Map<string, BowtieData>();
      bowties.forEach(bowtie => {
        const existing = latestBowtiesMap.get(bowtie.riskId);
        if (!existing || bowtie.version > existing.version) {
          latestBowtiesMap.set(bowtie.riskId, bowtie);
        }
      });
      
      const latestBowties = Array.from(latestBowtiesMap.values());

      setBowtieDiagrams(latestBowties);
      setRisksData(risks);

    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados para a página de Bowtie.",
        variant: "destructive",
      });
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (riskIdFromQuery && createNewFromQuery && risksData.length > 0) {
        const riskForNewDiagram = risksData.find(r => r.id === riskIdFromQuery);
        if(riskForNewDiagram && !bowtieDiagrams.some(d => d.riskId === riskIdFromQuery)) {
            handleCreateNew(riskIdFromQuery);
        }
    }
  }, [riskIdFromQuery, createNewFromQuery, bowtieDiagrams, risksData]);


  const handleUpdate = async (updatedData: BowtieData) => {
    const optimisticData = {
        ...updatedData,
        approvalStatus: 'Em aprovação' as const,
        version: updatedData.version + 0.1, // Incremento provisório
    };

    // Atualização otimista na UI
    setSelectedDiagram(optimisticData);
    setBowtieDiagrams(prev => prev.map(d => d.id === updatedData.id ? optimisticData : d));

    try {
        const response = await fetch(`/api/bowtie/${updatedData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(optimisticData),
        });

        if (!response.ok) throw new Error('Falha ao atualizar o Bowtie');

        const savedData = await response.json();
        
        // Sincroniza o estado com a resposta final do servidor
        setSelectedDiagram(savedData);
        setBowtieDiagrams(prev => prev.map(d => d.id === savedData.id ? savedData : d));

        toast({
            title: "Sucesso",
            description: "Diagrama Bowtie atualizado e enviado para aprovação.",
        });

    } catch (error) {
        console.error(error);
        toast({
            title: "Erro de Atualização",
            description: "Não foi possível salvar as alterações. Revertendo.",
            variant: "destructive",
        });
        // Reverte em caso de erro
        fetchData(); 
    }
  };

  const handleCreateNew = async (riskId: string) => {
    const risk = risksData.find(r => r.id === riskId);
    if (!risk) {
        toast({ title: "Erro", description: "Risco selecionado não encontrado.", variant: "destructive" });
        return;
    }

    const newDiagram: Omit<BowtieData, 'riskName'> & { riskName?: string } = {
        id: uuidv4(),
        riskId: risk.id,
        topEvent: { title: risk.risco, description: 'Evento de topo gerado a partir do risco' },
        threats: [],
        consequences: [],
        approvalStatus: 'Em aprovação',
        version: 1.0,
        responsible: 'Sistema', // Substituir pelo usuário logado
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'Sistema',
        updatedAt: new Date().toISOString(),
        updatedBy: 'Sistema',
    };

    try {
        const response = await fetch('/api/bowtie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newDiagram),
        });

        if (!response.ok) throw new Error('Falha ao criar o Bowtie');

        const createdDiagram = await response.json();

        setBowtieDiagrams(prev => [...prev, createdDiagram]);
        setSelectedDiagram(createdDiagram);

        toast({
            title: "Diagrama Criado",
            description: `Novo Bowtie para o risco "${risk.risco}" foi criado.`,
        });

    } catch (error) {
        console.error(error);
        toast({
            title: "Erro de Criação",
            description: "Não foi possível criar o novo diagrama Bowtie.",
            variant: "destructive",
        });
    }
  };

  const handleDeleteDiagram = async (diagramId: string) => {
    const originalDiagrams = [...bowtieDiagrams];
    setBowtieDiagrams(prev => prev.filter(d => d.id !== diagramId));
    setSelectedDiagram(null);

    try {
        const response = await fetch(`/api/bowtie/${diagramId}`, {
            method: 'DELETE',
        });

        if (!response.ok) throw new Error('Falha ao excluir o Bowtie');

        toast({
            title: "Sucesso",
            description: "Diagrama Bowtie excluído com sucesso.",
        });

    } catch (error) {
        console.error(error);
        toast({
            title: "Erro de Exclusão",
            description: "Não foi possível excluir o diagrama. Revertendo.",
            variant: "destructive",
        });
        setBowtieDiagrams(originalDiagrams);
    }
  }

  const handleApprove = async (diagramId: string) => {
    const diagram = bowtieDiagrams.find(d => d.id === diagramId);
    if (!diagram) return;

    const approvedDiagram = { ...diagram, approvalStatus: 'Aprovado' as 'Aprovado' };

    setBowtieDiagrams(prev => prev.map(d => d.id === diagramId ? approvedDiagram : d));

     try {
        const response = await fetch(`/api/bowtie/${diagramId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(approvedDiagram),
        });

        if (!response.ok) throw new Error('Falha ao aprovar o Bowtie');

        toast({
            title: "Aprovado!",
            description: "O diagrama Bowtie foi marcado como aprovado.",
        });

    } catch (error) {
        console.error(error);
        toast({
            title: "Erro de Aprovação",
            description: "Não foi possível aprovar o diagrama. Revertendo.",
            variant: "destructive",
        });
        fetchData(); // Re-sincroniza
    }
  };
  
  // Remove duplicatas de risksData baseado no ID antes de filtrar
  const uniqueRisksData = risksData.reduce((acc, current) => {
    const exists = acc.find(item => item.id === current.id);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, [] as Risk[]);
  
  const unassignedRisks = uniqueRisksData.filter(r => !bowtieDiagrams.some(d => d.riskId === r.id));


  if (selectedDiagram) {
    // Verifica se é uma versão antiga (não é a mais recente)
    const latestVersion = bowtieDiagrams.find(d => d.riskId === selectedDiagram.riskId);
    const isOldVersion = latestVersion && latestVersion.version !== selectedDiagram.version;
    
    return (
        <div className="space-y-4">
             <div className="flex items-center justify-between">
                <Button onClick={() => setSelectedDiagram(null)}>Voltar para a Lista</Button>
                {isOldVersion && (
                    <Badge variant="secondary" className="text-sm">
                        Visualizando versão {selectedDiagram.version.toFixed(1)} (Somente Leitura)
                    </Badge>
                )}
             </div>
             <BowtieDiagram 
                key={`${selectedDiagram.id}_v${selectedDiagram.version}`} 
                data={selectedDiagram} 
                onUpdate={handleUpdate} 
                onDelete={handleDeleteDiagram}
                readOnly={isOldVersion}
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
                        <Button disabled={!canCreateBowtie.allowed}>
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
                        <Select onValueChange={(riskId) => {
                            // Fechar o dialog e criar
                            handleCreateNew(riskId);
                            // A UI vai mudar para a tela de edição automaticamente
                        }}>
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
                        {/* A ação agora é direta no Select, este botão pode ser removido ou desabilitado */}
                        <AlertDialogAction disabled>Criar e Visualizar</AlertDialogAction>
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
                    {bowtieDiagrams.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center">
                                Nenhum diagrama Bowtie encontrado.
                            </TableCell>
                        </TableRow>
                    ) : (
                        bowtieDiagrams.map(diagram => {
                            const risk = risksData.find(r => r.id === diagram.riskId);
                            return (
                                <TableRow key={`${diagram.riskId}-${diagram.version}`}>
                                    <TableCell className="font-medium">{risk ? `[${risk.id}] ${risk.risco}` : `[${diagram.riskId}] Risco não encontrado`}</TableCell>
                                    <TableCell>{formatDate(diagram.createdAt)}</TableCell>
                                    <TableCell>{diagram.responsible}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariantMap[diagram.approvalStatus] || 'outline'}>
                                            {diagram.approvalStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>v{diagram.version}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => setSelectedDiagram(diagram)}
                                                disabled={!canViewBowtie.allowed}
                                            >
                                                <Eye className="h-4 w-4" />
                                                <span className="sr-only">Visualizar</span>
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleApprove(diagram.id)}
                                                disabled={diagram.approvalStatus === 'Aprovado' || !canEditBowtie.allowed}
                                            >
                                                <CheckCircle className={cn("h-4 w-4", diagram.approvalStatus === 'Aprovado' ? 'text-green-500' : '')} />
                                                <span className="sr-only">Aprovar</span>
                                            </Button>
                                            <BowtieVersionHistory 
                                                riskId={diagram.riskId}
                                                onSelectVersion={setSelectedDiagram}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    )}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}
