'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit } from 'lucide-react';
import type { EscalationConfig } from '@/lib/types';

export default function EscalationViewPage() {
  const router = useRouter();
  const params = useParams();
  const [escalation, setEscalation] = useState<EscalationConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      loadEscalation(params.id as string);
    }
  }, [params]);

  const loadEscalation = async (id: string) => {
    try {
      const response = await fetch(`/api/escalation/${id}`);
      if (!response.ok) throw new Error('Falha ao carregar');
      const data = await response.json();
      setEscalation(data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  if (!escalation) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>Escalonamento não encontrado.</p>
          <Button onClick={() => router.push('/escalation')} className="mt-4">
            Voltar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push('/escalation')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button onClick={() => router.push(`/escalation/capture?id=${escalation.id}`)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Escalonamento</CardTitle>
          <CardDescription>
            Visualização completa da configuração de escalonamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações do Controle */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Controle</h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">ID</p>
                <p className="font-medium">{escalation.controlId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{escalation.controlName || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Status Geral */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Status do Escalonamento</p>
              <p className="text-sm text-muted-foreground">
                Última atualização: {new Date(escalation.updatedAt).toLocaleString('pt-BR')}
              </p>
            </div>
            <Badge variant={escalation.enabled ? "default" : "secondary"} className="text-base px-4 py-2">
              {escalation.enabled ? "Ativo" : "Inativo"}
            </Badge>
          </div>

          <Separator />

          {/* Configuração de Percentual */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Escalonamento por % Fora da Meta</h3>
              <Badge variant={escalation.percentageConfig.enabled ? "default" : "outline"}>
                {escalation.percentageConfig.enabled ? "Ativo" : "Inativo"}
              </Badge>
            </div>

            {escalation.percentageConfig.enabled && (
              <div className="space-y-3 pl-4">
                {/* Nível 1 */}
                <div className="p-4 border rounded-lg">
                  <p className="font-semibold mb-2">Nível 1</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">% Abaixo da Meta</p>
                      <p className="font-medium">{escalation.percentageConfig.level1.threshold}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Superior</p>
                      <p className="font-medium">{escalation.percentageConfig.level1.supervisor || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">E-mail</p>
                      <p className="font-medium">{escalation.percentageConfig.level1.supervisorEmail || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Nível 2 */}
                <div className="p-4 border rounded-lg">
                  <p className="font-semibold mb-2">Nível 2</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">% Abaixo da Meta</p>
                      <p className="font-medium">{escalation.percentageConfig.level2.threshold}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Superior</p>
                      <p className="font-medium">{escalation.percentageConfig.level2.supervisor || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">E-mail</p>
                      <p className="font-medium">{escalation.percentageConfig.level2.supervisorEmail || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Nível 3 */}
                <div className="p-4 border rounded-lg">
                  <p className="font-semibold mb-2">Nível 3</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">% Abaixo da Meta</p>
                      <p className="font-medium">{escalation.percentageConfig.level3.threshold}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Superior</p>
                      <p className="font-medium">{escalation.percentageConfig.level3.supervisor || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">E-mail</p>
                      <p className="font-medium">{escalation.percentageConfig.level3.supervisorEmail || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Configuração de Dias */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Escalonamento por Dias Vencidos</h3>
              <Badge variant={escalation.daysConfig.enabled ? "default" : "outline"}>
                {escalation.daysConfig.enabled ? "Ativo" : "Inativo"}
              </Badge>
            </div>

            {escalation.daysConfig.enabled && (
              <div className="space-y-3 pl-4">
                {/* Nível 1 */}
                <div className="p-4 border rounded-lg">
                  <p className="font-semibold mb-2">Nível 1</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Vencido há mais de</p>
                      <p className="font-medium">{escalation.daysConfig.level1.threshold} dias</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Superior</p>
                      <p className="font-medium">{escalation.daysConfig.level1.supervisor || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">E-mail</p>
                      <p className="font-medium">{escalation.daysConfig.level1.supervisorEmail || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Nível 2 */}
                <div className="p-4 border rounded-lg">
                  <p className="font-semibold mb-2">Nível 2</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Vencido há mais de</p>
                      <p className="font-medium">{escalation.daysConfig.level2.threshold} dias</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Superior</p>
                      <p className="font-medium">{escalation.daysConfig.level2.supervisor || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">E-mail</p>
                      <p className="font-medium">{escalation.daysConfig.level2.supervisorEmail || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Nível 3 */}
                <div className="p-4 border rounded-lg">
                  <p className="font-semibold mb-2">Nível 3</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Vencido há mais de</p>
                      <p className="font-medium">{escalation.daysConfig.level3.threshold} dias</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Superior</p>
                      <p className="font-medium">{escalation.daysConfig.level3.supervisor || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">E-mail</p>
                      <p className="font-medium">{escalation.daysConfig.level3.supervisorEmail || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
