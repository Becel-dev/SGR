
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

const areaOptions = ['OPERAÇÃO', 'MANUTENÇÃO', 'SEGURANÇA', 'FINANCEIRO', 'RH', 'JURÍDICO', 'COMPLIANCE', 'TI'];
const tipoOptions = ['Preventivo', 'Mitigatório'];
const classificacaoOptions = ['Procedimento', 'Equipamento', 'Pessoa', 'Sistema'];
const statusOptions = ['Implementado', 'Implementado com Pendência', 'Não Implementado', 'Implementação Futura'];
const validacaoOptions = ['DENTRO DO PRAZO', 'ATRASADO', 'PENDENTE'];
const criticidadeOptions = ['Sim', 'Não'];


export default function CaptureControlPage() {
    const router = useRouter();
    const [creationDate, setCreationDate] = useState<Date>();
    const [lastCheckDate, setLastCheckDate] = useState<Date>();
    const [nextCheckDate, setNextCheckDate] = useState<Date>();
    
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Shield />
            Cadastro de Novo Controle (MUE)
        </CardTitle>
        <CardDescription>
          Preencha os campos abaixo para registrar um novo controle.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Column 1 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Identificação</h3>
            <div><Label htmlFor="id">ID</Label><Input id="id" name="id" placeholder="1"/></div>
            <div><Label htmlFor="codigoMUE">Código do MUE</Label><Input id="codigoMUE" name="codigoMUE" placeholder="RUMO 01"/></div>
            <div><Label htmlFor="titulo">Título</Label><Input id="titulo" name="titulo" placeholder="RUMO 01-01"/></div>
            <div><Label htmlFor="idRiscoMUE">ID Risco Associado</Label><Input id="idRiscoMUE" name="idRiscoMUE" placeholder="30"/></div>
            <div><Label htmlFor="topRiskAssociado">Top Risk Associado</Label><Input id="topRiskAssociado" name="topRiskAssociado" placeholder="Risco 01.Não integridade..."/></div>
            <div><Label htmlFor="descricaoMUE">Descrição do MUE</Label><Textarea id="descricaoMUE" name="descricaoMUE" placeholder="Descrição do MUE (Risco)"/></div>
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
             <h3 className="font-semibold text-lg border-b pb-2">Detalhes do Controle</h3>
             <div><Label htmlFor="nomeControle">Nome do Controle (CC)</Label><Textarea id="nomeControle" name="nomeControle" placeholder="Nome descritivo do controle"/></div>
             <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select name="tipo"><SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                    <SelectContent>{tipoOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
            </div>
             <div>
                <Label htmlFor="classificacao">Classificação</Label>
                <Select name="classificacao"><SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                    <SelectContent>{classificacaoOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="status">Status</Label>
                <Select name="status"><SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                    <SelectContent>{statusOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="criticidade">Criticidade</Label>
                <Select name="criticidade"><SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                    <SelectContent>{criticidadeOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
            </div>
             <div><Label htmlFor="onePager">OnePager</Label><Input id="onePager" name="onePager"/></div>
             <div><Label htmlFor="evidencia">Evidência</Label><Input id="evidencia" name="evidencia" placeholder="Link ou nome do arquivo"/></div>
          </div>
          
          {/* Column 3 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Responsabilidade e Prazos</h3>
            <div><Label htmlFor="donoControle">Dono do Controle</Label><Input id="donoControle" name="donoControle" /></div>
            <div><Label htmlFor="emailDono">E-mail do Dono</Label><Input id="emailDono" name="emailDono" type="email"/></div>
            <div>
                <Label htmlFor="area">Área</Label>
                <Select name="area"><SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                    <SelectContent>{areaOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
            </div>
             <div>
                <Label htmlFor="dataUltimaVerificacao">Data da Última Verificação</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {lastCheckDate ? <span>{lastCheckDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span> : <span>Selecione uma data</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={lastCheckDate} onSelect={setLastCheckDate} initialFocus/></PopoverContent>
                </Popover>
            </div>
            <div><Label htmlFor="frequenciaMeses">Frequência (em meses)</Label><Input id="frequenciaMeses" name="frequenciaMeses" type="number" placeholder="6"/></div>
            <div>
                <Label htmlFor="proximaVerificacao">Próxima Verificação</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {nextCheckDate ? <span>{nextCheckDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span> : <span>Selecione uma data</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={nextCheckDate} onSelect={setNextCheckDate} /></PopoverContent>
                </Popover>
            </div>
             <div>
                <Label htmlFor="validacao">Validação</Label>
                <Select name="validacao"><SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                    <SelectContent>{validacaoOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
            </div>
          </div>

           {/* Column 4 */}
           <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Metadados</h3>
                 <div>
                    <Label htmlFor="criadoEm">Data de Criação</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {creationDate ? <span>{creationDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span> : <span>Selecione uma data</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={creationDate} onSelect={setCreationDate} initialFocus/></PopoverContent>
                    </Popover>
                </div>
                <div><Label htmlFor="criadoPor">Criado Por</Label><Input id="criadoPor" name="criadoPor" /></div>
                <div><Label htmlFor="modificadoPor">Modificado Por</Label><Input id="modificadoPor" name="modificadoPor" /></div>
                <div><Label htmlFor="preenchimentoKPI">E-mails para KPI</Label><Textarea id="preenchimentoKPI" name="preenchimentoKPI" placeholder="email1@rumo.com;email2@rumo.com"/></div>
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
