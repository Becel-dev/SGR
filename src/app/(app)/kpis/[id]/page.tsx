
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
import { kpisData, controlsData } from '@/lib/mock-data';
import type { Kpi, Control } from '@/lib/types';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, GanttChartSquare, Shield, Calendar, User, Info, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const DetailItem = ({ label, value, className }: { label: string, value: React.ReactNode, className?: string }) => {
    if (value === null || value === undefined || value === '') return null;

    const isBadge = React.isValidElement(value) && value.type === Badge;
    const ValueWrapper = isBadge ? 'div' : 'p';

    return (
        <div className={className}>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <ValueWrapper className="text-base break-words">{value}</ValueWrapper>
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

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    'Em dia': 'default',
    'Atrasado': 'destructive',
};

export default function KpiDetailPage() {
    const params = useParams();
    const { id } = params;
    const [kpi, setKpi] = useState<Kpi | undefined>(undefined);
    const [control, setControl] = useState<Control | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const foundKpi = kpisData.find(k => k.id.toString() === id);
            setKpi(foundKpi);
            if (foundKpi) {
                const foundControl = controlsData.find(c => c.id === foundKpi.controlId);
                setControl(foundControl);
            }
        }
        setLoading(false);
    }, [id]);

    if (loading) {
        return <div>Carregando...</div>;
    }

    if (!kpi) {
        return notFound();
    }

    return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <GanttChartSquare />
                    Detalhes do KPI: {kpi.id}
                </CardTitle>
                <CardDescription>
                    Informações detalhadas do Key Performance Indicator.
                </CardDescription>
            </div>
            <Button variant="outline" asChild>
                <Link href="/kpis">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para Lista
                </Link>
            </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        <Section title="Informações do KPI" icon={Info}>
            <DetailItem label="ID do KPI" value={kpi.id} />
            <DetailItem label="Frequência" value={kpi.frequencia} />
            <DetailItem label="Status" value={<Badge variant={statusVariantMap[kpi.status] || 'default'}>{kpi.status}</Badge>} />
            <DetailItem label="Dias Pendentes" value={kpi.diasPendentes} />
        </Section>
        
        <Section title="Prazos e Registros" icon={Calendar}>
            <DetailItem label="Último KPI Informado" value={kpi.ultimoKpiInformado ? new Date(kpi.ultimoKpiInformado).toLocaleDateString('pt-BR') : 'N/A'} />
            <DetailItem label="Prazo para Próximo Registro" value={new Date(kpi.prazoProximoRegistro).toLocaleDateString('pt-BR')} />
        </Section>
        
        <Section title="Responsabilidade" icon={User}>
            <DetailItem label="Responsável" value={kpi.responsavel} />
            <DetailItem label="E-mail do Responsável" value={kpi.emailResponsavel} />
        </Section>

        {control && (
            <Section title="Controle Associado" icon={Shield}>
                <DetailItem label="ID do Controle" value={control.id} />
                <DetailItem label="Nome do Controle" value={control.nomeControle} className="sm:col-span-2" />
                <DetailItem label="Dono do Controle" value={control.donoControle} />
                <DetailItem label="Área do Controle" value={control.area} />
                <DetailItem label="Status do Controle" value={control.status} />
                <div className="sm:col-span-4">
                    <Button asChild variant="link" className="p-0 h-auto">
                        <Link href={`/controls/${control.id}`}>Ver detalhes completos do controle</Link>
                    </Button>
                </div>
            </Section>
        )}
        
      </CardContent>
       <CardFooter>
            <Button asChild>
                <Link href={`/kpis/capture?id=${kpi.id}`}>Editar KPI</Link>
            </Button>
       </CardFooter>
    </Card>
  );
}
