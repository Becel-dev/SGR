
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function EsgDashboard() {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Painel ESG</CardTitle>
        <CardDescription>
          Métricas e indicadores relacionados a Environmental, Social, and Governance.
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
