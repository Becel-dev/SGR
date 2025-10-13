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
import { useRouter, useSearchParams } from 'next/navigation';
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
import { useToast } from '@/hooks/use-toast';

// Fallback visual para mensagens
import { useRef } from 'react';
import { getCategoriaControleOptions } from '@/lib/form-options';
import { UserAutocomplete } from '@/components/ui/user-autocomplete';
import { useAuthUser } from '@/hooks/use-auth';


// Add a 'key' property for React's reconciliation process
type AssociatedRiskWithKey = AssociatedRisk & { key: number };

const areaOptions = ['OPERAÇÃO', 'MANUTENÇÃO', 'SEGURANÇA', 'FINANCEIRO', 'RH', 'JURÍDICO', 'COMPLIANCE', 'TI'];
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
    categoria: z.string().min(1, "A categoria é obrigatória."),
    classificacao: z.string().min(1, "A classificação é obrigatória."),
    status: z.string().min(1, "O status é obrigatório."),
    criticidade: z.string().min(1, "A criticidade é obrigatória."),
    onePager: z.any().optional(),
    donoControle: z.string().min(1, "O dono do controle é obrigatório."),
    emailDono: z.string().optional(),
    area: z.string().min(1, "A área é obrigatória."),
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
    const searchParams = useSearchParams();
    const controlId = searchParams ? searchParams.get('id') : null;
    const isEditing = !!controlId;
    const { toast } = useToast();
    const [associatedRisks, setAssociatedRisks] = useState<AssociatedRiskWithKey[]>([]);
    const [availableRisks, setAvailableRisks] = useState<Risk[]>([]);
    const [loadingRisks, setLoadingRisks] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingControl, setIsLoadingControl] = useState(false);
    const [categoriasControle, setCategoriasControle] = useState<string[]>([]);

    const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const authUser = useAuthUser();

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

    // Carrega Categorias de Controle dinamicamente
    useEffect(() => {
        const loadCategoriasControle = async () => {
            try {
                const dynamicCategorias = await getCategoriaControleOptions();
                setCategoriasControle(dynamicCategorias);
            } catch (error) {
                console.error('Erro ao carregar Categorias de Controle:', error);
            }
        };
        loadCategoriasControle();
    }, []);

    // Carrega dados do controle para edição
    useEffect(() => {
        const fetchControlData = async () => {
            if (!controlId) return;
            
            setIsLoadingControl(true);
            try {
                const response = await fetch(`/api/controls/${controlId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch control');
                }
                const { control: controlData } = await response.json();
                
                // Garante que categoria tenha um valor padrão se não estiver definida
                if (!controlData.categoria) {
                    controlData.categoria = 'Inspeção'; // Valor padrão
                }
                
                // Preenche os campos do formulário

                Object.keys(controlData).forEach((key) => {
                    if (key === 'associatedRisks') {
                        const risksWithKeys = controlData[key].map((risk: AssociatedRisk, index: number) => ({
                            ...risk,
                            key: Date.now() + index
                        }));
                        setAssociatedRisks(risksWithKeys);
                        setValue('associatedRisks', controlData[key]);
                    } else if (key === 'criadoEm') {
                        const value = controlData[key];
                        let dateValue: Date | undefined = undefined;
                        if (value instanceof Date && !isNaN(value.getTime())) {
                            dateValue = value;
                        } else if (typeof value === 'string' && value.trim().length > 0) {
                            const parsed = new Date(value);
                            if (!isNaN(parsed.getTime()) && parsed.toISOString() !== 'Invalid Date') {
                                dateValue = parsed;
                            } else {
                                dateValue = undefined;
                            }
                        } else {
                            dateValue = undefined;
                        }
                        setValue(key as any, dateValue);
                    } else {
                        setValue(key as any, controlData[key]);
                    }
                });
                
            } catch (error) {
                console.error("Error fetching control:", error);
                toast({
                    variant: "destructive",
                    title: "Erro ao carregar controle",
                    description: "Não foi possível carregar os dados do controle para edição."
                });
            } finally {
                setIsLoadingControl(false);
            }
        };

        fetchControlData();
    }, [controlId, setValue, toast]);

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
        console.log("=== DEBUG: onSubmit INICIADO ===");
        console.log("Data recebida:", data);
        setIsSubmitting(true);
        setFormMessage(null);

        // Timeout de 5s para garantir feedback
        let timeoutId = setTimeout(() => {
            setFormMessage({ type: 'error', text: 'A operação está demorando mais que o esperado. Verifique sua conexão ou tente novamente.' });
            setIsSubmitting(false);
        }, 5000);

        try {
            const formData = new FormData();
            let onePagerFile;

            if (data.onePager && data.onePager[0]) {
                onePagerFile = data.onePager[0] as File;
                formData.append('onePager', onePagerFile);
            }

            let onePagerUrl;
            if (onePagerFile) {
                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    throw new Error('Falha no upload dos arquivos.');
                }
                const uploadResult = await uploadResponse.json();
                onePagerUrl = uploadResult.onePagerUrl;
            }

            // Auto-extrair email do donoControle se estiver no formato "Name (email)"
            let emailDono = data.emailDono || '';
            const match = data.donoControle.match(/\(([^)]+)\)$/);
            if (match) {
                emailDono = match[1].trim();
            }

            // Constrói o objeto Control explicitamente para evitar incluir tipos incompatíveis (FileList)
            const controlData: Control = {
                id: controlId || `CTRL-${Date.now()}`,
                nomeControle: data.nomeControle,
                categoria: data.categoria,
                classificacao: data.classificacao,
                status: data.status,
                criticidade: data.criticidade,
                donoControle: data.donoControle,
                emailDono: emailDono,
                area: data.area,
                validacao: data.validacao,
                preenchimentoKPI: data.preenchimentoKPI,
                onePager: onePagerUrl || (typeof data.onePager === 'string' ? data.onePager : ''),
                criadoEm: data.criadoEm || new Date().toISOString(),
                criadoPor: data.criadoPor || `${authUser.name} (${authUser.email})`,
                modificadoEm: new Date().toISOString(),
                modificadoPor: `${authUser.name} (${authUser.email})`,
                associatedRisks: data.associatedRisks.map(({ riskId, codigoMUE, titulo }) => ({
                    riskId,
                    codigoMUE: codigoMUE || '',
                    titulo: titulo || ''
                }))
            };

            // Converte datas para string só na hora de enviar para API
            const controlDataToSend = {
                ...controlData,
                criadoEm: controlData.criadoEm instanceof Date ? controlData.criadoEm.toISOString() : (controlData.criadoEm || new Date().toISOString()),
            };

            console.log("=== DEBUG: Dados do controle antes de salvar ===");
            console.log("controlId:", controlId);
            console.log("isEditing:", isEditing);
            console.log("controlData:", controlData);
            console.log("categoria:", controlData.categoria);

            // Usa a API REST ao invés de chamada direta
            const apiUrl = isEditing ? `/api/controls/${controlId}` : '/api/controls';
            const apiMethod = isEditing ? 'PUT' : 'POST';
            
            console.log("=== DEBUG: Chamando API ===");
            console.log("URL:", apiUrl);
            console.log("Method:", apiMethod);
            
            const saveResponse = await fetch(apiUrl, {
                method: apiMethod,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(controlDataToSend),
            });

            console.log("=== DEBUG: Resposta da API ===");
            console.log("Status:", saveResponse.status);
            console.log("OK:", saveResponse.ok);

            if (!saveResponse.ok) {
                const errorData = await saveResponse.json();
                console.error("=== DEBUG: Erro da API ===", errorData);
                throw new Error(errorData.message || 'Falha ao salvar o controle.');
            }

            const responseData = await saveResponse.json();
            console.log("=== DEBUG: Sucesso! ===", responseData);

            clearTimeout(timeoutId);
            toast({
                title: "Sucesso!",
                description: isEditing ? "O controle foi atualizado com sucesso." : "O novo controle foi salvo com sucesso.",
            });
            setFormMessage({ type: 'success', text: isEditing ? 'O controle foi atualizado com sucesso.' : 'O novo controle foi salvo com sucesso.' });
            
            console.log("=== DEBUG: Redirecionando para /controls ===");
            router.push('/controls');

        } catch (error) {
            console.error("=== DEBUG: ERRO CAPTURADO ===");
            console.error("Erro ao salvar o controle:", error);
            console.error("Tipo do erro:", typeof error);
            console.error("Stack trace:", error instanceof Error ? error.stack : 'N/A');
            
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            
            clearTimeout(timeoutId);
            toast({
                title: "Erro ao salvar controle",
                description: errorMessage,
                variant: "destructive",
            });
            setFormMessage({ type: 'error', text: errorMessage });
        } finally {
            clearTimeout(timeoutId);
            console.log("=== DEBUG: Finally - setIsSubmitting(false) ===");
            setIsSubmitting(false);
        }
    };
    
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Shield />
            {isEditing ? 'Editar Controle' : 'Cadastro de Novo Controle'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Atualize as informações do controle selecionado.' 
            : 'Preencha os campos abaixo para registrar um novo controle e associá-lo a um ou mais riscos.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* DEBUG: Exibe controlId e isEditing */}
            <div className="mb-2 text-xs text-gray-500">
                <strong>DEBUG:</strong> controlId: {String(controlId)} | isEditing: {String(isEditing)}
            </div>
            {/* Exibe erros de validação do React Hook Form/Zod no topo */}
            {Object.keys(errors).length > 0 && (
                <div className="rounded p-3 mb-4 text-sm font-medium bg-red-100 text-red-800 border border-red-300" role="alert">
                    <ul className="list-disc pl-4">
                        {Object.entries(errors).map(([field, err]) => (
                            <li key={field}>{(err as any).message || String(field)}</li>
                        ))}
                    </ul>
                </div>
            )}
            {formMessage && (
                <div className={`rounded p-3 mb-4 text-sm font-medium ${formMessage.type === 'error' ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-green-100 text-green-800 border border-green-300'}`}
                    role={formMessage.type === 'error' ? 'alert' : 'status'}>
                    {formMessage.text}
                </div>
            )}
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
                <Field label="Categoria">
                    <Controller
                        name="categoria"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                                <SelectContent>{categoriasControle.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                            </Select>
                        )}
                    />
                    {errors.categoria && <p className="text-sm text-destructive">{errors.categoria.message}</p>}
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
            </Section>
            
            <Section title="Responsabilidade e Prazos">
                <Field label="Dono do Controle" className="sm:col-span-2">
                    <Controller
                        name="donoControle"
                        control={control}
                        render={({ field }) => (
                            <UserAutocomplete
                                value={field.value}
                                onSelect={(selectedValue) => {
                                    field.onChange(selectedValue);
                                    // Auto-preencher email extraindo do formato "Name (email)"
                                    const match = selectedValue.match(/\(([^)]+)\)$/);
                                    if (match) {
                                        setValue('emailDono', match[1].trim());
                                    }
                                }}
                            />
                        )}
                    />
                    {errors.donoControle && <p className="text-sm text-destructive">{errors.donoControle.message}</p>}
                </Field>
                <Field label="E-mail do Dono (preenchido automaticamente)">
                    <Input {...register("emailDono")} type="email" disabled className="bg-muted" />
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
            
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push('/controls')}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting || isLoadingControl}>
                    {isSubmitting ? 'Salvando...' : (isEditing ? 'Atualizar Controle' : 'Salvar Controle')}
                </Button>
            </div>
        </form>
      </CardContent>
    </Card>
  );
}
