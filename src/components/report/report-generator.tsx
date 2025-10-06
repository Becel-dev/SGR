'use client';

import { useActionState, useEffect, useMemo } from 'react';
import { useFormStatus } from 'react-dom';
import { generateReportAction, ReportState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    } else if (state.message && !state.report && state.message.includes('Failed')) {
      toast({
        variant: 'destructive',
        title: 'Erro ao Gerar Relatório',
        description: state.message,
      });
    } else if (state.report && state.message?.includes('successfully')) {
      toast({
        title: 'Sucesso',
        description: 'Relatório gerado com sucesso!',
      });
    }
  }, [state, toast]);

  const examplePrompts = [
    "Liste todos os riscos críticos (IER > 7) e seus responsáveis",
    "Quais controles estão com status 'Implementado com Pendência'?",
    "Mostre os escalonamentos ativos e seus níveis de threshold",
    "Gere um sumário executivo dos Top Risks",
    "Quais riscos identificados têm maior IER e quais são seus controles atuais?",
    "Liste os controles da categoria 'Inspeção' e seus donos",
  ];

  // Converter o relatório para HTML formatado
  const formattedReport = useMemo(() => {
    if (!state.report) return null;
    
    // Converter markdown básico para HTML
    let html = state.report;
    
    // Headers
    html = html.replace(/### (.*?)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
    html = html.replace(/## (.*?)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>');
    html = html.replace(/# (.*?)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>');
    
    // Bold e Italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Listas
    html = html.replace(/^- (.*?)$/gm, '<li class="ml-4">$1</li>');
    html = html.replace(/(<li[^>]*>.*?<\/li>)/gm, '<ul class="list-disc list-inside space-y-1 mb-4">$1</ul>');
    
    // Quebras de linha
    html = html.replace(/\n\n/g, '<br /><br />');
    html = html.replace(/\n/g, '<br />');
    
    return html;
  }, [state.report]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form action={formAction}>
        <Card>
          <CardHeader>
            <CardTitle>Gerador de Relatório de Risco com IA</CardTitle>
            <CardDescription>
              Faça uma pergunta sobre os dados do sistema. A IA analisará riscos, controles, escalonamentos, riscos identificados e top risks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Sua Pergunta ou Solicitação</Label>
              <Textarea
                id="prompt"
                name="prompt"
                placeholder="Ex: Liste os 5 principais riscos com maior IER e seus controles associados..."
                rows={8}
              />
              {state.errors?.prompt && (
                <p className="text-sm text-destructive">{state.errors.prompt[0]}</p>
              )}
            </div>
            
            {/* Exemplos de Prompts */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Exemplos de Perguntas:</Label>
              <div className="grid gap-2">
                {examplePrompts.map((example, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="text-left text-xs p-2 rounded border hover:bg-muted transition-colors"
                    onClick={() => {
                      const textarea = document.getElementById('prompt') as HTMLTextAreaElement;
                      if (textarea) textarea.value = example;
                    }}
                  >
                    {example}
                  </button>
                ))}
              </div>
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
            {state.message && !state.report && state.message.includes('Failed') ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Erro ao gerar relatório. Por favor, tente novamente ou verifique sua conexão.
                </AlertDescription>
              </Alert>
            ) : formattedReport ? (
                 <div 
                   className="prose prose-sm max-w-none dark:prose-invert space-y-2" 
                   dangerouslySetInnerHTML={{ __html: formattedReport }} 
                 />
            ) : (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg p-6 text-center">
                    <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">Aguardando sua pergunta...</p>
                    <p className="text-xs text-muted-foreground">
                      Digite uma pergunta e clique em &quot;Gerar Relatório&quot;
                    </p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
