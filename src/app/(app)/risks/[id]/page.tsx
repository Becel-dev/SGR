
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { risksData } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Siren, DollarSign, Target, BarChart2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

const DetailItem = ({ label, value, className }: { label: string, value: React.ReactNode, className?: string }) => (
    <div className={className}>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-base break-words">{value || '-'}</p>
    </div>
);

const Section = ({ title, children, icon: Icon }: { title: string, children: React.ReactNode, icon?: React.ElementType }) => (
     <div className="space-y-4 rounded-lg border p-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-primary" />}
            {title}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {children}
        </div>
    </div>
)

export default function RiskDetailPage({ params }: { params: { id: string } }) {
    const risk = risksData.find(r => r.id === params.id);

    if (!risk) {
        notFound();
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Siren />
                            Detalhes do Risco: {risk.id}
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

                <Section title="Identificação e Contexto">
                    <DetailItem label="Diretoria" value={risk.diretoria} />
                    <DetailItem label="Gerência" value={risk.gerencia} />
                    <DetailItem label="Processo" value={risk.processo} />
                    <DetailItem label="Descrição Detalhada" value={risk.descricaoDoRisco} className="sm:col-span-2 md:col-span-3"/>
                    <DetailItem label="Data de Identificação" value={risk.dataDeIdentificacao} />
                    <DetailItem label="Origem" value={risk.origemDoRisco} />
                    <DetailItem label="Processo Afetado" value={risk.processoAfetado} />
                    <DetailItem label="Causa Raiz" value={risk.causaRaizDoRisco} className="sm:col-span-2 md:col-span-3"/>
                    <DetailItem label="Consequência" value={risk.consequenciaDoRisco} className="sm:col-span-2 md:col-span-3"/>
                    <DetailItem label="Categoria" value={risk.categoriaDoRisco} />
                    <DetailItem label="Tipo de Risco" value={risk.tipoDeRisco} />
                </Section>
                
                <Section title="Análise de Risco Inerente">
                    <DetailItem label="Probabilidade" value={risk.probabilidadeInerente} />
                    <DetailItem label="Impacto" value={risk.impactoInerente} />
                    <DetailItem label="Nível de Risco" value={<Badge variant={riskLevelVariantMap[risk.nivelDeRiscoInerente] || 'default'}>{risk.nivelDeRiscoInerente}</Badge>} />
                </Section>

                <Section title="Controles e Tratamento">
                     <DetailItem label="Estratégia de Resposta" value={risk.estrategia} />
                     <DetailItem label="Descrição do Controle" value={risk.descricaoDoControle} className="sm:col-span-2" />
                     <DetailItem label="Natureza do Controle" value={risk.naturezaDoControle} />
                     <DetailItem label="Tipo de Controle" value={risk.tipoDeControle} />
                     <DetailItem label="Classificação" value={risk.classificacaoDoControle} />
                     <DetailItem label="Frequência" value={risk.frequencia} />
                     <DetailItem label="Eficácia do Controle" value={risk.eficaciaDoControle} />
                     <DetailItem label="Documentação" value={risk.documentacaoControle} />
                </Section>
                
                <Section title="Análise de Risco Residual">
                    <DetailItem label="Probabilidade" value={risk.probabilidadeResidual} />
                    <DetailItem label="Impacto" value={risk.impactoResidual} />
                    <DetailItem label="Nível de Risco" value={<Badge variant={riskLevelVariantMap[risk.nivelDeRiscoResidual] || 'default'}>{risk.nivelDeRiscoResidual}</Badge>} />
                </Section>

                <Section title="Gestão e Monitoramento">
                    <DetailItem label="Responsável" value={risk.responsavelPeloRisco} />
                    <DetailItem label="Plano de Ação" value={risk.planoDeAcao} />
                    <DetailItem label="Status" value={<Badge variant={statusVariantMap[risk.statusDoRisco] || 'default'}>{risk.statusDoRisco}</Badge>} />
                    <DetailItem label="Apetite ao Risco" value={risk.apetiteAoRisco} />
                    <DetailItem label="Última Revisão" value={risk.dataDaUltimaRevisao} />
                    <DetailItem label="Próxima Revisão" value={risk.dataDaProximaRevisao} />
                </Section>
                
                <Section title="Indicadores Chave (KRI)" icon={Target}>
                    <DetailItem label="KRI" value={risk.kri} className="sm:col-span-3"/>
                    <DetailItem label="Indicador de Risco" value={risk.indicadorRisco} className="sm:col-span-3" />
                    <DetailItem label="Limite de Apetite" value={risk.limiteApetite} />
                    <DetailItem label="Limite de Tolerância" value={risk.limiteTolerancia} />
                    <DetailItem label="Limite de Capacidade" value={risk.limiteCapacidade} />
                    <DetailItem label="Medição Atual" value={risk.medicaoAtual} />
                </Section>
                
                <Section title="Análise Financeira" icon={DollarSign}>
                    <DetailItem label="Custo do Risco" value={risk.custoDoRisco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                    <DetailItem label="Benefício do Controle" value={risk.beneficioDoControle.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                    <DetailItem label="Valor Exposto" value={risk.valorExposto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                </Section>

            </CardContent>
            <CardFooter>
                 <Button asChild>
                    <Link href={`/risks/capture?id=${risk.id}`}>Editar Risco</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
