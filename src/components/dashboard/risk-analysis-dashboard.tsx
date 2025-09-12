
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { risksData } from '@/lib/mock-data';
import type { Risk } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    'Novo': 'destructive',
    'Em Análise': 'secondary',
    'Analisado': 'default',
};

export function RiskAnalysisDashboard() {
    const [tipoIerFiltro, setTipoIerFiltro] = useState<string[]>([]);
    const [statusAnaliseFiltro, setStatusAnaliseFiltro] = useState<string[]>([]);
    const [riscoEspecificoFiltro, setRiscoEspecificoFiltro] = useState('Todos');
    const [taxonomiaFiltro, setTaxonomiaFiltro] = useState('Todos');
    const [responsavelFiltro, setResponsavelFiltro] = useState('Todos');

    const riscosUnicos = useMemo(() => ['Todos', ...Array.from(new Set(risksData.map(r => r.risco)))], []);
    const taxonomiasUnicas = useMemo(() => ['Todos', ...Array.from(new Set(risksData.map(r => r.taxonomia).filter(t => t)))], []);
    const responsaveisUnicos = useMemo(() => ['Todos', ...Array.from(new Set(risksData.map(r => r.responsavelBowtie).filter(r => r)))], []);

    const filteredRisks = useMemo(() => {
        return risksData.filter(risk => {
            if (tipoIerFiltro.length > 0 && !tipoIerFiltro.includes(risk.tipoIER || '')) return false;
            if (statusAnaliseFiltro.length > 0 && !statusAnaliseFiltro.includes(risk.status)) return false;
            if (riscoEspecificoFiltro !== 'Todos' && risk.risco !== riscoEspecificoFiltro) return false;
            if (taxonomiaFiltro !== 'Todos' && risk.taxonomia !== taxonomiaFiltro) return false;
            if (responsavelFiltro !== 'Todos' && risk.responsavelBowtie !== responsavelFiltro) return false;
            return true;
        });
    }, [tipoIerFiltro, statusAnaliseFiltro, riscoEspecificoFiltro, taxonomiaFiltro, responsavelFiltro]);

    const statusCounts = useMemo(() => {
        const counts = { 'Analisado': 0, 'Em Análise': 0, 'Novo': 0 };
        risksData.forEach(risk => {
            if (counts.hasOwnProperty(risk.status)) {
                counts[risk.status as keyof typeof counts]++;
            }
        });
        return counts;
    }, []);

    const handleTipoIerChange = (tipo: string) => {
        setTipoIerFiltro(prev => prev.includes(tipo) ? prev.filter(t => t !== tipo) : [...prev, tipo]);
    };
    
    const handleStatusAnaliseChange = (status: string) => {
        setStatusAnaliseFiltro(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
    };

    const limparFiltros = () => {
        setTipoIerFiltro([]);
        setStatusAnaliseFiltro([]);
        setRiscoEspecificoFiltro('Todos');
        setTaxonomiaFiltro('Todos');
        setResponsavelFiltro('Todos');
    };

    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>Painel de Análise do Risco</CardTitle>
                <CardDescription>
                    Visão geral e filtros para os riscos em análise no sistema.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Filtros */}
                    <div className="md:col-span-1 space-y-4 p-4 border rounded-lg">
                        <div className="space-y-2">
                            <h3 className="font-semibold">Tipo IER</h3>
                            {['Aceitável', 'Gerenciável', 'Prioritário', 'Crítico'].map(tipo => (
                                <div key={tipo} className="flex items-center space-x-2">
                                    <Checkbox id={`tipo-${tipo}`} checked={tipoIerFiltro.includes(tipo)} onCheckedChange={() => handleTipoIerChange(tipo)} />
                                    <label htmlFor={`tipo-${tipo}`} className="text-sm">{tipo}</label>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold">Status da Análise</h3>
                             <div className="grid grid-cols-3 gap-2">
                                <div className="p-2 bg-green-500 text-white text-center rounded-lg">
                                    <div className="font-bold text-xl">{statusCounts['Analisado']}</div>
                                    <div className="text-xs">Analisado</div>
                                </div>
                                <div className="p-2 bg-yellow-400 text-black text-center rounded-lg">
                                    <div className="font-bold text-xl">{statusCounts['Em Análise']}</div>
                                    <div className="text-xs">Em Análise</div>
                                </div>
                                <div className="p-2 bg-red-500 text-white text-center rounded-lg">
                                    <div className="font-bold text-xl">{statusCounts['Novo']}</div>
                                    <div className="text-xs">Novo</div>
                                </div>
                            </div>
                            {['Analisado', 'Em Análise', 'Novo'].map(status => (
                                <div key={status} className="flex items-center space-x-2">
                                    <Checkbox id={`status-${status}`} checked={statusAnaliseFiltro.includes(status)} onCheckedChange={() => handleStatusAnaliseChange(status)} />
                                    <label htmlFor={`status-${status}`} className="text-sm">{status}</label>
                                </div>
                            ))}
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
                        <div className="space-y-2">
                            <label className="font-semibold">Selecione a taxonomia</label>
                            <Select value={taxonomiaFiltro} onValueChange={setTaxonomiaFiltro}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {taxonomiasUnicas.map(tax => <SelectItem key={tax} value={tax}>{tax}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <label className="font-semibold">Responsável</label>
                            <Select value={responsavelFiltro} onValueChange={setResponsavelFiltro}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {responsaveisUnicos.map(resp => <SelectItem key={resp} value={resp}>{resp}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button variant="secondary" className="w-full" onClick={limparFiltros}>Limpar todas as segmentações</Button>
                    </div>

                    {/* Tabela */}
                    <div className="md:col-span-3 space-y-6">
                        <div className="max-h-[600px] overflow-auto border rounded-lg">
                            <Table>
                                <TableHeader className="sticky top-0 bg-card">
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Código</TableHead>
                                        <TableHead>Nome do Risco</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Responsável</TableHead>
                                        <TableHead className="text-right">IER</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRisks.sort((a, b) => b.ier - a.ier).map(risk => (
                                        <TableRow key={risk.id}>
                                            <TableCell className="font-mono text-xs">
                                                <Button variant="link" asChild className="p-0 h-auto">
                                                    <Link href={`/risks/${risk.id}`}>{risk.id}</Link>
                                                </Button>
                                            </TableCell>
                                            <TableCell>{risk.taxonomia}</TableCell>
                                            <TableCell>{risk.risco}</TableCell>
                                            <TableCell>
                                                <Badge variant={statusVariantMap[risk.status] || 'default'}>{risk.status}</Badge>
                                            </TableCell>
                                            <TableCell>{risk.responsavelBowtie}</TableCell>
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
