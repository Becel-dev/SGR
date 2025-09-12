
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function RiskAnalysisDashboard() {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Painel de Análise do Risco</CardTitle>
        <CardDescription>
          Ferramentas e gráficos para análise aprofundada dos riscos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Esta seção está em desenvolvimento.</p>
        </div>
      </CardContent>
    </Card>
  );
}
