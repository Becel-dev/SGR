
'use client';

import { BowtieDiagram } from "@/components/bowtie/bowtie-diagram";
import { initialBowtieData as diagrams, risksData, getEmptyBowtie } from "@/lib/mock-data";
import { useState } from "react";
import type { BowtieData, Risk } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
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


export default function BowtiePage() {
  const [bowtieDiagrams, setBowtieDiagrams] = useState<BowtieData[]>(diagrams);
  const [selectedDiagramId, setSelectedDiagramId] = useState<string>(diagrams[0]?.id || '');

  const handleUpdate = (updatedData: BowtieData) => {
    setBowtieDiagrams(prevDiagrams => 
      prevDiagrams.map(d => d.id === updatedData.id ? updatedData : d)
    );
    console.log("Bowtie data updated:", updatedData);
  };

  const handleSelectDiagram = (diagramId: string) => {
    if (diagramId === 'new') {
        // Find a risk that doesn't have a bowtie diagram yet
        const riskWithoutBowtie = risksData.find(r => !bowtieDiagrams.some(d => d.riskId === r.id));
        if (riskWithoutBowtie) {
            const newDiagram = getEmptyBowtie(riskWithoutBowtie);
            setBowtieDiagrams(prev => [...prev, newDiagram]);
            setSelectedDiagramId(newDiagram.id);
        } else {
            // Or create a generic new one if all risks are taken
            const newDiagram = getEmptyBowtie();
            setBowtieDiagrams(prev => [...prev, newDiagram]);
            setSelectedDiagramId(newDiagram.id);
        }
    } else {
        setSelectedDiagramId(diagramId);
    }
  };

  const handleDeleteDiagram = (diagramId: string) => {
    setBowtieDiagrams(prev => prev.filter(d => d.id !== diagramId));
    // Select the first diagram if the deleted one was selected
    if (selectedDiagramId === diagramId) {
      setSelectedDiagramId(bowtieDiagrams[0]?.id || '');
    }
  }

  const selectedDiagram = bowtieDiagrams.find(d => d.id === selectedDiagramId);
  const selectedRisk = risksData.find(r => r.id === selectedDiagram?.riskId);

  const unassignedRisks = risksData.filter(r => !bowtieDiagrams.some(d => d.riskId === r.id));


  return (
    <div className="w-full mx-auto space-y-4">
       <div className="flex items-center justify-between gap-4 p-4 border-b">
         <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Selecione o Diagrama Bowtie:</h2>
            <Select onValueChange={handleSelectDiagram} value={selectedDiagramId}>
              <SelectTrigger className="w-[400px]">
                <SelectValue placeholder="Selecione um risco para ver seu diagrama..." />
              </SelectTrigger>
              <SelectContent>
                {bowtieDiagrams.map(diagram => {
                  const risk = risksData.find(r => r.id === diagram.riskId);
                  return (
                    <SelectItem key={diagram.id} value={diagram.id}>
                      {risk ? `[${risk.id}] ${risk.risco}` : `Diagrama ${diagram.id}`}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
         </div>
         <div className="flex items-center gap-2">
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
                  <Select onValueChange={(riskId) => {
                      const risk = risksData.find(r => r.id === riskId);
                      if (risk) {
                          const newDiagram = getEmptyBowtie(risk);
                          setBowtieDiagrams(prev => [...prev, newDiagram]);
                          setSelectedDiagramId(newDiagram.id);
                      }
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
                  <AlertDialogAction asChild>
                    <Button disabled={unassignedRisks.length === 0}>Criar</Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
         </div>
      </div>
      {selectedDiagram ? (
        <BowtieDiagram 
          key={selectedDiagram.id} 
          data={selectedDiagram} 
          onUpdate={handleUpdate} 
          onDelete={handleDeleteDiagram}
        />
      ) : (
        <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">
            Nenhum diagrama selecionado. Escolha um na lista acima ou crie um novo.
          </p>
        </div>
      )}
    </div>
  );
}
