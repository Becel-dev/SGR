import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function ControlsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Shield />
            Governança de Controles
        </CardTitle>
        <CardDescription>
            Cadastro, gestão e vinculação de controles preventivos e mitigatórios.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Esta seção está em desenvolvimento.</p>
      </CardContent>
    </Card>
  );
}
