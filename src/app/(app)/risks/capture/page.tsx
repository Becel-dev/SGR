

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
    const [criadoDate, setCriadoDate] = useState<Date>();
    const [modificadoDate, setModificadoDate] = useState<Date>();
    const [dataAlteracaoCuradoria, setDataAlteracaoCuradoria] = useState<Date>();
    
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
            <Field label="Gerência"><Input name="gerencia" /></Field>
            <Field label="Risco (Nome)" className="sm:col-span-2"><Input name="risco" placeholder="Nome do Risco" /></Field>
            <Field label="TopRisk Associado" className="sm:col-span-2"><Input name="topRiskAssociado" /></Field>
            <Field label="Fator de Risco" className="sm:col-span-2"><Input name="fatorDeRisco" /></Field>
            <Field label="Taxonomia (Código)"><Input name="taxonomia" placeholder="RISK-CR-Negócio-1" /></Field>
            <Field label="Categoria"><Input name="categoriaDoRisco" placeholder="RISK-CR-Negócio"/></Field>
            <Field label="Contexto" className="sm:col-span-2"><Textarea name="contexto" /></Field>
            <Field label="Observação" className="sm:col-span-2"><Textarea name="observacao" /></Field>
          </Section>
          
          <Section title="Análise e Classificação" icon={BarChart3}>
                <Field label="IMP"><Input name="imp" type="number" /></Field>
                <Field label="ORG"><Input name="org" type="number" /></Field>
                <Field label="PROB"><Input name="prob" type="number" /></Field>
                <Field label="CTRL"><Input name="ctrl" type="number" /></Field>
                <Field label="TEMPO"><Input name="tempo" type="number" /></Field>
                <Field label="FACIL"><Input name="facil" type="number" /></Field>
                <Field label="IER"><Input name="ier" type="number" disabled placeholder="Calculado" /></Field>
                <Field label="Origem"><Input name="origem" /></Field>
                <Field label="Tipo IER"><Input name="tipoIER" /></Field>
                <Field label="X"><Input name="x" /></Field>
                <Field label="Y"><Input name="y" /></Field>
          </Section>

          <Section title="ESG e Governança" icon={ClipboardList}>
              <Field label="Englobador"><Input name="englobador" /></Field>
              <Field label="Pilar"><Input name="pilar" /></Field>
              <Field label="Pilar ESG"><Input name="pilarESG" /></Field>
              <Field label="Tema Material"><Input name="temaMaterial" /></Field>
              <Field label="GE de Origem do Risco"><Input name="geOrigemRisco" /></Field>
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
            <Field label="Horizonte Tempo"><Input name="horizonteTempo" /></Field>
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
            <Field label="Criado">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {criadoDate ? <span>{criadoDate.toLocaleDateString()}</span> : <span>Selecione uma data</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={criadoDate} onSelect={setCriadoDate} initialFocus/></PopoverContent>
                </Popover>
            </Field>
            <Field label="Criado Por"><Input name="criadoPor" /></Field>
            <Field label="Modificado">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {modificadoDate ? <span>{modificadoDate.toLocaleDateString()}</span> : <span>Selecione uma data</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={modificadoDate} onSelect={setModificadoDate} /></PopoverContent>
                </Popover>
            </Field>
            <Field label="Modificado Por"><Input name="modificadoPor" /></Field>
          </Section>

           <Section title="Controles e Bowtie" icon={ClipboardList}>
              <Field label="Bowtie Realizado">
                <Select name="bowtieRealizado"><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Sim">Sim</SelectItem>
                        <SelectItem value="Não">Não</SelectItem>
                        <SelectItem value="Realizado">Realizado</SelectItem>
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
