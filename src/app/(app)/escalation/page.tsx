import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Rss } from "lucide-react";

export default function EscalationPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Rss />
            Escalonamento
        </CardTitle>
        <CardDescription>
            Regras de escalonamento, histórico de notificações e pendências.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Esta seção está em desenvolvimento.</p>
      </CardContent>
    </Card>
  );
}
