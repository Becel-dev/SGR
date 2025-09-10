
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon, GanttChartSquare } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { controlsData, kpisData } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { Kpi } from '@/lib/types';

const Field = ({ label, children, className }: {label: string, children: React.ReactNode, className?: string}) => (
    <div className={cn("space-y-2", className)}>
        <Label>{label}</Label>
        {children}
    </div>
)

export default function CaptureKpiPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const kpiId = searchParams.get('id');
    const controlIdFromQuery = searchParams.get('controlId');
    const isEditing = !!kpiId;

    const [kpi, setKpi] = useState<Kpi | undefined>(undefined);
    const [lastInformedDate, setLastInformedDate] = useState<Date>();
    const [nextDeadlineDate, setNextDeadlineDate] = useState<Date>();
    const [selectedControlId, setSelectedControlId] = useState<string | undefined>(controlIdFromQuery || undefined);
    
    useEffect(() => {
        if(isEditing) {
            const foundKpi = kpisData.find(k => k.id === kpiId);
            setKpi(foundKpi);
            if (foundKpi) {
                setSelectedControlId(foundKpi.controlId.toString());
                if (foundKpi.ultimoKpiInformado) {
                    setLastInformedDate(new Date(foundKpi.ultimoKpiInformado));
                }
                if (foundKpi.prazoProximoRegistro) {
                    setNextDeadlineDate(new Date(foundKpi.prazoProximoRegistro));
                }
            }
        }
    }, [kpiId, isEditing]);

    const selectedControl = useMemo(() => {
        return controlsData.find(c => c.id.toString() === selectedControlId);
    }, [selectedControlId]);

    const handleControlChange = (value: string) => {
        setSelectedControlId(value);
    }

    const title = isEditing ? `Edição de KPI: ${kpi?.id}` : 'Cadastro de Novo KPI';
    const description = isEditing ? 'Atualize os campos abaixo para editar o KPI.' : 'Preencha os campos abaixo para registrar um novo KPI para um controle.';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <GanttChartSquare />
            {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <Field label="ID do KPI"><Input name="id" defaultValue={kpi?.id} placeholder="Gerado automaticamente" disabled /></Field>
                
                <Field label="Controle Associado" className="sm:col-span-2">
                     <Select onValueChange={handleControlChange} value={selectedControlId} defaultValue={selectedControlId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione um controle..." />
                        </SelectTrigger>
                        <SelectContent>
                            {controlsData.map(control => (
                                <SelectItem key={control.id} value={control.id.toString()}>
                                    {`[${control.id}] ${control.nomeControle}`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
                
                <Field label="Status">
                     <Select name="status" defaultValue={kpi?.status || "Pendente"}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Em dia">Em dia</SelectItem>
                            <SelectItem value="Atrasado">Atrasado</SelectItem>
                            <SelectItem value="Pendente">Pendente</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>

                {selectedControl && (
                    <>
                        <Field label="Responsável"><Input name="responsavel" defaultValue={kpi?.responsavel || selectedControl.donoControle} /></Field>
                        <Field label="E-mail do Responsável"><Input name="email" defaultValue={kpi?.emailResponsavel || selectedControl.emailDono} /></Field>
                        <Field label="Frequência de Verificação"><Input name="frequencia" defaultValue={kpi?.frequencia || (selectedControl.frequenciaMeses ? `${selectedControl.frequenciaMeses} Meses` : 'Não definida')} /></Field>
                        <Field label="Dias Pendentes"><Input name="diasPendentes" type="number" defaultValue={kpi?.diasPendentes || 0} /></Field>
                    </>
                )}


                <Field label="Último KPI Informado">
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {lastInformedDate ? <span>{lastInformedDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span> : <span>Selecione</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={lastInformedDate} onSelect={setLastInformedDate} initialFocus/></PopoverContent>
                    </Popover>
                </Field>
                <Field label="Prazo para Próximo Registro">
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {nextDeadlineDate ? <span>{nextDeadlineDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span> : <span>Selecione</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={nextDeadlineDate} onSelect={setNextDeadlineDate} /></PopoverContent>
                    </Popover>
                </Field>
           </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push('/kpis')}>Cancelar</Button>
        <Button>Salvar KPI</Button>
      </CardFooter>
    </Card>
  );
}
