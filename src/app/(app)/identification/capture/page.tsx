
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
import { Lightbulb, Info, AlertTriangle, CheckSquare, Target, SlidersHorizontal, BarChart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import * as React from 'react';


const Section = ({ title, children, icon: Icon, defaultOpen = false }: { title: string, children: React.ReactNode, icon?: React.ElementType, defaultOpen?: boolean }) => (
    <Accordion type="single" collapsible defaultValue={defaultOpen ? "item-1" : ""}>
        <AccordionItem value="item-1" className="border rounded-lg">
             <AccordionTrigger className="bg-muted/50 px-4 py-2 rounded-t-lg">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    {Icon && <Icon className="h-5 w-5 text-primary" />}
                    {title}
                </h3>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {children}
                </div>
            </AccordionContent>
        </AccordionItem>
    </Accordion>
)

const Field = ({ label, children, className, description }: {label: string, children: React.ReactNode, className?: string, description?: string}) => (
    <div className={cn("space-y-2", className)}>
        <Label>{label}</Label>
        {children}
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
)

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

const businessObjectivesOptions = [
    'Continuidade operacional',
    'Integridade financeira',
    'Conformidade legal/regulatória',
    'Imagem e reputação',
    'Segurança de pessoas ou ativos'
];

const RatingSlider = ({ label, helpText }: { label: string, helpText: string }) => {
    const [value, setValue] = React.useState(0);
    return (
        <Field label={label} description={helpText}>
            <div className='flex items-center gap-4'>
                <Slider defaultValue={[0]} value={[value]} max={10} step={1} onValueChange={(v) => setValue(v[0])} />
                <span className="font-bold text-lg w-12 text-center">{value}</span>
            </div>
        </Field>
    )
}

export default function CaptureIdentifiedRiskPage() {
    const router = useRouter();
    
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Lightbulb />
            Ficha de Identificação de Risco
        </CardTitle>
        <CardDescription>
          Preencha os campos abaixo para incluir um novo risco na base de Riscos de continuidade ao Negócio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          
          <Section title="Mapeamento e Identificação" icon={Info} defaultOpen>
            <Field label="1. Nome do Risco" className="sm:col-span-4" description="Descreva o risco em uma frase curta e objetiva, mencionando causa e efeito principais.">
                <Input name="riskName" placeholder="Ex: Interrupção no fornecimento de peças ou serviços críticos..." />
            </Field>

            <Field label="2. Top Risk Corporativo" className="sm:col-span-2" description="Selecione o Top Risk relacionado à sua área.">
                 <Select name="topRisk">
                    <SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger>
                    <SelectContent>
                        {topRiskOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                </Select>
            </Field>

            <Field label="3. Fator de Risco" className="sm:col-span-2" description="Assinale o item do mapa de riscos mais alinhado ao Top Risk selecionado.">
                 <Select name="riskFactor">
                    <SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger>
                    <SelectContent>
                        {riskFactorOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                </Select>
            </Field>

            <Field label="4. Causa Provável" className="sm:col-span-2" description="Descreva a causa técnica ou operacional que pode originar o risco.">
                <Textarea name="probableCause" placeholder="Ex: Alta dependência de fornecedor único..." />
            </Field>

             <Field label="5. Cenário de Risco" className="sm:col-span-2" description="Descreva uma situação prática, ocorrida ou hipotética, que exemplifique o risco.">
                <Textarea name="riskScenario" placeholder="Ex: Crise geopolítica impede o envio de componentes..." />
            </Field>

            <Field label="6. Consequência Esperada no Negócio" className="sm:col-span-2" description="Descreva os principais impactos esperados (operacionais, financeiros, etc.).">
                <Textarea name="expectedConsequence" placeholder="Ex: Locomotivas paradas, queda na capacidade..." />
            </Field>

            <Field label="7. Controles Atuais" className="sm:col-span-2" description="Indique os controles (técnicos, operacionais, de processo) existentes.">
                <Textarea name="currentControls" placeholder="Ex: Estoque de peças críticas, Contratos com cláusulas..." />
            </Field>
          </Section>

          <Section title="Categorização do Risco" icon={SlidersHorizontal}>
                <Field label="8. Este risco atua principalmente como:">
                    <Select name="riskRole">
                        <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Facilitador técnico">01 - Facilitador técnico</SelectItem>
                            <SelectItem value="Amplificador de impacto">02 - Amplificador de impacto</SelectItem>
                            <SelectItem value="Estruturante">03 - Estruturante</SelectItem>
                            <SelectItem value="De negócio direto">04 - De negócio direto</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>

                <Field label="9. Tipo do Apontamento">
                    <Select name="pointingType">
                        <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Risco efetivo">01 - Risco efetivo (associado a um Top Risk)</SelectItem>
                            <SelectItem value="Facilitador técnico">02 - Facilitador técnico</SelectItem>
                            <SelectItem value="Amplificador de impacto">03 - Amplificador de impacto</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>

                <Field label="10. Objetivos de Negócio Afetados" className="sm:col-span-2" description="Você pode escolher até 3.">
                    <div className="p-4 border rounded-md space-y-2">
                        {businessObjectivesOptions.map(obj => (
                            <div key={obj} className="flex items-center gap-2">
                                <Checkbox id={obj} />
                                <Label htmlFor={obj} className='font-normal'>{obj}</Label>
                            </div>
                        ))}
                    </div>
                </Field>
          </Section>

          <Section title="Classificação do Risco (Impacto, Probabilidade)" icon={BarChart}>
            <RatingSlider 
                label="11. Potencial de Impacto Corporativo" 
                helpText="Qual o impacto na companhia se o risco se concretizar?"
            />
            <RatingSlider 
                label="12. Relevância Organizacional do Objeto de Risco"
                helpText="Avalia a importância estratégica/operacional do ativo/processo afetado."
            />
             <RatingSlider 
                label="13. Probabilidade Contextualizada"
                helpText="Considera a frequência com que o risco já ocorreu ou sinais de que possa ocorrer."
            />
             <RatingSlider 
                label="14. Capacidade Atual de Controle"
                helpText="Avalia a robustez dos controles existentes. (Lógica invertida: maior nota = menor controle)."
            />
             <RatingSlider 
                label="15. Tempo Estimado de Contenção/Mitigação"
                helpText="Mede a rapidez com que a organização pode responder ao risco. (Lógica invertida: maior nota = menor controle)."
            />
             <RatingSlider 
                label="16. Facilidade Técnica/Prática de Ocorrência"
                helpText="Mede a viabilidade de o risco se concretizar."
            />
          </Section>

        </form>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push('/identification')}>Cancelar</Button>
        <Button>Salvar Risco</Button>
      </CardFooter>
    </Card>
  );
}
