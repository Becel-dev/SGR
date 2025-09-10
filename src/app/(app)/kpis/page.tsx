import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { GanttChartSquare } from "lucide-react";

export default function KpisPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <GanttChartSquare />
            KPIs &amp; Input de Resultados
        </CardTitle>
        <CardDescription>
            Input periódico de resultados de KPIs, metas e justificativas de desvios.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Esta seção está em desenvolvimento.</p>
      </CardContent>
    </Card>
  );
}
