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
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from '@/lib/utils';
import type { AssociatedRisk, Risk, Control } from '@/lib/types';
import { addOrUpdateControl } from '@/lib/azure-table-storage';
import { useToast } from '@/hooks/use-toast';


// Add a 'key' property for React's reconciliation process
type AssociatedRiskWithKey = AssociatedRisk & { key: number };

const areaOptions = ['OPERAÇÃO', 'MANUTENÇÃO', 'SEGURANÇA', 'FINANCEIRO', 'RH', 'JURÍDICO', 'COMPLIANCE', 'TI'];
const tipoOptions = ['Preventivo', 'Mitigatório'];
const classificacaoOptions = ['Procedimento', 'Equipamento', 'Pessoa', 'Sistema'];
const statusOptions = ['Implementado', 'Implementado com Pendência', 'Não Implementado', 'Implementação Futura'];
const validacaoOptions = ['DENTRO DO PRAZO', 'ATRASADO', 'PENDENTE'];
const criticidadeOptions = ['Sim', 'Não'];

const controlSchema = z.object({
    nomeControle: z.string().min(1, "O nome do controle é obrigatório."),
    associatedRisks: z.array(z.object({
        riskId: z.string().min(1, "O ID do risco é obrigatório."),
        codigoMUE: z.string().optional(),
        titulo: z.string().optional(),
    })).min(1, "É necessário associar pelo menos um risco."),
    tipo: z.string().min(1, "O tipo é obrigatório."),
    classificacao: z.string().min(1, "A classificação é obrigatória."),
    status: z.string().min(1, "O status é obrigatório."),
    criticidade: z.string().min(1, "A criticidade é obrigatória."),
    onePager: z.any().optional(),
    evidencia: z.any().optional(),
    donoControle: z.string().min(1, "O dono do controle é obrigatório."),
    emailDono: z.string().email("Formato de e-mail inválido.").min(1, "O e-mail do dono é obrigatório."),
    area: z.string().min(1, "A área é obrigatória."),
    frequenciaMeses: z.coerce.number().positive("A frequência deve ser um número positivo.").optional(),
    dataUltimaVerificacao: z.date().optional(),
    proximaVerificacao: z.date().optional(),
    validacao: z.string().optional(),
    criadoEm: z.date().optional(),
    criadoPor: z.string().optional(),
    preenchimentoKPI: z.string().optional(),
});

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
    const { toast } = useToast();
    const [associatedRisks, setAssociatedRisks] = useState<AssociatedRiskWithKey[]>([]);
    const [availableRisks, setAvailableRisks] = useState<Risk[]>([]);
    const [loadingRisks, setLoadingRisks] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<z.infer<typeof controlSchema>>({
        resolver: zodResolver(controlSchema),
        defaultValues: {
            associatedRisks: [],
        }
    });

    useEffect(() => {
        const fetchRisks = async () => {
            setLoadingRisks(true);
            try {
                const response = await fetch('/api/risks/for-association');
                if (!response.ok) {
                    throw new Error('Failed to fetch risks');
                }
                const data = await response.json();
                setAvailableRisks(data);
            } catch (error) {
                console.error("Error fetching risks for association:", error);
            } finally {
                setLoadingRisks(false);
            }
        };
        fetchRisks();
    }, []);

    useEffect(() => {
        setValue('associatedRisks', associatedRisks.map(({ key, ...rest }) => rest));
    }, [associatedRisks, setValue]);

    const handleAddRisk = () => {
        // Add a unique key for each new item
        setAssociatedRisks([...associatedRisks, { key: Date.now(), riskId: '', codigoMUE: '', titulo: '' }]);
    };

    const handleRemoveRisk = (key: number) => {
        setAssociatedRisks(associatedRisks.filter(risk => risk.key !== key));
    };

    const handleRiskChange = (key: number, field: keyof Omit<AssociatedRiskWithKey, 'key'>, value: string) => {
        setAssociatedRisks(prevRisks =>
            prevRisks.map(risk =>
                risk.key === key ? { ...risk, [field]: value } : risk
            )
        );
    };

    const onSubmit = async (data: z.infer<typeof controlSchema>) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            let onePagerFile, evidenciaFile;

            if (data.onePager && data.onePager[0]) {
                onePagerFile = data.onePager[0] as File;
                formData.append('onePager', onePagerFile);
            }
            if (data.evidencia && data.evidencia[0]) {
                evidenciaFile = data.evidencia[0] as File;
                formData.append('evidencia', evidenciaFile);
            }

            let onePagerUrl, evidenciaUrl;
            if (onePagerFile || evidenciaFile) {
                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    throw new Error('Falha no upload dos arquivos.');
                }
                const uploadResult = await uploadResponse.json();
                onePagerUrl = uploadResult.onePagerUrl;
                evidenciaUrl = uploadResult.evidenciaUrl;
            }

            const newControl: Control = {
                ...data,
                id: `CTRL-${Date.now()}`, // Gerando um ID único
                onePager: onePagerUrl || '',
                evidencia: evidenciaUrl || '',
                dataUltimaVerificacao: data.dataUltimaVerificacao?.toISOString() || '',
                proximaVerificacao: data.proximaVerificacao?.toISOString() || '',
                criadoEm: (data.criadoEm || new Date()).toISOString(),
                modificadoEm: new Date().toISOString(),
                modificadoPor: 'Sistema', // Substituir pelo usuário logado
                associatedRisks: data.associatedRisks.map(({ riskId, codigoMUE, titulo }) => ({ 
                    riskId, 
                    codigoMUE: codigoMUE || '', 
                    titulo: titulo || '' 
                }))
            };

            await addOrUpdateControl(newControl);

            toast({
                title: "Sucesso!",
                description: "O novo controle foi salvo com sucesso.",
            });
            router.push('/controls');

        } catch (error) {
            console.error("Erro ao salvar o controle:", error);
            toast({
                title: "Erro",
                description: "Não foi possível salvar o controle. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Section title="Identificação do Controle" defaultOpen>
                <Field label="ID do Controle"><Input placeholder="Gerado automaticamente" disabled /></Field>
                <Field label="Nome do Controle (CC)" className="sm:col-span-3">
                    <Textarea {...register("nomeControle")} placeholder="Nome descritivo do controle" />
                    {errors.nomeControle && <p className="text-sm text-destructive">{errors.nomeControle.message}</p>}
                </Field>
            </Section>

            <div className='space-y-4'>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <AlertTriangle className='h-5 w-5 text-primary'/>
                    Riscos Associados
                </h3>
                {errors.associatedRisks && <p className="text-sm text-destructive">{errors.associatedRisks.message}</p>}
                 {associatedRisks.map((assocRisk, index) => {
                    const selectedRiskData = availableRisks.find(r => r.id === assocRisk.riskId);
                    return (
                        <div key={assocRisk.key} className="border p-4 rounded-lg space-y-4 relative">
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handleRemoveRisk(assocRisk.key)}>
                                <Trash2 className="h-4 w-4 text-destructive"/>
                            </Button>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                               <Field label="ID do Risco" className='md:col-span-3'>
                                    <Select value={assocRisk.riskId} onValueChange={(value) => handleRiskChange(assocRisk.key, 'riskId', value)} disabled={loadingRisks}>
                                        <SelectTrigger><SelectValue placeholder={loadingRisks ? "Carregando riscos..." : "Selecione um risco..."}/></SelectTrigger>
                                        <SelectContent position="popper">
                                            {availableRisks.map(risk => (
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
                    <Controller
                        name="tipo"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                                <SelectContent>{tipoOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                            </Select>
                        )}
                    />
                    {errors.tipo && <p className="text-sm text-destructive">{errors.tipo.message}</p>}
                </Field>
                <Field label="Classificação">
                     <Controller
                        name="classificacao"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                                <SelectContent>{classificacaoOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                            </Select>
                        )}
                    />
                    {errors.classificacao && <p className="text-sm text-destructive">{errors.classificacao.message}</p>}
                </Field>
                <Field label="Status">
                    <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                                <SelectContent>{statusOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                            </Select>
                        )}
                    />
                    {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
                </Field>
                <Field label="Criticidade">
                    <Controller
                        name="criticidade"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                                <SelectContent>{criticidadeOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                            </Select>
                        )}
                    />
                    {errors.criticidade && <p className="text-sm text-destructive">{errors.criticidade.message}</p>}
                </Field>
                <Field label="OnePager"><Input {...register("onePager")} type="file" /></Field>
                <Field label="Evidência"><Input {...register("evidencia")} type="file" /></Field>
            </Section>
            
            <Section title="Responsabilidade e Prazos">
                <Field label="Dono do Controle">
                    <Input {...register("donoControle")} />
                    {errors.donoControle && <p className="text-sm text-destructive">{errors.donoControle.message}</p>}
                </Field>
                <Field label="E-mail do Dono">
                    <Input {...register("emailDono")} type="email" />
                    {errors.emailDono && <p className="text-sm text-destructive">{errors.emailDono.message}</p>}
                </Field>
                <Field label="Área">
                    <Controller
                        name="area"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                                <SelectContent>{areaOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                            </Select>
                        )}
                    />
                    {errors.area && <p className="text-sm text-destructive">{errors.area.message}</p>}
                </Field>
                <Field label="Frequência (em meses)">
                    <Input {...register("frequenciaMeses")} type="number" placeholder="Ex: 6" />
                    {errors.frequenciaMeses && <p className="text-sm text-destructive">{errors.frequenciaMeses.message}</p>}
                </Field>
                <Field label="Data da Última Verificação">
                    <Controller
                        name="dataUltimaVerificacao"
                        control={control}
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? <span>{field.value.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span> : <span>Selecione</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/></PopoverContent>
                            </Popover>
                        )}
                    />
                </Field>
                <Field label="Próxima Verificação">
                    <Controller
                        name="proximaVerificacao"
                        control={control}
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? <span>{field.value.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span> : <span>Selecione</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent>
                            </Popover>
                        )}
                    />
                </Field>
                <Field label="Validação">
                    <Controller
                        name="validacao"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                                <SelectContent>{validacaoOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                            </Select>
                        )}
                    />
                </Field>
            </Section>

            <Section title="Metadados">
                <Field label="Data de Criação">
                    <Input disabled placeholder="Definido automaticamente" />
                </Field>
                <Field label="Criado Por"><Input disabled placeholder="Definido automaticamente" /></Field>
                <Field label="Modificado Por"><Input disabled placeholder="Definido na edição" /></Field>
                <Field label="E-mails para KPI" className="sm:col-span-2">
                    <Textarea {...register("preenchimentoKPI")} placeholder="email1@rumo.com;email2@rumo.com" />
                </Field>
            </Section>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push('/controls')}>Cancelar</Button>
        <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar Controle'}
        </Button>
      </CardFooter>
    </Card>
  );
}
