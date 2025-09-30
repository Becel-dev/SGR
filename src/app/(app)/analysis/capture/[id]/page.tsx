'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getRiskAnalysisById,
  getIdentifiedRiskById,
  addOrUpdateRiskAnalysis,
} from "@/lib/azure-table-storage";
import type { RiskAnalysis, IdentifiedRisk } from "@/lib/types";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import {
  gerenciaOptions,
  tipoIerOptions,
  bowtieRealizadoOptions,
  pilarOptions,
  temaMaterialOptions,
  englobadorOptions,
  horizonteTempoOptions,
  geOrigemRiscoOptions,
  topRiskOptions, // Adicionado
  riskFactorOptions, // Adicionado
} from '@/lib/form-options';

// Validação com Zod para todos os campos da análise
const analysisSchema = z.object({
  // --- Campos da Identificação (read-only, mas necessários para o form) ---
  riskName: z.string(),
  topRisk: z.string(),
  riskFactor: z.string(),
  riskScenario: z.string(),
  corporateImpact: z.number(),
  organizationalRelevance: z.number(),
  contextualizedProbability: z.number(),
  currentControlCapacity: z.number(),
  containmentTime: z.number(),
  technicalFeasibility: z.number(),

  // --- Campos Editáveis da Análise ---
  gerencia: z.string().optional(),
  categoria: z.string().optional(),
  taxonomia: z.string().optional(),
  observacao: z.string().optional(),
  contexto: z.string().optional(),
  
  // Análise e Classificação
  ier: z.number().optional(),
  origem: z.string().optional(),
  tipoIER: z.enum(["Crítico", "Prioritário", "Gerenciável", "Aceitável", ""]).optional(),
  x: z.coerce.number().optional(),
  y: z.coerce.number().optional(),
  englobador: z.string().optional(),

  // ESG e Governança
  pilar: z.string().optional(),
  temaMaterial: z.string().optional(),
  pilarESG: z.string().optional(),
  geOrigemRisco: z.string().optional(),

  // Gestão e Prazos
  responsavelBowtie: z.string().optional(),
  horizonteTempo: z.string().optional(),
  dataAlteracaoCuradoria: z.string().optional(),

  // Controles e Bowtie
  bowtieRealizado: z.enum(['Realizado', 'Não Realizado', 'Em Andamento']).optional(),
  possuiCC: z.enum(['Sim', 'Não']).optional(),
  urlDoCC: z.string().url({ message: "Por favor, insira uma URL válida." }).or(z.literal('')).optional(),
});


