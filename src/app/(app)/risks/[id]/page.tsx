

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { risksData } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Siren, DollarSign, Target, Shield, Activity, BarChart3, Briefcase, Users, CircleHelp, ClipboardList, TrendingUp } from "lucide-react";
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

                <Section title="Identificação e Contexto" icon={Briefcase}>
                    <DetailItem label="Diretoria" value={risk.diretoria} />
                    <DetailItem label="Gerência" value={risk.gerencia} />
                    <DetailItem label="Processo" value={risk.processo} />
                    <DetailItem label="Processo Afetado" value={risk.processoAfetado} />
                    <DetailItem label="Descrição Detalhada" value={risk.descricaoDoRisco} className="sm:col-span-2 md:col-span-3"/>
                    <DetailItem label="Data de Identificação" value={risk.dataDeIdentificacao} />
                    <DetailItem label="Causa Raiz" value={risk.causaRaizDoRisco} className="sm:col-span-2 md:col-span-3"/>
                    <DetailItem label="Consequência" value={risk.consequenciaDoRisco} className="sm:col-span-2 md:col-span-3"/>
                </Section>
                
                <Section title="Categorização" icon={ClipboardList}>
                    <DetailItem label="Origem do Risco" value={risk.origemDoRisco} />
                    <DetailItem label="Tipo de Risco" value={risk.tipoDeRisco} />
                    <DetailItem label="Categoria do Risco" value={risk.categoriaDoRisco} />
                    <DetailItem label="Categoria (MP)" value={risk.categoriaMP} />
                    <DetailItem label="Top Risk Associado" value={risk.topRiskAssociado} className="sm:col-span-2"/>
                    <DetailItem label="Horizonte" value={risk.horizonte} />
                    <DetailItem label="Fator de Risco" value={risk.fatorDeRisco} />
                    <DetailItem label="Tronco" value={risk.tronco} />
                    <DetailItem label="Englobado" value={risk.englobado} />
                </Section>
                
                <Section title="Análise de Risco Inerente" icon={BarChart3}>
                    <DetailItem label="Probabilidade" value={risk.probabilidadeInerente} />
                    <DetailItem label="Impacto" value={risk.impactoInerente} />
                    <DetailItem label="Nível de Risco" value={risk.nivelDeRiscoInerente} isBadge />
                </Section>

                <Section title="Tratamento e Controles" icon={Shield}>
                     <DetailItem label="Estratégia de Resposta (Ação)" value={risk.estrategia} />
                     <DetailItem label="Possui Controle Central (CC)?" value={risk.possuiCC} />
                     <DetailItem label="URL do CC" value={risk.urlDoCC} />
                     <DetailItem label="Status do Controle" value={risk.statusControle} />
                     <DetailItem label="Descrição do Controle" value={risk.descricaoDoControle} className="sm:col-span-4" />
                </Section>
                
                <Section title="Análise de Risco Residual" icon={TrendingUp}>
                    <DetailItem label="Probabilidade" value={risk.probabilidadeResidual} />
                    <DetailItem label="Impacto" value={risk.impactoResidual} />
                    <DetailItem label="Nível de Risco" value={risk.nivelDeRiscoResidual} isBadge />
                </Section>

                <Section title="Gestão e Monitoramento" icon={Activity}>
                    <DetailItem label="Status do Risco" value={risk.statusDoRisco} isBadge />
                    <DetailItem label="Plano de Ação" value={risk.planoDeAcao} />
                    <DetailItem label="Responsável" value={risk.responsavelPeloRisco} />
                    <DetailItem label="Data da Última Revisão" value={risk.dataDaUltimaRevisao} />
                    <DetailItem label="Próxima Revisão" value={risk.dataDaProximaRevisao} />
                    <DetailItem label="Data da Avaliação" value={risk.dataDaAvaliacao} />
                    <DetailItem label="Contexto" value={risk.contexto} />
                    <DetailItem label="Bowtie" value={risk.bowtie} />
                    <DetailItem label="Observação" value={risk.observacao} className="sm:col-span-4"/>
                </Section>
                
                <Section title="Indicadores e ESG" icon={Users}>
                    <DetailItem label="Pilar" value={risk.pilar} />
                    <DetailItem label="Pilar ESG" value={risk.pilarESG} />
                    <DetailItem label="Indicador" value={risk.indicador} />
                    <DetailItem label="Sub-tema" value={risk.subtema} />
                    <DetailItem label="GE" value={risk.ge} />
                    <DetailItem label="GR" value={risk.gr} />
                </Section>
                
                <Section title="Pontuações e Classificações (Interno)" icon={CircleHelp}>
                    <DetailItem label="IMP" value={risk.impactoInerente} />
                    <DetailItem label="ORIG" value={risk.orig} />
                    <DetailItem label="PROB" value={risk.prob} />
                    <DetailItem label="CTRL" value={risk.ctrl} />
                    <DetailItem label="TEMPO" value={risk.tempo} />
                    <DetailItem label="FACIL" value={risk.facil} />
                    <DetailItem label="ELEV" value={risk.elev} />
                    <DetailItem label="IER" value={risk.ier} />
                    <DetailItem label="V" value={risk.v} />
                    <DetailItem label="D" value={risk.d} />
                    <DetailItem label="G" value={risk.g} />
                    <DetailItem label="U" value={risk.u} />
                    <DetailItem label="T (Score)" value={risk.t_score} />
                    <DetailItem label="I (Score)" value={risk.i_score} />
                    <DetailItem label="OredsX" value={risk.oredsX} />
                    <DetailItem label="T (Rating)" value={risk.t_rating} />
                    <DetailItem label="Filho" value={risk.filho} />
                    <DetailItem label="Riscos Aceitáveis" value={risk.riscosAceitaveis} />
                    <DetailItem label="Riscos Não Aceitáveis" value={risk.riscosNaoAceitaveis} />
                    <DetailItem label="Riscos Mix" value={risk.riscosMix} />
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
