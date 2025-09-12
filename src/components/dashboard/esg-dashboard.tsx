
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { risksData } from '@/lib/mock-data';
import type { Risk } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const topRisksButtons = [
    { id: 'R1', label: 'R1' }, { id: 'R3', label: 'R3' }, { id: 'R5', label: 'R5' }, { id: 'R7', label: 'R7' }, { id: 'R9', label: 'R9' }, { id: 'R11', label: 'R11' },
    { id: 'R2', label: 'R2' }, { id: 'R4', label: 'R4' }, { id: 'R6', label: 'R6' }, { id: 'R8', label: 'R8' }, { id: 'R10', label: 'R10' }
];

export function EsgDashboard() {
  const [activePilar, setActivePilar] = useState('E');
  const [fatorRiscoFiltro, setFatorRiscoFiltro] = useState('Todos');
  const [riscoEspecificoFiltro, setRiscoEspecificoFiltro] = useState('Todos');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string[]>([]);
  const [temaMaterialFiltro, setTemaMaterialFiltro] = useState<string[]>([]);

  const fatoresDeRiscoUnicos = useMemo(() => ['Todos', ...Array.from(new Set(risksData.map(r => r.fatorDeRisco)))], []);
  const riscosUnicos = useMemo(() => ['Todos', ...Array.from(new Set(risksData.map(r => r.risco)))], []);
  const categoriasUnicas = useMemo(() => Array.from(new Set(risksData.map(r => r.categoria).filter(Boolean))), []);
  const temasMateriaisUnicos = useMemo(() => Array.from(new Set(risksData.map(r => r.temaMaterial).filter(Boolean))), []);

  const filteredRisks = useMemo(() => {
    return risksData.filter(risk => {
        if (fatorRiscoFiltro !== 'Todos' && risk.fatorDeRisco !== fatorRiscoFiltro) return false;
        if (riscoEspecificoFiltro !== 'Todos' && risk.risco !== riscoEspecificoFiltro) return false;
        if (categoriaFiltro.length > 0 && !categoriaFiltro.includes(risk.categoria)) return false;
        if (temaMaterialFiltro.length > 0 && !temaMaterialFiltro.includes(risk.temaMaterial)) return false;
        if (activePilar && risk.pilarESG !== activePilar) return false;
        return true;
    });
  }, [fatorRiscoFiltro, riscoEspecificoFiltro, categoriaFiltro, temaMaterialFiltro, activePilar]);

  const classficacaoCounts = useMemo(() => {
    const counts = { 'Aceitável': 0, 'Gerenciável': 0, 'Prioritário': 0, 'Crítico': 0 };
    risksData.forEach(risk => {
      const nivel = risk.tipoIER;
      if (nivel && counts.hasOwnProperty(nivel)) {
        counts[nivel as keyof typeof counts]++;
      }
    });
    return counts;
  }, []);

  const handleCategoriaChange = (categoria: string) => {
    setCategoriaFiltro(prev => prev.includes(categoria) ? prev.filter(c => c !== categoria) : [...prev, categoria]);
  };
  
  const handleTemaMaterialChange = (tema: string) => {
    setTemaMaterialFiltro(prev => prev.includes(tema) ? prev.filter(t => t !== tema) : [...prev, tema]);
  };

  const limparFiltros = () => {
    setActivePilar('E');
    setFatorRiscoFiltro('Todos');
    setRiscoEspecificoFiltro('Todos');
    setCategoriaFiltro([]);
    setTemaMaterialFiltro([]);
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Painel ESG</CardTitle>
        <CardDescription>
          Métricas e indicadores relacionados a Environmental, Social, and Governance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Filtros */}
          <div className="md:col-span-1 space-y-4 p-4 border rounded-lg">
            <Tabs value={activePilar} onValueChange={setActivePilar} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="E">E - Ambiente</TabsTrigger>
                <TabsTrigger value="S">S - Social</TabsTrigger>
                <TabsTrigger value="G">G - Governança</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2">
              <label className="font-semibold">Selecione um Fator de Risco Específico</label>
              <Select value={fatorRiscoFiltro} onValueChange={setFatorRiscoFiltro}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {fatoresDeRiscoUnicos.map(fator => <SelectItem key={fator} value={fator}>{fator}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="font-semibold">Selecione um risco específico</label>
              <Select value={riscoEspecificoFiltro} onValueChange={setRiscoEspecificoFiltro}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {riscosUnicos.map(risco => <SelectItem key={risco} value={risco}>{risco}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="font-semibold text-center mb-1">TOTAL DE RISCOS</h3>
              <div className="p-4 bg-primary text-primary-foreground text-center rounded-lg text-4xl font-bold">{risksData.length}</div>
            </div>
            <div>
              <h3 className="font-semibold text-center mb-1">CLASSIFICAÇÃO</h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="p-2 bg-green-500 text-white text-center rounded-lg">
                  <div className="font-bold text-xl">{classficacaoCounts['Aceitável']}</div>
                  <div className="text-xs">Aceitável</div>
                </div>
                <div className="p-2 bg-yellow-400 text-black text-center rounded-lg">
                  <div className="font-bold text-xl">{classficacaoCounts['Gerenciável']}</div>
                  <div className="text-xs">Gerenciável</div>
                </div>
                <div className="p-2 bg-orange-500 text-white text-center rounded-lg">
                  <div className="font-bold text-xl">{classficacaoCounts['Prioritário']}</div>
                  <div className="text-xs">Prioritário</div>
                </div>
                <div className="p-2 bg-red-500 text-white text-center rounded-lg">
                  <div className="font-bold text-xl">{classficacaoCounts['Crítico']}</div>
                  <div className="text-xs">Crítico</div>
                </div>
              </div>
            </div>

            <Button variant="secondary" className="w-full" onClick={limparFiltros}>Limpar todas as segmentações</Button>
          </div>

          {/* Tabela e Filtros adicionais */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-1 space-y-2 p-4 border rounded-lg">
                    <h3 className="font-semibold">Categoria</h3>
                    {categoriasUnicas.map(cat => (
                        <div key={cat} className="flex items-center space-x-2">
                            <Checkbox id={`cat-${cat}`} checked={categoriaFiltro.includes(cat)} onCheckedChange={() => handleCategoriaChange(cat)} />
                            <label htmlFor={`cat-${cat}`} className="text-sm">{cat}</label>
                        </div>
                    ))}
                </div>
                <div className="xl:col-span-1 space-y-2 p-4 border rounded-lg">
                    <h3 className="font-semibold">Tema Material</h3>
                    {temasMateriaisUnicos.map(tema => (
                        <div key={tema} className="flex items-center space-x-2">
                            <Checkbox id={`tema-${tema}`} checked={temaMaterialFiltro.includes(tema)} onCheckedChange={() => handleTemaMaterialChange(tema)} />
                            <label htmlFor={`tema-${tema}`} className="text-sm">{tema}</label>
                        </div>
                    ))}
                </div>
                 <div className="xl:col-span-1 space-y-2 p-4 border rounded-lg">
                    <h3 className="font-semibold">Top Risks</h3>
                    <div className="grid grid-cols-6 gap-1">
                        {topRisksButtons.map(btn => (
                            <Button key={btn.id} variant="outline" size="sm" className="p-2 h-auto text-xs">{btn.label}</Button>
                        ))}
                    </div>
                </div>
            </div>


            <div className="max-h-[600px] overflow-auto border rounded-lg">
              <Table>
                <TableHeader className="sticky top-0 bg-card">
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome do Risco</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">IER</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRisks.sort((a, b) => b.ier - a.ier).map(risk => (
                    <TableRow key={risk.id}>
                      <TableCell className="font-mono text-xs">{risk.taxonomia}</TableCell>
                      <TableCell>{risk.risco}</TableCell>
                      <TableCell>{risk.categoria}</TableCell>
                      <TableCell className="text-right font-bold">
                        <span className={cn('p-2 rounded', {
                          'bg-red-500 text-white': risk.ier > 800,
                          'bg-orange-400 text-white': risk.ier > 750 && risk.ier <= 800,
                          'bg-yellow-400 text-black': risk.ier <= 750
                        })}>{risk.ier}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
