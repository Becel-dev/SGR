

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Cell } from 'recharts';
import { risksData } from '@/lib/mock-data';
import type { Risk } from '@/lib/types';
import { Shield } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { cn } from '@/lib/utils';

const topRisksFilters = [
    'Risco 01.Não integridade Operacional de Ativos',
    'Risco 02. Execução nos projetos de expansão',
    'Risco 03. Não atendimento junto ao Regulador',
    'Risco 04. Crise Ambiental & Mudanças Climáticas',
    'Risco 05. Decisões Tributárias e Judiciais Adversas',
    'Risco 06. Ambiente Concorrencial & Demanda',
    'Risco 07. Impactos no Ambiente Operacional de Tecnologia',
    'Risco 08. Integridade, Compliance & Reputacional',
    'Risco 09. Dependência de Fornecedores',
    'Risco 10. Gente & Cultura',
    'Risco 11. Gestão de Mudança',
];

const riskColorMap: { [key: string]: string } = {
    'Aceitável': 'hsl(var(--chart-2))',
    'Gerenciável': 'hsl(var(--chart-3))',
    'Prioritário': 'hsl(var(--chart-4))',
    'Crítico': 'hsl(var(--chart-5))', 
};

// These scores are not present in the new type definition.
// We will use the direct numeric values from the Risk object.
const probabilityScore: Record<string, number> = { "Raro": 1, "Improvável": 2, "Possível": 3, "Provável": 4, "Quase Certo": 5, '': 0 };
const impactScore: Record<string, number> = { "Insignificante": 1, "Menor": 2, "Moderado": 3, "Maior": 4, "Catastrófico": 5, '': 0 };

