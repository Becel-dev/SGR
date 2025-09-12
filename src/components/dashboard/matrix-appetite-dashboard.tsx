
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RiskMatrix } from "@/components/dashboard/risk-matrix";
import { risksData } from "@/lib/mock-data";

const topRisks = [
    "Risco 01. Não Integridade Operacional de Ativos",
    "Risco 02. Execução nos Projetos de Expansão",
    "Risco 03. Não Atendimento Junto ao Órgão Regulador",
    "Risco 04. Crise Ambiental & Mudanças Climáticas",
    "Risco 05. Decisões Tributárias e Judiciais Adversas",
    "Risco 06. Ambiente Concorrencial & Demanda",
    "Risco 07. Impactos no Ambiente Operacional de Tecnologia",
    "Risco 08. Integridade, Compliance & Reputação",
    "Risco 09. Dependência de Fornecedores",
    "Risco 10. Gente & Cultura",
    "Risco 11. Gestão de Mudança",
];

const AppetiteRuler = () => (
    <div className="mt-6">
        <div className="grid grid-cols-4 text-center text-white font-bold">
            <div className="bg-green-500 p-2 rounded-l-md">
                <p>0 - 199</p>
                <p>ACEITÁVEL</p>
            </div>
            <div className="bg-yellow-400 p-2 text-black">
                <p>200 - 499</p>
                <p>GERENCIÁVEL</p>
            </div>
            <div className="bg-orange-500 p-2">
                <p>500 - 799</p>
                <p>PRIORITÁRIO</p>
            </div>
            <div className="bg-red-600 p-2 rounded-r-md">
                <p>800 - 1000</p>
                <p>CRÍTICO</p>
            </div>
        </div>
    </div>
);


export function MatrixAppetiteDashboard() {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Painel de Matriz & Apetite de Risco</CardTitle>
        <CardDescription>
          Visualizações detalhadas da matriz de risco e definição do apetite.
        </CardDescription>
      </CardHeader>
      <CardContent>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Esquerda */}
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Apetite ao Risco</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <p>O Apetite ao Risco representa o nível de risco que a <strong>RUMO</strong> está disposta a aceitar para atingir seus objetivos estratégicos e servindo como um guia para a tomada de decisões. Na prática, define os limites do que é considerado aceitável em termos de exposição a riscos orientando priorização de ações, controles e investimentos. Esse conceito é medido por meio de uma <strong>régua global</strong> (0-1000), que posiciona cada risco dentro de faixas previamente estabelecidas pela RUMO, revisada pelo Comitê de Riscos e validada pelo Conselho.</p>
                    </CardContent>
                </Card>
                 <Card className="bg-blue-100 dark:bg-blue-900/30">
                    <CardHeader>
                        <CardTitle className="text-primary">TopRisks da RUMO</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-1 text-sm">
                            {topRisks.map((risk, index) => (
                                <li key={index}><strong>{risk.split('.')[0]}.</strong>{risk.split('.')[1]}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
            {/* Coluna Direita */}
            <div className="lg:col-span-2 space-y-6">
                <RiskMatrix risks={risksData} />
                <AppetiteRuler />
            </div>
         </div>
      </CardContent>
    </Card>
  );
}
