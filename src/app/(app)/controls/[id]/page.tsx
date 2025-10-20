'use client'

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Control, Kpi, Risk } from '@/lib/types';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Shield, GanttChartSquare, ClipboardList, User, Calendar, Info, PlusCircle, ArrowRight, FileText, AlertTriangle, Trash2, Edit, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PermissionButton } from '@/components/auth/permission-button';
import { usePermissions } from '@/hooks/use-permissions'; // Otimização: múltiplos módulos em uma chamada
import { formatDateCached } from '@/lib/date-utils'; // Otimização: cache de formatação de datas


const DetailItem = ({ label, value, className }: { label: string, value: React.ReactNode, className?: string }) => {
    if (value === null || value === undefined || value === '') return null;
    return (
        <div className={className}>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="text-base break-words">{value}</div>
        </div>
    );
};

const Section = ({ title, children, icon: Icon }: { title: string, children: React.ReactNode, icon?: React.ElementType }) => (
     <div className="space-y-4 rounded-lg border p-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-primary" />}
            {title}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {children}
        </div>
    </div>
)

const kpiStatusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    'OK': 'default',
    'NOK': 'destructive',
};

// Função local para formatar data sem hora (compatibilidade)
const formatDate = (value: unknown) => {
    if (!value) return '-';
    return formatDateCached(value as string);
}

