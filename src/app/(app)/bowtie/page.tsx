import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { GitFork } from "lucide-react";

export default function BowtiePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <GitFork />
            Visualização Bowtie
        </CardTitle>
        <CardDescription>
            Editor e visualizador de diagramas Bowtie para análise de riscos (ISO 31000).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Esta seção está em desenvolvimento.</p>
      </CardContent>
    </Card>
  );
}
