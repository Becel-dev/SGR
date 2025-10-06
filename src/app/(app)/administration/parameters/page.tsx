'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Settings, 
  Trash2, 
  PlusCircle, 
  ArrowRight,
  Target 
} from 'lucide-react';

// Definindo o tipo para uma única regra de IER
type IerRule = {
  min: number;
  max: number;
  label: string;
  color: string;
};

// Definindo o tipo para o parâmetro completo
type IerParameter = {
  name: 'ierRules';
  rules: IerRule[];
};

const defaultIerRules: IerRule[] = [
  { min: 0, max: 199, label: 'BAIXO', color: '#a7f3d0' }, // light green
  { min: 200, max: 499, label: 'GERENCIÁVEL', color: '#fef08a' }, // yellow
  { min: 500, max: 799, label: 'PRIORITÁRIO', color: '#fbbf24' }, // orange
  { min: 800, max: 1000, label: 'CRÍTICO', color: '#ef4444' }, // red
];

const RuleRow = ({ rule, onChange, onRemove }: { rule: IerRule, onChange: (field: keyof IerRule, value: any) => void, onRemove: () => void }) => (
  <div className="flex items-center gap-4 p-4 border rounded-lg">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
      <div className="space-y-2">
        <Label>Mínimo</Label>
        <Input type="number" value={rule.min} onChange={(e) => onChange('min', parseInt(e.target.value, 10))} />
      </div>
      <div className="space-y-2">
        <Label>Máximo</Label>
        <Input type="number" value={rule.max} onChange={(e) => onChange('max', parseInt(e.target.value, 10))} />
      </div>
      <div className="space-y-2">
        <Label>Rótulo</Label>
        <Input value={rule.label} onChange={(e) => onChange('label', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Cor (Hex)</Label>
        <div className="flex items-center gap-2">
          <Input value={rule.color} onChange={(e) => onChange('color', e.target.value)} />
          <div className="h-8 w-8 rounded" style={{ backgroundColor: rule.color }} />
        </div>
      </div>
    </div>
    <Button variant="ghost" size="icon" onClick={onRemove}>
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  </div>
);

export default function ParametersPage() {
  const { toast } = useToast();
  const [ierRules, setIerRules] = useState<IerRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Efeito para carregar as regras (simulado por enquanto)
  useEffect(() => {
    setLoading(true);
    // TODO: Substituir pela chamada à API
    setTimeout(() => {
      setIerRules(defaultIerRules);
      setLoading(false);
    }, 1000);
  }, []);

  const handleRuleChange = (index: number, field: keyof IerRule, value: any) => {
    const newRules = [...ierRules];
    newRules[index] = { ...newRules[index], [field]: value };
    setIerRules(newRules);
  };

  const handleAddRule = () => {
    setIerRules([...ierRules, { min: 0, max: 0, label: '', color: '#ffffff' }]);
  };

  const handleRemoveRule = (index: number) => {
    const newRules = ierRules.filter((_, i) => i !== index);
    setIerRules(newRules);
  };

  const handleSave = async () => {
    setSaving(true);
    // TODO: Implementar a chamada à API para salvar
    console.log("Salvando regras:", ierRules);
    
    // Simulação de salvamento
    setTimeout(() => {
      toast({
        title: 'Parâmetros Salvos!',
        description: 'As regras de IER foram atualizadas com sucesso.',
      });
      setSaving(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Card de Navegação de Parâmetros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings />
            Parâmetros do Sistema
          </CardTitle>
          <CardDescription>
            Escolha o tipo de parâmetro que deseja configurar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Target className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-semibold">Top Risks Corporativos</h3>
                      <p className="text-sm text-muted-foreground">
                        Gerencie os Top Risks para Identificação e Análise
                      </p>
                    </div>
                  </div>
                  <Link href="/administration/parameters/toprisk">
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-semibold">Fatores de Risco</h3>
                      <p className="text-sm text-muted-foreground">
                        Gerencie os Fatores de Risco para formulários
                      </p>
                    </div>
                  </div>
                  <Link href="/administration/parameters/riskfactor">
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-semibold">Temas Materiais</h3>
                      <p className="text-sm text-muted-foreground">
                        Gerencie os Temas Materiais ESG
                      </p>
                    </div>
                  </div>
                  <Link href="/administration/parameters/temamaterial">
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-semibold">Categorias de Controle</h3>
                      <p className="text-sm text-muted-foreground">
                        Gerencie as Categorias de Controle
                      </p>
                    </div>
                  </div>
                  <Link href="/administration/parameters/categoriacontrole">
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors border-dashed">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold text-muted-foreground">Outros Parâmetros</h3>
                      <p className="text-sm text-muted-foreground">
                        Em breve...
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Card das Regras IER - Mantido para compatibilidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings />
            Regras de Classificação do IER
          </CardTitle>
          <CardDescription>
            Configure as faixas e classificações para o cálculo do Índice de Exposição ao Risco (IER).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {ierRules.map((rule, index) => (
                <RuleRow
                  key={index}
                  rule={rule}
                  onChange={(field, value) => handleRuleChange(index, field, value)}
                  onRemove={() => handleRemoveRule(index)}
                />
              ))}
              <Button variant="outline" onClick={handleAddRule}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Nova Regra
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={loading || saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
