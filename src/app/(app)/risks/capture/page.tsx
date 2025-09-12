

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
            <Field label="Risco (Título)" className="sm:col-span-3"><Input name="risco" placeholder="Título resumido do risco" /></Field>
            <Field label="Descrição do Risco" className="sm:col-span-4"><Textarea name="descricaoDoRisco" rows={3} placeholder="Descreva o risco em detalhes" /></Field>
            <Field label="Diretoria"><Input name="diretoria" /></Field>
            <Field label="Gerência"><Input name="gerencia" /></Field>
            <Field label="Processo"><Input name="processo" /></Field>
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
            <Field label="Causa Raiz" className="sm:col-span-2"><Textarea name="causaRaizDoRisco" rows={3} placeholder="Descreva a causa principal" /></Field>
            <Field label="Consequência" className="sm:col-span-2"><Textarea name="consequenciaDoRisco" rows={3} placeholder="Descreva a principal consequência" /></Field>
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
                <Field label="Processo Afetado"><Input name="processoAfetado" /></Field>
          </Section>
          
          <Section title="Análise de Risco (Inerente e Residual)" icon={BarChart3}>
                <Field label="Probabilidade Inerente">
                    <Select name="probabilidadeInerente"><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Raro">Raro</SelectItem><SelectItem value="Improvável">Improvável</SelectItem><SelectItem value="Possível">Possível</SelectItem>
                            <SelectItem value="Provável">Provável</SelectItem><SelectItem value="Quase Certo">Quase Certo</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
                <Field label="Impacto Inerente">
                    <Select name="impactoInerente"><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Insignificante">Insignificante</SelectItem><SelectItem value="Menor">Menor</SelectItem><SelectItem value="Moderado">Moderado</SelectItem>
                            <SelectItem value="Maior">Maior</SelectItem><SelectItem value="Catastrófico">Catastrófico</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
                <Field label="Nível de Risco Inerente"><Input name="nivelDeRiscoInerente" disabled placeholder="Calculado" /></Field>
                <Field label="Probabilidade Residual">
                    <Select name="probabilidadeResidual"><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Raro">Raro</SelectItem><SelectItem value="Improvável">Improvável</SelectItem><SelectItem value="Possível">Possível</SelectItem>
                            <SelectItem value="Provável">Provável</SelectItem><SelectItem value="Quase Certo">Quase Certo</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
                <Field label="Impacto Residual">
                    <Select name="impactoResidual"><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Insignificante">Insignificante</SelectItem><SelectItem value="Menor">Menor</SelectItem><SelectItem value="Moderado">Moderado</SelectItem>
                            <SelectItem value="Maior">Maior</SelectItem><SelectItem value="Catastrófico">Catastrófico</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
                <Field label="Nível de Risco Residual"><Input name="nivelDeRiscoResidual" disabled placeholder="Calculado" /></Field>
          </Section>

          <Section title="Tratamento e Monitoramento" icon={Activity}>
            <Field label="Estratégia (Ação)"><Input name="estrategia" /></Field>
            <Field label="Descrição do Controle" className="sm:col-span-3"><Textarea name="descricaoDoControle" placeholder="Descreva o controle aplicado" /></Field>
            <Field label="Status do Risco">
                <Select name="statusDoRisco"><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Aberto">Aberto</SelectItem><SelectItem value="Em Tratamento">Em Tratamento</SelectItem><SelectItem value="Fechado">Fechado</SelectItem><SelectItem value="Mitigado">Mitigado</SelectItem>
                    </SelectContent>
                </Select>
            </Field>
            <Field label="Plano de Ação"><Input name="planoDeAcao" /></Field>
            <Field label="Responsável"><Input name="responsavelPeloRisco" /></Field>
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
          </Section>

          <Section title="Outras Classificações" icon={ClipboardList}>
              <Field label="Top Risk Associado"><Input name="topRiskAssociado" /></Field>
              <Field label="Fator de Risco"><Input name="fatorDeRisco" /></Field>
              <Field label="Pilar"><Input name="pilar" /></Field>
              <Field label="Pilar ESG"><Input name="pilarESG" /></Field>
              <Field label="Contexto"><Input name="contexto" /></Field>
              <Field label="Bowtie"><Input name="bowtie" /></Field>
              <Field label="Observação"><Textarea name="observacao" /></Field>
              <Field label="Possui CC"><Input name="possuiCC" /></Field>
              <Field label="URL do CC"><Input name="urlDoCC" /></Field>
              <Field label="Status do Controle"><Input name="statusControle" /></Field>
              <Field label="Horizonte"><Input name="horizonte" /></Field>
              <Field label="Englobado"><Input name="englobado" /></Field>
              <Field label="Tronco"><Input name="tronco" /></Field>
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