// Função para formatar data COM hora
const formatDateTime = (value: string | Date | undefined) => {
    if (!value) return '-';
    try {
        const date = typeof value === 'string' ? new Date(value) : value;
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch {
        return String(value);
    }
};


export default function ControlDetailPage() {
    return (
        <ProtectedRoute module="controles" action="view">
            <ControlDetailContent />
        </ProtectedRoute>
    );
}

function ControlDetailContent() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    
    // Otimização: Verificar permissões de múltiplos módulos de uma vez (3 PermissionButtons → 1 hook)
    const permissions = usePermissions([
        { module: 'kpis', action: 'create', key: 'kpisCreate' },
        { module: 'controles', action: 'delete', key: 'controlesDelete' },
        { module: 'controles', action: 'edit', key: 'controlesEdit' }
    ]);
    const id = params && typeof params.id === 'string' ? params.id : '';
    const [control, setControl] = useState<Control | null>(null);
    const [relatedKpis, setRelatedKpis] = useState<Kpi[]>([]);
    const [associatedRisks, setAssociatedRisks] = useState<Risk[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (id) {
            const fetchControlDetails = async () => {
                setLoading(true);
                try {
                    const res = await fetch(`/api/controls/${id}`);
                    if (!res.ok) {
                        throw new Error('Failed to fetch control details');
                    }
                    const data = await res.json();
                    setControl(data.control);
                    setAssociatedRisks(data.associatedRisks || []);
                    setRelatedKpis(data.relatedKpis || []);
                } catch (error) {
                    console.error(error);
                    setControl(null);
                } finally {
                    setLoading(false);
                }
            };
            fetchControlDetails();
        }
    }, [id]);

    const handleDelete = async () => {
        if (!control) return;
        setDeleting(true);
        try {
            const response = await fetch(`/api/controls/${control.id}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                throw new Error('Falha ao excluir controle');
            }
            
            toast({
                title: "Sucesso",
                description: "O controle foi excluído com sucesso.",
            });
            
            router.push('/controls');
            router.refresh();
        } catch (error: any) {
            console.error('Erro ao excluir controle:', error);
            toast({
                variant: "destructive",
                title: "Erro ao excluir",
                description: error?.message || "Não foi possível excluir o controle."
            });
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-4 rounded-lg border p-4">
                            <Skeleton className="h-6 w-1/4" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (!control) {
        return notFound();
    }
    
    const fileDisplay = (fileName: string) => (
        fileName && fileName.trim() !== '' ? (
            <Button variant="link" asChild className="p-0 h-auto text-base">
                <a href="#" download={fileName}>
                    <FileText className="mr-2 h-4 w-4" />
                    {fileName}
                </a>
            </Button>
        ) : '-'
    )

    return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <Shield />
                    Detalhes do Controle: {control.id}
                </CardTitle>
                <CardDescription>
                    {control.nomeControle}
                </CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="default" asChild>
                    <Link href={`/kpis/capture?controlId=${control.id}`}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar KPI
                    </Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/controls">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para Lista
                    </Link>
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        <Section title="Identificação do Controle" icon={Info}>
            <DetailItem label="ID do Controle" value={control.id} />
            <DetailItem label="Nome do Controle (CC)" value={control.nomeControle} className="sm:col-span-3"/>
        </Section>

        <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Riscos Associados
            </h3>
            <div className="overflow-x-auto">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID Risco</TableHead>
                            <TableHead>Nome do Risco</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Top Risk</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...new Map(associatedRisks.map(risk => [risk.id, risk])).values()].map((risk, idx) => (
                            <TableRow key={risk.id + '-' + idx}>
                                <TableCell>
                                    <Button variant="link" asChild className="p-0 h-auto">
                                        <Link href={`/analysis/risks/${risk.id}`}>{risk.id}</Link>
                                    </Button>
                                </TableCell>
                                <TableCell>{risk.risco}</TableCell>
                                <TableCell>{risk.status}</TableCell>
                                <TableCell>{risk.topRiskAssociado}</TableCell>
                            </TableRow>
                        ))}
                         {associatedRisks.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">Nenhum risco associado.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
        
        <Section title="Classificação e Status" icon={ClipboardList}>
            <DetailItem label="Categoria" value={control.categoria || '-'} />
            <DetailItem label="Classificação" value={control.classificacao} />
            <DetailItem label="Status" value={control.status} />
            <DetailItem label="Criticidade" value={control.criticidade} />
            <DetailItem label="Validação" value={control.validacao} />
            <DetailItem label="OnePager" value={control.onePager ? fileDisplay(control.onePager) : '-'} />
        </Section>
        
        <Section title="Responsabilidade e Governança" icon={User}>
            <DetailItem label="Dono do Controle" value={control.donoControle} />
            <DetailItem label="E-mail do Dono" value={control.emailDono} />
            <DetailItem label="Área" value={control.area} />
        </Section>

        <Section title="Metadados de Cadastro" icon={Calendar}>
             <DetailItem label="Data de Criação" value={formatDateTime(control.criadoEm)} />
             <DetailItem label="Criado Por" value={control.criadoPor} />
             <DetailItem label="Data de Modificação" value={formatDateTime(control.modificadoEm)} />
             <DetailItem label="Modificado Por" value={control.modificadoPor} />
             <DetailItem label="E-mails para KPI" value={control.preenchimentoKPI} className="sm:col-span-4" />
        </Section>

        {relatedKpis.length > 0 && (
            <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <GanttChartSquare className="h-5 w-5 text-primary" />
                    KPIs Relacionados
                </h3>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID do KPI</TableHead>
                                <TableHead>Dono do Controle</TableHead>
                                <TableHead>Frequência (dias)</TableHead>
                                <TableHead>Próxima Verificação</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {relatedKpis.map(kpi => (
                                <TableRow key={kpi.id}>
                                    <TableCell className="font-mono">{kpi.id}</TableCell>
                                    <TableCell>{kpi.donoControle}</TableCell>
                                    <TableCell>{kpi.frequenciaDias}</TableCell>
                                    <TableCell>{formatDate(kpi.dataProximaVerificacao)}</TableCell>
                                    <TableCell>
                                        <Badge variant={kpiStatusVariantMap[kpi.status] || 'default'}>{kpi.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/kpis/${kpi.id}`}>
                                            <ArrowRight className="h-4 w-4" />
                                            <span className="sr-only">Ver Detalhes do KPI</span>
                                        </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        )}
        
      </CardContent>
       <CardFooter className="flex justify-between">
            <div className="flex gap-2">
                <Button 
                    asChild 
                    disabled={!(permissions.kpisCreate as any)?.allowed || permissions.loading}
                >
                    <Link href={`/kpis/capture?controlId=${control.id}`}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar KPI
                    </Link>
                </Button>
            </div>
            <div className="flex gap-2">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button 
                            variant="destructive" 
                            disabled={deleting || !(permissions.controlesDelete as any)?.allowed || permissions.loading}
                        >
                            {deleting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            {deleting ? "Excluindo..." : "Excluir Controle"}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza que deseja excluir este controle?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente o controle "{control.nomeControle}" e todos os dados relacionados.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                                Sim, excluir
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                
                <Button 
                    asChild 
                    disabled={deleting || !(permissions.controlesEdit as any)?.allowed || permissions.loading}
                >
                    <Link href={`/controls/capture?id=${control.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar Controle
                    </Link>
                </Button>
            </div>
       </CardFooter>
    </Card>
  );
}
