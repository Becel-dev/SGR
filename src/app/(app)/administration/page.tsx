import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function AdministrationPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Users />
            Administração
        </CardTitle>
        <CardDescription>
            Gerenciamento de usuários, papéis e permissões do sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Esta seção está em desenvolvimento.</p>
      </CardContent>
    </Card>
  );
}
