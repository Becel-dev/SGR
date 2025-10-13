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
import { TemaMaterial } from '@/lib/types';
import { useAuthUser } from '@/hooks/use-auth';

const TemaMaterialRow = ({ 
  temaMaterial, 
  onEdit, 
  onDelete 
}: { 
  temaMaterial: TemaMaterial;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <TableRow>
    <TableCell className="font-medium">{temaMaterial.nome}</TableCell>
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

const TemaMaterialForm = ({ 
  temaMaterial, 
  onSave, 
  onCancel, 
  isEdit = false 
}: { 
  temaMaterial?: TemaMaterial;
  onSave: (data: Omit<TemaMaterial, 'id' | 'createdBy' | 'createdAt' | 'updatedBy' | 'updatedAt'>) => void;
  onCancel: () => void;
  isEdit?: boolean;
}) => {
  const [formData, setFormData] = useState({
    nome: temaMaterial?.nome || '',
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
          placeholder="Nome do Tema Material"
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

export default function TemaMaterialPage() {
  const { toast } = useToast();
  const authUser = useAuthUser();
  const [temasMateriais, setTemasMateriais] = useState<TemaMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingTemaMaterial, setEditingTemaMaterial] = useState<TemaMaterial | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Carrega os Temas Materiais do servidor
  useEffect(() => {
    loadTemasMateriais();
  }, []);

  const loadTemasMateriais = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/parameters/temamaterial');
      if (response.ok) {
        const data = await response.json();
        setTemasMateriais(data);
      } else {
        throw new Error('Erro ao carregar Temas Materiais');
      }
    } catch (error) {
      console.error('Erro ao carregar Temas Materiais:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os Temas Materiais.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: Omit<TemaMaterial, 'id' | 'createdBy' | 'createdAt' | 'updatedBy' | 'updatedAt'>) => {
    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        createdBy: `${authUser.name} (${authUser.email})`,
        createdAt: new Date().toISOString(),
      };

      const response = await fetch('/api/parameters/temamaterial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: 'Tema Material salvo com sucesso.',
        });
        setShowAddDialog(false);
        await loadTemasMateriais();
      } else {
        throw new Error('Erro ao salvar Tema Material');
      }
    } catch (error) {
      console.error('Erro ao salvar Tema Material:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o Tema Material.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (formData: Omit<TemaMaterial, 'id' | 'createdBy' | 'createdAt' | 'updatedBy' | 'updatedAt'>) => {
    if (!editingTemaMaterial) return;
    
    setSaving(true);
    try {
      const dataToUpdate = {
        ...formData,
        id: editingTemaMaterial.id,
        updatedBy: `${authUser.name} (${authUser.email})`,
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(`/api/parameters/temamaterial`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToUpdate),
      });

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: 'Tema Material atualizado com sucesso.',
        });
        setShowEditDialog(false);
        setEditingTemaMaterial(null);
        await loadTemasMateriais();
      } else {
        throw new Error('Erro ao atualizar Tema Material');
      }
    } catch (error) {
      console.error('Erro ao atualizar Tema Material:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o Tema Material.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (temaMaterial: TemaMaterial) => {
    if (!confirm(`Tem certeza que deseja excluir o Tema Material "${temaMaterial.nome}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/parameters/temamaterial?id=${temaMaterial.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: 'Tema Material excluído com sucesso.',
        });
        await loadTemasMateriais();
      } else {
        throw new Error('Erro ao excluir Tema Material');
      }
    } catch (error) {
      console.error('Erro ao excluir Tema Material:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o Tema Material.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings />
          Temas Materiais
        </CardTitle>
        <CardDescription>
          Gerencie os Temas Materiais ESG que serão utilizados no módulo de Análise de Risco.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Lista de Temas Materiais</h3>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Tema Material
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Tema Material</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo Tema Material.
                </DialogDescription>
              </DialogHeader>
              <TemaMaterialForm
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
                {temasMateriais.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      Nenhum Tema Material cadastrado ainda.
                    </TableCell>
                  </TableRow>
                ) : (
                  temasMateriais.map((temaMaterial) => (
                    <TemaMaterialRow
                      key={temaMaterial.id}
                      temaMaterial={temaMaterial}
                      onEdit={() => {
                        setEditingTemaMaterial(temaMaterial);
                        setShowEditDialog(true);
                      }}
                      onDelete={() => handleDelete(temaMaterial)}
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
              <DialogTitle>Editar Tema Material</DialogTitle>
              <DialogDescription>
                Edite os dados do Tema Material.
              </DialogDescription>
            </DialogHeader>
            {editingTemaMaterial && (
              <TemaMaterialForm
                temaMaterial={editingTemaMaterial}
                onSave={handleUpdate}
                onCancel={() => {
                  setShowEditDialog(false);
                  setEditingTemaMaterial(null);
                }}
                isEdit
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-muted-foreground">
          Total: {temasMateriais.length} Tema{temasMateriais.length !== 1 ? 's' : ''} Material{temasMateriais.length !== 1 ? 'is' : ''} cadastrado{temasMateriais.length !== 1 ? 's' : ''}
        </div>
      </CardFooter>
    </Card>
  );
}
