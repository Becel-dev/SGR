
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Esta seção está em desenvolvimento.</p>
        </div>
      </CardContent>
    </Card>
  );
}
