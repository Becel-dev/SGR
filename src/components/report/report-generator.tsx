'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { generateReportAction, ReportState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Gerar Relatório
        </>
      )}
    </Button>
  );
}

export function ReportGenerator() {
  const initialState: ReportState = {};
  const [state, formAction] = useActionState(generateReportAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message && state.errors) {
      toast({
        variant: 'destructive',
        title: 'Erro de Validação',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form action={formAction}>
        <Card>
          <CardHeader>
            <CardTitle>Gerador de Relatório de Risco com IA</CardTitle>
            <CardDescription>
              Forneça os detalhes para que a IA possa montar um relatório customizado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="risk-details">Detalhes dos Riscos</Label>
              <Textarea
                id="risk-details"
                name="riskDetails"
                placeholder="Ex: Risco de descarrilamento em curvas de raio reduzido devido a desgaste de trilhos. Atinge principalmente a Malha Sul..."
                rows={5}
              />
              {state.errors?.riskDetails && (
                <p className="text-sm text-destructive">{state.errors.riskDetails[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="control-details">Detalhes dos Controles</Label>
              <Textarea
                id="control-details"
                name="controlDetails"
                placeholder="Ex: Controle preventivo: Inspeção ultrassônica de trilhos com frequência semanal. Controle mitigatório: Redução de velocidade em trechos críticos."
                rows={5}
              />
               {state.errors?.controlDetails && (
                <p className="text-sm text-destructive">{state.errors.controlDetails[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="kpi-details">Detalhes dos KPIs</Label>
              <Textarea
                id="kpi-details"
                name="kpiDetails"
                placeholder="Ex: KPI de conformidade das inspeções (Meta: 95%). KPI de ocorrências por trecho (Meta < 1/mês)."
                rows={3}
              />
              {state.errors?.kpiDetails && (
                <p className="text-sm text-destructive">{state.errors.kpiDetails[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-format">Formato do Relatório</Label>
              <Select name="reportFormat" defaultValue="paragraph">
                <SelectTrigger id="report-format">
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paragraph">Parágrafos</SelectItem>
                  <SelectItem value="bullet_points">Tópicos (Bullet Points)</SelectItem>
                  <SelectItem value="executive_summary">Sumário Executivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </Card>
      </form>
      
      <Card>
        <CardHeader>
            <CardTitle className='flex items-center'>
                <Bot className="mr-2 h-5 w-5"/>
                Relatório Gerado
            </CardTitle>
            <CardDescription>O resultado da análise da IA será exibido aqui.</CardDescription>
        </CardHeader>
        <CardContent>
            {state.report ? (
                 <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: state.report.replace(/\n/g, '<br />') }} />
            ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Aguardando geração do relatório...</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
