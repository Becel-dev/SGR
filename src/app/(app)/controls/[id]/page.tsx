

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
import { controlsData } from '@/lib/mock-data';
import type { Control } from '@/lib/types';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Shield, GanttChartSquare, ClipboardList, User, Calendar, Info, PlusCircle } from 'lucide-react';


const DetailItem = ({ label, value, className }: { label: string, value: React.ReactNode, className?: string }) => {
    if (value === null || value === undefined || value === '') return null;
    return (
        <div className={className}>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-base break-words">{value}</p>
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

export default function ControlDetailPage() {
    const params = useParams();
    const { id } = params;
    const [control, setControl] = useState<Control | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const foundControl = controlsData.find(c => c.id.toString() === id);
            setControl(foundControl);
        }
        setLoading(false);
    }, [id]);

    if (loading) {
        return <div>Carregando...</div>;
    }

    if (!control) {
        return notFound();
    }

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
            <DetailItem label="ID do Risco" value={control.idRiscoMUE} />
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
            <DetailItem label="OnePager" value={control.onePager} />
            <DetailItem label="Evidência" value={control.evidencia} />
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
