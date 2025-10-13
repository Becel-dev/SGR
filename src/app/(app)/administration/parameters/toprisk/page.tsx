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
import { TopRisk } from '@/lib/types';
import { useAuthUser } from '@/hooks/use-auth';

const TopRiskRow = ({ 
  topRisk, 
  onEdit, 
  onDelete 
}: { 
  topRisk: TopRisk;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <TableRow>
    <TableCell className="font-medium">{topRisk.nome}</TableCell>
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

const TopRiskForm = ({ 
  topRisk, 
  onSave, 
  onCancel, 
  isEdit = false 
}: { 
  topRisk?: TopRisk;
  onSave: (data: Omit<TopRisk, 'id' | 'createdBy' | 'createdAt' | 'updatedBy' | 'updatedAt'>) => void;
  onCancel: () => void;
  isEdit?: boolean;
}) => {
  const [formData, setFormData] = useState({
    nome: topRisk?.nome || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
          placeholder="Nome do Top Risk"
          required
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" />
          {isEdit ? 'Atualizar' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
};

export default function TopRiskPage() {
  const { toast } = useToast();
  const authUser = useAuthUser();
  const [topRisks, setTopRisks] = useState<TopRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingTopRisk, setEditingTopRisk] = useState<TopRisk | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Carrega os Top Risks do servidor
  useEffect(() => {
    loadTopRisks();
  }, []);

  const loadTopRisks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/parameters/toprisk');
      if (response.ok) {
        const data = await response.json();
        setTopRisks(data);
      } else {
        throw new Error('Erro ao carregar Top Risks');
      }
    } catch (error) {
      console.error('Erro ao carregar Top Risks:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os Top Risks.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: Omit<TopRisk, 'id' | 'createdBy' | 'createdAt' | 'updatedBy' | 'updatedAt'>) => {
    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        createdBy: `${authUser.name} (${authUser.email})`,
        createdAt: new Date().toISOString(),
      };

      const response = await fetch('/api/parameters/toprisk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: 'Top Risk salvo com sucesso.',
        });
        setShowAddDialog(false);
        await loadTopRisks();
      } else {
        throw new Error('Erro ao salvar Top Risk');
      }
    } catch (error) {
      console.error('Erro ao salvar Top Risk:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o Top Risk.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (formData: Omit<TopRisk, 'id' | 'createdBy' | 'createdAt' | 'updatedBy' | 'updatedAt'>) => {
    if (!editingTopRisk) return;
    
    setSaving(true);
    try {
      const dataToUpdate = {
        ...formData,
        id: editingTopRisk.id,
        updatedBy: `${authUser.name} (${authUser.email})`,
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(`/api/parameters/toprisk`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToUpdate),
      });

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: 'Top Risk atualizado com sucesso.',
        });
        setShowEditDialog(false);
        setEditingTopRisk(null);
        await loadTopRisks();
      } else {
        throw new Error('Erro ao atualizar Top Risk');
      }
    } catch (error) {
      console.error('Erro ao atualizar Top Risk:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o Top Risk.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (topRisk: TopRisk) => {
    if (!confirm(`Tem certeza que deseja excluir o Top Risk "${topRisk.nome}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/parameters/toprisk?id=${topRisk.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: 'Top Risk excluído com sucesso.',
        });
        await loadTopRisks();
      } else {
        throw new Error('Erro ao excluir Top Risk');
      }
    } catch (error) {
      console.error('Erro ao excluir Top Risk:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o Top Risk.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings />
          Top Risks Corporativos
        </CardTitle>
        <CardDescription>
          Gerencie os Top Risks corporativos que serão utilizados nos módulos de Identificação e Análise de Risco.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Lista de Top Risks</h3>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Top Risk
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Top Risk</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo Top Risk corporativo.
                </DialogDescription>
              </DialogHeader>
              <TopRiskForm
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
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topRisks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      Nenhum Top Risk cadastrado ainda.
                    </TableCell>
                  </TableRow>
                ) : (
                  topRisks.map((topRisk) => (
                    <TopRiskRow
                      key={topRisk.id}
                      topRisk={topRisk}
                      onEdit={() => {
                        setEditingTopRisk(topRisk);
                        setShowEditDialog(true);
                      }}
                      onDelete={() => handleDelete(topRisk)}
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
              <DialogTitle>Editar Top Risk</DialogTitle>
              <DialogDescription>
                Edite os dados do Top Risk corporativo.
              </DialogDescription>
            </DialogHeader>
            {editingTopRisk && (
              <TopRiskForm
                topRisk={editingTopRisk}
                onSave={handleUpdate}
                onCancel={() => {
                  setShowEditDialog(false);
                  setEditingTopRisk(null);
                }}
                isEdit
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-muted-foreground">
          Total: {topRisks.length} Top Risk{topRisks.length !== 1 ? 's' : ''} cadastrado{topRisks.length !== 1 ? 's' : ''}
        </div>
      </CardFooter>
    </Card>
  );
}