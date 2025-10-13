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
import { UserAutocomplete } from '@/components/ui/user-autocomplete';
import {
  getRiskAnalysisById,
  getIdentifiedRiskById,
  addOrUpdateRiskAnalysis,
  deleteRiskAnalysis,
} from "@/lib/azure-table-storage";
import { getIerRules, getIerClassification } from "@/lib/ier-utils";
import type { RiskAnalysis, IdentifiedRisk, IerRule } from "@/lib/types";
import { Loader2, Save, ArrowLeft, Trash2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';
import {
  gerenciaOptions,
  tipoIerOptions,
  bowtieRealizadoOptions,
  pilarOptions,
  temaMaterialOptions,
  englobadorOptions,
  horizonteTempoOptions,
  geOrigemRiscoOptions,
  topRiskOptions,
  riskFactorOptions,
  getTopRiskOptions,
  getRiskFactorOptions,
  getTemasMaterialOptions,
} from '@/lib/form-options';

const analysisSchema = z.object({
  riskName: z.string().min(1, "O nome do risco é obrigatório."),
  topRisk: z.string().min(1, "O Top Risk é obrigatório."),
  riskFactor: z.string().min(1, "O Fator de Risco é obrigatório."),
  riskScenario: z.string().optional().default(""),
  corporateImpact: z.coerce.number().min(0).max(10),
  organizationalRelevance: z.coerce.number().min(0).max(10),
  contextualizedProbability: z.coerce.number().min(0).max(10),
  currentControlCapacity: z.coerce.number().min(0).max(10),
  containmentTime: z.coerce.number().min(0).max(10),
  technicalFeasibility: z.coerce.number().min(0).max(10),
  gerencia: z.string().optional().default(""),
  categoria: z.string().optional().default(""),
  taxonomia: z.string().optional().default(""),
  observacao: z.string().optional().default(""),
  contexto: z.string().optional().default(""),
  origem: z.string().optional().default("Identificação de Risco"),
  tipoIER: z.string().optional(), // Tornando o campo uma string opcional para evitar falha de validação
  x: z.coerce.number().optional().default(0),
  y: z.coerce.number().optional().default(0),
  englobador: z.string().optional().default(""),
  pilar: z.string().optional().default(""),
  temaMaterial: z.string().optional().default(""),
  pilarESG: z.string().optional().default(""),
  geOrigemRisco: z.string().optional().default(""),
  responsavelBowtie: z.string().optional().default(""),
  horizonteTempo: z.string().optional().default(""),
  dataAlteracaoCuradoria: z.string().optional().default(""),
  bowtieRealizado: z.string().optional().default("") ,
  possuiCC: z.string().optional().default("") ,
  urlDoCC: z.string().optional().default(""),
  ier: z.number().optional().default(0)
});


export default function RiskAnalysisCapturePage() {
  // Função para deletar análise
  const handleDelete = async () => {
    if (!risk) return;
    setIsDeleting(true);
    try {
      const partitionKey = risk.topRisk.replace(/[^a-zA-Z0-9]/g, '') || "Default";
      await deleteRiskAnalysis(risk.id, partitionKey);
      toast({
        title: "Análise Excluída",
        description: "A análise de risco foi removida com sucesso.",
      });
      router.push('/analysis');
    } catch (error) {
      console.error("Erro ao excluir análise:", error);
      toast({
        title: "Erro ao Excluir",
        description: "Não foi possível remover a análise. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Função para marcar como analisado
  const handleMarkAsAnalyzed = async () => {
    if (!risk) return;
    const isValid = await trigger();
    if (!isValid) {
      toast({
        title: "Erro de Validação",
        description: "Verifique os campos do formulário antes de marcar como analisado.",
        variant: "destructive",
      });
      return;
    }
    setIsMarkingAsAnalyzed(true);
    try {
      const formData = getValues();
      const analysisData: RiskAnalysis = {
        id: risk.id,
        riskName: formData.riskName,
        topRisk: formData.topRisk,
        riskFactor: formData.riskFactor,
        riskScenario: formData.riskScenario,
        corporateImpact: formData.corporateImpact,
        organizationalRelevance: formData.organizationalRelevance,
        contextualizedProbability: formData.contextualizedProbability,
        currentControlCapacity: formData.currentControlCapacity,
        containmentTime: formData.containmentTime,
        technicalFeasibility: formData.technicalFeasibility,
        gerencia: formData.gerencia,
        categoria: formData.categoria,
        taxonomia: formData.taxonomia,
        observacao: formData.observacao,
        contexto: formData.contexto,
        origem: formData.origem,
        tipoIER: formData.tipoIER,
        x: formData.x,
        y: formData.y,
        englobador: formData.englobador,
        pilar: formData.pilar,
        temaMaterial: formData.temaMaterial,
        pilarESG: formData.pilarESG,
        geOrigemRisco: formData.geOrigemRisco,
        responsavelBowtie: formData.responsavelBowtie,
        horizonteTempo: formData.horizonteTempo,
        dataAlteracaoCuradoria: formData.dataAlteracaoCuradoria,
        bowtieRealizado: formData.bowtieRealizado,
        possuiCC: formData.possuiCC,
        urlDoCC: formData.urlDoCC,
        ier: calculatedIer,
        status: 'Analisado',
        analysisId: formData.topRisk.replace(/[^a-zA-Z0-9]/g, '') || "Default",
        createdAt: risk.createdAt || new Date().toISOString(),
        createdBy: risk.createdBy || 'current.user@example.com',
        updatedAt: new Date().toISOString(),
        updatedBy: 'current.user@example.com',
        probableCause: (risk as any).probableCause ?? '',
        expectedConsequence: (risk as any).expectedConsequence ?? '',
        currentControls: (risk as any).currentControls ?? '',
        riskRole: (risk as any).riskRole ?? '',
        pointingType: (risk as any).pointingType ?? '',
        businessObjectives: (risk as any).businessObjectives ?? '',
      };
      await addOrUpdateRiskAnalysis(analysisData);
      toast({
        title: "Status Atualizado",
        description: "O risco foi marcado como 'Analisado'.",
      });
      router.refresh();
      router.push('/analysis');
    } catch (error) {
      console.error("Erro ao marcar como analisado:", error);
      toast({
        title: "Erro ao Atualizar",
        description: "Não foi possível atualizar o status. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsMarkingAsAnalyzed(false);
    }
  };
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params?.id as string;

  const [risk, setRisk] = useState<IdentifiedRisk | RiskAnalysis | null>(null);
  const [ierRules, setIerRules] = useState<IerRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingAsAnalyzed, setIsMarkingAsAnalyzed] = useState(false);
  const [calculatedIer, setCalculatedIer] = useState(0);
  const [topRisks, setTopRisks] = useState<string[]>(topRiskOptions); // Fallback estático
  const [riskFactors, setRiskFactors] = useState<Array<{ nome: string; donoRisco: string }>>(riskFactorOptions.map(rf => ({ nome: rf, donoRisco: '' }))); // Fallback estático
  const [temasMateriais, setTemasMateriais] = useState<string[]>(temaMaterialOptions); // Fallback estático

  const { control, handleSubmit, reset, watch, setValue, getValues, trigger, formState: { errors } } = useForm<z.infer<typeof analysisSchema>>({
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
        tipoIER: undefined,
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

  // Log dos erros de validação para depuração
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Erros de validação do formulário:", errors);
    }
  }, [errors]);

  // Carrega TopRisks dinamicamente
  useEffect(() => {
    const loadTopRisks = async () => {
      try {
        const dynamicTopRisks = await getTopRiskOptions();
        setTopRisks(dynamicTopRisks);
      } catch (error) {
        console.error('Erro ao carregar TopRisks:', error);
        // Mantém o fallback estático
      }
    };
    loadTopRisks();
  }, []);

  // Carrega RiskFactors dinamicamente
  useEffect(() => {
    const loadRiskFactors = async () => {
      try {
        const dynamicRiskFactors = await getRiskFactorOptions();
        setRiskFactors(dynamicRiskFactors);
      } catch (error) {
        console.error('Erro ao carregar RiskFactors:', error);
        // Mantém o fallback estático
      }
    };
    loadRiskFactors();
  }, []);

  // Carrega Temas Materiais dinamicamente
  useEffect(() => {
    const loadTemasMateriais = async () => {
      try {
        const dynamicTemasMateriais = await getTemasMaterialOptions();
        setTemasMateriais(dynamicTemasMateriais);
      } catch (error) {
        console.error('Erro ao carregar Temas Materiais:', error);
        // Mantém o fallback estático
      }
    };
    loadTemasMateriais();
  }, []);

  const watchedFields = watch([
    "corporateImpact", 
    "organizationalRelevance", 
    "contextualizedProbability", 
    "currentControlCapacity", 
    "containmentTime", 
    "technicalFeasibility"
  ]);

  // Calcula automaticamente X e Y quando os ponderadores mudam
  useEffect(() => {
    const imp = Number(getValues('corporateImpact')) || 0;
    const org = Number(getValues('organizationalRelevance')) || 0;
    const prob = Number(getValues('contextualizedProbability')) || 0;
    const facil = Number(getValues('technicalFeasibility')) || 0;

    // X = média de IMP e ORG
    const calculatedX = (imp + org) / 2;
    // Y = média de PROB e FACIL
    const calculatedY = (prob + facil) / 2;

    setValue('x', Number(calculatedX.toFixed(1)));
    setValue('y', Number(calculatedY.toFixed(1)));
  }, [watchedFields[0], watchedFields[1], watchedFields[2], watchedFields[5], getValues, setValue]);

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

    // Atualiza o Tipo IER dinamicamente
    if (ierRules.length > 0) {
      const classification = getIerClassification(roundedIer, ierRules);
      setValue('tipoIER', classification.label as any);
    }

  }, [watchedFields, setValue, ierRules]);


  useEffect(() => {
    if (!id || id === 'new') {
      setLoading(false);
      return;
    }

    async function fetchRiskData() {
      try {
        setLoading(true);
        
        const [riskResult, rulesResult] = await Promise.all([
          getRiskAnalysisById(id).then(res => res || getIdentifiedRiskById(id)),
          getIerRules()
        ]);

        setIerRules(rulesResult);
        const riskData = riskResult || null;

        if (riskData) {
          setRisk(riskData);
          
          // Garante que o objeto de dados tenha a forma completa do schema de análise
          const completeData = {
            ...{ // Valores padrão para garantir a forma completa
              gerencia: '', categoria: '', taxonomia: '', observacao: '', contexto: '',
              ier: 0, origem: 'Identificação de Risco', tipoIER: undefined, x: 0, y: 0,
              englobador: '', pilar: '', temaMaterial: '', pilarESG: '', geOrigemRisco: '',
              responsavelBowtie: '', horizonteTempo: '', dataAlteracaoCuradoria: '',
              bowtieRealizado: 'Não Realizado', possuiCC: 'Não', urlDoCC: '',
            },
            ...riskData, // Sobrescreve com os dados carregados (seja da análise ou identificação)
          };
          
          // Calcula X e Y automaticamente com os dados carregados
          const imp = Number(completeData.corporateImpact) || 0;
          const org = Number(completeData.organizationalRelevance) || 0;
          const prob = Number(completeData.contextualizedProbability) || 0;
          const facil = Number(completeData.technicalFeasibility) || 0;
          
          completeData.x = Number(((imp + org) / 2).toFixed(1));
          completeData.y = Number(((prob + facil) / 2).toFixed(1));
          
          console.log("Dados completos sendo enviados para o formulário (reset):", completeData);
          console.log("X calculado:", completeData.x, "Y calculado:", completeData.y);
          reset(completeData);
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
    console.log("Dados do formulário no momento da submissão (onSubmit):", data);
    if (!risk) {
        console.error("Tentativa de salvar sem um risco carregado.");
        return;
    }

    setIsSaving(true);
    try {
      // Se o risco já estava 'Analisado', qualquer nova edição o reverte para 'Em Análise'
      const newStatus = risk && 'status' in risk && risk.status === 'Analisado' ? 'Em Análise' : 'Em Análise';

      const analysisData: RiskAnalysis = {
        ...risk,
        ...data,
        tipoIER: data.tipoIER as RiskAnalysis['tipoIER'], // Type assertion
        ier: calculatedIer,
        status: newStatus,
        analysisId: data.topRisk.replace(/[^a-zA-Z0-9]/g, '') || "Default",
        updatedAt: new Date().toISOString(),
        updatedBy: 'current.user@example.com', // TODO: Substituir pelo usuário logado
      };

      await addOrUpdateRiskAnalysis(analysisData);
      console.log("addOrUpdateRiskAnalysis executado com sucesso.");

      toast({
        title: "Análise Salva",
        description: "A análise de risco foi salva e o status atualizado para 'Em Análise'.",
      });
      router.push('/analysis');
    } catch (error) {
      console.error("Erro ao salvar análise:", error);
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar a análise. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      console.log("Finalizando onSubmit.");
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

  // Ajuste de layout: garantir que o formulário ocupe altura mínima e não "corra para cima"
  return (
    <form
      onSubmit={handleSubmit(onSubmit, (formErrors) => {
        console.error("Falha na validação do formulário. Erros:", formErrors);
        toast({
          title: "Erro de Validação",
          description: "Por favor, verifique os campos do formulário. Há erros ou campos obrigatórios não preenchidos.",
          variant: "destructive",
        });
      })}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Análise de Risco</CardTitle>
              <CardDescription>Preencha os campos adicionais para analisar o risco identificado.</CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSaving || isDeleting || isMarkingAsAnalyzed}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                </Button>
                
                {risk && 'status' in risk && risk.status === 'Em Análise' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" variant="destructive" disabled={isSaving || isDeleting || isMarkingAsAnalyzed}>
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                        Excluir Análise
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá permanentemente a análise de risco, e o risco voltará ao status 'Novo' na lista de análise.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Continuar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {risk && 'status' in risk && risk.status === 'Em Análise' && (
                  <Button 
                    type="button" 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleMarkAsAnalyzed} 
                    disabled={isSaving || isDeleting || isMarkingAsAnalyzed}
                  >
                    {isMarkingAsAnalyzed ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    Marcar como Analisado
                  </Button>
                )}

                <Button type="submit" disabled={isSaving || isDeleting || isMarkingAsAnalyzed}>
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
                    <Controller name="riskName" control={control} render={({ field }) => (
                        <div><Label>Risco</Label><Input {...field} /></div>
                    )} />
                    
                    <Controller name="topRisk" control={control} render={({ field }) => (
                        <div><Label>TopRisk Associado</Label>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>
                                {topRisks.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                            </SelectContent>
                        </Select></div>
                    )} />

                    <div className="md:col-span-3">
                        <Controller name="riskFactor" control={control} render={({ field }) => (
                            <div><Label>Fator de Risco</Label>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                    {riskFactors.map(option => <SelectItem key={option.nome} value={option.nome}>{option.nome}</SelectItem>)}
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
                    <Controller name="corporateImpact" control={control} render={({ field }) => (
                        <div><Label>IMP</Label><Input type="number" {...field} className="font-bold text-center"/></div>
                    )} />
                    <Controller name="organizationalRelevance" control={control} render={({ field }) => (
                        <div><Label>ORG</Label><Input type="number" {...field} className="font-bold text-center"/></div>
                    )} />
                    <Controller name="contextualizedProbability" control={control} render={({ field }) => (
                        <div><Label>PROB</Label><Input type="number" {...field} className="font-bold text-center"/></div>
                    )} />
                    <Controller name="currentControlCapacity" control={control} render={({ field }) => (
                        <div><Label>CTRL</Label><Input type="number" {...field} className="font-bold text-center"/></div>
                    )} />
                    <Controller name="containmentTime" control={control} render={({ field }) => (
                        <div><Label>TEMPO</Label><Input type="number" {...field} className="font-bold text-center"/></div>
                    )} />
                    <Controller name="technicalFeasibility" control={control} render={({ field }) => (
                        <div><Label>FACIL</Label><Input type="number" {...field} className="font-bold text-center"/></div>
                    )} />
                    
                    {/* Calculated and Editable */}
                    <div><Label>IER</Label><Input value={calculatedIer} readOnly className="bg-blue-100 dark:bg-blue-900/50 font-bold text-center text-lg"/></div>
                    <div><Label>Origem</Label><Input value="Identificação de Risco" readOnly className="bg-muted/60"/></div>
                    
                    <Controller name="tipoIER" control={control} render={({ field }) => (
                        <div>
                            <Label>Tipo IER</Label>
                            <Input {...field} value={field.value ?? ''} readOnly className="bg-muted/60 font-bold" />
                        </div>
                    )} />
                    <Controller name="x" control={control} render={({ field }) => (
                        <div>
                            <Label>X (Auto)</Label>
                            <Input type="number" {...field} readOnly className="bg-green-100 dark:bg-green-900/50 font-bold text-center" title="Calculado automaticamente: média de IMP e ORG" />
                        </div>
                    )} />
                    <Controller name="y" control={control} render={({ field }) => (
                        <div>
                            <Label>Y (Auto)</Label>
                            <Input type="number" {...field} readOnly className="bg-green-100 dark:bg-green-900/50 font-bold text-center" title="Calculado automaticamente: média de PROB e FACIL" />
                        </div>
                    )} />
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
                                {temasMateriais.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
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
                    <Controller 
                      name="responsavelBowtie" 
                      control={control} 
                      render={({ field }) => (
                        <div>
                          <Label>Responsável pelo Bowtie</Label>
                          <UserAutocomplete 
                            value={field.value} 
                            onSelect={field.onChange}
                            placeholder="Buscar usuário..."
                          />
                        </div>
                      )} 
                    />
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
        <CardFooter className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSaving || isDeleting || isMarkingAsAnalyzed}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          {risk && 'status' in risk && risk.status !== 'Novo' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" disabled={isSaving || isDeleting || isMarkingAsAnalyzed}>
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                  Excluir Análise
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente a análise de risco, e o risco voltará ao status 'Novo' na lista de análise.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Continuar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {/* Botão Marcar como Analisado também no rodapé */}
          {risk && 'status' in risk && risk.status === 'Em Análise' && (
            <Button
              type="button"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleMarkAsAnalyzed}
              disabled={isSaving || isDeleting || isMarkingAsAnalyzed}
            >
              {isMarkingAsAnalyzed ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Marcar como Analisado
            </Button>
          )}
          <Button type="submit" disabled={isSaving || isDeleting || isMarkingAsAnalyzed}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar Análise
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
