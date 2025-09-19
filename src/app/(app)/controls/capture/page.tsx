

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
import { Calendar as CalendarIcon, Shield, AlertTriangle, PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from '@/lib/utils';
import type { AssociatedRisk } from '@/lib/types';
import { risksData } from '@/lib/mock-data';

// Add a 'key' property for React's reconciliation process
type AssociatedRiskWithKey = AssociatedRisk & { key: number };

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


export default function CaptureControlPage() {
    const router = useRouter();
    const [creationDate, setCreationDate] = useState<Date>();
    const [lastCheckDate, setLastCheckDate] = useState<Date>();
    const [nextCheckDate, setNextCheckDate] = useState<Date>();
    const [associatedRisks, setAssociatedRisks] = useState<AssociatedRiskWithKey[]>([]);

    const handleAddRisk = () => {
        // Add a unique key for each new item
        setAssociatedRisks([...associatedRisks, { key: Date.now(), riskId: '', codigoMUE: '', titulo: '' }]);
    };

    const handleRemoveRisk = (key: number) => {
        setAssociatedRisks(associatedRisks.filter(risk => risk.key !== key));
    };

    const handleRiskChange = (key: number, field: keyof AssociatedRisk, value: string) => {
        const newRisks = associatedRisks.map(risk => {
            if (risk.key === key) {
                const currentRisk = { ...risk, [field]: value };
                
                // If the riskId is changing, populate the related fields
                if (field === 'riskId') {
                    const selectedRiskData = risksData.find(r => r.id === value);
                    if (selectedRiskData) {
                        currentRisk.codigoMUE = selectedRiskData.taxonomia || `RUMO-${selectedRiskData.id}`;
                        currentRisk.titulo = selectedRiskData.risco || 'Título não encontrado';
                    }
                }
                return currentRisk;
            }
            return risk;
        });
        setAssociatedRisks(newRisks);
    };
    
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Shield />
            Cadastro de Novo Controle
        </CardTitle>
        <CardDescription>
          Preencha os campos abaixo para registrar um novo controle e associá-lo a um ou mais riscos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
            <Section title="Identificação do Controle" defaultOpen>
                <Field label="ID do Controle"><Input name="id" placeholder="Gerado automaticamente" disabled /></Field>
                <Field label="Nome do Controle (CC)" className="sm:col-span-3"><Textarea name="nomeControle" placeholder="Nome descritivo do controle" /></Field>
            </Section>

            <div className='space-y-4'>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <AlertTriangle className='h-5 w-5 text-primary'/>
                    Riscos Associados
                </h3>
                 {associatedRisks.map((assocRisk) => {
                    const selectedRiskData = risksData.find(r => r.id === assocRisk.riskId);
                    return (
                        <div key={assocRisk.key} className="border p-4 rounded-lg space-y-4 relative">
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handleRemoveRisk(assocRisk.key)}>
                                <Trash2 className="h-4 w-4 text-destructive"/>
                            </Button>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                               <Field label="ID do Risco" className='md:col-span-3'>
                                    <Select value={assocRisk.riskId} onValueChange={(value) => handleRiskChange(assocRisk.key, 'riskId', value)}>
                                        <SelectTrigger><SelectValue placeholder="Selecione um risco..."/></SelectTrigger>
                                        <SelectContent position="popper">
                                            {risksData.map(risk => (
                                                <SelectItem key={risk.id} value={risk.id}>
                                                    {`[${risk.id}] ${risk.risco}`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                                {selectedRiskData && (
                                   <>
                                     <Field label="Nome do Risco"><Input value={selectedRiskData.risco} disabled /></Field>
                                     <Field label="TopRisk Associado"><Input value={selectedRiskData.topRiskAssociado} disabled /></Field>
                                     <Field label="Gerência do Risco"><Input value={selectedRiskData.gerencia} disabled /></Field>
                                   </>
                                )}
                                <Field label="Código do MUE"><Input value={assocRisk.codigoMUE} onChange={(e) => handleRiskChange(assocRisk.key, 'codigoMUE', e.target.value)} placeholder="Ex: RUMO 01" /></Field>
                                <Field label="Título"><Input value={assocRisk.titulo} onChange={(e) => handleRiskChange(assocRisk.key, 'titulo', e.target.value)} placeholder="Ex: RUMO 01-01" /></Field>
                            </div>
                        </div>
                    )
                 })}
                 <Button type="button" variant="outline" onClick={handleAddRisk}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Associação de Risco
                 </Button>
            </div>

            <Section title="Detalhes do Controle">
                <Field label="Tipo">
                    <Select name="tipo">
                        <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                        <SelectContent>{tipoOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                </Field>
                <Field label="Classificação">
                    <Select name="classificacao">
                        <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                        <SelectContent>{classificacaoOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                </Field>
                <Field label="Status">
                    <Select name="status">
                        <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                        <SelectContent>{statusOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                </Field>
                <Field label="Criticidade">
                    <Select name="criticidade">
                        <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                        <SelectContent>{criticidadeOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                </Field>
                <Field label="OnePager"><Input name="onePager" type="file" /></Field>
                <Field label="Evidência"><Input name="evidencia" type="file" /></Field>
            </Section>
            
            <Section title="Responsabilidade e Prazos">
                <Field label="Dono do Controle"><Input name="donoControle" /></Field>
                <Field label="E-mail do Dono"><Input name="emailDono" type="email" /></Field>
                <Field label="Área">
                    <Select name="area">
                        <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                        <SelectContent>{areaOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                </Field>
                <Field label="Frequência (em meses)"><Input name="frequenciaMeses" type="number" placeholder="Ex: 6" /></Field>
                <Field label="Data da Última Verificação">
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {lastCheckDate ? <span>{lastCheckDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span> : <span>Selecione</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={lastCheckDate} onSelect={setLastCheckDate} initialFocus/></PopoverContent>
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
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={nextCheckDate} onSelect={setNextCheckDate} /></PopoverContent>
                    </Popover>
                </Field>
                <Field label="Validação">
                    <Select name="validacao">
                        <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
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
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={creationDate} onSelect={setCreationDate} initialFocus/></PopoverContent>
                    </Popover>
                </Field>
                <Field label="Criado Por"><Input name="criadoPor" /></Field>
                <Field label="Modificado Por"><Input name="modificadoPor" disabled placeholder="Definido na edição" /></Field>
                <Field label="E-mails para KPI" className="sm:col-span-2"><Textarea name="preenchimentoKPI" placeholder="email1@rumo.com;email2@rumo.com" /></Field>
            </Section>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push('/controls')}>Cancelar</Button>
        <Button>Salvar Controle</Button>
      </CardFooter>
    </Card>
  );
}
