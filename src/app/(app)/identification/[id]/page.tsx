
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
import { identifiedRisksData } from '@/lib/identified-risks-data';
import type { IdentifiedRisk } from '@/lib/types';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Lightbulb, Info, SlidersHorizontal, BarChart, CheckSquare, Target, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {children}
        </div>
    </div>
)

const RatingItem = ({ label, value }: {label:string, value: number}) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-sm font-bold">{value} / 10</p>
        </div>
        <Progress value={value * 10} className="h-2" />
    </div>
)


export default function IdentifiedRiskDetailPage() {
    const params = useParams();
    const { id } = params;
    const [risk, setRisk] = useState<IdentifiedRisk | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const foundRisk = identifiedRisksData.find(c => c.id.toString() === id);
            setRisk(foundRisk);
        }
        setLoading(false);
    }, [id]);

    const handleDelete = () => {
        // Lógica de exclusão aqui
        console.log(`Risco ${risk?.id} excluído.`);
        // Idealmente, redirecionar o usuário após a exclusão
        // router.push('/identification');
    }

    if (loading) {
        return <div>Carregando...</div>;
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
                    <Lightbulb />
                    Detalhes da Identificação de Risco: {risk.id}
                </CardTitle>
                <CardDescription>
                    {risk.riskName}
                </CardDescription>
            </div>
            <Button variant="outline" asChild>
                <Link href="/identification">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para Lista
                </Link>
            </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        <Section title="Mapeamento e Identificação" icon={Info}>
            <DetailItem label="1. Nome do Risco" value={risk.riskName} className="lg:col-span-4" />
            <DetailItem label="2. Top Risk Corporativo" value={risk.topRisk} className="sm:col-span-2" />
            <DetailItem label="3. Fator de Risco" value={risk.riskFactor} className="sm:col-span-2" />
            <DetailItem label="4. Causa Provável" value={risk.probableCause} className="sm:col-span-2" />
            <DetailItem label="5. Cenário de Risco" value={risk.riskScenario} className="sm:col-span-2" />
            <DetailItem label="6. Consequência Esperada no Negócio" value={risk.expectedConsequence} className="sm:col-span-4" />
            <DetailItem label="7. Controles Atuais" value={risk.currentControls} className="sm:col-span-4" />
        </Section>
        
        <Section title="Categorização do Risco" icon={SlidersHorizontal}>
            <DetailItem label="8. Papel do Risco" value={<Badge variant="outline">{risk.riskRole}</Badge>} />
            <DetailItem label="9. Tipo de Apontamento" value={<Badge variant="outline">{risk.pointingType}</Badge>} />
             <DetailItem 
                label="10. Objetivos de Negócio Afetados" 
                value={
                    <div className="flex flex-wrap gap-2">
                        {risk.businessObjectives.map(obj => <Badge key={obj} variant="secondary">{obj}</Badge>)}
                    </div>
                } 
                className="sm:col-span-2"
            />
        </Section>
        
        <Section title="Classificação do Risco" icon={BarChart}>
            <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <RatingItem label="11. Potencial de Impacto Corporativo" value={risk.corporateImpact} />
                <RatingItem label="12. Relevância Organizacional" value={risk.organizationalRelevance} />
                <RatingItem label="13. Probabilidade Contextualizada" value={risk.contextualizedProbability} />
                <RatingItem label="14. Capacidade Atual de Controle" value={risk.currentControlCapacity} />
                <RatingItem label="15. Tempo Estimado de Contenção" value={risk.containmentTime} />
                <RatingItem label="16. Facilidade Técnica de Ocorrência" value={risk.technicalFeasibility} />
            </div>
        </Section>
      </CardContent>
       <CardFooter className="flex justify-between">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive-outline"><Trash2 className="mr-2 h-4 w-4" /> Excluir Risco</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza que deseja excluir o registro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente a ficha de identificação de risco "{risk.riskName}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Não</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Sim</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Button asChild>
                <Link href={`/identification/capture?id=${risk.id}`}>Editar Ficha</Link>
            </Button>
       </CardFooter>
    </Card>
  );
}
