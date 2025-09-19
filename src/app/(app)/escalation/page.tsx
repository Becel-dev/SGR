'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Rss, Settings, Search } from 'lucide-react';
import { risksData } from '@/lib/mock-data';
import type { Risk, EscalationRule } from '@/lib/types';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EscalationForm } from '@/components/escalation/escalation-form';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';

export default function EscalationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [allRisks, setAllRisks] = useState<Risk[]>(risksData);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);

  const handleUpdateRule = (riskId: string, newRule: EscalationRule) => {
    setAllRisks(prevRisks =>
      prevRisks.map(risk =>
        risk.id === riskId ? { ...risk, escalationRule: newRule } : risk
      )
    );
    setSelectedRisk(null); // Fecha o Sheet após salvar
  };

  const filteredRisks = allRisks.filter(risk =>
    risk.risco.toLowerCase().includes(searchTerm.toLowerCase()) ||
    risk.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Rss />
                Regras de Escalonamento
              </CardTitle>
              <CardDescription>
                Gerencie os gatilhos e as regras de notificação para cada risco.
              </CardDescription>
            </div>
            <div className="relative flex-1 sm:flex-grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nome ou ID do risco..."
                className="pl-8 w-full sm:w-[300px] lg:w-[400px]"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID do Risco</TableHead>
                  <TableHead>Nome do Risco</TableHead>
                  <TableHead>Responsável pelo Bowtie</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRisks.map(risk => (
                  <TableRow key={risk.id}>
                    <TableCell className="font-mono">{risk.id}</TableCell>
                    <TableCell className="font-medium">{risk.risco}</TableCell>
                    <TableCell>{risk.responsavelBowtie || 'Não definido'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelectedRisk(risk)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Configurar
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
      
      <Sheet open={!!selectedRisk} onOpenChange={(isOpen) => !isOpen && setSelectedRisk(null)}>
        <SheetContent className="sm:max-w-xl">
            {selectedRisk && (
                <>
                    <SheetHeader>
                        <SheetTitle>Configurar Escalonamento</SheetTitle>
                        <SheetDescription>
                            Defina as regras para o risco: <span className="font-semibold text-foreground">[{selectedRisk.id}] {selectedRisk.risco}</span>
                        </SheetDescription>
                    </SheetHeader>
                    <EscalationForm
                        risk={selectedRisk}
                        onSave={handleUpdateRule}
                        onCancel={() => setSelectedRisk(null)}
                    />
                </>
            )}
        </SheetContent>
      </Sheet>
    </>
  );
}