export default function RiskAnalysisCapturePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params?.id as string;

  const [risk, setRisk] = useState<IdentifiedRisk | RiskAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [calculatedIer, setCalculatedIer] = useState(0);

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<z.infer<typeof analysisSchema>>({
    resolver: zodResolver(analysisSchema),
    defaultValues: {
        riskName: '',
        topRisk: '',
        riskFactor: '',
        riskScenario: '',
        corporateImpact: 0,
        organizationalRelevance: 0,
        contextualizedProbability: 0,
        currentControlCapacity: 0,
        containmentTime: 0,
        technicalFeasibility: 0,
        gerencia: '',
        categoria: '',
        taxonomia: '',
        observacao: '',
        contexto: '',
        ier: 0,
        origem: 'Identificação de Risco',
        tipoIER: '',
        x: 0,
        y: 0,
        englobador: '',
        pilar: '',
        temaMaterial: '',
        pilarESG: '',
        geOrigemRisco: '',
        responsavelBowtie: '',
        horizonteTempo: '',
        dataAlteracaoCuradoria: '',
        bowtieRealizado: 'Não Realizado',
        possuiCC: 'Não',
        urlDoCC: '',
    }
  });

  const watchedFields = watch([
    "corporateImpact", 
    "organizationalRelevance", 
    "contextualizedProbability", 
    "currentControlCapacity", 
    "containmentTime", 
    "technicalFeasibility"
  ]);

  useEffect(() => {
    const [imp, org, prob, ctrl, tempo, facil] = watchedFields;
    
    // Pesos
    const weights = {
      imp: 0.25,
      org: 0.10,
      prob: 0.15,
      ctrl: 0.20,
      tempo: 0.15,
      facil: 0.15
    };

    // A lógica de inversão para CTRL e TEMPO é (11 - valor)
    const invertedCtrl = 11 - (ctrl || 0);
    const invertedTempo = 11 - (tempo || 0);

    const ierValue = (
      (imp || 0) * weights.imp +
      (org || 0) * weights.org +
      (prob || 0) * weights.prob +
      invertedCtrl * weights.ctrl +
      invertedTempo * weights.tempo +
      (facil || 0) * weights.facil
    ) * 100;
    
    const roundedIer = Math.round(ierValue);
    setCalculatedIer(roundedIer);
    setValue('ier', roundedIer); // Atualiza o valor do IER no formulário

  }, [watchedFields, setValue]);


  useEffect(() => {
    if (!id || id === 'new') {
      setLoading(false);
      return;
    }

    async function fetchRiskData() {
      try {
        setLoading(true);
        // 1. Tenta buscar da tabela de Análise primeiro
        let riskData: RiskAnalysis | IdentifiedRisk | null = (await getRiskAnalysisById(id)) || null;

        // 2. Se não encontrar, busca da tabela de Identificação
        if (!riskData) {
          riskData = (await getIdentifiedRiskById(id)) || null;
        }

        if (riskData) {
          setRisk(riskData);
          
          // Mapeia os campos para o formulário, usando os dados existentes se for uma análise
          const analysisValues = riskData as RiskAnalysis;
          reset({
            // Dados base da identificação
            riskName: riskData.riskName,
            topRisk: riskData.topRisk,
            riskFactor: riskData.riskFactor,
            riskScenario: riskData.riskScenario,
            corporateImpact: riskData.corporateImpact,
            organizationalRelevance: riskData.organizationalRelevance,
            contextualizedProbability: riskData.contextualizedProbability,
            currentControlCapacity: riskData.currentControlCapacity,
            containmentTime: riskData.containmentTime,
            technicalFeasibility: riskData.technicalFeasibility,
            
            // Dados da análise (se existirem)
            gerencia: analysisValues.gerencia || '',
            categoria: analysisValues.categoria || '',
            taxonomia: analysisValues.taxonomia || '',
            observacao: analysisValues.observacao || '',
            contexto: analysisValues.contexto || riskData.riskScenario, // Usa o cenário se o contexto for vazio
            ier: analysisValues.ier || 0,
            origem: analysisValues.origem || 'Identificação de Risco',
            tipoIER: analysisValues.tipoIER || '',
            x: analysisValues.x || 0,
            y: analysisValues.y || 0,
            englobador: analysisValues.englobador || '',
            pilar: analysisValues.pilar || '',
            temaMaterial: analysisValues.temaMaterial || '',
            pilarESG: analysisValues.pilarESG || '',
            geOrigemRisco: analysisValues.geOrigemRisco || '',
            responsavelBowtie: analysisValues.responsavelBowtie || '',
            horizonteTempo: analysisValues.horizonteTempo || '',
            dataAlteracaoCuradoria: analysisValues.dataAlteracaoCuradoria || '',
            bowtieRealizado: analysisValues.bowtieRealizado || 'Não Realizado',
            possuiCC: analysisValues.possuiCC || 'Não',
            urlDoCC: analysisValues.urlDoCC || '',
          });
        } else {
            toast({
                title: "Erro",
                description: "Risco não encontrado.",
                variant: "destructive",
            });
        }
      } catch (error) {
        console.error(error);
        toast({
            title: "Erro ao carregar",
            description: "Não foi possível buscar os dados do risco.",
            variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchRiskData();
  }, [id, reset, toast]);

  const onSubmit = async (data: z.infer<typeof analysisSchema>) => {
    if (!risk) return;

    setIsSaving(true);
    try {
        const baseRisk = risk as IdentifiedRisk;
        
        // Mescla os dados da base com os dados do formulário
        const mergedData = { ...baseRisk, ...data };

        const analysisData: RiskAnalysis = {
            // Recria o objeto garantindo a ordem e os tipos corretos
            id: mergedData.id,
            riskName: mergedData.riskName,
            topRisk: mergedData.topRisk,
            riskFactor: mergedData.riskFactor,
            probableCause: mergedData.probableCause,
            riskScenario: mergedData.riskScenario,
            expectedConsequence: mergedData.expectedConsequence,
            currentControls: mergedData.currentControls,
            riskRole: mergedData.riskRole,
            pointingType: mergedData.pointingType,
            businessObjectives: mergedData.businessObjectives,
            corporateImpact: mergedData.corporateImpact,
            organizationalRelevance: mergedData.organizationalRelevance,
            contextualizedProbability: mergedData.contextualizedProbability,
            currentControlCapacity: mergedData.currentControlCapacity,
            containmentTime: mergedData.containmentTime,
            technicalFeasibility: mergedData.technicalFeasibility,
            createdBy: mergedData.createdBy,
            createdAt: mergedData.createdAt,
            updatedBy: mergedData.updatedBy,
            updatedAt: mergedData.updatedAt,

            // Campos específicos da análise
            status: 'Em Análise',
            analysisId: mergedData.id,
            gerencia: mergedData.gerencia,
            categoria: mergedData.categoria,
            taxonomia: mergedData.taxonomia,
            observacao: mergedData.observacao,
            contexto: mergedData.contexto,
            ier: calculatedIer, // Usa o IER recém-calculado
            origem: mergedData.origem,
            tipoIER: mergedData.tipoIER,
            x: mergedData.x,
            y: mergedData.y,
            englobador: mergedData.englobador,
            pilar: mergedData.pilar,
            temaMaterial: mergedData.temaMaterial,
            pilarESG: mergedData.pilarESG,
            geOrigemRisco: mergedData.geOrigemRisco,
            responsavelBowtie: mergedData.responsavelBowtie,
            horizonteTempo: mergedData.horizonteTempo,
            dataAlteracaoCuradoria: mergedData.dataAlteracaoCuradoria,
            bowtieRealizado: mergedData.bowtieRealizado,
            possuiCC: mergedData.possuiCC,
            urlDoCC: mergedData.urlDoCC,
        };

        await addOrUpdateRiskAnalysis(analysisData);

        toast({
            title: "Sucesso!",
            description: "A análise de risco foi salva e o status atualizado para 'Em Análise'.",
        });
        router.push('/analysis');
    } catch (error) {
        console.error(error);
        toast({
            title: "Erro ao Salvar",
            description: "Não foi possível salvar a análise. Tente novamente.",
            variant: "destructive",
        });
    } finally {
        setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <CardTitle>Análise de Risco</CardTitle>
              <CardDescription>Preencha os campos adicionais para analisar o risco identificado.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                </Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Salvar Análise
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 mt-6">
            {/* --- Section: Identificação e Contexto --- */}
            <section className="space-y-4 p-4 border rounded-md">
                <h3 className="font-semibold text-lg text-primary">Identificação e Contexto</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><Label>ID</Label><Input value={risk?.id || ''} readOnly className="bg-muted/60"/></div>
                    <div><Label>Risco</Label><Input value={risk?.riskName || ''} readOnly className="bg-muted/60"/></div>
                    
                    <Controller name="topRisk" control={control} render={({ field }) => (
                        <div><Label>TopRisk Associado</Label>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>
                                {topRiskOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                            </SelectContent>
                        </Select></div>
                    )} />

                    <div className="md:col-span-3">
                        <Controller name="riskFactor" control={control} render={({ field }) => (
                            <div><Label>Fator de Risco</Label>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                    {riskFactorOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                                </SelectContent>
                            </Select></div>
                        )} />
                    </div>
                    
                    <Controller name="gerencia" control={control} render={({ field }) => (
                        <div><Label htmlFor="gerencia">Gerência</Label>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger id="gerencia"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>
                                {gerenciaOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                            </SelectContent>
                        </Select></div>
                    )} />
                    <Controller name="taxonomia" control={control} render={({ field }) => (<div><Label htmlFor="taxonomia">Taxonomia</Label><Input id="taxonomia" {...field} /></div>)} />
                    <div className="md:col-span-3"><Controller name="contexto" control={control} render={({ field }) => (<div><Label htmlFor="contexto">Contexto</Label><Textarea id="contexto" {...field} /></div>)} /></div>
                    <div className="md:col-span-3"><Controller name="observacao" control={control} render={({ field }) => (<div><Label htmlFor="observacao">Observação</Label><Textarea id="observacao" {...field} /></div>)} /></div>
                </div>
            </section>

            {/* --- Section: Análise e Classificação --- */}
            <section className="space-y-4 p-4 border rounded-md">
                <h3 className="font-semibold text-lg text-primary">Análise e Classificação</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 items-end">
                    {/* Read-only values from Identification */}
                    <div><Label>IMP</Label><Input type="number" value={risk?.corporateImpact || 0} readOnly className="bg-muted/60 font-bold text-center"/></div>
                    <div><Label>ORG</Label><Input type="number" value={risk?.organizationalRelevance || 0} readOnly className="bg-muted/60 font-bold text-center"/></div>
                    <div><Label>PROB</Label><Input type="number" value={risk?.contextualizedProbability || 0} readOnly className="bg-muted/60 font-bold text-center"/></div>
                    <div><Label>CTRL</Label><Input type="number" value={risk?.currentControlCapacity || 0} readOnly className="bg-muted/60 font-bold text-center"/></div>
                    <div><Label>TEMPO</Label><Input type="number" value={risk?.containmentTime || 0} readOnly className="bg-muted/60 font-bold text-center"/></div>
                    <div><Label>FACIL</Label><Input type="number" value={risk?.technicalFeasibility || 0} readOnly className="bg-muted/60 font-bold text-center"/></div>
                    
                    {/* Calculated and Editable */}
                    <div><Label>IER</Label><Input value={calculatedIer} readOnly className="bg-blue-100 dark:bg-blue-900/50 font-bold text-center text-lg"/></div>
                    <div><Label>Origem</Label><Input value="Identificação de Risco" readOnly className="bg-muted/60"/></div>
                    
                    <Controller name="tipoIER" control={control} render={({ field }) => (
                        <div><Label>Tipo IER</Label>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>
                                {tipoIerOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                            </SelectContent>
                        </Select></div>
                    )} />
                    <Controller name="x" control={control} render={({ field }) => (<div><Label>X</Label><Input type="number" {...field} /></div>)} />
                    <Controller name="y" control={control} render={({ field }) => (<div><Label>Y</Label><Input type="number" {...field} /></div>)} />
                    <Controller name="englobador" control={control} render={({ field }) => (
                        <div><Label>Englobador</Label>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>
                                {englobadorOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                            </SelectContent>
                        </Select></div>
                    )} />
                </div>
            </section>

            {/* --- Section: ESG e Governança --- */}
            <section className="space-y-4 p-4 border rounded-md">
                <h3 className="font-semibold text-lg text-primary">ESG e Governança</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Controller name="pilar" control={control} render={({ field }) => (
                        <div><Label>Pilar</Label>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>
                                {pilarOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                            </SelectContent>
                        </Select></div>
                    )} />
                    <Controller name="temaMaterial" control={control} render={({ field }) => (
                        <div><Label>Tema Material</Label>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>
                                {temaMaterialOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                            </SelectContent>
                        </Select></div>
                    )} />
                    <Controller name="pilarESG" control={control} render={({ field }) => (<div><Label>Pilar ESG</Label><Input {...field} /></div>)} />
                    <Controller name="geOrigemRisco" control={control} render={({ field }) => (
                        <div><Label>GE de Origem do Risco</Label>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>
                                {geOrigemRiscoOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                            </SelectContent>
                        </Select></div>
                    )} />
                </div>
            </section>

            {/* --- Section: Gestão e Prazos --- */}
            <section className="space-y-4 p-4 border rounded-md">
                <h3 className="font-semibold text-lg text-primary">Gestão e Prazos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                    <div><Label>Status do Risco</Label><Badge variant={risk && 'status' in risk && risk.status === 'Em Análise' ? 'secondary' : 'destructive'}>{risk && 'status' in risk ? risk.status : 'Novo'}</Badge></div>
                    <Controller name="responsavelBowtie" control={control} render={({ field }) => (<div><Label>Responsável pelo Bowtie</Label><Input {...field} /></div>)} />
                    <Controller name="horizonteTempo" control={control} render={({ field }) => (
                        <div><Label>Horizonte Tempo</Label>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>
                                {horizonteTempoOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                            </SelectContent>
                        </Select></div>
                    )} />
                    <Controller name="dataAlteracaoCuradoria" control={control} render={({ field }) => (<div><Label>Data Alteração Curadoria</Label><Input type="date" {...field} /></div>)} />
                    <div><Label>Criado em</Label><Input value={risk?.createdAt ? new Date(risk.createdAt).toLocaleDateString() : ''} readOnly className="bg-muted/60"/></div>
                    <div><Label>Criado por</Label><Input value={risk?.createdBy || ''} readOnly className="bg-muted/60"/></div>
                    <div><Label>Modificado em</Label><Input value={risk?.updatedAt ? new Date(risk.updatedAt).toLocaleDateString() : ''} readOnly className="bg-muted/60"/></div>
                    <div><Label>Modificado por</Label><Input value={risk?.updatedBy || ''} readOnly className="bg-muted/60"/></div>
                </div>
            </section>

            {/* --- Section: Controles e Bowtie --- */}
            <section className="space-y-4 p-4 border rounded-md">
                <h3 className="font-semibold text-lg text-primary">Controles e Bowtie</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Controller name="bowtieRealizado" control={control} render={({ field }) => (
                        <div><Label>Bowtie Realizado</Label>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger>
                            <SelectContent>
                                {bowtieRealizadoOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                            </SelectContent>
                        </Select></div>
                    )} />
                    <Controller name="possuiCC" control={control} render={({ field }) => (
                        <div><Label>Possui CC</Label>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Não">Não</SelectItem>
                                <SelectItem value="Sim">Sim</SelectItem>
                            </SelectContent>
                        </Select></div>
                    )} />
                    <Controller name="urlDoCC" control={control} render={({ field }) => (<div><Label>URL do CC</Label><Input {...field} placeholder="https://..." />{errors.urlDoCC && <p className="text-red-500 text-sm mt-1">{errors.urlDoCC.message}</p>}</div>)} />
                </div>
            </section>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
            </Button>
            <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Salvar Análise
            </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
