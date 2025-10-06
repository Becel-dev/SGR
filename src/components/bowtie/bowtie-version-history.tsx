'use client';

import { useState } from 'react';
import { BowtieData } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { History, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface BowtieVersionHistoryProps {
  riskId: string;
  onSelectVersion: (version: BowtieData) => void;
  trigger?: React.ReactNode;
}

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  'Aprovado': 'default',
  'Em aprovação': 'secondary',
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

export function BowtieVersionHistory({ 
  riskId, 
  onSelectVersion,
  trigger 
}: BowtieVersionHistoryProps) {
  const [versions, setVersions] = useState<BowtieData[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/bowtie/${riskId}/versions`);
      if (!response.ok) {
        throw new Error('Failed to load versions');
      }
      const data = await response.json();
      setVersions(data);
    } catch (error) {
      console.error('Error loading versions:', error);
      setVersions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      loadVersions();
    }
  };

  const handleViewVersion = (version: BowtieData) => {
    onSelectVersion(version);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon">
            <History className="h-4 w-4" />
            <span className="sr-only">Ver Histórico</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Histórico de Versões</DialogTitle>
          <DialogDescription>
            Visualize todas as versões anteriores deste diagrama Bowtie.
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <span className="animate-spin text-2xl">⏳</span>
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma versão encontrada.
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {versions.map((version, index) => (
                <div
                  key={`${version.id}_v${version.version}`}
                  className={cn(
                    "border rounded-lg p-4 hover:bg-accent/50 transition-colors",
                    index === 0 && "border-primary bg-primary/5"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">
                          Versão {version.version.toFixed(1)}
                        </h4>
                        {index === 0 && (
                          <Badge variant="default">Atual</Badge>
                        )}
                        <Badge variant={statusVariantMap[version.approvalStatus] || 'outline'}>
                          {version.approvalStatus}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Criado em:</span>{' '}
                          {formatDate(version.createdAt)}
                        </div>
                        <div>
                          <span className="font-medium">Criado por:</span>{' '}
                          {version.createdBy}
                        </div>
                        <div>
                          <span className="font-medium">Atualizado em:</span>{' '}
                          {formatDate(version.updatedAt)}
                        </div>
                        <div>
                          <span className="font-medium">Atualizado por:</span>{' '}
                          {version.updatedBy}
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Responsável:</span>{' '}
                        {version.responsible}
                      </div>
                      
                      <div className="mt-2 text-sm text-muted-foreground">
                        {version.threats.length} ameaça(s) • {version.consequences.length} consequência(s)
                      </div>
                    </div>
                    
                    <Button
                      variant={index === 0 ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleViewVersion(version)}
                      className="ml-4"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {index === 0 ? 'Editar' : 'Visualizar'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
