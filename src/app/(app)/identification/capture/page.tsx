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
import { Lightbulb, Info, SlidersHorizontal, BarChart, Loader2, Lock } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { useHideDocumentScrollbar } from '@/hooks/use-hide-document-scrollbar';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { IdentifiedRisk } from '@/lib/types';
import { getIdentifiedRiskById, addOrUpdateIdentifiedRisk, getRiskAnalysisStatus } from '@/lib/azure-table-storage';
import { topRiskOptions, riskFactorOptions, businessObjectivesOptions, getTopRiskOptions, getRiskFactorOptions } from '@/lib/form-options';
import { useToast } from '@/hooks/use-toast';
import { useAuthUser } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/auth/protected-route';

const Section = ({ title, children, icon: Icon, defaultOpen = false, disabled = false }: { title: string, children: React.ReactNode, icon?: React.ElementType, defaultOpen?: boolean, disabled?: boolean }) => (
    <Accordion type="single" collapsible defaultValue={defaultOpen ? "item-1" : ""} disabled={disabled}>
        <AccordionItem value="item-1" className="border rounded-lg">
             <AccordionTrigger className="bg-muted/50 px-4 py-2 rounded-t-lg disabled:opacity-70">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    {Icon && <Icon className="h-5 w-5 text-primary" />}
                    {title}
                </h3>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {children}
                </div>
            </AccordionContent>
        </AccordionItem>
    </Accordion>
)

const Field = ({ label, children, className, description, error }: {label: string, children: React.ReactNode, className?: string, description?: string, error?: string}) => (
    <div className={cn("space-y-2", className)}>
        <Label>{label}</Label>
        {children}
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
)

const identifiedRiskSchema = z.object({
        id: z.string().default(''),
        riskName: z.string().min(1, "O nome do risco é obrigatório."),
        topRisk: z.string().min(1, "O Top Risk é obrigatório."),
        riskFactor: z.string().min(1, "O Fator de Risco é obrigatório."),
        donoRisco: z.string().optional(),
        probableCause: z.string().min(1, "A causa provável é obrigatória."),
        riskScenario: z.string().min(1, "O cenário de risco é obrigatório."),
        expectedConsequence: z.string().min(1, "A consequência é obrigatória."),
        currentControls: z.string().min(1, "Os controles atuais são obrigatórios."),
        riskRole: z.enum(['Facilitador técnico', 'Amplificador de impacto', 'Estruturante', 'De negócio direto']),
        pointingType: z.enum(['Risco efetivo', 'Facilitador técnico', 'Amplificador de impacto']),
        businessObjectives: z.array(z.string()).min(1, "Selecione pelo menos um objetivo.").max(3, "Selecione no máximo 3 objetivos."),
        corporateImpact: z.number().min(0).max(10),
        organizationalRelevance: z.number().min(0).max(10),
        contextualizedProbability: z.number().min(0).max(10),
        currentControlCapacity: z.number().min(0).max(10),
        containmentTime: z.number().min(0).max(10),
        technicalFeasibility: z.number().min(0).max(10),
        observacao: z.string().optional(),
        // Campos de auditoria
        createdBy: z.string().optional(),
        createdAt: z.string().optional(),
        updatedBy: z.string().optional(),
        updatedAt: z.string().optional(),
});

const RatingSlider = ({ label, helpText, field, disabled }: { label: string, helpText: string, field: any, disabled: boolean }) => (
    <Field label={label} description={helpText}>
        <div className='flex items-center gap-4'>
            <Slider
                value={[field.value]}
                onValueChange={(v) => field.onChange(v[0])}
                max={10}
                step={1}
                disabled={disabled}
            />
            <span className="font-bold text-lg w-12 text-center">{field.value}</span>
        </div>
    </Field>
);

export default function CaptureIdentifiedRiskPage() {
    useHideDocumentScrollbar();
    const searchParams = useSearchParams();
    const riskId = searchParams ? searchParams.get('id') : null;
    const isEditing = !!riskId;
    
    // Proteger a página com ACL
    // Se está editando, precisa de permissão de 'edit'
    // Se está criando, precisa de permissão de 'create'
    return (
        <ProtectedRoute 
            module="identificacao" 
            action={isEditing ? 'edit' : 'create'}
        >
            <CaptureIdentifiedRiskContent />
        </ProtectedRoute>
    );
}

function CaptureIdentifiedRiskContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const riskId = searchParams ? searchParams.get('id') : null;
    const isEditing = !!riskId;
    const { toast } = useToast();
    const authUser = useAuthUser(); // ✅ Hook deve ser chamado no topo do componente
    const [loading, setLoading] = React.useState(isEditing);
    const [isLocked, setIsLocked] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [topRisks, setTopRisks] = React.useState<string[]>(topRiskOptions); // Fallback estático
    const [riskFactors, setRiskFactors] = React.useState<Array<{ nome: string; donoRisco: string }>>(riskFactorOptions.map(rf => ({ nome: rf, donoRisco: '' }))); // Fallback estático

    const { control, handleSubmit, register, setValue, watch, formState: { errors, isSubmitting } } = useForm<z.infer<typeof identifiedRiskSchema>>({
        resolver: zodResolver(identifiedRiskSchema),
        defaultValues: {
            id: '',
            businessObjectives: [], corporateImpact: 0, organizationalRelevance: 0, contextualizedProbability: 0,
            currentControlCapacity: 0, containmentTime: 0, technicalFeasibility: 0
        }
    });

    // Carrega TopRisks dinamicamente
    React.useEffect(() => {
        const loadTopRisks = async () => {
            try {
                const dynamicTopRisks = await getTopRiskOptions();
                setTopRisks(dynamicTopRisks);
            } catch (error) {
                console.error('Erro ao carregar TopRisks:', error);
                // Mantém o fallback estático
            }
        };
        loadTopRisks();
    }, []);

    // Carrega RiskFactors dinamicamente
    React.useEffect(() => {
        const loadRiskFactors = async () => {
            try {
                const dynamicRiskFactors = await getRiskFactorOptions();
                // dynamicRiskFactors agora retorna { nome, donoRisco }
                setRiskFactors(dynamicRiskFactors);
            } catch (error) {
                console.error('Erro ao carregar RiskFactors:', error);
                // Mantém o fallback estático
            }
        };
        loadRiskFactors();
    }, []);

    React.useEffect(() => {
        if (riskId) {
            setError(null);
            const fetchRisk = async () => {
                try {
                    const [risk, status] = await Promise.all([
                        getIdentifiedRiskById(riskId),
                        getRiskAnalysisStatus(riskId)
                    ]);

                    // Bloqueia se o status for 'Em Análise' ou 'Analisado'
                    setIsLocked(status === 'Em Análise' || status === 'Analisado');

                    if (risk) {
                        // Só atualiza os campos que existem no schema
                        Object.keys(identifiedRiskSchema.shape).forEach((key) => {
                            setValue(key as any, (risk as any)[key]);
                        });
                    }
                } catch (err: any) {
                    setError("Erro ao carregar dados do risco. Tente novamente.");
                    toast({
                        variant: "destructive",
                        title: "Erro ao carregar risco",
                        description: err?.message || "Não foi possível conectar ao banco de dados."
                    });
                } finally {
                    setLoading(false);
                }
            };
            fetchRisk();
        }
    }, [riskId, setValue]);

    const onSubmit = async (data: z.infer<typeof identifiedRiskSchema>) => {
        setError(null);
        
        // ✅ Verificar se a sessão ainda está carregando
        if (authUser.isLoading) {
            toast({
                variant: 'destructive',
                title: 'Aguarde',
                description: 'Aguardando autenticação carregar. Tente novamente em alguns segundos.',
            });
            return;
        }
        
        try {
            const now = new Date().toISOString();
            const userName = `${authUser.name} (${authUser.email})`;
            
            // Adiciona informações de auditoria com usuário real
            // Se for novo registro, não envia id (deixa backend gerar R-n)
            const riskData = {
                ...data,
                updatedBy: userName,
                updatedAt: now,
                ...(!isEditing && {
                    createdBy: userName,
                    createdAt: now,
                    id: undefined,
                }),
            };

            const savedRisk = await addOrUpdateIdentifiedRisk(riskData as IdentifiedRisk);
            toast({
                title: "Sucesso!",
                description: `Risco ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso.`,
            });
            router.push(`/identification/${savedRisk.id}`);
        } catch (err: any) {
            setError("Erro ao salvar o risco. Tente novamente.");
            toast({
                variant: 'destructive',
                title: 'Erro ao Salvar',
                description: err?.message || 'Ocorreu um erro ao salvar o risco. Tente novamente.',
            });
            console.error(err);
        }
    };

    if (loading) {
         return (
            <div className="flex h-64 w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
        return (
                <Card>
                        <form onSubmit={handleSubmit(onSubmit)}>
                        <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                                <Lightbulb />
                                                {isEditing ? 'Editar Ficha de Risco' : 'Ficha de Identificação de Risco'}
                                </CardTitle>
                                <CardDescription>
                                        {isEditing ? 'Atualize os campos abaixo.' : 'Preencha os campos abaixo para incluir um novo risco na base.'}
                                </CardDescription>
                                {isLocked && (
                                    <div className="mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md">
                                        <p className="font-bold flex items-center gap-2"><Lock className="h-4 w-4"/> Edição Bloqueada</p>
                                        <p>Este risco já está em processo de análise e não pode ser modificado aqui.</p>
                                    </div>
                                )}
                                {/* Campos de auditoria, apenas se estiver editando */}
                                {isEditing && (
                                                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
                                                            <div><b>Criado por:</b> {watch().createdBy || 'Sistema'}</div>
                                                            <div><b>Data de criação:</b> {typeof watch().createdAt === 'string' && watch().createdAt !== '' ? new Date(watch().createdAt as string).toLocaleString('pt-BR') : '-'}</div>
                                                            <div><b>Última alteração por:</b> {watch().updatedBy || 'Sistema'}</div>
                                                            <div><b>Data da última alteração:</b> {typeof watch().updatedAt === 'string' && watch().updatedAt !== '' ? new Date(watch().updatedAt as string).toLocaleString('pt-BR') : '-'}</div>
                                                        </div>
                                )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                {error && (
                    <div className="text-center p-4 text-destructive border border-destructive rounded mb-4">
                        {error}
                    </div>
                )}
                <Section title="Mapeamento e Identificação" icon={Info} defaultOpen disabled={isLocked}>
                    <Field label="1. Nome do Risco" className="md:col-span-2" description="Descreva o risco em uma frase curta e objetiva." error={errors.riskName?.message}>
                        <Input {...register("riskName")} placeholder="Ex: Interrupção no fornecimento de peças..." disabled={isLocked} />
                    </Field>
                    <Field label="2. Top Risk Corporativo" description="Selecione o Top Risk relacionado." error={errors.topRisk?.message}>
                        <Controller name="topRisk" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value} disabled={isLocked}>
                                <SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger>
                                <SelectContent>{topRisks.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                            </Select>
                        )} />
                    </Field>
                    <Field label="3. Fator de Risco" description="Assinale o item do mapa de riscos." error={errors.riskFactor?.message}>
                        <Controller name="riskFactor" control={control} render={({ field }) => (
                            <Select onValueChange={(value) => {
                                field.onChange(value);
                                // Auto-popula o donoRisco baseado no fator de risco selecionado
                                const selectedFactor = riskFactors.find(rf => rf.nome === value);
                                if (selectedFactor) {
                                    setValue('donoRisco', selectedFactor.donoRisco);
                                }
                            }} value={field.value} disabled={isLocked}>
                                <SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger>
                                <SelectContent>{riskFactors.map(factor => <SelectItem key={factor.nome} value={factor.nome}>{factor.nome}</SelectItem>)}</SelectContent>
                            </Select>
                        )} />
                    </Field>
                    <Field label="Dono do Risco" description="Preenchido automaticamente dos Parâmetros ao selecionar o Fator de Risco.">
                        <Input {...register("donoRisco")} disabled readOnly placeholder="Selecione um Fator de Risco" className="bg-muted" />
                    </Field>
                    <Field label="4. Causa Provável" description="Descreva a causa que pode originar o risco." error={errors.probableCause?.message}>
                        <Textarea {...register("probableCause")} placeholder="Ex: Alta dependência de fornecedor único..." disabled={isLocked} />
                    </Field>
                    <Field label="5. Cenário de Risco" description="Descreva uma situação prática." error={errors.riskScenario?.message}>
                        <Textarea {...register("riskScenario")} placeholder="Ex: Crise geopolítica impede o envio..." disabled={isLocked} />
                    </Field>
                    <Field label="6. Consequência Esperada" description="Descreva os principais impactos esperados." error={errors.expectedConsequence?.message}>
                        <Textarea {...register("expectedConsequence")} placeholder="Ex: Locomotivas paradas, queda na capacidade..." disabled={isLocked} />
                    </Field>
                    <Field label="7. Controles Atuais" description="Indique os controles existentes." error={errors.currentControls?.message}>
                        <Textarea {...register("currentControls")} placeholder="Ex: Estoque de peças críticas, Contratos..." disabled={isLocked} />
                    </Field>
                </Section>
                <Section title="Categorização do Risco" icon={SlidersHorizontal} disabled={isLocked}>
                    <Field label="8. Este risco atua principalmente como:" error={errors.riskRole?.message}>
                        <Controller name="riskRole" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value} disabled={isLocked}>
                                <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Facilitador técnico">01 - Facilitador técnico</SelectItem>
                                    <SelectItem value="Amplificador de impacto">02 - Amplificador de impacto</SelectItem>
                                    <SelectItem value="Estruturante">03 - Estruturante</SelectItem>
                                    <SelectItem value="De negócio direto">04 - De negócio direto</SelectItem>
                                </SelectContent>
                            </Select>
                        )}/>
                    </Field>
                    <Field label="9. Tipo do Apontamento" error={errors.pointingType?.message}>
                        <Controller name="pointingType" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value} disabled={isLocked}>
                                <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Risco efetivo">01 - Risco efetivo (associado a um Top Risk)</SelectItem>
                                    <SelectItem value="Facilitador técnico">02 - Facilitador técnico</SelectItem>
                                    <SelectItem value="Amplificador de impacto">03 - Amplificador de impacto</SelectItem>
                                </SelectContent>
                            </Select>
                        )}/>
                    </Field>
                    <Field label="10. Objetivos de Negócio Afetados" className="md:col-span-2" description="Você pode escolher até 3." error={errors.businessObjectives?.message}>
                        <Controller name="businessObjectives" control={control} render={({ field }) => (
                            <div className="p-4 border rounded-md space-y-2">
                                {businessObjectivesOptions.map(obj => (
                                    <div key={obj} className="flex items-center gap-2">
                                        <Checkbox 
                                            id={obj} 
                                            checked={field.value?.includes(obj)}
                                            onCheckedChange={(checked) => {
                                                return checked
                                                    ? field.onChange([...field.value, obj])
                                                    : field.onChange(field.value?.filter(value => value !== obj))
                                            }}
                                            disabled={isLocked}
                                        />
                                        <Label htmlFor={obj} className='font-normal'>{obj}</Label>
                                    </div>
                                ))}
                            </div>
                        )}/>
                    </Field>
                </Section>
                <Section title="Classificação do Risco (Impacto, Probabilidade)" icon={BarChart} disabled={isLocked}>
                    <Controller name="corporateImpact" control={control} render={({ field }) => (
                        <RatingSlider label="11. Potencial de Impacto Corporativo" helpText="Qual o impacto na companhia se o risco se concretizar?" field={field} disabled={isLocked} />
                    )}/>
                    <Controller name="organizationalRelevance" control={control} render={({ field }) => (
                        <RatingSlider label="12. Relevância Organizacional do Objeto de Risco" helpText="Avalia a importância estratégica/operacional do ativo/processo afetado." field={field} disabled={isLocked} />
                    )}/>
                    <Controller name="contextualizedProbability" control={control} render={({ field }) => (
                        <RatingSlider label="13. Probabilidade Contextualizada" helpText="Considera a frequência com que o risco já ocorreu ou sinais de que possa ocorrer." field={field} disabled={isLocked} />
                    )}/>
                    <Controller name="currentControlCapacity" control={control} render={({ field }) => (
                        <RatingSlider label="14. Capacidade Atual de Controle" helpText="Avalia a robustez dos controles existentes. (Lógica invertida: maior nota = menor controle)." field={field} disabled={isLocked} />
                    )}/>
                    <Controller name="containmentTime" control={control} render={({ field }) => (
                        <RatingSlider label="15. Tempo Estimado de Contenção/Mitigação" helpText="Mede a rapidez com que a organização pode responder ao risco. (Lógica invertida: maior nota = menor controle)." field={field} disabled={isLocked} />
                    )}/>
                    <Controller name="technicalFeasibility" control={control} render={({ field }) => (
                        <RatingSlider label="16. Facilidade Técnica/Prática de Ocorrência" helpText="Mede a viabilidade de o risco se concretizar." field={field} disabled={isLocked} />
                    )}/>
                    
                    <Field label="17. Observações" className="md:col-span-2" description="Observações adicionais sobre o risco identificado.">
                        <Textarea {...register("observacao")} placeholder="Digite observações relevantes sobre este risco..." disabled={isLocked} />
                    </Field>
                </Section>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting || loading}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting || loading || isLocked}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLocked ? 'Edição Bloqueada' : isEditing ? 'Salvar Alterações' : 'Salvar Risco'}
                </Button>
            </CardFooter>
            </form>
        </Card>
    );
}
