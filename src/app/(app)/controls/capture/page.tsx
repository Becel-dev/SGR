
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
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon, Shield } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { risksData } from '@/lib/mock-data';


export default function CaptureControlPage() {
    const router = useRouter();
    const [creationDate, setCreationDate] = useState<Date>();
    
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Shield />
            Cadastro de Novo Controle
        </CardTitle>
        <CardDescription>
          Preencha os campos abaixo para registrar um novo controle.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Column 1 */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="control-title">Controle</Label>
              <Input id="control-title" name="controle" placeholder="Título resumido do controle" />
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
                        <Calendar mode="single" selected={creationDate} onSelect={setCreationDate} initialFocus/>
                    </PopoverContent>
                </Popover>
            </div>
             <div>
              <Label htmlFor="gerencia">Gerência Responsável</Label>
              <Select name="gerencia">
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
                <Select name="natureza">
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
                <Select name="tipo">
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
                <Select name="frequencia">
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
              <Select name="status">
                <SelectTrigger id="status"><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div>
              <Label htmlFor="associated-risks">Risco(s) Associado(s)</Label>
               <Select name="associated-risks">
                    <SelectTrigger id="associated-risks"><SelectValue placeholder="Selecione um ou mais riscos" /></SelectTrigger>
                    <SelectContent>
                        {risksData.map(risk => (
                            <SelectItem key={risk.id} value={risk.id}>
                                {`[${risk.id}] ${risk.risco}`}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push('/controls')}>Cancelar</Button>
        <Button>Salvar Controle</Button>
      </CardFooter>
    </Card>
  );
}
