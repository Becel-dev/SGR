'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { generateReportAction, ReportState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
              Faça uma pergunta ou dê um comando. A IA usará os dados de riscos, controles e KPIs do sistema para gerar o relatório.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Seu Pedido</Label>
              <Textarea
                id="prompt"
                name="prompt"
                placeholder="Ex: Gere um sumário executivo dos riscos críticos com status 'Aberto'. Liste os 5 principais controles com status 'Implementado com Pendência' e seus responsáveis. Quais KPIs estão atrasados e quem são os responsáveis?"
                rows={8}
              />
              {state.errors?.prompt && (
                <p className="text-sm text-destructive">{state.errors.prompt[0]}</p>
              )}
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
