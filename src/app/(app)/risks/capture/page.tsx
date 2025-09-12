

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
import { Calendar as CalendarIcon, DollarSign, Siren, Target, Shield, Activity, BarChart3, Briefcase, Building, ChevronDown, CircleHelp, ClipboardList, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


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
    const router = useRouter();
    const [identificationDate, setIdentificationDate] = useState<Date>();
    const [lastReviewDate, setLastReviewDate] = useState<Date>();
    const [nextReviewDate, setNextReviewDate] = useState<Date>();
    const [evaluationDate, setEvaluationDate] = useState<Date>();
    
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Siren />
            Análise de Risco
        </CardTitle>
        <CardDescription>
          Preencha os campos abaixo para registrar um novo risco.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          
          <Section title="Identificação e Contexto" icon={Briefcase} defaultOpen>
            <Field label="ID"><Input name="id" placeholder="Ex: 1" /></Field>
            <Field label="Risco (Título)" className="sm:col-span-2"><Input name="risco" placeholder="Título resumido do risco" /></Field>
            <Field label="Responsável"><Input name="responsavelPeloRisco" /></Field>
            <Field label="Descrição do Risco" className="sm:col-span-4"><Textarea name="descricaoDoRisco" rows={3} placeholder="Descreva o risco em detalhes" /></Field>
            <Field label="Diretoria"><Input name="diretoria" /></Field>
            <Field label="Gerência"><Input name="gerencia" /></Field>
            <Field label="Processo"><Input name="processo" /></Field>
            <Field label="Processo Afetado"><Input name="processoAfetado" /></Field>
            <Field label="Causa Raiz" className="sm:col-span-2"><Textarea name="causaRaizDoRisco" rows={3} placeholder="Descreva a causa principal" /></Field>
            <Field label="Consequência" className="sm:col-span-2"><Textarea name="consequenciaDoRisco" rows={3} placeholder="Descreva a principal consequência" /></Field>
             <Field label="Data de Identificação">
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {identificationDate ? <span>{identificationDate.toLocaleDateString()}</span> : <span>Selecione uma data</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={identificationDate} onSelect={setIdentificationDate} initialFocus/></PopoverContent>
                </Popover>
            </Field>
          </Section>

          <Section title="Categorização" icon={ClipboardList}>
                <Field label="Origem do Risco">
                    <Select name="origemDoRisco">
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Técnico">Técnico</SelectItem>
                            <SelectItem value="Negócio">Negócio</SelectItem>
                            <SelectItem value="Externo">Externo</SelectItem>
                            <SelectItem value="Interno">Interno</SelectItem>
                            <SelectItem value="Regulatório">Regulatório</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
                <Field label="Tipo de Risco"><Input name="tipoDeRisco" /></Field>
                <Field label="Categoria do Risco"><Input name="categoriaDoRisco" /></Field>
                <Field label="Categoria (MP)"><Input name="categoriaMP" /></Field>
                <Field label="Top Risk Associado"><Input name="topRiskAssociado" /></Field>
                <Field label="Horizonte"><Input name="horizonte" /></Field>
                <Field label="Fator de Risco"><Input name="fatorDeRisco" /></Field>
                <Field label="Tronco"><Input name="tronco" /></Field>
                <Field label="Englobado"><Input name="englobado" /></Field>
          </Section>
          
          <Section title="Análise de Risco Inerente" icon={BarChart3}>
                <Field label="Probabilidade">
                    <Select name="probabilidadeInerente"><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Raro">Raro</SelectItem><SelectItem value="Improvável">Improvável</SelectItem><SelectItem value="Possível">Possível</SelectItem>
                            <SelectItem value="Provável">Provável</SelectItem><SelectItem value="Quase Certo">Quase Certo</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
                <Field label="Impacto">
                    <Select name="impactoInerente"><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Insignificante">Insignificante</SelectItem><SelectItem value="Menor">Menor</SelectItem><SelectItem value="Moderado">Moderado</SelectItem>
                            <SelectItem value="Maior">Maior</SelectItem><SelectItem value="Catastrófico">Catastrófico</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
                <Field label="Nível de Risco Inerente (Calculado)">
                    <Input name="nivelDeRiscoInerente" disabled />
                </Field>
          </Section>

          <Section title="Tratamento e Controles" icon={Shield}>
            <Field label="Estratégia (Ação)"><Input name="estrategia" /></Field>
            <Field label="Descrição do Controle" className="sm:col-span-2"><Textarea name="descricaoDoControle" placeholder="Descreva o controle aplicado" /></Field>
            <Field label="Possui Controle Central (CC)?">
                <Select name="possuiCC"><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent><SelectItem value="Sim">Sim</SelectItem><SelectItem value="Não">Não</SelectItem></SelectContent>
                </Select>
            </Field>
            <Field label="URL do CC"><Input name="urlDoCC" /></Field>
            <Field label="Status do Controle"><Input name="statusControle" /></Field>
          </Section>

          <Section title="Análise de Risco Residual" icon={TrendingUp}>
                <Field label="Probabilidade">
                    <Select name="probabilidadeResidual"><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Raro">Raro</SelectItem><SelectItem value="Improvável">Improvável</SelectItem><SelectItem value="Possível">Possível</SelectItem>
                            <SelectItem value="Provável">Provável</SelectItem><SelectItem value="Quase Certo">Quase Certo</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
                <Field label="Impacto">
                    <Select name="impactoResidual"><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Insignificante">Insignificante</SelectItem><SelectItem value="Menor">Menor</SelectItem><SelectItem value="Moderado">Moderado</SelectItem>
                            <SelectItem value="Maior">Maior</SelectItem><SelectItem value="Catastrófico">Catastrófico</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
                <Field label="Nível de Risco Residual (Calculado)">
                    <Input name="nivelDeRiscoResidual" disabled />
                </Field>
          </Section>

          <Section title="Gestão e Monitoramento" icon={Activity}>
            <Field label="Plano de Ação"><Input name="planoDeAcao" /></Field>
            <Field label="Status do Risco">
                <Select name="statusDoRisco"><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Aberto">Aberto</SelectItem><SelectItem value="Em Tratamento">Em Tratamento</SelectItem><SelectItem value="Fechado">Fechado</SelectItem><SelectItem value="Mitigado">Mitigado</SelectItem>
                    </SelectContent>
                </Select>
            </Field>
            <Field label="Data da Última Revisão">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {lastReviewDate ? <span>{lastReviewDate.toLocaleDateString()}</span> : <span>Selecione uma data</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={lastReviewDate} onSelect={setLastReviewDate} /></PopoverContent>
                </Popover>
            </Field>
            <Field label="Próxima Revisão">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {nextReviewDate ? <span>{nextReviewDate.toLocaleDateString()}</span> : <span>Selecione uma data</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={nextReviewDate} onSelect={setNextReviewDate}/></PopoverContent>
                </Popover>
            </Field>
             <Field label="Data da Avaliação">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {evaluationDate ? <span>{evaluationDate.toLocaleDateString()}</span> : <span>Selecione uma data</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={evaluationDate} onSelect={setEvaluationDate} /></PopoverContent>
                </Popover>
            </Field>
             <Field label="Contexto (%)"><Input name="contexto" /></Field>
             <Field label="Observação"><Textarea name="observacao" /></Field>
             <Field label="Bowtie">
                <Select name="bowtie"><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent><SelectItem value="Sim">Sim</SelectItem><SelectItem value="Não">Não</SelectItem></SelectContent>
                </Select>
            </Field>
          </Section>

           <Section title="Indicadores e ESG" icon={Users}>
                <Field label="Pilar"><Input name="pilar" /></Field>
                <Field label="Pilar ESG"><Input name="pilarESG" /></Field>
                <Field label="Indicador"><Input name="indicador" /></Field>
                <Field label="Sub-tema"><Input name="subtema" /></Field>
                <Field label="GE"><Input name="ge" /></Field>
                <Field label="GR"><Input name="gr" /></Field>
            </Section>

            <Section title="Pontuações e Classificações (Interno)" icon={CircleHelp}>
                <Field label="Impacto (orig)" className="text-muted-foreground"><Input name="orig" type="number" /></Field>
                <Field label="PROB"><Input name="prob" type="number" /></Field>
                <Field label="CTRL"><Input name="ctrl" type="number" /></Field>
                <Field label="TEMPO"><Input name="tempo" type="number" /></Field>
                <Field label="FACIL"><Input name="facil" type="number" /></Field>
                <Field label="ELEV"><Input name="elev" type="number" /></Field>
                <Field label="IER"><Input name="ier" type="number" /></Field>
                <Field label="V"><Input name="v" type="number" /></Field>
                <Field label="D"><Input name="d" type="number" /></Field>
                <Field label="G"><Input name="g" type="number" /></Field>
                <Field label="U"><Input name="u" type="number" /></Field>
                <Field label="T (Score)"><Input name="t_score" type="number" /></Field>
                <Field label="I (Score)"><Input name="i_score" type="number" /></Field>
                <Field label="OredsX"><Input name="oredsX" type="number" /></Field>
                <Field label="T (Rating)"><Input name="t_rating" type="number" /></Field>
                <Field label="Filho">
                  <Select name="filho"><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent><SelectItem value="Sim">Sim</SelectItem><SelectItem value="Não">Não</SelectItem></SelectContent>
                  </Select>
                </Field>
                <Field label="Riscos Aceitáveis">
                   <Select name="riscosAceitaveis"><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                       <SelectContent><SelectItem value="sim">Sim</SelectItem><SelectItem value="não">Não</SelectItem></SelectContent>
                   </Select>
                </Field>
                <Field label="Riscos Não Aceitáveis">
                   <Select name="riscosNaoAceitaveis"><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                       <SelectContent><SelectItem value="sim">Sim</SelectItem><SelectItem value="não">Não</SelectItem></SelectContent>
                   </Select>
                </Field>
                <Field label="Riscos Mix">
                   <Select name="riscosMix"><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                       <SelectContent><SelectItem value="sim">Sim</SelectItem><SelectItem value="não">Não</SelectItem></SelectContent>
                   </Select>
                </Field>
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

