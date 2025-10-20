
'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { notFound, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Siren, Shield, Activity, BarChart3, Briefcase, CircleHelp, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { RiskAnalysis } from "@/lib/types";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

// Formata data ISO para formato brasileiro com hora
const formatDateTime = (isoString: string | undefined) => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch {
        return isoString;
    }
};

const DetailItem = ({ label, value, className, isBadge = false, isDateTime = false }: { label: string, value: React.ReactNode, className?: string, isBadge?: boolean, isDateTime?: boolean }) => {
    if (!value && value !== 0 && value !== '') return null;

    let displayValue: React.ReactNode = value;
    let ValueWrapper: 'p' | 'div' = 'p';

    if(isBadge && typeof value === 'string') {
        const badgeVariant = (riskLevelVariantMap[value] || statusVariantMap[value] || 'default');
        displayValue = <Badge variant={badgeVariant}>{value}</Badge>;
        ValueWrapper = 'div'; // Use div for badge to avoid p-in-p error
    } else if (isDateTime && typeof value === 'string') {
        displayValue = formatDateTime(value);
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
    const id = params?.id as string | undefined;
    const [risk, setRisk] = useState<RiskAnalysis | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRisk = async () => {
            if (!id) return;
            
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`/api/analysis/risks/${id}`);
                
                if (response.status === 404) {
                    setRisk(undefined);
                    return;
                }
                
                if (!response.ok) {
                    throw new Error('Erro ao buscar risco');
                }
                
                const data = await response.json();
                setRisk(data);
            } catch (err) {
                console.error('Erro ao carregar risco:', err);
                setError(err instanceof Error ? err.message : 'Erro desconhecido');
            } finally {
                setLoading(false);
            }
        };

        fetchRisk();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (!risk) {
        return notFound();
    }

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
                            {risk.riskName}
                        </CardDescription>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/analysis/risks">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar para Lista
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <Section title="Identificação e Contexto" icon={Briefcase}>
                    <DetailItem label="ID" value={risk.id} />
                    <DetailItem label="Risco" value={risk.riskName} className="sm:col-span-3"/>
                    <DetailItem label="Gerência" value={risk.gerencia} />
                    <DetailItem label="TopRisk Associado" value={risk.topRisk} className="sm:col-span-3"/>
                    <DetailItem label="Fator de Risco" value={risk.riskFactor} className="sm:col-span-4"/>
                    <DetailItem label="Dono do Risco" value={risk.donoRisco} />
                    <DetailItem label="Taxonomia" value={risk.taxonomia} />
                    <DetailItem label="Causa Provável" value={risk.probableCause} className="sm:col-span-3"/>
                    <DetailItem label="Cenário de Risco" value={risk.riskScenario} className="sm:col-span-3"/>
                    <DetailItem label="Consequência Esperada" value={risk.expectedConsequence} className="sm:col-span-3"/>
                    <DetailItem label="Controles Atuais" value={risk.currentControls} className="sm:col-span-3"/>
                    <DetailItem label="Observação" value={risk.observacao} className="sm:col-span-4"/>
                </Section>
                
                <Section title="Análise e Classificação" icon={BarChart3}>
                    <DetailItem label="IMP (Impacto Corporativo)" value={risk.corporateImpact} />
                    <DetailItem label="ORG (Relevância Organizacional)" value={risk.organizationalRelevance} />
                    <DetailItem label="PROB (Probabilidade)" value={risk.contextualizedProbability} />
                    <DetailItem label="CTRL (Capacidade Controles)" value={risk.currentControlCapacity} />
                    <DetailItem label="TEMPO (Contenção)" value={risk.containmentTime} />
                    <DetailItem label="FACIL (Viabilidade Técnica)" value={risk.technicalFeasibility} />
                    <DetailItem label="IER" value={risk.ier} />
                    <DetailItem label="Origem" value={risk.origem} />
                    <DetailItem label="Tipo IER" value={risk.tipoIER} />
                    <DetailItem label="Papel do Risco" value={risk.riskRole} />
                    <DetailItem label="Tipo de Apontamento" value={risk.pointingType} />
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
                    <DetailItem label="Criado em" value={risk.createdAt} isDateTime />
                    <DetailItem label="Criado por" value={risk.createdBy} />
                    <DetailItem label="Modificado em" value={risk.updatedAt} isDateTime />
                    <DetailItem label="Modificado por" value={risk.updatedBy} />
                </Section>

                <Section title="Controles e Bowtie" icon={CircleHelp}>
                    <DetailItem label="Bowtie Realizado" value={risk.bowtieRealizado} />
                    <DetailItem label="Possui CC" value={risk.possuiCC} />
                    <DetailItem label="URL do CC" value={risk.urlDoCC} />
                </Section>

            </CardContent>
        </Card>
    );
}
