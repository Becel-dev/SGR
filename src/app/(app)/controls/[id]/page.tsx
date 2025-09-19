

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
import { controlsData, kpisData } from '@/lib/mock-data';
import type { Control, Kpi } from '@/lib/types';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Shield, GanttChartSquare, ClipboardList, User, Calendar, Info, PlusCircle, ArrowRight, FileText } from 'lucide-react';
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
                    {control.titulo}
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
            <DetailItem label="ID" value={control.id} />
            <DetailItem label="Código do MUE" value={control.codigoMUE} />
            <DetailItem label="Título" value={control.titulo} />
            <DetailItem label="Nome do Controle (CC)" value={control.nomeControle} className="sm:col-span-2 md:col-span-3"/>
        </Section>
        
        <Section title="Risco Associado" icon={GanttChartSquare}>
            <DetailItem 
                label="ID do Risco" 
                value={
                    <Button variant="link" asChild className="p-0 h-auto text-base">
                        <Link href={`/risks/${control.idRiscoMUE}`}>{control.idRiscoMUE}</Link>
                    </Button>
                } 
            />
            <DetailItem label="Top Risk Associado" value={control.topRiskAssociado} />
            <DetailItem label="Gerência do Risco" value={control.gerenciaRisco} />
            <DetailItem label="Descrição do Risco (MUE)" value={control.descricaoMUE} className="sm:col-span-4"/>
        </Section>

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
            <DetailItem label="Data da Última Verificação" value={control.dataUltimaVerificacao} />
            <DetailItem label="Próxima Verificação" value={control.proximaVerificacao} />
        </Section>

        <Section title="Metadados de Cadastro" icon={Calendar}>
             <DetailItem label="Data de Criação" value={control.criadoEm} />
             <DetailItem label="Criado Por" value={control.criadoPor} />
             <DetailItem label="Data de Modificação" value={control.modificadoEm} />
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
