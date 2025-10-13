'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Control, Kpi, KpiResponsible } from '@/lib/types';
import { Trash2, Plus } from 'lucide-react';
import { UserAutocomplete } from '@/components/ui/user-autocomplete';
import { useAuthUser } from '@/hooks/use-auth';

export default function KpiCapturePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [controls, setControls] = useState<Control[]>([]);
  const [selectedControlId, setSelectedControlId] = useState<string>('');
  const [selectedControl, setSelectedControl] = useState<Control | null>(null);
  const [responsibles, setResponsibles] = useState<KpiResponsible[]>([]);
  const [frequenciaDias, setFrequenciaDias] = useState<number>(30);
  const [dataProximaVerificacao, setDataProximaVerificacao] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    const initializePage = async () => {
      await loadControls();

      const controlId = searchParams?.get('controlId');
      const kpiId = searchParams?.get('id');

      if (controlId) {
        setSelectedControlId(controlId);
      }

      if (kpiId) {
        setIsEdit(true);
        loadKpi(kpiId);
      }
    };

    initializePage();
  }, [searchParams]);

  useEffect(() => {
    if (selectedControlId && controls.length > 0) {
      const control = controls.find((c) => c.id === selectedControlId);
      setSelectedControl(control || null);
    }
  }, [selectedControlId, controls]);

  const loadControls = async () => {
    try {
      const response = await fetch('/api/controls');
      if (!response.ok) throw new Error('Falha ao carregar controles');
      const data = await response.json();
      setControls(data);
    } catch (error) {
      console.error('Erro ao carregar controles:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os controles.',
        variant: 'destructive',
      });
    }
  };

  const loadKpi = async (id: string) => {
    try {
      const response = await fetch(`/api/kpis/${id}`);
      if (!response.ok) throw new Error('Falha ao carregar KPI');
      const data: Kpi = await response.json();

      setSelectedControlId(data.controlId);
      setResponsibles(data.responsibles || []);
      setFrequenciaDias(data.frequenciaDias);
      setDataProximaVerificacao(data.dataProximaVerificacao);
    } catch (error) {
      console.error('Erro ao carregar KPI:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o KPI.',
        variant: 'destructive',
      });
    }
  };

  const authUser = useAuthUser();

  const addResponsible = () => {
    setResponsibles([...responsibles, { name: '', email: '' }]);
  };

  const removeResponsible = (index: number) => {
    setResponsibles(responsibles.filter((_, i) => i !== index));
  };

  const updateResponsible = (index: number, field: 'name' | 'email', value: string) => {
    const updated = [...responsibles];
    updated[index][field] = value;
    setResponsibles(updated);
  };

  const handleUserSelect = (index: number, userName: string, userEmail: string) => {
    const updated = [...responsibles];
    updated[index].name = userName;
    updated[index].email = userEmail;
    setResponsibles(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedControlId || !selectedControl) {
      toast({
        title: 'Erro de Validação',
        description: 'Selecione um controle.',
        variant: 'destructive',
      });
      return;
    }

    if (!dataProximaVerificacao) {
      toast({
        title: 'Erro de Validação',
        description: 'Informe a data da próxima verificação.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    // No momento da criação, dataInicioVerificacao = dataProximaVerificacao
    const dataInicio = dataProximaVerificacao;

    const kpiData = {
      controlId: selectedControl.id,
      controlName: selectedControl.nomeControle,
      donoControle: selectedControl.donoControle,
      emailDonoControle: selectedControl.emailDono,
      responsibles,
      status: 'NOK' as const, // Inicial sempre NOK (sem evidência)
      dataInicioVerificacao: dataInicio,
      dataProximaVerificacao,
      frequenciaDias,
      evidenceFiles: [],
      createdBy: isEdit ? undefined : `${authUser.name} (${authUser.email})`,
      createdAt: isEdit ? undefined : new Date().toISOString(),
      updatedBy: `${authUser.name} (${authUser.email})`,
      updatedAt: new Date().toISOString(),
    };

    try {
      const kpiId = searchParams?.get('id');
      const url = isEdit && kpiId ? `/api/kpis/${kpiId}` : '/api/kpis';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kpiData),
      });

      if (!response.ok) throw new Error('Falha ao salvar');

      toast({
        title: 'Sucesso',
        description: `KPI ${isEdit ? 'atualizado' : 'criado'} com sucesso.`,
      });

      router.push('/kpis');
    } catch (error) {
      console.error('Erro ao salvar KPI:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o KPI.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Editar' : 'Novo'} KPI</CardTitle>
          <CardDescription>
            Configure um indicador de desempenho para o controle selecionado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção de Controle */}
          <div className="space-y-2">
            <Label htmlFor="control">Controle *</Label>
            <Select
              value={selectedControlId}
              onValueChange={setSelectedControlId}
              disabled={isEdit || !!searchParams?.get('controlId')}
            >
              <SelectTrigger id="control">
                <SelectValue placeholder="Selecione um controle..." />
              </SelectTrigger>
              <SelectContent>
                {controls.map((control) => (
                  <SelectItem key={control.id} value={control.id}>
                    [{control.id}] {control.nomeControle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Informações do Controle (se selecionado) */}
          {selectedControl && (
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div>
                <Label className="text-sm text-muted-foreground">Dono do Controle</Label>
                <p className="text-sm">{selectedControl.donoControle}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">E-mail</Label>
                <p className="text-sm">{selectedControl.emailDono}</p>
              </div>
            </div>
          )}

          {/* Configuração de Frequência e Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequencia">Frequência de Verificação (dias) *</Label>
              <Input
                id="frequencia"
                type="number"
                min="1"
                value={frequenciaDias}
                onChange={(e) => setFrequenciaDias(parseInt(e.target.value) || 30)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataProximaVerificacao">Data da Próxima Verificação *</Label>
              <Input
                id="dataProximaVerificacao"
                type="date"
                value={dataProximaVerificacao}
                onChange={(e) => setDataProximaVerificacao(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Responsáveis Adicionais */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Responsáveis Adicionais (Opcional)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addResponsible}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>

            {responsibles.map((resp, index) => (
              <div key={index} className="flex items-end gap-2">
                <div className="flex-1">
                  <Label>Buscar Responsável no Azure AD</Label>
                  <UserAutocomplete
                    value={resp.name && resp.email ? `${resp.name} (${resp.email})` : ''}
                    onSelect={(selectedValue) => {
                      // Parse "Name (email@domain.com)"
                      const match = selectedValue.match(/^(.+?)\s*\((.+?)\)$/);
                      if (match) {
                        const [, name, email] = match;
                        handleUserSelect(index, name.trim(), email.trim());
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeResponsible(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {responsibles.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum responsável adicional configurado.
              </p>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/kpis')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar KPI'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