export function RiskMappingDashboard() {
    const [classificacaoFiltro, setClassificacaoFiltro] = useState<string[]>([]);
    const [fatorRiscoFiltro, setFatorRiscoFiltro] = useState('Todos');
    const [riscoEspecificoFiltro, setRiscoEspecificoFiltro] = useState('Todos');
    const [topRisksFiltro, setTopRisksFiltro] = useState<string[]>([]);

    const fatoresDeRiscoUnicos = useMemo(() => ['Todos', ...Array.from(new Set(risksData.map(r => r.fatorDeRisco)))], []);
    const riscosUnicos = useMemo(() => ['Todos', ...Array.from(new Set(risksData.map(r => r.risco)))], []);

    const filteredRisks = useMemo(() => {
        return risksData.filter(risk => {
            const nivelDeRisco = risk.tipoIER || '';
            if (classificacaoFiltro.length > 0 && !classificacaoFiltro.includes(nivelDeRisco)) return false;
            if (fatorRiscoFiltro !== 'Todos' && risk.fatorDeRisco !== fatorRiscoFiltro) return false;
            if (riscoEspecificoFiltro !== 'Todos' && risk.risco !== riscoEspecificoFiltro) return false;
            if (topRisksFiltro.length > 0 && !topRisksFiltro.includes(risk.topRiskAssociado)) return false;
            return true;
        });
    }, [classificacaoFiltro, fatorRiscoFiltro, riscoEspecificoFiltro, topRisksFiltro]);

    const chartData = useMemo(() => {
        return filteredRisks.map(risk => ({
            x: risk.x,
            y: risk.y,
            z: risk.ier,
            name: risk.risco,
            level: risk.tipoIER || 'N/A',
            fill: riskColorMap[risk.tipoIER]
        }));
    }, [filteredRisks]);

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

    const handleClassificacaoClick = (classificacao: string) => {
        setClassificacaoFiltro(prev => {
            if (prev.includes(classificacao)) {
                return prev.filter(c => c !== classificacao);
            }
            return [...prev, classificacao];
        });
    };

    const handleTopRiskChange = (topRisk: string) => {
        setTopRisksFiltro(prev => {
            if (prev.includes(topRisk)) {
                return prev.filter(tr => tr !== topRisk);
            }
            return [...prev, topRisk];
        });
    };

    const limparFiltros = () => {
        setClassificacaoFiltro([]);
        setFatorRiscoFiltro('Todos');
        setRiscoEspecificoFiltro('Todos');
        setTopRisksFiltro([]);
    };
    

    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>Painel de Mapeamento de Risco</CardTitle>
                <CardDescription>Mapeamento Geral dos Riscos levantados pela RUMO. Os valores estão em constante mudança e validação pela Curadoria e Comitê de Riscos.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Filtros */}
                    <div className="lg:col-span-2 space-y-4 p-4 border rounded-lg">
                        <div>
                            <h3 className="font-semibold text-center mb-1">TOTAL DE RISCOS</h3>
                            <div className="p-4 bg-primary text-primary-foreground text-center rounded-lg text-4xl font-bold">{risksData.length}</div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-center mb-1">CLASSIFICAÇÃO</h3>
                            <div className="grid grid-cols-2 gap-2">
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
                         <div className="grid grid-cols-2 gap-2">
                            <Button variant={classificacaoFiltro.includes('Aceitável') ? 'default' : 'outline'} onClick={() => handleClassificacaoClick('Aceitável')}>Risco Aceitável</Button>
                            <Button variant={classificacaoFiltro.includes('Gerenciável') ? 'default' : 'outline'} onClick={() => handleClassificacaoClick('Gerenciável')}>Risco Gerenciável</Button>
                            <Button variant={classificacaoFiltro.includes('Prioritário') ? 'default' : 'outline'} onClick={() => handleClassificacaoClick('Prioritário')}>Risco Prioritário</Button>
                            <Button variant={classificacaoFiltro.includes('Crítico') ? 'default' : 'outline'} onClick={() => handleClassificacaoClick('Crítico')}>Risco Crítico</Button>
                        </div>

                        <Button variant="secondary" className="w-full" onClick={limparFiltros}>Limpar todas as segmentações</Button>

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
                            <label className="font-semibold">Selecione um Risco Específico</label>
                            <Select value={riscoEspecificoFiltro} onValueChange={setRiscoEspecificoFiltro}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {riscosUnicos.map(risco => <SelectItem key={risco} value={risco}>{risco}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <h3 className="font-semibold">TopRisks</h3>
                            <div className="space-y-2 mt-2">
                                {topRisksFilters.map(topRisk => (
                                    <div key={topRisk} className="flex items-start space-x-2">
                                        <Checkbox 
                                            id={topRisk} 
                                            checked={topRisksFiltro.includes(topRisk)}
                                            onCheckedChange={() => handleTopRiskChange(topRisk)}
                                            className="mt-1"
                                        />
                                        <label htmlFor={topRisk} className="text-sm leading-snug">
                                            {topRisk}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Gráfico e Tabela */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="h-[400px] w-full p-4 border rounded-lg relative">
                             <div 
                                className="absolute inset-0 grid grid-cols-2 grid-rows-2 -z-10"
                                style={{
                                    gridTemplateColumns: '50% 50%',
                                    gridTemplateRows: '50% 50%',
                                }}
                            >
                                <div className="bg-green-100/50"></div>
                                <div className="bg-yellow-100/50"></div>
                                <div className="bg-yellow-100/50"></div>
                                <div className="bg-orange-100/50"></div>
                            </div>
                            <div 
                                className="absolute top-0 right-0 h-1/2 w-1/2 bg-red-100/50 -z-10"
                            ></div>
                            <ChartContainer 
                                config={{
                                    'Aceitável': { label: 'Risco Aceitável', color: riskColorMap['Aceitável'] },
                                    'Gerenciável': { label: 'Risco Gerenciável', color: riskColorMap['Gerenciável'] },
                                    'Prioritário': { label: 'Risco Prioritário', color: riskColorMap['Prioritário'] },
                                    'Crítico': { label: 'Risco Crítico', color: riskColorMap['Crítico'] },
                                }}
                                className="w-full h-full"
                            >
                                <ScatterChart margin={{ top: 40, right: 20, bottom: 40, left: 40 }}>
                                    <XAxis type="number" dataKey="x" name="Impacto" domain={[0, 10]} ticks={[2,4,6,8,10]} label={{ value: "Impacto", position: "bottom", offset: 20 }} />
                                    <YAxis type="number" dataKey="y" name="Probabilidade" domain={[0, 10]} ticks={[2,4,6,8,10]} label={{ value: "Probabilidade", angle: -90, position: "insideLeft", offset: -20 }} />
                                    <ZAxis type="number" dataKey="z" range={[100, 1000]} name="IER" />
                                    <ChartTooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent />} />
                                    <ChartLegend 
                                        content={<ChartLegendContent />}
                                        verticalAlign="top" 
                                        wrapperStyle={{top: 0, right: 0}}
                                    />
                                    <Scatter data={chartData}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.7} />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                            </ChartContainer>
                        </div>
                        <div className="max-h-[400px] overflow-auto border rounded-lg">
                            <Table>
                                <TableHeader className="sticky top-0 bg-card">
                                    <TableRow>
                                        <TableHead>Código</TableHead>
                                        <TableHead>Fator de Risco</TableHead>
                                        <TableHead>Nome do Risco</TableHead>
                                        <TableHead className="text-right">IER</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRisks.sort((a,b) => b.ier - a.ier).map(risk => (
                                        <TableRow key={risk.id}>
                                            <TableCell className="font-mono text-xs">{risk.categoria}-{risk.id.padStart(3,'0')}</TableCell>
                                            <TableCell>{risk.fatorDeRisco}</TableCell>
                                            <TableCell>{risk.risco}</TableCell>
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
