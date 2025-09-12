import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export default function IdentificationPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Lightbulb />
            Identificação de Risco
        </CardTitle>
        <CardDescription>
            Módulo para a identificação e captura de novos riscos no sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Esta seção está em desenvolvimento.</p>
      </CardContent>
    </Card>
  );
}
