'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  TrendingUp,
  Shield,
  GanttChartSquare,
  FileText,
  GitFork,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import type { Control, Kpi, Action, BowtieData, RiskAnalysis } from '@/lib/types';
import { getRisksForAnalysis } from '@/lib/azure-table-storage';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface TreeNode {
  risk: RiskAnalysis;
  controls: {
    control: Control;
    actions: Action[];
    kpis: Kpi[];
  }[];
}

export default function PainelPage() {
  const [risks, setRisks] = useState<RiskAnalysis[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [bowties, setBowties] = useState<BowtieData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRisks, setExpandedRisks] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [fetchedRisks, controlsRes, kpisRes, actionsRes, bowtiesRes] = await Promise.all([
        getRisksForAnalysis(),
        fetch('/api/controls'),
        fetch('/api/kpis'),
        fetch('/api/actions'),
        fetch('/api/bowtie'),
      ]);

      setRisks(fetchedRisks);
      if (controlsRes.ok) setControls(await controlsRes.json());
      if (kpisRes.ok) setKpis(await kpisRes.json());
      if (actionsRes.ok) setActions(await actionsRes.json());
      if (bowtiesRes.ok) {
        const allBowties = await bowtiesRes.json();
        // Filtrar apenas a última versão de cada riskId
        const latestBowties = filterLatestBowtieVersions(allBowties);
        setBowties(latestBowties);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para filtrar apenas a última versão de cada bowtie por riskId
  const filterLatestBowtieVersions = (bowties: BowtieData[]): BowtieData[] => {
    const bowtieMap = new Map<string, BowtieData>();
    
    bowties.forEach(bowtie => {
      const existing = bowtieMap.get(bowtie.riskId);
      if (!existing || bowtie.version > existing.version) {
        bowtieMap.set(bowtie.riskId, bowtie);
      }
    });
    
    return Array.from(bowtieMap.values());
  };

  // Calcular status de ações (incluindo vencidas)
  const getActionStatus = (action: Action): Action['status'] => {
    if (action.status === 'Concluída') return 'Concluída';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(action.prazo);
    deadline.setHours(0, 0, 0, 0);
    
    if (deadline < today) return 'Vencida';
    return action.status;
  };

  // Estatísticas
  const stats = {
    risks: {
      novo: risks.filter(r => r.status === 'Novo').length,
      emAnalise: risks.filter(r => r.status === 'Em Análise').length,
      analisado: risks.filter(r => r.status === 'Analisado').length,
    },
    controls: {
      implementado: controls.filter(c => c.status === 'Implementado').length,
      naoImplementado: controls.filter(c => c.status === 'Não Implementado').length,
      implementadoPendencia: controls.filter(c => c.status === 'Implementado com Pendência').length,
      implementacaoFutura: controls.filter(c => c.status === 'Implementação Futura').length,
    },
    kpis: {
      ok: kpis.filter(k => k.status === 'OK').length,
      nok: kpis.filter(k => k.status === 'NOK').length,
    },
    actions: {
      pendente: actions.filter(a => getActionStatus(a) === 'Pendente').length,
      emAndamento: actions.filter(a => getActionStatus(a) === 'Em Andamento').length,
      vencida: actions.filter(a => getActionStatus(a) === 'Vencida').length,
      concluida: actions.filter(a => getActionStatus(a) === 'Concluída').length,
    },
    bowties: {
      emAprovacao: bowties.filter(b => b.approvalStatus === 'Em aprovação').length,
      aprovado: bowties.filter(b => b.approvalStatus === 'Aprovado').length,
    },
  };

  // Construir árvore de relacionamento
  const buildTree = (): TreeNode[] => {
    console.log('=== DEBUG: Building Tree ===');
    console.log('Total Risks:', risks.length);
    console.log('Total Controls:', controls.length);
    console.log('Sample Risk IDs:', risks.slice(0, 3).map(r => ({ id: r.id, name: r.riskName })));
    console.log('Sample Control IDs and Associated Risks:', controls.slice(0, 3).map(c => ({ 
      id: c.id, 
      name: c.nomeControle,
      associatedRisks: c.associatedRisks 
    })));

    const tree = risks.map(risk => {
      // Encontrar controles associados a este risco
      // Usar tanto o risk.id quanto o risk.analysisId para buscar
      const associatedControls = controls.filter(control => {
        if (!control.associatedRisks || control.associatedRisks.length === 0) {
          return false;
        }
        return control.associatedRisks.some(ar => 
          ar.riskId === risk.id || ar.riskId === risk.analysisId
        );
      });

      console.log(`Risk ${risk.id} (${risk.riskName}): ${associatedControls.length} controls found`);

      return {
        risk,
        controls: associatedControls.map(control => ({
          control,
          actions: actions.filter(a => a.controlId === control.id),
          kpis: kpis.filter(k => k.controlId === control.id),
        })),
      };
    }).filter(node => node.controls.length > 0); // Apenas riscos com controles
    
    console.log('Tree nodes with controls:', tree.length);
    return tree;
  };

  const toggleRiskExpansion = (riskId: string) => {
    setExpandedRisks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(riskId)) {
        newSet.delete(riskId);
      } else {
        newSet.add(riskId);
      }
      return newSet;
    });
  };

  const treeData = buildTree();

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Painel de Gestão
        </h1>
        <p className="text-muted-foreground">
          Visão consolidada de riscos, controles, KPIs e ações
        </p>
      </div>

      {/* Indicadores - Cards separados para cada grupo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Riscos */}
        <Card className="shadow-lg border bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="h-6 w-6 text-blue-600" /> Riscos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-base">
              <span className="text-muted-foreground">Novos</span>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 font-bold text-lg">{stats.risks.novo}</Badge>
            </div>
            <div className="flex items-center justify-between text-base">
              <span className="text-muted-foreground">Em Análise</span>
              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 font-bold text-lg">{stats.risks.emAnalise}</Badge>
            </div>
            <div className="flex items-center justify-between text-base">
              <span className="text-muted-foreground">Analisados</span>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 font-bold text-lg">{stats.risks.analisado}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Controles */}
        <Card className="shadow-lg border bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="h-6 w-6 text-green-600" /> Controles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-base">
              <span className="text-muted-foreground">Implementados</span>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 font-bold text-lg">{stats.controls.implementado}</Badge>
            </div>
            <div className="flex items-center justify-between text-base">
              <span className="text-muted-foreground">Não Impl.</span>
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 font-bold text-lg">{stats.controls.naoImplementado}</Badge>
            </div>
            <div className="flex items-center justify-between text-base">
              <span className="text-muted-foreground">C/ Pendência</span>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 font-bold text-lg">{stats.controls.implementadoPendencia}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <Card className="shadow-lg border bg-gradient-to-br from-yellow-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <GanttChartSquare className="h-6 w-6 text-yellow-600" /> KPIs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-base">
              <span className="text-muted-foreground">OK</span>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 font-bold text-lg">{stats.kpis.ok}</Badge>
            </div>
            <div className="flex items-center justify-between text-base">
              <span className="text-muted-foreground">NOK</span>
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 font-bold text-lg">{stats.kpis.nok}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <Card className="shadow-lg border bg-gradient-to-br from-orange-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-6 w-6 text-orange-600" /> Ações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-base">
              <span className="text-muted-foreground">Pendentes</span>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 font-bold text-lg">{stats.actions.pendente}</Badge>
            </div>
            <div className="flex items-center justify-between text-base">
              <span className="text-muted-foreground">Em Andamento</span>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 font-bold text-lg">{stats.actions.emAndamento}</Badge>
            </div>
            <div className="flex items-center justify-between text-base">
              <span className="text-muted-foreground">Vencidas</span>
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 font-bold text-lg">{stats.actions.vencida}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Bowtie */}
        <Card className="shadow-lg border bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <GitFork className="h-6 w-6 text-purple-600" /> Bowtie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-base">
              <span className="text-muted-foreground">Em Aprovação</span>
              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 font-bold text-lg">{stats.bowties.emAprovacao}</Badge>
            </div>
            <div className="flex items-center justify-between text-base">
              <span className="text-muted-foreground">Aprovados</span>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 font-bold text-lg">{stats.bowties.aprovado}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relatório em Árvore - Destaque Principal */}
      <Card className="border-2">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-xl flex items-center gap-2">
            <GitFork className="h-6 w-6" />
            Relatório de Relacionamento
          </CardTitle>
          <CardDescription className="text-base">
            Visualização hierárquica: Riscos → Controles → Ações/KPIs
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {treeData.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum relacionamento encontrado
            </p>
          ) : (
            <div className="space-y-2">
              {treeData.map(node => (
                <div key={node.risk.id} className="border rounded-lg">
                  {/* Risco */}
                  <div
                    className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleRiskExpansion(node.risk.id)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {expandedRisks.has(node.risk.id) ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-semibold">{node.risk.riskName}</p>
                        <p className="text-sm text-muted-foreground">ID: {node.risk.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{node.controls.length} controles</Badge>
                      <Badge className={
                        node.risk.status === 'Novo' ? 'bg-blue-100 text-blue-800' :
                        node.risk.status === 'Em Análise' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {node.risk.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Controles (expandido) */}
                  {expandedRisks.has(node.risk.id) && (
                    <div className="pl-12 pr-4 pb-4 space-y-3">
                      {node.controls.map(({ control, actions, kpis }) => (
                        <div key={control.id} className="border-l-2 border-muted pl-4 space-y-2">
                          {/* Controle */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-green-600" />
                              <span className="font-medium">{control.nomeControle}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {actions.length} ações
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {kpis.length} KPIs
                              </Badge>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/controls/${control.id}`}>Ver</Link>
                              </Button>
                            </div>
                          </div>

                          {/* Ações */}
                          {actions.length > 0 && (
                            <div className="pl-6 space-y-1">
                              <p className="text-xs text-muted-foreground font-semibold">Ações:</p>
                              {actions.map(action => {
                                const status = getActionStatus(action);
                                return (
                                  <div key={action.id} className="flex items-center gap-2 text-sm">
                                    <FileText className="h-3 w-3 text-muted-foreground" />
                                    <span className="flex-1 truncate">{action.descricao.substring(0, 50)}...</span>
                                    <Badge className={
                                      status === 'Concluída' ? 'bg-green-100 text-green-800' :
                                      status === 'Vencida' ? 'bg-red-100 text-red-800' :
                                      status === 'Em Andamento' ? 'bg-blue-100 text-blue-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }>
                                      {status}
                                    </Badge>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* KPIs */}
                          {kpis.length > 0 && (
                            <div className="pl-6 space-y-1">
                              <p className="text-xs text-muted-foreground font-semibold">KPIs:</p>
                              {kpis.map(kpi => (
                                <div key={kpi.id} className="flex items-center gap-2 text-sm">
                                  <GanttChartSquare className="h-3 w-3 text-muted-foreground" />
                                  <span className="flex-1">Verificação a cada {kpi.frequenciaDias} dias</span>
                                  <Badge className={
                                    kpi.status === 'OK' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }>
                                    {kpi.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
