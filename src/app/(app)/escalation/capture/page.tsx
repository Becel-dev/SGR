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
import { Badge } from '@/components/ui/badge';
import type { Control, EscalationConfig, EscalationLevel } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function EscalationCapturePage() {
  const searchParams = useSearchParams();
  const controlId = searchParams?.get('controlId');
  const escalationId = searchParams?.get('id');
  const isEditing = !!(controlId || escalationId);
  
  return (
    <ProtectedRoute 
      module="escalation" 
      action={isEditing ? 'edit' : 'create'}
    >
      <EscalationCaptureContent />
    </ProtectedRoute>
  );
}

function EscalationCaptureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [controls, setControls] = useState<Control[]>([]);
  const [selectedControlId, setSelectedControlId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isControlLocked, setIsControlLocked] = useState(false);
  const [loadingHierarchy, setLoadingHierarchy] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

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
      setInitialLoading(true);
      
      try {
        // 1. Primeiro carrega os controles
        const response = await fetch('/api/controls');
        if (!response.ok) throw new Error('Falha ao carregar controles');
        const loadedControls = await response.json();
        setControls(loadedControls);
        
        console.log('✅ Controles carregados:', loadedControls.length);
        
        const controlId = searchParams?.get('controlId');
        const escalationId = searchParams?.get('id');
        
        if (controlId) {
          setSelectedControlId(controlId);
          setIsControlLocked(true);
        }
        
        if (escalationId) {
          setIsEdit(true);
          setIsControlLocked(true);
          await loadEscalation(escalationId);
        } else if (controlId) {
          // Auto-preenche hierarquia se for novo escalonamento
          console.log('🔄 Iniciando auto-preenchimento de hierarquia...');
          
          // Busca o controle dos dados já carregados
          const control = loadedControls.find((c: Control) => c.id === controlId);
          
          if (!control) {
            console.error('❌ Controle não encontrado:', controlId);
            return;
          }
          
          if (!control.emailDono) {
            console.warn('⚠️ Controle sem email do dono configurado');
            return;
          }
          
          await autoFillHierarchyWithControl(control);
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar página:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados.",
          variant: "destructive",
        });
      } finally {
        setInitialLoading(false);
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

  const autoFillHierarchyWithControl = async (control: Control) => {
    console.log('🔍 autoFillHierarchyWithControl iniciado');
    console.log('📋 Controle:', control);
    console.log('📧 Email do dono (bruto):', control.emailDono);
    
    if (!control || !control.emailDono) {
      console.error('❌ Controle sem email do dono configurado');
      toast({
        title: "Aviso",
        description: "O controle selecionado não possui email do dono configurado.",
        variant: "destructive",
      });
      return;
    }

    setLoadingHierarchy(true);

    try {
      // Extrai o email do formato "Nome (email@dominio.com)"
      const emailMatch = control.emailDono.match(/\(([^)]+)\)$/);
      const ownerEmail = emailMatch ? emailMatch[1].trim() : control.emailDono;

      console.log('📧 Email extraído para busca:', ownerEmail);
      console.log('🌐 Fazendo requisição para /api/users/manager...');

      // Busca N1 - Superior imediato do dono do controle
      const n1Response = await fetch(`/api/users/manager?email=${encodeURIComponent(ownerEmail)}`);
      
      console.log('📥 Resposta N1 status:', n1Response.status);
      
      if (!n1Response.ok) {
        const errorText = await n1Response.text();
        console.error('❌ Erro ao buscar N1:', errorText);
        toast({
          title: "Aviso",
          description: "Não foi possível buscar o superior imediato no Azure AD.",
          variant: "destructive",
        });
        return;
      }

      const n1Data = await n1Response.json();
      console.log('📊 Dados N1 recebidos:', n1Data);
      
      if (!n1Data || !n1Data.email) {
        console.warn('⚠️ Dono do controle não possui superior imediato configurado no Azure AD');
        toast({
          title: "Aviso",
          description: "O dono do controle não possui superior imediato configurado no Azure AD.",
          variant: "destructive",
        });
        return;
      }

      // Preenche N1
      const n1Name = `${n1Data.name} (${n1Data.email})`;
      console.log('✏️ Preenchendo N1 com:', n1Name);
      setPctLevel1(prev => {
        const newValue = { ...prev, supervisor: n1Name, supervisorEmail: n1Data.email };
        console.log('✅ pctLevel1 atualizado:', newValue);
        return newValue;
      });
      setDaysLevel1(prev => {
        const newValue = { ...prev, supervisor: n1Name, supervisorEmail: n1Data.email };
        console.log('✅ daysLevel1 atualizado:', newValue);
        return newValue;
      });

      // Busca N2 - Superior do N1
      const n2Response = await fetch(`/api/users/manager?email=${encodeURIComponent(n1Data.email)}`);
      
      if (n2Response.ok) {
        const n2Data = await n2Response.json();
        
        if (n2Data && n2Data.email) {
          const n2Name = `${n2Data.name} (${n2Data.email})`;
          setPctLevel2(prev => ({ ...prev, supervisor: n2Name, supervisorEmail: n2Data.email }));
          setDaysLevel2(prev => ({ ...prev, supervisor: n2Name, supervisorEmail: n2Data.email }));
          console.log('✅ N2 preenchido:', n2Name);

          // Busca N3 - Superior do N2
          const n3Response = await fetch(`/api/users/manager?email=${encodeURIComponent(n2Data.email)}`);
          
          if (n3Response.ok) {
            const n3Data = await n3Response.json();
            
            if (n3Data && n3Data.email) {
              const n3Name = `${n3Data.name} (${n3Data.email})`;
              setPctLevel3(prev => ({ ...prev, supervisor: n3Name, supervisorEmail: n3Data.email }));
              setDaysLevel3(prev => ({ ...prev, supervisor: n3Name, supervisorEmail: n3Data.email }));
              console.log('✅ N3 preenchido:', n3Name);
            }
          }
        }
      }

      console.log('✅ Hierarquia de supervisores preenchida automaticamente');
      toast({
        title: "Sucesso",
        description: "Hierarquia de supervisores carregada do Azure AD.",
      });
    } catch (error: any) {
      console.error('❌ Erro ao buscar hierarquia:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar hierarquia de supervisores.",
        variant: "destructive",
      });
    } finally {
      console.log('🏁 Finalizando auto-preenchimento');
      setLoadingHierarchy(false);
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

  // Tela de loading inicial
  if (initialLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando Configuração de Escalonamento</CardTitle>
          <CardDescription>
            Buscando dados do controle e hierarquia de supervisores...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">Preparando escalonamento</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                {loadingHierarchy ? (
                  <>
                    <p>✅ Controle carregado</p>
                    <p className="text-primary font-medium">🔄 Buscando hierarquia no Azure AD...</p>
                  </>
                ) : (
                  <p>🔄 Carregando dados do controle...</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            {selectedControlId && pctLevel1.supervisor && (
              <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                <span className="font-medium">✅ Hierarquia de supervisores carregada automaticamente do Azure AD</span>
              </div>
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
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-semibold">Nível 1</Label>
                    {pctLevel1.supervisor && (
                      <Badge variant="secondary" className="text-xs">
                        Superior imediato do dono
                      </Badge>
                    )}
                  </div>
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
                        className={pctLevel1.supervisor ? "bg-green-50 dark:bg-green-950/20" : ""}
                      />
                    </div>
                    <div>
                      <Label>E-mail Superior N1</Label>
                      <Input
                        type="email"
                        value={pctLevel1.supervisorEmail}
                        onChange={e => setPctLevel1({...pctLevel1, supervisorEmail: e.target.value})}
                        placeholder="email@exemplo.com"
                        className={pctLevel1.supervisorEmail ? "bg-green-50 dark:bg-green-950/20" : ""}
                      />
                    </div>
                  </div>
                </div>

                {/* Nível 2 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-semibold">Nível 2</Label>
                    {pctLevel2.supervisor && (
                      <Badge variant="secondary" className="text-xs">
                        Superior do N1
                      </Badge>
                    )}
                  </div>
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
                        className={pctLevel2.supervisor ? "bg-green-50 dark:bg-green-950/20" : ""}
                      />
                    </div>
                    <div>
                      <Label>E-mail Superior N2</Label>
                      <Input
                        type="email"
                        value={pctLevel2.supervisorEmail}
                        onChange={e => setPctLevel2({...pctLevel2, supervisorEmail: e.target.value})}
                        placeholder="email@exemplo.com"
                        className={pctLevel2.supervisorEmail ? "bg-green-50 dark:bg-green-950/20" : ""}
                      />
                    </div>
                  </div>
                </div>

                {/* Nível 3 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-semibold">Nível 3</Label>
                    {pctLevel3.supervisor && (
                      <Badge variant="secondary" className="text-xs">
                        Superior do N2
                      </Badge>
                    )}
                  </div>
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
                        className={pctLevel3.supervisor ? "bg-green-50 dark:bg-green-950/20" : ""}
                      />
                    </div>
                    <div>
                      <Label>E-mail Superior N3</Label>
                      <Input
                        type="email"
                        value={pctLevel3.supervisorEmail}
                        onChange={e => setPctLevel3({...pctLevel3, supervisorEmail: e.target.value})}
                        placeholder="email@exemplo.com"
                        className={pctLevel3.supervisorEmail ? "bg-green-50 dark:bg-green-950/20" : ""}
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
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-semibold">Nível 1</Label>
                    {daysLevel1.supervisor && (
                      <Badge variant="secondary" className="text-xs">
                        Superior imediato do dono
                      </Badge>
                    )}
                  </div>
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
                        className={daysLevel1.supervisor ? "bg-green-50 dark:bg-green-950/20" : ""}
                      />
                    </div>
                    <div>
                      <Label>E-mail Superior N1</Label>
                      <Input
                        type="email"
                        value={daysLevel1.supervisorEmail}
                        onChange={e => setDaysLevel1({...daysLevel1, supervisorEmail: e.target.value})}
                        placeholder="email@exemplo.com"
                        className={daysLevel1.supervisorEmail ? "bg-green-50 dark:bg-green-950/20" : ""}
                      />
                    </div>
                  </div>
                </div>

                {/* Nível 2 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-semibold">Nível 2</Label>
                    {daysLevel2.supervisor && (
                      <Badge variant="secondary" className="text-xs">
                        Superior do N1
                      </Badge>
                    )}
                  </div>
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
                        className={daysLevel2.supervisor ? "bg-green-50 dark:bg-green-950/20" : ""}
                      />
                    </div>
                    <div>
                      <Label>E-mail Superior N2</Label>
                      <Input
                        type="email"
                        value={daysLevel2.supervisorEmail}
                        onChange={e => setDaysLevel2({...daysLevel2, supervisorEmail: e.target.value})}
                        placeholder="email@exemplo.com"
                        className={daysLevel2.supervisorEmail ? "bg-green-50 dark:bg-green-950/20" : ""}
                      />
                    </div>
                  </div>
                </div>

                {/* Nível 3 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-semibold">Nível 3</Label>
                    {daysLevel3.supervisor && (
                      <Badge variant="secondary" className="text-xs">
                        Superior do N2
                      </Badge>
                    )}
                  </div>
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
                        className={daysLevel3.supervisor ? "bg-green-50 dark:bg-green-950/20" : ""}
                      />
                    </div>
                    <div>
                      <Label>E-mail Superior N3</Label>
                      <Input
                        type="email"
                        value={daysLevel3.supervisorEmail}
                        onChange={e => setDaysLevel3({...daysLevel3, supervisorEmail: e.target.value})}
                        placeholder="email@exemplo.com"
                        className={daysLevel3.supervisorEmail ? "bg-green-50 dark:bg-green-950/20" : ""}
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
