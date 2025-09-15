

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


const topRiskOptions = [
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
    'Risco 11. Gestão de Mudança'
];

const riskFactorOptions = [
    '1.1 Paralisação e/ou indisponibilidade operacional por vandalismo, greve ou manifestação',
    '1.2 Limitação de capacidade operacional.',
    '1.3 Paralização e/ou indisponibilidade operacional causado por acidentes',
    '1.4 Ausência de plano de manutenção preventivo estruturado',
    '2.1 Performance dos contratos chaves.',
    '2.2 Comprometimento do CAPEX e cronograma planejado',
    '3.1 Decisões regulatórias adversas: Passivos contratuais da Malha Sul e Oeste.',
    '3.2 Decisões regulatórias adversas: Cumprimento e gerenciamento do caderno de obrigações das concessões e autorizações',
    '3.3 Licenciamento e Atos Autorizativos : Não manutenção das licenças e/ou atendimento das condicionantes para operar',
    '3.4 Análise, contribuições e acompanhamento da revisão de normativos da ANTT',
    '4.1 Danos físicos aos ativos e operação, principalmente corredor Santos',
    '4.2 Danos ambientais causados pela Companhia',
    '4.3 Impacto em demanda',
    '5.1 Falha no monitoramento da Legislação Tributária.',
    '5.2 Perdas financeiras devido a divergência de Interpretação do dispositivo legal ou mudança da jurisprudência',
    '5.3 Decisões judiciais adversas.',
    '6.1 Desenvolvimento de rotas e serviços alternativos',
    '6.2 Queda abrupta da oferta de grãos',
    '6.3 Evolução da demanda global',
    '7.1 Indisponibilidade de sistemas críticos para operação e planejamento',
    '7.2 Tratamento inadequado de informações confidenciais, pessoais ou sensíveis',
    '7.3 Incapacidade de recuperação de sistemas e dados essenciais após incidentes',
    '8.1 Desvio de conduta',
    '8.2 Relacionamento com órgão público e conduta com fornecedores',
    '8.3 Gestão inadequada e due diligence em terceiros, fornecedores e clientes.',
    '9.1 Dependência dos fornecedores de locomotivas e vagões',
    '10.1 Falta de mão de obra especializada para operacionalização das atividades da ferrovia',
    '10.2 Saúde e Segurança Pessoal',
    '10.3 Não atendimento da legislação trabalhista',
    '10.4 Cultura DNA Rumo não consolidada',
    '10.5 Direitos Humanos',
    '11.1. Gestão inadequada de mudanças ocasionando erro, ruptura e descontinuidade de processos e perda de histórico.',
    '11.2. Gestão inadequada do conhecimento'
];

const gerenciaOptions = [
    'Operação', 'Tecnologia', 'Ambiental', 'GesMud', 'Compliance',
    'Regulatório', 'Suprimentos', 'Jurídico', 'Comercial', 'DHO',
    'Expansão', 'Seg. Trabalho', 'Cultura e Comunicação'
];

const categoriaOptions = [
    'Operacional', 'Tecnologia', 'Compliance', 'Regulatório',
    'Estratégico', 'Financeiro', 'Sustentabilidade', 'Não Aplicável'
];

const tipoIerOptions = ['Crítico', 'Prioritário', 'Gerenciável', 'Aceitável'];
const origemOptions = ['Técnico', 'Negócio'];
const pilarOptions = ['G - Governança', 'E - Ambiente', 'S - Social'];


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
                        {topRiskOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                </Select>
            </Field>

            <Field label="Fator de Risco" className="sm:col-span-2">
                 <Select name="fatorDeRisco">
                    <SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger>
                    <SelectContent>
                        {riskFactorOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
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
                <Field label="X"><Input name="x" /></Field>
                <Field label="Y"><Input name="y" /></Field>
          </Section>

          <Section title="ESG e Governança" icon={ClipboardList}>
              <Field label="Englobador"><Input name="englobador" /></Field>
              <Field label="Pilar">
                <Select name="pilar">
                    <SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger>
                    <SelectContent>
                        {pilarOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                </Select>
              </Field>
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
                        <SelectItem value="Realizado">Realizado</SelectItem>
                        <SelectItem value="Não Realizado">Não Realizado</SelectItem>
                        <SelectItem value="Em Andamento">Em Andamento</SelectItem>
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
