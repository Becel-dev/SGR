

'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { controlsData, initialBowtieData, risksData } from "@/lib/mock-data";
import { notFound, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Siren, DollarSign, Target, Shield, Activity, BarChart3, Briefcase, Users, CircleHelp, ClipboardList, TrendingUp, PlusCircle, ArrowRight, GitFork } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Control, Risk } from "@/lib/types";
import { useEffect, useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

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
};

const controlStatusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    'Implementado': 'default',
    'Implementado com Pendência': 'secondary',
    'Implementação Futura': 'outline',
    'Não Implementado': 'destructive',
};

const DetailItem = ({ label, value, className, isBadge = false }: { label: string, value: React.ReactNode, className?: string, isBadge?: boolean }) => {
    if (!value && value !== 0) return null;

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
    const [risk, setRisk] = useState<(typeof risksData[0]) | undefined>(undefined);
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

    if (loading) {
        return <div>Carregando...</div>;
    }

    if (!risk) {
        return notFound();
    }
    
    const hasBowtie = risk.bowtie === 'Realizado' || risk.bowtie === 'Sim';

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
                    <DetailItem label="Diretoria" value={risk.diretoria} />
                    <DetailItem label="Gerência" value={risk.gerencia} />
                    <DetailItem label="Processo" value={risk.processo} />
                    <DetailItem label="Data de Identificação" value={risk.dataDeIdentificacao} />
                    <DetailItem label="Descrição Detalhada" value={risk.descricaoDoRisco} className="sm:col-span-2 md:col-span-4"/>
                    <DetailItem label="Causa Raiz" value={risk.causaRaizDoRisco} className="sm:col-span-2"/>
                    <DetailItem label="Consequência" value={risk.consequenciaDoRisco} className="sm:col-span-2"/>
                </Section>
                
                <Section title="Categorização" icon={ClipboardList}>
                    <DetailItem label="Origem do Risco" value={risk.origemDoRisco} />
                    <DetailItem label="Tipo de Risco" value={risk.tipoDeRisco} />
                    <DetailItem label="Categoria do Risco" value={risk.categoriaDoRisco} />
                    <DetailItem label="Processo Afetado" value={risk.processoAfetado} />
                </Section>
                
                <Section title="Análise de Risco" icon={BarChart3}>
                    <DetailItem label="Probabilidade Inerente" value={risk.probabilidadeInerente} />
                    <DetailItem label="Impacto Inerente" value={risk.impactoInerente} />
                    <DetailItem label="Nível de Risco Inerente" value={risk.nivelDeRiscoInerente} isBadge />
                    <DetailItem label="Probabilidade Residual" value={risk.probabilidadeResidual} />
                    <DetailItem label="Impacto Residual" value={risk.impactoResidual} />
                    <DetailItem label="Nível de Risco Residual" value={risk.nivelDeRiscoResidual} isBadge />
                </Section>

                <Section title="Tratamento e Controles" icon={Shield}>
                     <DetailItem label="Estratégia de Resposta (Ação)" value={risk.estrategia} />
                     <DetailItem label="Descrição do Controle" value={risk.descricaoDoControle} className="sm:col-span-4" />
                </Section>
                
                <Section title="Gestão e Monitoramento" icon={Activity}>
                    <DetailItem label="Status do Risco" value={risk.statusDoRisco} isBadge />
                    <DetailItem label="Plano de Ação" value={risk.planoDeAcao} />
                    <DetailItem label="Responsável" value={risk.responsavelPeloRisco} />
                    <DetailItem label="Data da Última Revisão" value={risk.dataDaUltimaRevisao} />
                    <DetailItem label="Próxima Revisão" value={risk.dataDaProximaRevisao} />
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
            <CardFooter className="flex justify-between flex-wrap gap-2">
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
                 <Button asChild>
                    <Link href={`/risks/capture?id=${risk.id}`}>Editar Risco</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
