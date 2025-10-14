'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function ImprovementPage() {
  return (
    <ProtectedRoute module="melhoria" action="view">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
              <Sparkles />
              Melhoria Contínua
          </CardTitle>
          <CardDescription>
              Gestão de planos de ação, lições aprendidas e auditorias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Esta seção está em desenvolvimento.</p>
        </CardContent>
      </Card>
    </ProtectedRoute>
  );
}
