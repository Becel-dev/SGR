
'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { controlsData, initialBowtieData, risksData } from "@/lib/mock-data";
import { notFound, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Siren, DollarSign, Target, Shield, Activity, BarChart3, Briefcase, Users, CircleHelp, ClipboardList, TrendingUp, PlusCircle, ArrowRight, GitFork, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Control, Risk } from "@/lib/types";
import { useEffect, useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
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
} from "@/components/ui/alert-dialog";

const riskLevelVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    'Crítico': 'destructive',
    'Extremo': 'destructive',
    'Alto': 'default',
    'Médio': 'secondary',
    'Baixo': 'outline',
};

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    'Aberto': 'secondary',
    'Em Tratamento': 'default',
    'Fechado': 'outline',
    'Mitigado': 'outline',
    'Novo': 'destructive',
    'Em Análise': 'secondary',
};

const controlStatusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    'Implementado': 'default',
    'Implementado com Pendência': 'secondary',
    'Implementação Futura': 'outline',
    'Não Implementado': 'destructive',
};

const DetailItem = ({ label, value, className, isBadge = false }: { label: string, value: React.ReactNode, className?: string, isBadge?: boolean }) => {
    if (!value && value !== 0 && value !== '') return null;

    let displayValue: React.ReactNode = value;
    let ValueWrapper: 'p' | 'div' = 'p';

    if(isBadge && typeof value === 'string') {
        const badgeVariant = (riskLevelVariantMap[value] || statusVariantMap[value] || 'default');
        displayValue = <Badge variant={badgeVariant}>{value}</Badge>;
        ValueWrapper = 'div'; // Use div for badge to avoid p-in-p error
    }

    return (
        <div className={className}>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <ValueWrapper className="text-base break-words">{displayValue}</ValueWrapper>
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

export default function RiskDetailPage() {
    const params = useParams();
    const { id } = params;
    const [risk, setRisk] = useState<Risk | undefined>(undefined);
    const [relatedControls, setRelatedControls] = useState<Control[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const foundRisk = risksData.find(r => r.id === id);
            setRisk(foundRisk);
             if(foundRisk) {
                const foundControls = controlsData.filter(c => c.idRiscoMUE && c.idRiscoMUE.toString() === foundRisk.id);
                setRelatedControls(foundControls);
            }
        }
        setLoading(false);
    }, [id]);

    const handleDelete = () => {
        // Lógica de exclusão aqui
        console.log(`Risco ${risk?.id} excluído.`);
        // Idealmente, redirecionar o usuário após a exclusão
        // router.push('/risks');
    }


    if (loading) {
        return <div>Carregando...</div>;
    }

    if (!risk) {
        return notFound();
    }
    
    const hasBowtie = risk.bowtieRealizado === 'Realizado' || risk.bowtieRealizado === 'Sim';

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Siren />
                            Análise de Risco: {risk.id}
                        </CardTitle>
                        <CardDescription>
                            {risk.risco}
                        </CardDescription>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/risks">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar para Lista
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <Section title="Identificação e Contexto" icon={Briefcase}>
                    <DetailItem label="ID" value={risk.id} />
                    <DetailItem label="Risco" value={risk.risco} className="sm:col-span-3"/>
                    <DetailItem label="Gerência" value={risk.gerencia} />
                    <DetailItem label="TopRisk Associado" value={risk.topRiskAssociado} className="sm:col-span-3"/>
                    <DetailItem label="Fator de Risco" value={risk.fatorDeRisco} className="sm:col-span-4"/>
                    <DetailItem label="Taxonomia" value={risk.taxonomia} />
                    <DetailItem label="Contexto" value={risk.contexto} className="sm:col-span-3"/>
                    <DetailItem label="Observação" value={risk.observacao} className="sm:col-span-4"/>
                </Section>
                
                <Section title="Análise e Classificação" icon={BarChart3}>
                    <DetailItem label="IMP" value={risk.imp} />
                    <DetailItem label="ORG" value={risk.org} />
                    <DetailItem label="PROB" value={risk.prob} />
                    <DetailItem label="CTRL" value={risk.ctrl} />
                    <DetailItem label="TEMPO" value={risk.tempo} />
                    <DetailItem label="FACIL" value={risk.facil} />
                    <DetailItem label="IER" value={risk.ier} />
                    <DetailItem label="Origem" value={risk.origem} />
                    <DetailItem label="Tipo IER" value={risk.tipoIER} />
                    <DetailItem label="X" value={risk.x} />
                    <DetailItem label="Y" value={risk.y} />
                    <DetailItem label="Englobador" value={risk.englobador} />
                </Section>

                <Section title="ESG e Governança" icon={Shield}>
                     <DetailItem label="Pilar" value={risk.pilar} />
                     <DetailItem label="Tema Material" value={risk.temaMaterial} />
                     <DetailItem label="Pilar ESG" value={risk.pilarESG} />
                     <DetailItem label="GE de Origem do Risco" value={risk.geOrigemRisco} />
                </Section>
                
                <Section title="Gestão e Prazos" icon={Activity}>
                    <DetailItem label="Status do Risco" value={risk.status} isBadge />
                    <DetailItem label="Responsável pelo Bowtie" value={risk.responsavelBowtie} />
                    <DetailItem label="Horizonte Tempo" value={risk.horizonteTempo} />
                    <DetailItem label="Data Alteração Curadoria" value={risk.dataAlteracaoCuradoria} />
                    <DetailItem label="Criado em" value={risk.criado} />
                    <DetailItem label="Criado por" value={risk.criadoPor} />
                    <DetailItem label="Modificado em" value={risk.modificado} />
                    <DetailItem label="Modificado por" value={risk.modificadoPor} />
                </Section>

                <Section title="Controles e Bowtie" icon={CircleHelp}>
                    <DetailItem label="Bowtie Realizado" value={risk.bowtieRealizado} />
                    <DetailItem label="Possui CC" value={risk.possuiCC} />
                    <DetailItem label="URL do CC" value={risk.urlDoCC} />
                </Section>
                
                {relatedControls.length > 0 && (
                    <div className="space-y-4 rounded-lg border p-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            Controles Relacionados
                        </h3>
                         <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Título</TableHead>
                                    <TableHead>Nome do Controle</TableHead>
                                    <TableHead>Dono</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {relatedControls.map(control => (
                                    <TableRow key={control.id}>
                                    <TableCell className="font-mono">{control.id}</TableCell>
                                    <TableCell className="font-medium">{control.titulo}</TableCell>
                                    <TableCell>{control.nomeControle}</TableCell>
                                    <TableCell>{control.donoControle}</TableCell>
                                    <TableCell>
                                        <Badge variant={controlStatusVariantMap[control.status] || 'default'}>{control.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/controls/${control.id}`}>
                                            <ArrowRight className="h-4 w-4" />
                                            <span className="sr-only">Ver Detalhes do Controle</span>
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
            <CardFooter className="flex justify-between flex-wrap gap-4">
                <div className="flex gap-2 flex-wrap">
                     <Button asChild>
                        <Link href={`/controls/capture?riskId=${risk.id}`}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Controle
                        </Link>
                    </Button>
                    {hasBowtie ? (
                        <Button asChild variant="outline">
                            <Link href={`/bowtie?riskId=${risk.id}`}>
                                <GitFork className="mr-2 h-4 w-4" />
                                Ver Bowtie
                            </Link>
                        </Button>
                    ) : (
                         <Button asChild variant="outline">
                            <Link href={`/bowtie?riskId=${risk.id}&create=true`}>
                                <GitFork className="mr-2 h-4 w-4" />
                                Criar Bowtie
                            </Link>
                        </Button>
                    )}
                </div>
                <div className="flex gap-2 flex-wrap">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive-outline"><Trash2 className="mr-2 h-4 w-4" />Excluir Risco</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza que deseja excluir o registro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o risco "{risk.risco}".
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Não</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>Sim</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button asChild>
                        <Link href={`/risks/capture?id=${risk.id}`}>Editar Risco</Link>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
