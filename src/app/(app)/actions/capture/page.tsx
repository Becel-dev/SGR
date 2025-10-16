'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Slider } from '@/components/ui/slider';
import { UserAutocomplete } from '@/components/ui/user-autocomplete';
import { useAuthUser } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useHideDocumentScrollbar } from '@/hooks/use-hide-document-scrollbar';

const actionFormSchema = z.object({
  controlId: z.string().min(1, 'ID do controle é obrigatório'),
  controlName: z.string().min(1, 'Nome do controle é obrigatório'),
  responsavel: z.string().min(3, 'Nome do responsável deve ter pelo menos 3 caracteres'),
  email: z.string().optional(),
  prazo: z.string().min(1, 'Prazo é obrigatório'),
  descricao: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  contingencia: z.string().optional(),
  criticidadeAcao: z.number().min(0).max(10),
  valorEstimado: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
  // Campos de auditoria
  createdBy: z.string().optional(),
  createdAt: z.string().optional(),
  updatedBy: z.string().optional(),
  updatedAt: z.string().optional(),
});

type ActionFormValues = z.infer<typeof actionFormSchema>;

function ActionCaptureContent() {
  useHideDocumentScrollbar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const authUser = useAuthUser(); // ✅ Hook deve ser chamado no topo do componente

  const controlId = searchParams?.get('controlId') || '';
  const controlName = searchParams?.get('controlName') || '';

  const form = useForm<ActionFormValues>({
    resolver: zodResolver(actionFormSchema),
    defaultValues: {
      controlId,
      controlName,
      responsavel: '',
      email: '',
      prazo: '',
      descricao: '',
      contingencia: '',
      criticidadeAcao: 5,
      valorEstimado: 0,
    },
  });

  useEffect(() => {
    if (controlId && controlName) {
      form.setValue('controlId', controlId);
      form.setValue('controlName', controlName);
    }
  }, [controlId, controlName, form]);

  const onSubmit = async (data: ActionFormValues) => {
    // Verificar se a sessão ainda está carregando
    if (authUser.isLoading) {
      toast({
        title: 'Aguarde',
        description: 'Aguardando autenticação carregar. Tente novamente em alguns segundos.',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    try {
      // Adiciona auditoria
      const now = new Date().toISOString();
      const userForAudit = `${authUser.name} (${authUser.email})`;
      
      const actionData = {
        ...data,
        createdBy: userForAudit,
        createdAt: now,
        updatedBy: userForAudit,
        updatedAt: now,
      };

      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actionData),
      });

      if (res.ok) {
        const action = await res.json();
        toast({
          title: 'Ação criada com sucesso!',
          description: 'A ação foi registrada no sistema.',
        });
        router.push(`/actions/${action.id}`);
      } else {
        const error = await res.json();
        toast({
          title: 'Erro ao criar ação',
          description: error.error || 'Ocorreu um erro ao criar a ação',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao criar ação:', error);
      toast({
        title: 'Erro ao criar ação',
        description: 'Ocorreu um erro ao criar a ação',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/controls">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Criar Nova Ação
          </h1>
          <p className="text-muted-foreground">
            Registre uma ação corretiva para controle crítico não implementado
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Ação</CardTitle>
          <CardDescription>
            Preencha os dados da ação corretiva. Os campos marcados com * são obrigatórios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Controle (read-only) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="controlId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID do Controle *</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-muted" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="controlName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Controle *</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-muted" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Responsável */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="responsavel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável pela Ação *</FormLabel>
                      <FormControl>
                        <UserAutocomplete
                          value={field.value}
                          onSelect={(selectedValue) => {
                            field.onChange(selectedValue);
                            // Auto-extrai email do formato "Nome (email@dominio.com)"
                            const match = selectedValue.match(/\(([^)]+)\)$/);
                            if (match) {
                              form.setValue('email', match[1].trim());
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Busque o usuário no Azure AD digitando pelo menos 2 caracteres
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email do Responsável</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Preenchido automaticamente" 
                          {...field} 
                          disabled
                          className="bg-muted"
                        />
                      </FormControl>
                      <FormDescription>
                        Preenchido automaticamente ao selecionar o responsável
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Prazo e Criticidade */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="prazo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prazo para Conclusão *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Data limite para execução da ação
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="criticidadeAcao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Criticidade da Ação (0-10) *</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Slider
                            min={0}
                            max={10}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                          <div className="text-center font-medium text-lg">
                            {field.value}
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Nível de criticidade de 0 (baixa) a 10 (crítica)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Valor Estimado */}
              <FormField
                control={form.control}
                name="valorEstimado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Estimado (R$) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Custo estimado para execução da ação
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Descrição */}
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição da Ação de Correção *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva detalhadamente a ação corretiva a ser executada..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Detalhe as atividades necessárias para correção do controle
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contingência */}
              <FormField
                control={form.control}
                name="contingencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plano de Contingência</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o plano de contingência caso a ação não seja executada no prazo..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Medidas alternativas em caso de não execução
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Botões */}
              <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar Ação'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ActionCapturePage() {
  return (
    <ProtectedRoute module="acoes" action="create">
      <Suspense fallback={
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      }>
        <ActionCaptureContent />
      </Suspense>
    </ProtectedRoute>
  );
}
