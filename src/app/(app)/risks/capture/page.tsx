

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
import { Calendar as CalendarIcon, DollarSign, Siren, Target } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const Section = ({ title, children, icon: Icon }: { title: string, children: React.ReactNode, icon?: React.ElementType }) => (
    <div className="space-y-6 rounded-lg border p-4 pt-2">
       <h3 className="font-semibold text-lg flex items-center gap-2 border-b -mx-4 px-4 py-2 bg-muted/50">
           {Icon && <Icon className="h-5 w-5 text-primary" />}
           {title}
       </h3>
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
           {children}
       </div>
   </div>
)

const Field = ({ label, children, className }: {label: string, children: React.ReactNode, className?: string}) => (
    <div className={cn("space-y-2", className)}>
        <Label htmlFor={label}>{label}</Label>
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
            Cadastro de Novo Risco
        </CardTitle>
        <CardDescription>
          Preencha os campos abaixo para registrar um novo risco.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8">
          
          <Section title="Identificação e Contexto">
            <Field label="ID"><Input id="ID" name="id" placeholder="Ex: R016" /></Field>
            <Field label="Gerência"><Input id="Gerência" name="gerencia" /></Field>
            <Field label="Diretoria"><Input id="Diretoria" name="diretoria" /></Field>
            <Field label="Processo"><Input id="Processo" name="processo" /></Field>
            <Field label="Risco (Título)" className="sm:col-span-2"><Input id="Risco (Título)" name="risco" placeholder="Título resumido do risco" /></Field>
            <Field label="Descrição do Risco" className="sm:col-span-3"><Textarea id="Descrição do Risco" name="descricaoDoRisco" rows={4} placeholder="Descreva o risco em detalhes" /></Field>
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
            <Field label="Origem do Risco">
                <Select name="origemDoRisco">
                    <SelectTrigger id="origemDoRisco"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent><SelectItem value="Interna">Interna</SelectItem><SelectItem value="Externa">Externa</SelectItem></SelectContent>
                </Select>
            </Field>
            <Field label="Processo Afetado"><Input id="Processo Afetado" name="processoAfetado" /></Field>
            <Field label="Causa Raiz" className="sm:col-span-3"><Textarea id="Causa Raiz" name="causaRaizDoRisco" rows={3} placeholder="Descreva a causa principal" /></Field>
            <Field label="Consequência" className="sm:col-span-3"><Textarea id="Consequência" name="consequenciaDoRisco" rows={3} placeholder="Descreva a principal consequência" /></Field>
            <Field label="Categoria do Risco"><Input id="Categoria do Risco" name="categoriaDoRisco" /></Field>
            <Field label="Tipo de Risco"><Input id="Tipo de Risco" name="tipoDeRisco" /></Field>
          </Section>

          <Section title="Análise de Risco Inerente">
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
                <Field label="Nível de Risco Inerente (Calculado)">
                    <Input id="Nível de Risco Inerente" name="nivelDeRiscoInerente" disabled />
                </Field>
          </Section>

          <Section title="Controles e Tratamento">
            <Field label="Estratégia de Resposta"><Input id="Estratégia de Resposta" name="estrategia" /></Field>
            <Field label="Descrição do Controle" className="sm:col-span-2"><Textarea id="Descrição do Controle" name="descricaoDoControle" placeholder="Descreva o controle aplicado" /></Field>
            <Field label="Natureza do Controle"><Input id="Natureza do Controle" name="naturezaDoControle" /></Field>
            <Field label="Tipo de Controle"><Input id="Tipo de Controle" name="tipoDeControle" /></Field>
            <Field label="Classificação do Controle"><Input id="Classificação do Controle" name="classificacaoDoControle" /></Field>
            <Field label="Frequência do Controle"><Input id="Frequência do Controle" name="frequencia" /></Field>
            <Field label="Eficácia do Controle">
                 <Select name="eficaciaDoControle"><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Ineficaz">Ineficaz</SelectItem><SelectItem value="Pouco Eficaz">Pouco Eficaz</SelectItem>
                        <SelectItem value="Eficaz">Eficaz</SelectItem><SelectItem value="Muito Eficaz">Muito Eficaz</SelectItem>
                    </SelectContent>
                </Select>
            </Field>
            <Field label="Documentação do Controle"><Input id="Documentação do Controle" name="documentacaoControle" /></Field>
          </Section>

          <Section title="Análise de Risco Residual">
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
                <Field label="Nível de Risco Residual (Calculado)">
                    <Input id="Nível de Risco Residual" name="nivelDeRiscoResidual" disabled />
                </Field>
          </Section>

          <Section title="Gestão e Monitoramento">
            <Field label="Responsável pelo Risco"><Input id="Responsável pelo Risco" name="responsavelPeloRisco" /></Field>
            <Field label="Plano de Ação"><Input id="Plano de Ação" name="planoDeAcao" /></Field>
            <Field label="Status do Risco">
                <Select name="statusDoRisco"><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Aberto">Aberto</SelectItem><SelectItem value="Em Tratamento">Em Tratamento</SelectItem>
                        <SelectItem value="Fechado">Fechado</SelectItem><SelectItem value="Mitigado">Mitigado</SelectItem>
                    </SelectContent>
                </Select>
            </Field>
            <Field label="Apetite ao Risco"><Input id="Apetite ao Risco" name="apetiteAoRisco" /></Field>
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

           <Section title="Indicadores Chave (KRI)" icon={Target}>
                <Field label="KRI" className="sm:col-span-3"><Input id="KRI" name="kri" /></Field>
                <Field label="Indicador de Risco" className="sm:col-span-3"><Input id="Indicador de Risco" name="indicadorRisco" /></Field>
                <Field label="Limite de Apetite"><Input id="Limite de Apetite" name="limiteApetite" type="number" /></Field>
                <Field label="Limite de Tolerância"><Input id="Limite de Tolerância" name="limiteTolerancia" type="number" /></Field>
                <Field label="Limite de Capacidade"><Input id="Limite de Capacidade" name="limiteCapacidade" type="number" /></Field>
                <Field label="Medição Atual"><Input id="Medição Atual" name="medicaoAtual" type="number" /></Field>
            </Section>

            <Section title="Análise Financeira" icon={DollarSign}>
                <Field label="Custo do Risco"><Input id="Custo do Risco" name="custoDoRisco" type="number" /></Field>
                <Field label="Benefício do Controle"><Input id="Benefício do Controle" name="beneficioDoControle" type="number" /></Field>
                <Field label="Valor Exposto"><Input id="Valor Exposto" name="valorExposto" type="number" /></Field>
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
