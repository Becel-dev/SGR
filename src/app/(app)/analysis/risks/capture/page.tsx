'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon, Siren, Activity, BarChart3, Briefcase, ClipboardList } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useHideDocumentScrollbar } from '@/hooks/use-hide-document-scrollbar';


import { getTopRiskOptions, getRiskFactorOptions, getTemasMaterialOptions } from '@/lib/form-options';
import { getRisksForAnalysis } from '@/lib/azure-table-storage';
import { ProtectedRoute } from '@/components/auth/protected-route';

// TopRisks dinâmicos serão carregados do Azure Storage
// RiskFactors dinâmicos serão carregados do Azure Storage - removido array estático

const gerenciaOptions = [
    'Operação', 'Tecnologia', 'Ambiental', 'GesMud', 'Compliance',
    'Regulatório', 'Suprimentos', 'Jurídico', 'Comercial', 'DHO',
    'Expansão', 'Seg. Trabalho', 'Cultura e Comunicação'
];

const categoriaOptions = [
    'Operacional', 'Tecnologia', 'Compliance', 'Regulatório',
    'Estratégico', 'Financeiro', 'Sustentabilidade', 'Não Aplicável'
];

const origemOptions = ['Técnico', 'Negócio'];
const tipoIerOptions = ['Crítico', 'Prioritário', 'Gerenciável', 'Aceitável'];
const bowtieRealizadoOptions = ['Realizado', 'Não Realizado', 'Em Andamento'];
const pilarOptions = ['G - Governança', 'E - Ambiente', 'S - Social'];
const englobadorOptions = ['Negócio', 'Operacional'];
const horizonteTempoOptions = ['Curto Prazo', 'Longo Prazo', 'Médio Prazo'];
const geOrigemRiscoOptions = [
    'Controles Internos',
    'Tecnologia e Segurança da Informação',
    'Segurança e Riscos Operacionais',
    'Material Rodante',
    'Meio Ambiente',
    'Expansão - Portos e Terminais',
    'EXP - Malha Paulista',
    'Expansão - FMT',
    'Financeiro',
    'Terminais',
    'Segurança do Trabalho',
    'Operação',
    'Seguros',
    'Via Permanente',
    'Jurídico',
    'Regulatório',
    'Manutenção - CIM',
    'Segurança Pessoal'
];

const contextoOptions = ['WIP', '100%'];


const Section = ({ title, children, icon: Icon, defaultOpen = false }: { title: string, children: React.ReactNode, icon?: React.ElementType, defaultOpen?: boolean }) => (
    <Accordion type="single" collapsible defaultValue={defaultOpen ? "item-1" : ""}>
        <AccordionItem value="item-1" className="border rounded-lg">
             <AccordionTrigger className="bg-muted/50 px-4 py-2 rounded-t-lg">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    {Icon && <Icon className="h-5 w-5 text-primary" />}
                    {title}
                </h3>
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {children}
                </div>
            </AccordionContent>
        </AccordionItem>
    </Accordion>
)

const Field = ({ label, children, className }: {label: string, children: React.ReactNode, className?: string}) => (
    <div className={cn("space-y-2", className)}>
        <Label>{label}</Label>
        {children}
    </div>
)

export default function CaptureRiskPage() {
    useHideDocumentScrollbar();
    const searchParams = useSearchParams();
    const riskId = searchParams ? searchParams.get('id') : null;
    const isEditing = !!riskId;
    
    return (
        <ProtectedRoute 
            module="analise" 
            action={isEditing ? 'edit' : 'create'}
        >
            <CaptureRiskContent />
        </ProtectedRoute>
    );
}

function CaptureRiskContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const riskId = searchParams ? searchParams.get('id') : null;
    const isEditing = !!riskId;
    const [dataAlteracaoCuradoria, setDataAlteracaoCuradoria] = useState<Date>();
    const [topRisks, setTopRisks] = useState<string[]>([]); // Estado para TopRisks dinâmicos
    const [riskFactors, setRiskFactors] = useState<Array<{ nome: string; donoRisco: string }>>([]); // Carregado dinamicamente
    const [temasMateriais, setTemasMateriais] = useState<string[]>([]); // Carregado dinamicamente
    const [isLoadingRisk, setIsLoadingRisk] = useState(false);
    const [isLoadingOptions, setIsLoadingOptions] = useState(true); // Novo estado para controlar carregamento de opções

    // Carrega TopRisks dinamicamente
    useEffect(() => {
        const loadTopRisks = async () => {
            try {
                const dynamicTopRisks = await getTopRiskOptions();
                setTopRisks(dynamicTopRisks);
            } catch (error) {
                console.error('Erro ao carregar TopRisks:', error);
                // Fallback vazio em caso de erro
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
                setIsLoadingOptions(false);
            } catch (error) {
                console.error('Erro ao carregar RiskFactors:', error);
                setRiskFactors([{ nome: '⚠️ ERRO: Não foi possível carregar fatores de risco', donoRisco: '' }]);
                setIsLoadingOptions(false);
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
            }
        };
        loadTemasMateriais();
    }, []);

    // Carrega dados do risco para edição
    useEffect(() => {
        const loadRiskData = async () => {
            if (!riskId) return;
            
            // Aguarda as opções serem carregadas antes de continuar
            if (isLoadingOptions) {
                console.log('⏳ Aguardando carregamento de opções...');
                return;
            }
            
            console.log('🔄 Carregando dados para edição, riskId:', riskId);
            console.log('📊 RiskFactors disponíveis:', riskFactors.length);
            console.log('📋 Lista de RiskFactors:', riskFactors);
            
            setIsLoadingRisk(true);
            try {
                const risks = await getRisksForAnalysis();
                const riskData = risks.find((r: any) => r.id === riskId);
                
                if (riskData) {
                    console.log('✅ Dados do risco encontrados:', {
                        id: riskData.id,
                        riskName: riskData.riskName,
                        topRisk: riskData.topRisk,
                        riskFactor: riskData.riskFactor
                    });

                    // Aguarda um pouco para garantir que os elementos estejam renderizados
                    setTimeout(() => {
                        // Preenche campos básicos
                        const idField = document.querySelector('[name="id"]') as HTMLInputElement;
                        if (idField) idField.value = riskData.id || '';
                        
                        const riscoField = document.querySelector('[name="risco"]') as HTMLInputElement;
                        if (riscoField) riscoField.value = riskData.riskName || '';
                        
                        // Preenche selects
                        const topRiskSelect = document.querySelector('[name="topRiskAssociado"]') as HTMLSelectElement;
                        if (topRiskSelect) {
                            topRiskSelect.value = riskData.topRisk || '';
                            console.log('📝 TopRisk preenchido:', riskData.topRisk);
                        }
                        
                        const fatorRiscoSelect = document.querySelector('[name="fatorDeRisco"]') as HTMLSelectElement;
                        if (fatorRiscoSelect) {
                            console.log('🔍 Tentando preencher RiskFactor com:', riskData.riskFactor);
                            console.log('🎯 Opções disponíveis no select:', Array.from(fatorRiscoSelect.options).map(opt => ({ value: opt.value, text: opt.text })));

                            // If the saved value is not present in the loaded options, append it to the runtime state
                            if (riskData.riskFactor && !riskFactors.some(rf => rf.nome === riskData.riskFactor)) {
                                console.log('➕ Saved risk factor not found in loaded options. Appending to state:', riskData.riskFactor);
                                setRiskFactors(prev => [...prev, { nome: riskData.riskFactor, donoRisco: '' }]);

                                // As a DOM fallback (in case the Select component has already rendered), add an option element directly
                                try {
                                    const opt = document.createElement('option');
                                    opt.value = riskData.riskFactor;
                                    opt.text = riskData.riskFactor;
                                    fatorRiscoSelect.appendChild(opt);
                                    console.log('DOM fallback: option appended to select for saved risk factor');
                                } catch (domErr) {
                                    console.warn('Could not append DOM option fallback:', domErr);
                                }
                            }

                            // Verifica se o valor existe nas opções
                            const optionExists = Array.from(fatorRiscoSelect.options).some(opt => opt.value === riskData.riskFactor);
                            console.log('✓ Opção existe no select?', optionExists);

                            fatorRiscoSelect.value = riskData.riskFactor || '';
                            console.log('📝 RiskFactor preenchido. Valor atual do select:', fatorRiscoSelect.value);
                        }
                        
                        const observacaoField = document.querySelector('[name="observacao"]') as HTMLTextAreaElement;
                        if (observacaoField) observacaoField.value = riskData.observacao || '';
                        
                        // Preenche valores numéricos mapeados corretamente
                        setImp(riskData.corporateImpact || 0);
                        setOrg(riskData.organizationalRelevance || 0);
                        setProb(riskData.contextualizedProbability || 0);
                        setCtrl(riskData.currentControlCapacity || 0);
                        setTempo(riskData.containmentTime || 0);
                        setFacil(riskData.technicalFeasibility || 0);
                    }, 1000); // Aumentando o delay para garantir que tudo foi renderizado
                }
            } catch (error) {
                console.error('❌ Erro ao carregar dados do risco:', error);
            } finally {
                setIsLoadingRisk(false);
            }
        };

        loadRiskData();
    }, [riskId, isLoadingOptions, riskFactors, topRisks]); // Adiciona isLoadingOptions como dependência

    // States for IER calculation
    const [imp, setImp] = useState(0);
    const [org, setOrg] = useState(0);
    const [prob, setProb] = useState(0);
    const [ctrl, setCtrl] = useState(0);
    const [tempo, setTempo] = useState(0);
    const [facil, setFacil] = useState(0);
    const [ier, setIer] = useState(0);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);

    // Calculate IER whenever a dependency changes
    useEffect(() => {
        const impWeight = 0.25;
        const orgWeight = 0.10;
        const probWeight = 0.15;
        const ctrlWeight = 0.20;
        const tempoWeight = 0.15;
        const facilWeight = 0.15;

        const calculatedIer = (
            (imp * impWeight) +
            (org * orgWeight) +
            (prob * probWeight) +
            (ctrl * ctrlWeight) +
            (tempo * tempoWeight) +
            (facil * facilWeight)
        ) * 100;

        setIer(Math.round(calculatedIer));
    }, [imp, org, prob, ctrl, tempo, facil]);

    // Calculate X and Y automatically
    useEffect(() => {
        // X = média de IMP e ORG
        const calculatedX = (Number(imp) + Number(org)) / 2;
        setX(calculatedX);
        
        // Y = média de PROB e FACIL
        const calculatedY = (Number(prob) + Number(facil)) / 2;
        setY(calculatedY);
    }, [imp, org, prob, facil]);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Siren />
            Análise de Risco
        </CardTitle>
        <CardDescription>
          Preencha os campos abaixo para analisar um risco.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          
          <Section title="Identificação e Contexto" icon={Briefcase} defaultOpen>
            <Field label="ID"><Input name="id" placeholder="Ex: 1" /></Field>
            <Field label="Gerência">
              <Select name="gerencia">
                <SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger>
                <SelectContent>
                  {gerenciaOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Risco (Nome)" className="sm:col-span-2"><Input name="risco" placeholder="Nome do Risco" /></Field>
            
            <Field label="TopRisk Associado" className="sm:col-span-2">
                <Select name="topRiskAssociado">
                    <SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger>
                    <SelectContent>
                        {topRisks.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                </Select>
            </Field>

            <Field label="Fator de Risco" className="sm:col-span-2">
              <Select name="fatorDeRisco">
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingOptions ? "Carregando..." : (riskFactors.length === 0 ? "Nenhum fator de risco encontrado" : "Selecione...")} />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingOptions ? (
                    <SelectItem value="_loading" disabled>Carregando fatores de risco...</SelectItem>
                  ) : riskFactors.length === 0 ? (
                    <SelectItem value="_empty" disabled>⚠️ Nenhum fator de risco dinâmico encontrado</SelectItem>
                  ) : (
                    riskFactors.map(o => <SelectItem key={o.nome} value={o.nome}>{o.nome}</SelectItem>)
                  )}
                </SelectContent>
              </Select>
            </Field>
            
            <Field label="Taxonomia (Código)"><Input name="taxonomia" placeholder="RISK-CR-Negócio-1" /></Field>
            <Field label="Categoria">
                <Select name="categoria">
                    <SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger>
                    <SelectContent>
                        {categoriaOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                </Select>
            </Field>
            <Field label="Contexto">
                <Select name="contexto">
                    <SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger>
                    <SelectContent>
                        {contextoOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                </Select>
            </Field>
            <Field label="Observação" className="sm:col-span-2"><Textarea name="observacao" /></Field>
          </Section>
          
          <Section title="Análise e Classificação" icon={BarChart3}>
                <Field label="IMP"><Input name="imp" type="number" value={imp} onChange={e => setImp(Number(e.target.value))} /></Field>
                <Field label="ORG"><Input name="org" type="number" value={org} onChange={e => setOrg(Number(e.target.value))} /></Field>
                <Field label="PROB"><Input name="prob" type="number" value={prob} onChange={e => setProb(Number(e.target.value))} /></Field>
                <Field label="CTRL"><Input name="ctrl" type="number" value={ctrl} onChange={e => setCtrl(Number(e.target.value))} /></Field>
                <Field label="TEMPO"><Input name="tempo" type="number" value={tempo} onChange={e => setTempo(Number(e.target.value))} /></Field>
                <Field label="FACIL"><Input name="facil" type="number" value={facil} onChange={e => setFacil(Number(e.target.value))} /></Field>
                <Field label="IER"><Input name="ier" type="number" value={ier} disabled placeholder="Calculado" /></Field>
                <Field label="Origem">
                    <Select name="origem">
                        <SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger>
                        <SelectContent>
                            {origemOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </Field>
                <Field label="Tipo IER">
                    <Select name="tipoIER">
                        <SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger>
                        <SelectContent>
                            {tipoIerOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </Field>
                <Field label="X (Auto)">
                    <Input name="x" type="number" value={x.toFixed(1)} disabled className="bg-green-100 dark:bg-green-900/50 font-bold text-center" title="Calculado automaticamente: média de IMP e ORG" />
                </Field>
                <Field label="Y (Auto)">
                    <Input name="y" type="number" value={y.toFixed(1)} disabled className="bg-green-100 dark:bg-green-900/50 font-bold text-center" title="Calculado automaticamente: média de PROB e FACIL" />
                </Field>
          </Section>

          <Section title="ESG e Governança" icon={ClipboardList}>
              <Field label="Englobador">
                <Select name="englobador">
                    <SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger>
                    <SelectContent>
                        {englobadorOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                </Select>
              </Field>
              <Field label="Pilar">
                <Select name="pilar">
                    <SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger>
                    <SelectContent>
                        {pilarOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                </Select>
              </Field>
              <Field label="Tema Material" className="sm:col-span-2">
                <Select name="temaMaterial">
                    <SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger>
                    <SelectContent>
                        {temasMateriais.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                </Select>
              </Field>
              <Field label="GE de Origem do Risco" className="sm:col-span-2">
                <Select name="geOrigemRisco">
                    <SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger>
                    <SelectContent>
                        {geOrigemRiscoOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                </Select>
              </Field>
          </Section>

          <Section title="Gestão e Prazos" icon={Activity}>
            <Field label="Status do Risco">
                <Select name="status"><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Novo">Novo</SelectItem>
                        <SelectItem value="Em Análise">Em Análise</SelectItem>
                        <SelectItem value="Analisado">Analisado</SelectItem>
                    </SelectContent>
                </Select>
            </Field>
            <Field label="Responsável pelo Bowtie"><Input name="responsavelBowtie" /></Field>
            <Field label="Horizonte Tempo">
                <Select name="horizonteTempo">
                    <SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger>
                    <SelectContent>
                        {horizonteTempoOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                </Select>
            </Field>
            <Field label="Data Alteração Curadoria">
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataAlteracaoCuradoria ? <span>{dataAlteracaoCuradoria.toLocaleDateString()}</span> : <span>Selecione uma data</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dataAlteracaoCuradoria} onSelect={setDataAlteracaoCuradoria}/></PopoverContent>
                </Popover>
            </Field>
          </Section>

           <Section title="Controles e Bowtie" icon={ClipboardList}>
              <Field label="Bowtie Realizado">
                <Select name="bowtieRealizado"><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                        {bowtieRealizadoOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                </Select>
              </Field>
              <Field label="Possui CC">
                 <Select name="possuiCC"><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Sim">Sim</SelectItem>
                        <SelectItem value="Não">Não</SelectItem>
                    </SelectContent>
                </Select>
              </Field>
              <Field label="URL do CC" className="sm:col-span-2"><Input name="urlDoCC" /></Field>
          </Section>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push('/risks')}>Cancelar</Button>
        <Button>Salvar Risco</Button>
      </CardFooter>
    </Card>
  );
}
