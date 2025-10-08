'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { Control, EscalationConfig, EscalationLevel } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export default function EscalationCapturePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [controls, setControls] = useState<Control[]>([]);
  const [selectedControlId, setSelectedControlId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isControlLocked, setIsControlLocked] = useState(false);

  // Estados para configuração de Percentual
  const [percentageEnabled, setPercentageEnabled] = useState(true);
  const [pctLevel1, setPctLevel1] = useState<EscalationLevel>({ threshold: 0, supervisor: '', supervisorEmail: '' });
  const [pctLevel2, setPctLevel2] = useState<EscalationLevel>({ threshold: 0, supervisor: '', supervisorEmail: '' });
  const [pctLevel3, setPctLevel3] = useState<EscalationLevel>({ threshold: 0, supervisor: '', supervisorEmail: '' });

  // Estados para configuração de Dias
  const [daysEnabled, setDaysEnabled] = useState(true);
  const [daysLevel1, setDaysLevel1] = useState<EscalationLevel>({ threshold: 0, supervisor: '', supervisorEmail: '' });
  const [daysLevel2, setDaysLevel2] = useState<EscalationLevel>({ threshold: 0, supervisor: '', supervisorEmail: '' });
  const [daysLevel3, setDaysLevel3] = useState<EscalationLevel>({ threshold: 0, supervisor: '', supervisorEmail: '' });

  const [globalEnabled, setGlobalEnabled] = useState(true);

  useEffect(() => {
    const initializePage = async () => {
      await loadControls();
      
      const controlId = searchParams?.get('controlId');
      const escalationId = searchParams?.get('id');
      
      if (controlId) {
        setSelectedControlId(controlId);
        setIsControlLocked(true); // Bloqueia o campo quando vem da tabela
      }
      
      if (escalationId) {
        setIsEdit(true);
        setIsControlLocked(true); // Bloqueia o campo no modo edição
        await loadEscalation(escalationId);
      }
    };
    
    initializePage();
  }, [searchParams]);

  const loadControls = async () => {
    try {
      const response = await fetch('/api/controls');
      if (!response.ok) throw new Error('Falha ao carregar controles');
      const data = await response.json();
      setControls(data);
    } catch (error) {
      console.error('Erro ao carregar controles:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os controles.",
        variant: "destructive",
      });
    }
  };

  const loadEscalation = async (id: string) => {
    try {
      const response = await fetch(`/api/escalation/${id}`);
      if (!response.ok) throw new Error('Falha ao carregar escalonamento');
      const data: EscalationConfig = await response.json();
      
      setSelectedControlId(data.controlId);
      setGlobalEnabled(data.enabled);
      
      // Carregar config de percentual
      setPercentageEnabled(data.percentageConfig.enabled);
      setPctLevel1(data.percentageConfig.level1);
      setPctLevel2(data.percentageConfig.level2);
      setPctLevel3(data.percentageConfig.level3);
      
      // Carregar config de dias
      setDaysEnabled(data.daysConfig.enabled);
      setDaysLevel1(data.daysConfig.level1);
      setDaysLevel2(data.daysConfig.level2);
      setDaysLevel3(data.daysConfig.level3);
    } catch (error) {
      console.error('Erro ao carregar escalonamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o escalonamento.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedControlId) {
      toast({
        title: "Erro de Validação",
        description: "Selecione um controle.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    const control = controls.find(c => c.id === selectedControlId);
    
    const escalationData: EscalationConfig = {
      id: isEdit ? (searchParams?.get('id') || uuidv4()) : uuidv4(),
      controlId: selectedControlId,
      controlName: control?.nomeControle,
      enabled: globalEnabled,
      percentageConfig: {
        enabled: percentageEnabled,
        level1: pctLevel1,
        level2: pctLevel2,
        level3: pctLevel3,
      },
      daysConfig: {
        enabled: daysEnabled,
        level1: daysLevel1,
        level2: daysLevel2,
        level3: daysLevel3,
      },
      createdBy: 'Sistema',
      createdAt: new Date().toISOString(),
      updatedBy: 'Sistema',
      updatedAt: new Date().toISOString(),
    };

    try {
      const url = isEdit ? `/api/escalation/${escalationData.id}` : '/api/escalation';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(escalationData),
      });

      if (!response.ok) throw new Error('Falha ao salvar');

      toast({
        title: "Sucesso",
        description: `Escalonamento ${isEdit ? 'atualizado' : 'criado'} com sucesso.`,
      });

      router.push('/escalation');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o escalonamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Editar' : 'Novo'} Escalonamento</CardTitle>
          <CardDescription>
            Configure as regras de escalonamento por % fora da meta e dias vencidos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção de Controle */}
          <div className="space-y-2">
            <Label htmlFor="control">Controle *</Label>
            <Select
              value={selectedControlId}
              onValueChange={setSelectedControlId}
              disabled={isControlLocked}
            >
              <SelectTrigger id="control">
                <SelectValue placeholder="Selecione um controle..." />
              </SelectTrigger>
              <SelectContent>
                {controls.map(control => (
                  <SelectItem key={control.id} value={control.id}>
                    [{control.id}] {control.nomeControle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isControlLocked && (
              <p className="text-xs text-muted-foreground">
                O controle não pode ser alterado após a seleção inicial.
              </p>
            )}
          </div>

          {/* Habilitar/Desabilitar Geral */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Escalonamento Ativo</Label>
              <div className="text-sm text-muted-foreground">
                Ativar ou desativar todas as regras de escalonamento
              </div>
            </div>
            <Switch
              checked={globalEnabled}
              onCheckedChange={setGlobalEnabled}
            />
          </div>

          <Separator />

          {/* Configuração de % Fora da Meta */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Escalonamento por % Fora da Meta</h3>
                <p className="text-sm text-muted-foreground">
                  Notificações baseadas em percentual abaixo da meta
                </p>
              </div>
              <Switch
                checked={percentageEnabled}
                onCheckedChange={setPercentageEnabled}
              />
            </div>

            {percentageEnabled && (
              <div className="space-y-4 pl-4 border-l-2">
                {/* Nível 1 */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Nível 1</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>% Abaixo da Meta</Label>
                      <Input
                        type="number"
                        value={pctLevel1.threshold}
                        onChange={e => setPctLevel1({...pctLevel1, threshold: Number(e.target.value)})}
                        placeholder="Ex: 10"
                      />
                    </div>
                    <div>
                      <Label>Superior N1</Label>
                      <Input
                        value={pctLevel1.supervisor}
                        onChange={e => setPctLevel1({...pctLevel1, supervisor: e.target.value})}
                        placeholder="Nome do superior"
                      />
                    </div>
                    <div>
                      <Label>E-mail Superior N1</Label>
                      <Input
                        type="email"
                        value={pctLevel1.supervisorEmail}
                        onChange={e => setPctLevel1({...pctLevel1, supervisorEmail: e.target.value})}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Nível 2 */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Nível 2</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>% Abaixo da Meta</Label>
                      <Input
                        type="number"
                        value={pctLevel2.threshold}
                        onChange={e => setPctLevel2({...pctLevel2, threshold: Number(e.target.value)})}
                        placeholder="Ex: 20"
                      />
                    </div>
                    <div>
                      <Label>Superior N2</Label>
                      <Input
                        value={pctLevel2.supervisor}
                        onChange={e => setPctLevel2({...pctLevel2, supervisor: e.target.value})}
                        placeholder="Nome do superior"
                      />
                    </div>
                    <div>
                      <Label>E-mail Superior N2</Label>
                      <Input
                        type="email"
                        value={pctLevel2.supervisorEmail}
                        onChange={e => setPctLevel2({...pctLevel2, supervisorEmail: e.target.value})}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Nível 3 */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Nível 3</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>% Abaixo da Meta</Label>
                      <Input
                        type="number"
                        value={pctLevel3.threshold}
                        onChange={e => setPctLevel3({...pctLevel3, threshold: Number(e.target.value)})}
                        placeholder="Ex: 30"
                      />
                    </div>
                    <div>
                      <Label>Superior N3</Label>
                      <Input
                        value={pctLevel3.supervisor}
                        onChange={e => setPctLevel3({...pctLevel3, supervisor: e.target.value})}
                        placeholder="Nome do superior"
                      />
                    </div>
                    <div>
                      <Label>E-mail Superior N3</Label>
                      <Input
                        type="email"
                        value={pctLevel3.supervisorEmail}
                        onChange={e => setPctLevel3({...pctLevel3, supervisorEmail: e.target.value})}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Configuração de Dias Vencidos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Escalonamento por Dias Vencidos</h3>
                <p className="text-sm text-muted-foreground">
                  Notificações baseadas em dias de atraso
                </p>
              </div>
              <Switch
                checked={daysEnabled}
                onCheckedChange={setDaysEnabled}
              />
            </div>

            {daysEnabled && (
              <div className="space-y-4 pl-4 border-l-2">
                {/* Nível 1 */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Nível 1</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Vencido há mais de (dias)</Label>
                      <Input
                        type="number"
                        value={daysLevel1.threshold}
                        onChange={e => setDaysLevel1({...daysLevel1, threshold: Number(e.target.value)})}
                        placeholder="Ex: 5"
                      />
                    </div>
                    <div>
                      <Label>Superior N1</Label>
                      <Input
                        value={daysLevel1.supervisor}
                        onChange={e => setDaysLevel1({...daysLevel1, supervisor: e.target.value})}
                        placeholder="Nome do superior"
                      />
                    </div>
                    <div>
                      <Label>E-mail Superior N1</Label>
                      <Input
                        type="email"
                        value={daysLevel1.supervisorEmail}
                        onChange={e => setDaysLevel1({...daysLevel1, supervisorEmail: e.target.value})}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Nível 2 */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Nível 2</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Vencido há mais de (dias)</Label>
                      <Input
                        type="number"
                        value={daysLevel2.threshold}
                        onChange={e => setDaysLevel2({...daysLevel2, threshold: Number(e.target.value)})}
                        placeholder="Ex: 10"
                      />
                    </div>
                    <div>
                      <Label>Superior N2</Label>
                      <Input
                        value={daysLevel2.supervisor}
                        onChange={e => setDaysLevel2({...daysLevel2, supervisor: e.target.value})}
                        placeholder="Nome do superior"
                      />
                    </div>
                    <div>
                      <Label>E-mail Superior N2</Label>
                      <Input
                        type="email"
                        value={daysLevel2.supervisorEmail}
                        onChange={e => setDaysLevel2({...daysLevel2, supervisorEmail: e.target.value})}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Nível 3 */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Nível 3</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Vencido há mais de (dias)</Label>
                      <Input
                        type="number"
                        value={daysLevel3.threshold}
                        onChange={e => setDaysLevel3({...daysLevel3, threshold: Number(e.target.value)})}
                        placeholder="Ex: 15"
                      />
                    </div>
                    <div>
                      <Label>Superior N3</Label>
                      <Input
                        value={daysLevel3.supervisor}
                        onChange={e => setDaysLevel3({...daysLevel3, supervisor: e.target.value})}
                        placeholder="Nome do superior"
                      />
                    </div>
                    <div>
                      <Label>E-mail Superior N3</Label>
                      <Input
                        type="email"
                        value={daysLevel3.supervisorEmail}
                        onChange={e => setDaysLevel3({...daysLevel3, supervisorEmail: e.target.value})}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex items-center gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Escalonamento'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/escalation')}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
