'use client'

import { useState, useEffect } from 'react';
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
  Edit, 
  Save, 
  X 
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PermissionButton } from '@/components/auth/permission-button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RiskFactor } from '@/lib/types';
import { UserAutocomplete } from '@/components/ui/user-autocomplete';
import { useAuthUser } from '@/hooks/use-auth';

const RiskFactorRow = ({ 
  riskFactor, 
  onEdit, 
  onDelete 
}: { 
  riskFactor: RiskFactor;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <TableRow>
    <TableCell className="font-medium">{riskFactor.nome}</TableCell>
    <TableCell>{riskFactor.donoRisco || '-'}</TableCell>
    <TableCell>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </TableCell>
  </TableRow>
);

const RiskFactorForm = ({ 
  riskFactor, 
  onSave, 
  onCancel, 
  isEdit = false 
}: { 
  riskFactor?: RiskFactor;
  onSave: (data: Omit<RiskFactor, 'id' | 'createdBy' | 'createdAt' | 'updatedBy' | 'updatedAt'>) => void;
  onCancel: () => void;
  isEdit?: boolean;
}) => {
  const [formData, setFormData] = useState({
    nome: riskFactor?.nome || '',
    donoRisco: riskFactor?.donoRisco || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim() || !formData.donoRisco.trim()) {
      return; // Validação simples
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome *</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
          placeholder="Nome do Fator de Risco"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="donoRisco">Dono do Risco *</Label>
        <UserAutocomplete
          value={formData.donoRisco}
          onSelect={(selectedValue) => {
            setFormData(prev => ({ ...prev, donoRisco: selectedValue }));
          }}
        />
        <p className="text-xs text-muted-foreground">
          Busque o usuário no Azure AD digitando pelo menos 2 caracteres
        </p>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button type="submit" disabled={!formData.nome.trim() || !formData.donoRisco.trim()}>
          <Save className="mr-2 h-4 w-4" />
          {isEdit ? 'Atualizar' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
};

export default function RiskFactorPage() {
  return (
    <ProtectedRoute module="parametros" action="view">
      <RiskFactorContent />
    </ProtectedRoute>
  );
}

function RiskFactorContent() {
  const { toast } = useToast();
  const authUser = useAuthUser();
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingRiskFactor, setEditingRiskFactor] = useState<RiskFactor | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Carrega os Risk Factors do servidor
  useEffect(() => {
    loadRiskFactors();
  }, []);

  const loadRiskFactors = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/parameters/riskfactor');
      if (response.ok) {
        const data = await response.json();
        setRiskFactors(data);
      } else {
        throw new Error('Erro ao carregar Risk Factors');
      }
    } catch (error) {
      console.error('Erro ao carregar Risk Factors:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os Fatores de Risco.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: Omit<RiskFactor, 'id' | 'createdBy' | 'createdAt' | 'updatedBy' | 'updatedAt'>) => {
    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        createdBy: `${authUser.name} (${authUser.email})`,
        createdAt: new Date().toISOString(),
      };

      const response = await fetch('/api/parameters/riskfactor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: 'Fator de Risco salvo com sucesso.',
        });
        setShowAddDialog(false);
        await loadRiskFactors();
      } else {
        throw new Error('Erro ao salvar Fator de Risco');
      }
    } catch (error) {
      console.error('Erro ao salvar Fator de Risco:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o Fator de Risco.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (formData: Omit<RiskFactor, 'id' | 'createdBy' | 'createdAt' | 'updatedBy' | 'updatedAt'>) => {
    if (!editingRiskFactor) return;
    
    setSaving(true);
    try {
      const dataToUpdate = {
        ...formData,
        id: editingRiskFactor.id,
        updatedBy: `${authUser.name} (${authUser.email})`,
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(`/api/parameters/riskfactor`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToUpdate),
      });

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: 'Fator de Risco atualizado com sucesso.',
        });
        setShowEditDialog(false);
        setEditingRiskFactor(null);
        await loadRiskFactors();
      } else {
        throw new Error('Erro ao atualizar Fator de Risco');
      }
    } catch (error) {
      console.error('Erro ao atualizar Fator de Risco:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o Fator de Risco.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (riskFactor: RiskFactor) => {
    if (!confirm(`Tem certeza que deseja excluir o Fator de Risco "${riskFactor.nome}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/parameters/riskfactor?id=${riskFactor.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: 'Fator de Risco excluído com sucesso.',
        });
        await loadRiskFactors();
      } else {
        throw new Error('Erro ao excluir Fator de Risco');
      }
    } catch (error) {
      console.error('Erro ao excluir Fator de Risco:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o Fator de Risco.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings />
          Fatores de Risco
        </CardTitle>
        <CardDescription>
          Gerencie os Fatores de Risco que serão utilizados nos módulos de Identificação e Análise de Risco.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Lista de Fatores de Risco</h3>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Fator de Risco
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Fator de Risco</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo Fator de Risco.
                </DialogDescription>
              </DialogHeader>
              <RiskFactorForm
                onSave={handleSave}
                onCancel={() => setShowAddDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Dono do Risco</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {riskFactors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Nenhum Fator de Risco cadastrado ainda.
                    </TableCell>
                  </TableRow>
                ) : (
                  riskFactors.map((riskFactor) => (
                    <RiskFactorRow
                      key={riskFactor.id}
                      riskFactor={riskFactor}
                      onEdit={() => {
                        setEditingRiskFactor(riskFactor);
                        setShowEditDialog(true);
                      }}
                      onDelete={() => handleDelete(riskFactor)}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Dialog de Edição */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Fator de Risco</DialogTitle>
              <DialogDescription>
                Edite os dados do Fator de Risco.
              </DialogDescription>
            </DialogHeader>
            {editingRiskFactor && (
              <RiskFactorForm
                riskFactor={editingRiskFactor}
                onSave={handleUpdate}
                onCancel={() => {
                  setShowEditDialog(false);
                  setEditingRiskFactor(null);
                }}
                isEdit
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-muted-foreground">
          Total: {riskFactors.length} Fator{riskFactors.length !== 1 ? 'es' : ''} de Risco cadastrado{riskFactors.length !== 1 ? 's' : ''}
        </div>
      </CardFooter>
    </Card>
  );
}