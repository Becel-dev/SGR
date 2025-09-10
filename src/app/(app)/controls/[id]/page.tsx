

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon, Shield, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { controlsData } from '@/lib/mock-data';
import type { Control } from '@/lib/types';
import Link from 'next/link';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from '@/lib/utils';

const areaOptions = ['OPERAÇÃO', 'MANUTENÇÃO', 'SEGURANÇA', 'FINANCEIRO', 'RH', 'JURÍDICO', 'COMPLIANCE', 'TI'];
const tipoOptions = ['Preventivo', 'Mitigatório'];
const classificacaoOptions = ['Procedimento', 'Equipamento', 'Pessoa', 'Sistema'];
const statusOptions = ['Implementado', 'Implementado com Pendência', 'Não Implementado', 'Implementação Futura'];
const validacaoOptions = ['DENTRO DO PRAZO', 'ATRASADO', 'PENDENTE'];
const criticidadeOptions = ['Sim', 'Não'];


const Section = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => (
    <Accordion type="single" collapsible defaultValue={defaultOpen ? "item-1" : ""} className='w-full'>
        <AccordionItem value="item-1" className="border rounded-lg">
             <AccordionTrigger className="bg-muted/50 px-4 py-3 rounded-t-lg hover:no-underline">
                <h3 className="font-semibold text-lg">
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

const Field = ({ label, children, className }: {label: string, children: React.ReactNode, className?: string}) => (
    <div className={cn("space-y-2", className)}>
        <Label>{label}</Label>
        {children}
    </div>
)


export default function EditControlPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [control, setControl] = useState<Control | null>(null);
    const [creationDate, setCreationDate] = useState<Date | undefined>();
    const [lastCheckDate, setLastCheckDate] = useState<Date | undefined>();
    const [nextCheckDate, setNextCheckDate] = useState<Date | undefined>();

    useEffect(() => {
        const foundControl = controlsData.find(c => c.id.toString() === id);
        if (foundControl) {
            setControl(foundControl);
            if (foundControl.criadoEm) setCreationDate(new Date(foundControl.criadoEm));
            if (foundControl.dataUltimaVerificacao) setLastCheckDate(new Date(foundControl.dataUltimaVerificacao));
            if (foundControl.proximaVerificacao) setNextCheckDate(new Date(foundControl.proximaVerificacao));
        }
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!control) return;
        const { name, value } = e.target;
        setControl({ ...control, [name]: value });
    };

    const handleSelectChange = (name: string, value: string) => {
        if (!control) return;
        setControl({ ...control, [name]: value });
    };
    
    const handleDateChange = (name: keyof Control, date: Date | undefined) => {
        if (!control || !date) return;
         setControl({ ...control, [name]: date.toISOString().split('T')[0] });
    }

    if (!control) {
        return <div>Controle não encontrado...</div>
    }

    return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <Shield />
                    Detalhes do Controle: {control.titulo}
                </CardTitle>
                <CardDescription>
                Visualize ou edite os campos abaixo.
                </CardDescription>
            </div>
            <Button variant="outline" asChild>
                <Link href="/controls">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Link>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <Section title="Identificação" defaultOpen>
            <Field label="ID"><Input name="id" value={control.id} onChange={handleInputChange} disabled /></Field>
            <Field label="Código do MUE"><Input name="codigoMUE" value={control.codigoMUE} onChange={handleInputChange} /></Field>
            <Field label="Título"><Input name="titulo" value={control.titulo} onChange={handleInputChange}/></Field>
            <Field label="ID Risco Associado"><Input name="idRiscoMUE" value={control.idRiscoMUE} onChange={handleInputChange}/></Field>
            <Field label="Top Risk Associado"><Input name="topRiskAssociado" value={control.topRiskAssociado} onChange={handleInputChange}/></Field>
            <Field label="Descrição do MUE" className="sm:col-span-2 md:col-span-3"><Textarea name="descricaoMUE" value={control.descricaoMUE} onChange={handleInputChange}/></Field>
          </Section>

          <Section title="Detalhes do Controle">
             <Field label="Nome do Controle (CC)" className="sm:col-span-2"><Textarea name="nomeControle" value={control.nomeControle} onChange={handleInputChange}/></Field>
             <Field label="Tipo">
                <Select name="tipo" value={control.tipo} onValueChange={(v) => handleSelectChange('tipo', v)}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>{tipoOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
            </Field>
             <Field label="Classificação">
                 <Select name="classificacao" value={control.classificacao} onValueChange={(v) => handleSelectChange('classificacao', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{classificacaoOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
            </Field>
            <Field label="Status">
                <Select name="status" value={control.status} onValueChange={(v) => handleSelectChange('status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{statusOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
            </Field>
            <Field label="Criticidade">
                <Select name="criticidade" value={control.criticidade} onValueChange={(v) => handleSelectChange('criticidade', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{criticidadeOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
            </Field>
             <Field label="OnePager"><Input name="onePager" value={control.onePager} onChange={handleInputChange}/></Field>
             <Field label="Evidência"><Input name="evidencia" value={control.evidencia} onChange={handleInputChange} /></Field>
          </Section>
          
          <Section title="Responsabilidade e Prazos">
            <Field label="Dono do Controle"><Input name="donoControle" value={control.donoControle} onChange={handleInputChange} /></Field>
            <Field label="E-mail do Dono"><Input name="emailDono" type="email" value={control.emailDono} onChange={handleInputChange}/></Field>
            <Field label="Área">
                 <Select name="area" value={control.area} onValueChange={(v) => handleSelectChange('area', v)}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>{areaOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
            </Field>
            <Field label="Frequência (em meses)"><Input name="frequenciaMeses" type="number" value={control.frequenciaMeses} onChange={handleInputChange}/></Field>
             <Field label="Data da Última Verificação">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {lastCheckDate ? <span>{lastCheckDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span> : <span>Selecione</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={lastCheckDate} onSelect={(date) => { setLastCheckDate(date); handleDateChange('dataUltimaVerificacao', date); }} initialFocus/>
                    </PopoverContent>
                </Popover>
            </Field>
            <Field label="Próxima Verificação">
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {nextCheckDate ? <span>{nextCheckDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span> : <span>Selecione</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={nextCheckDate} onSelect={(date) => { setNextCheckDate(date); handleDateChange('proximaVerificacao', date); }}/>
                    </PopoverContent>
                </Popover>
            </Field>
             <Field label="Validação">
                 <Select name="validacao" value={control.validacao} onValueChange={(v) => handleSelectChange('validacao', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{validacaoOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
            </Field>
          </Section>

           <Section title="Metadados">
                 <Field label="Data de Criação">
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                             {creationDate ? <span>{creationDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span> : <span>Selecione</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={creationDate} onSelect={(date) => { setCreationDate(date); handleDateChange('criadoEm', date); }} initialFocus/>
                        </PopoverContent>
                    </Popover>
                </Field>
                <Field label="Criado Por"><Input name="criadoPor" value={control.criadoPor} onChange={handleInputChange} /></Field>
                <Field label="Modificado Por"><Input name="modificadoPor" value={control.modificadoPor} onChange={handleInputChange} /></Field>
                <Field label="E-mails para KPI" className="sm:col-span-2"><Textarea name="preenchimentoKPI" value={control.preenchimentoKPI} onChange={handleInputChange}/></Field>
           </Section>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push('/controls')}>Cancelar</Button>
        <Button onClick={() => alert('Controle salvo!')}>Salvar Alterações</Button>
      </CardFooter>
    </Card>
  );
}

    