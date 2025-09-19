

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
import { controlsData, kpisData, risksData } from '@/lib/mock-data';
import type { Control, Kpi, AssociatedRisk, Risk } from '@/lib/types';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Shield, GanttChartSquare, ClipboardList, User, Calendar, Info, PlusCircle, ArrowRight, FileText, AlertTriangle } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';


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
    'Em dia': 'default',
    'Atrasado': 'destructive',
    'Pendente': 'secondary',
};

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12);
        return utcDate.toLocaleDateString('pt-BR');
    } catch(e) {
        return dateString;
    }
}


export default function ControlDetailPage() {
    const params = useParams();
    const { id } = params;
    const [control, setControl] = useState<Control | undefined>(undefined);
    const [relatedKpis, setRelatedKpis] = useState<Kpi[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const foundControl = controlsData.find(c => c.id.toString() === id);
            setControl(foundControl);
            if (foundControl) {
                const foundKpis = kpisData.filter(k => k.controlId === foundControl.id);
                setRelatedKpis(foundKpis);
            }
        }
        setLoading(false);
    }, [id]);

    if (loading) {
        return <div>Carregando...</div>;
    }

    if (!control) {
        return notFound();
    }
    
    const fileDisplay = (fileName: string) => (
        <Button variant="link" asChild className="p-0 h-auto text-base">
            <a href="#" download={fileName}>
                <FileText className="mr-2 h-4 w-4" />
                {fileName}
            </a>
        </Button>
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
            <Button variant="outline" asChild>
                <Link href="/controls">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para Lista
                </Link>
            </Button>
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
                            <TableHead>Código MUE</TableHead>
                            <TableHead>Título</TableHead>
                            <TableHead>Top Risk</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {control.associatedRisks.map(assocRisk => {
                            const risk = risksData.find(r => r.id === assocRisk.riskId);
                            return (
                                <TableRow key={assocRisk.riskId}>
                                    <TableCell>
                                        <Button variant="link" asChild className="p-0 h-auto">
                                            <Link href={`/risks/${assocRisk.riskId}`}>{assocRisk.riskId}</Link>
                                        </Button>
                                    </TableCell>
                                    <TableCell>{risk?.risco}</TableCell>
                                    <TableCell>{assocRisk.codigoMUE}</TableCell>
                                    <TableCell>{assocRisk.titulo}</TableCell>
                                    <TableCell>{risk?.topRiskAssociado}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
        
        <Section title="Classificação e Status" icon={ClipboardList}>
            <DetailItem label="Tipo (Preventivo/Mitigatório)" value={control.tipo} />
            <DetailItem label="Classificação" value={control.classificacao} />
            <DetailItem label="Status" value={control.status} />
            <DetailItem label="Criticidade" value={control.criticidade} />
            <DetailItem label="Validação" value={control.validacao} />
            <DetailItem label="OnePager" value={control.onePager ? fileDisplay(control.onePager) : '-'} />
            <DetailItem label="Evidência" value={control.evidencia ? fileDisplay(control.evidencia) : '-'} />
        </Section>
        
        <Section title="Responsabilidade e Prazos" icon={User}>
            <DetailItem label="Dono do Controle" value={control.donoControle} />
            <DetailItem label="E-mail do Dono" value={control.emailDono} />
            <DetailItem label="Área" value={control.area} />
            <DetailItem label="Frequência (em meses)" value={control.frequenciaMeses} />
            <DetailItem label="Data da Última Verificação" value={formatDate(control.dataUltimaVerificacao)} />
            <DetailItem label="Próxima Verificação" value={formatDate(control.proximaVerificacao)} />
        </Section>

        <Section title="Metadados de Cadastro" icon={Calendar}>
             <DetailItem label="Data de Criação" value={formatDate(control.criadoEm)} />
             <DetailItem label="Criado Por" value={control.criadoPor} />
             <DetailItem label="Data de Modificação" value={formatDate(control.modificadoEm)} />
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
                                <TableHead>Responsável</TableHead>
                                <TableHead>Frequência</TableHead>
                                <TableHead>Próximo Registro</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {relatedKpis.map(kpi => (
                                <TableRow key={kpi.id}>
                                    <TableCell className="font-mono">{kpi.id}</TableCell>
                                    <TableCell>{kpi.responsavel}</TableCell>
                                    <TableCell>{kpi.frequencia}</TableCell>
                                    <TableCell>{formatDate(kpi.prazoProximoRegistro)}</TableCell>
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
            <div>
                 <Button asChild>
                    <Link href={`/kpis/capture?controlId=${control.id}`}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar KPI
                    </Link>
                </Button>
            </div>
            <div>
                 <Button asChild>
                    <Link href={`/controls/edit/${control.id}`}>Editar Controle</Link>
                </Button>
            </div>
       </CardFooter>
    </Card>
  );
}
