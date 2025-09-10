
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { risksData } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Siren } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const riskLevelVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    'Crítico': 'destructive',
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

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-base">{value}</p>
    </div>
);

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
                            Voltar
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Coluna 1: Identificação */}
                    <div className="space-y-4 rounded-lg border p-4">
                        <h3 className="font-semibold text-lg">Identificação</h3>
                        <DetailItem label="Descrição Detalhada" value={risk.descricaoDoRisco} />
                        <DetailItem label="Gerência" value={risk.gerencia} />
                        <DetailItem label="Processo Afetado" value={risk.processoAfetado} />
                        <DetailItem label="Data de Identificação" value={risk.dataDeIdentificacao} />
                        <DetailItem label="Origem do Risco" value={risk.origemDoRisco} />
                        <DetailItem label="Tipo de Risco" value={risk.tipoDeRisco} />
                        <DetailItem label="Causa Raiz" value={risk.causaRaizDoRisco} />
                        <DetailItem label="Consequência" value={risk.consequenciaDoRisco} />
                    </div>

                    {/* Coluna 2: Análise e Controles */}
                    <div className="space-y-4 rounded-lg border p-4">
                        <h3 className="font-semibold text-lg">Análise e Controles</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <DetailItem label="Probabilidade Inerente" value={risk.probabilidadeInerente} />
                            <DetailItem label="Impacto Inerente" value={risk.impactoInerente} />
                        </div>
                         <DetailItem label="Nível de Risco Inerente" value={<Badge variant={riskLevelVariantMap[risk.nivelDeRiscoInerente] || 'default'}>{risk.nivelDeRiscoInerente}</Badge>} />
                        <DetailItem label="Estratégia de Resposta" value={risk.estrategia} />
                        <DetailItem label="Descrição do Controle" value={risk.descricaoDoControle} />
                         <div className="grid grid-cols-2 gap-4">
                            <DetailItem label="Natureza do Controle" value={risk.naturezaDoControle} />
                            <DetailItem label="Tipo de Controle" value={risk.tipoDeControle} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <DetailItem label="Classificação" value={risk.classificacaoDoControle} />
                            <DetailItem label="Frequência" value={risk.frequencia} />
                        </div>
                         <DetailItem label="Eficácia do Controle" value={risk.eficaciaDoControle} />

                    </div>

                    {/* Coluna 3: Risco Residual e Gestão */}
                    <div className="space-y-4 rounded-lg border p-4">
                         <h3 className="font-semibold text-lg">Risco Residual e Gestão</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <DetailItem label="Probabilidade Residual" value={risk.probabilidadeResidual} />
                            <DetailItem label="Impacto Residual" value={risk.impactoResidual} />
                        </div>
                        <DetailItem label="Nível de Risco Residual" value={<Badge variant={riskLevelVariantMap[risk.nivelDeRiscoResidual] || 'default'}>{risk.nivelDeRiscoResidual}</Badge>} />
                        <DetailItem label="Status" value={<Badge variant={statusVariantMap[risk.statusDoRisco] || 'default'}>{risk.statusDoRisco}</Badge>} />
                        <DetailItem label="Responsável" value={risk.responsavelPeloRisco} />
                        <DetailItem label="Última Revisão" value={risk.dataDaUltimaRevisao} />
                        <DetailItem label="Próxima Revisão" value={risk.dataDaProximaRevisao} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
