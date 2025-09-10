
'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon, Shield, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { controlsData, risksData } from '@/lib/mock-data';
import type { Control } from '@/lib/types';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';


export default function EditControlPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [control, setControl] = useState<Control | null>(null);
    const [creationDate, setCreationDate] = useState<Date>();

    useEffect(() => {
        const foundControl = controlsData.find(c => c.id === id);
        if (foundControl) {
            setControl(foundControl);
            setCreationDate(new Date(foundControl.criadoEm));
        }
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!control) return;
        const { name, value } = e.target;
        setControl({ ...control, [name]: value });
    };

    const handleSelectChange = (name: string, value: string) => {
        if (!control) return;
        setControl({ ...control, [name]: value });
    };

    if (!control) {
        return <div>Controle não encontrado...</div>
    }

    return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <Shield />
                    Detalhes do Controle: {control.id}
                </CardTitle>
                <CardDescription>
                Visualize ou edite os campos abaixo.
                </CardDescription>
            </div>
            <Button variant="outline" asChild>
                <Link href="/controls">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Link>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Column 1 */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="control-title">Controle</Label>
              <Input id="control-title" name="controle" value={control.controle} onChange={handleInputChange} placeholder="Título resumido do controle" />
            </div>
             <div>
                <Label htmlFor="creation-date">Data de Criação</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {creationDate ? <span>{creationDate.toLocaleDateString()}</span> : <span>Selecione uma data</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={creationDate} onSelect={(date) => {
                            setCreationDate(date);
                            if(date) handleSelectChange('criadoEm', date.toISOString().split('T')[0]);
                        }} initialFocus/>
                    </PopoverContent>
                </Popover>
            </div>
             <div>
              <Label htmlFor="gerencia">Gerência Responsável</Label>
              <Select name="gerenciaResponsavel" value={control.gerenciaResponsavel} onValueChange={(v) => handleSelectChange('gerenciaResponsavel', v)}>
                <SelectTrigger id="gerencia"><SelectValue placeholder="Selecione a gerência" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Operação">Operação</SelectItem>
                  <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="Ambiental">Ambiental</SelectItem>
                  <SelectItem value="GesMun">GesMun</SelectItem>
                  <SelectItem value="Compliance">Compliance</SelectItem>
                  <SelectItem value="Regulatório">Regulatório</SelectItem>
                  <SelectItem value="Suprimentos">Suprimentos</SelectItem>
                  <SelectItem value="Jurídico">Jurídico</SelectItem>
                  <SelectItem value="Comercial">Comercial</SelectItem>
                  <SelectItem value="DHO">DHO</SelectItem>
                  <SelectItem value="Expansão">Expansão</SelectItem>
                  <SelectItem value="Financeiro">Financeiro</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="RH">RH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
             <div>
                <Label htmlFor="control-nature">Natureza do Controle</Label>
                <Select name="natureza" value={control.natureza} onValueChange={(v) => handleSelectChange('natureza', v)}>
                    <SelectTrigger id="control-nature"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Manual">Manual</SelectItem>
                        <SelectItem value="Sistêmico">Sistêmico</SelectItem>
                        <SelectItem value="Semi-Sistêmico">Semi-Sistêmico</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div>
                <Label htmlFor="control-type">Tipo de Controle</Label>
                 <Select name="tipo" value={control.tipo} onValueChange={(v) => handleSelectChange('tipo', v)}>
                    <SelectTrigger id="control-type"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Preventivo">Preventivo</SelectItem>
                        <SelectItem value="Detectivo">Detectivo</SelectItem>
                        <SelectItem value="Corretivo">Corretivo</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="control-frequency">Frequência</Label>
                <Select name="frequencia" value={control.frequencia} onValueChange={(v) => handleSelectChange('frequencia', v)}>
                    <SelectTrigger id="control-frequency"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Diário">Diário</SelectItem>
                        <SelectItem value="Semanal">Semanal</SelectItem>
                        <SelectItem value="Mensal">Mensal</SelectItem>
                        <SelectItem value="Trimestral">Trimestral</SelectItem>
                        <SelectItem value="Semestral">Semestral</SelectItem>
                        <SelectItem value="Anual">Anual</SelectItem>
                        <SelectItem value="Sob Demanda">Sob Demanda</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          
          {/* Column 3 */}
          <div className="space-y-6">
             <div>
              <Label htmlFor="status">Status</Label>
              <Select name="status" value={control.status} onValueChange={(v) => handleSelectChange('status', v)}>
                <SelectTrigger id="status"><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div>
              <Label htmlFor="associated-risks">Risco(s) Associado(s)</Label>
               {/* This should be a multi-select component in a real scenario */}
                <div className="flex flex-wrap gap-1 p-2 border rounded-md min-h-[40px]">
                    {control.riscosAssociados.length > 0 ? control.riscosAssociados.map(riskId => {
                        const risk = risksData.find(r => r.id === riskId);
                        return risk ? <Badge key={riskId} variant="secondary">{risk.risco}</Badge> : null;
                    }) : <span className="text-sm text-muted-foreground">Nenhum risco associado</span>}
                </div>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push('/controls')}>Cancelar</Button>
        <Button onClick={() => alert('Controle salvo!')}>Salvar Alterações</Button>
      </CardFooter>
    </Card>
  );
}
