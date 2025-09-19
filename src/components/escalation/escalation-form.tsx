'use client';

import { useState, useEffect } from 'react';
import type { Risk, EscalationRule, EscalationLevel } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface EscalationFormProps {
  risk: Risk;
  onSave: (riskId: string, rule: EscalationRule) => void;
  onCancel: () => void;
}

const defaultRule: EscalationRule = {
  metricType: 'days',
  levels: [
    { level: 0, triggerDays: 0, triggerPercentage: 0, role: 'Gerente do Dono do Controle', responsible: 'Nome do Gerente', enabled: true },
    { level: 1, triggerDays: 5, triggerPercentage: 10, role: 'Gerente Executivo', responsible: 'Nome do Gerente Executivo', enabled: true },
    { level: 2, triggerDays: 10, triggerPercentage: 20, role: 'Diretor', responsible: 'Nome do Diretor', enabled: true },
    { level: 3, triggerDays: 15, triggerPercentage: 30, role: 'VP', responsible: 'Nome do VP', enabled: true },
  ],
};

const LevelCard = ({
  level,
  metricType,
  onUpdate,
  isFirstLevel,
}: {
  level: EscalationLevel;
  metricType: 'days' | 'percentage';
  onUpdate: (updatedLevel: EscalationLevel) => void;
  isFirstLevel?: boolean;
}) => {
  const handleInputChange = (field: keyof EscalationLevel, value: string | number | boolean) => {
    onUpdate({ ...level, [field]: value });
  };

  const titleMap: { [key: number]: string } = {
    0: 'Controle Vencido',
    1: 'Nível 1 de Escalonamento',
    2: 'Nível 2 de Escalonamento',
    3: 'Nível 3 de Escalonamento',
  };

  return (
    <div className={cn("p-4 rounded-lg", level.enabled ? "bg-card border" : "bg-muted/50 border border-dashed")}>
      <div className="flex justify-between items-center mb-4">
        <h4 className={cn("font-semibold", !level.enabled && "text-muted-foreground")}>{titleMap[level.level]}</h4>
        {!isFirstLevel && (
            <Switch
                checked={level.enabled}
                onCheckedChange={(checked) => handleInputChange('enabled', checked)}
            />
        )}
      </div>
      <div className={cn("space-y-4", !level.enabled && "opacity-50 pointer-events-none")}>
        {!isFirstLevel && (
            <div className="grid grid-cols-2 gap-4">
            {metricType === 'days' ? (
                <div>
                <Label htmlFor={`triggerDays-${level.level}`}>Disparar após (dias)</Label>
                <Input
                    id={`triggerDays-${level.level}`}
                    type="number"
                    value={level.triggerDays}
                    onChange={(e) => handleInputChange('triggerDays', parseInt(e.target.value) || 0)}
                />
                </div>
            ) : (
                <div>
                <Label htmlFor={`triggerPercentage-${level.level}`}>Disparar se abaixo de (%)</Label>
                <Input
                    id={`triggerPercentage-${level.level}`}
                    type="number"
                    value={level.triggerPercentage}
                    onChange={(e) => handleInputChange('triggerPercentage', parseInt(e.target.value) || 0)}
                />
                </div>
            )}
            </div>
        )}
         {isFirstLevel && (
            <div className="flex items-center text-sm text-muted-foreground p-3 bg-muted rounded-md">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>Este nível é acionado assim que o controle vence.</span>
            </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
            <div>
            <Label htmlFor={`role-${level.level}`}>Cargo</Label>
            <Input
                id={`role-${level.level}`}
                value={level.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
            />
            </div>
            <div>
            <Label htmlFor={`responsible-${level.level}`}>Nome do Responsável</Label>
            <Input
                id={`responsible-${level.level}`}
                value={level.responsible}
                onChange={(e) => handleInputChange('responsible', e.target.value)}
            />
            </div>
        </div>
      </div>
    </div>
  );
};

export function EscalationForm({ risk, onSave, onCancel }: EscalationFormProps) {
  const [rule, setRule] = useState<EscalationRule>(risk.escalationRule || defaultRule);

  useEffect(() => {
    setRule(risk.escalationRule || defaultRule);
  }, [risk]);

  const handleLevelUpdate = (updatedLevel: EscalationLevel) => {
    const updatedLevels = rule.levels.map(l =>
      l.level === updatedLevel.level ? updatedLevel : l
    );
    setRule({ ...rule, levels: updatedLevels });
  };

  const handleSave = () => {
    onSave(risk.id, rule);
  };

  return (
    <div className="py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-150px)] pr-2">
      <div className="space-y-2">
        <Label>Métrica de Gatilho</Label>
        <Select
          value={rule.metricType}
          onValueChange={(value: 'days' | 'percentage') => setRule({ ...rule, metricType: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="days">Dias Vencidos</SelectItem>
            <SelectItem value="percentage">% Fora da Meta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-4">
        {rule.levels.sort((a,b) => a.level - b.level).map(level => (
          <LevelCard
            key={level.level}
            level={level}
            metricType={rule.metricType}
            onUpdate={handleLevelUpdate}
            isFirstLevel={level.level === 0}
          />
        ))}
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>Salvar Regras</Button>
      </div>
    </div>
  );
}
