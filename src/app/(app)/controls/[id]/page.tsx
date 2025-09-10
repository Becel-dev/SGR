
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
import { controlsData } from '@/lib/mock-data';
import type { Control } from '@/lib/types';
import Link from 'next/link';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';

const areaOptions = ['OPERAÇÃO', 'MANUTENÇÃO', 'SEGURANÇA', 'FINANCEIRO', 'RH', 'JURÍDICO', 'COMPLIANCE', 'TI'];
const tipoOptions = ['Preventivo', 'Mitigatório'];
const classificacaoOptions = ['Procedimento', 'Equipamento', 'Pessoa', 'Sistema'];
const statusOptions = ['Implementado', 'Implementado com Pendência', 'Não Implementado', 'Implementação Futura'];
const validacaoOptions = ['DENTRO DO PRAZO', 'ATRASADO', 'PENDENTE'];
const criticidadeOptions = ['Sim', 'Não'];


export default function EditControlPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [control, setControl] = useState<Control | null>(null);
    const [creationDate, setCreationDate] = useState<Date | undefined>();
    const [lastCheckDate, setLastCheckDate] = useState<Date | undefined>();
    const [nextCheckDate, setNextCheckDate] = useState<Date | undefined>();

    useEffect(() => {
        const foundControl = controlsData.find(c => c.id.toString() === id);
        if (foundControl) {
            setControl(foundControl);
            if (foundControl.criadoEm) setCreationDate(new Date(foundControl.criadoEm));
            if (foundControl.dataUltimaVerificacao) setLastCheckDate(new Date(foundControl.dataUltimaVerificacao));
            if (foundControl.proximaVerificacao) setNextCheckDate(new Date(foundControl.proximaVerificacao));
        }
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!control) return;
        const { name, value } = e.target;
        setControl({ ...control, [name]: value });
    };

    const handleSelectChange = (name: string, value: string) => {
        if (!control) return;
        setControl({ ...control, [name]: value });
    };
    
    const handleDateChange = (name: keyof Control, date: Date | undefined) => {
        if (!control || !date) return;
         setControl({ ...control, [name]: date.toISOString().split('T')[0] });
    }

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
                    Detalhes do Controle: {control.titulo}
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
        <form className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
           {/* Column 1 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Identificação</h3>
            <div><Label htmlFor="id">ID</Label><Input id="id" name="id" value={control.id} onChange={handleInputChange} disabled /></div>
            <div><Label htmlFor="codigoMUE">Código do MUE</Label><Input id="codigoMUE" name="codigoMUE" value={control.codigoMUE} onChange={handleInputChange} /></div>
            <div><Label htmlFor="titulo">Título</Label><Input id="titulo" name="titulo" value={control.titulo} onChange={handleInputChange}/></div>
            <div><Label htmlFor="idRiscoMUE">ID Risco Associado</Label><Input id="idRiscoMUE" name="idRiscoMUE" value={control.idRiscoMUE} onChange={handleInputChange}/></div>
            <div><Label htmlFor="topRiskAssociado">Top Risk Associado</Label><Input id="topRiskAssociado" name="topRiskAssociado" value={control.topRiskAssociado} onChange={handleInputChange}/></div>
            <div><Label htmlFor="descricaoMUE">Descrição do MUE</Label><Textarea id="descricaoMUE" name="descricaoMUE" value={control.descricaoMUE} onChange={handleInputChange}/></div>
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
             <h3 className="font-semibold text-lg border-b pb-2">Detalhes do Controle</h3>
             <div><Label htmlFor="nomeControle">Nome do Controle (CC)</Label><Textarea id="nomeControle" name="nomeControle" value={control.nomeControle} onChange={handleInputChange}/></div>
             <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select name="tipo" value={control.tipo} onValueChange={(v) => handleSelectChange('tipo', v)}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>{tipoOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
            </div>
             <div>
                <Label htmlFor="classificacao">Classificação</Label>
                 <Select name="classificacao" value={control.classificacao} onValueChange={(v) => handleSelectChange('classificacao', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{classificacaoOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="status">Status</Label>
                <Select name="status" value={control.status} onValueChange={(v) => handleSelectChange('status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{statusOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="criticidade">Criticidade</Label>
                <Select name="criticidade" value={control.criticidade} onValueChange={(v) => handleSelectChange('criticidade', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{criticidadeOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
            </div>
             <div><Label htmlFor="onePager">OnePager</Label><Input id="onePager" name="onePager" value={control.onePager} onChange={handleInputChange}/></div>
             <div><Label htmlFor="evidencia">Evidência</Label><Input id="evidencia" name="evidencia" value={control.evidencia} onChange={handleInputChange} /></div>
          </div>
          
          {/* Column 3 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Responsabilidade e Prazos</h3>
            <div><Label htmlFor="donoControle">Dono do Controle</Label><Input id="donoControle" name="donoControle" value={control.donoControle} onChange={handleInputChange} /></div>
            <div><Label htmlFor="emailDono">E-mail do Dono</Label><Input id="emailDono" name="emailDono" type="email" value={control.emailDono} onChange={handleInputChange}/></div>
            <div>
                <Label htmlFor="area">Área</Label>
                 <Select name="area" value={control.area} onValueChange={(v) => handleSelectChange('area', v)}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>{areaOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
            </div>
             <div>
                <Label htmlFor="dataUltimaVerificacao">Data da Última Verificação</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {lastCheckDate ? <span>{lastCheckDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span> : <span>Selecione</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={lastCheckDate} onSelect={(date) => { setLastCheckDate(date); handleDateChange('dataUltimaVerificacao', date); }} initialFocus/>
                    </PopoverContent>
                </Popover>
            </div>
            <div><Label htmlFor="frequenciaMeses">Frequência (em meses)</Label><Input id="frequenciaMeses" name="frequenciaMeses" type="number" value={control.frequenciaMeses} onChange={handleInputChange}/></div>
            <div>
                <Label htmlFor="proximaVerificacao">Próxima Verificação</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {nextCheckDate ? <span>{nextCheckDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span> : <span>Selecione</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={nextCheckDate} onSelect={(date) => { setNextCheckDate(date); handleDateChange('proximaVerificacao', date); }}/>
                    </PopoverContent>
                </Popover>
            </div>
             <div>
                <Label htmlFor="validacao">Validação</Label>
                 <Select name="validacao" value={control.validacao} onValueChange={(v) => handleSelectChange('validacao', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                             {creationDate ? <span>{creationDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span> : <span>Selecione</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={creationDate} onSelect={(date) => { setCreationDate(date); handleDateChange('criadoEm', date); }} initialFocus/>
                        </PopoverContent>
                    </Popover>
                </div>
                <div><Label htmlFor="criadoPor">Criado Por</Label><Input id="criadoPor" name="criadoPor" value={control.criadoPor} onChange={handleInputChange} /></div>
                <div><Label htmlFor="modificadoPor">Modificado Por</Label><Input id="modificadoPor" name="modificadoPor" value={control.modificadoPor} onChange={handleInputChange} /></div>
                <div><Label htmlFor="preenchimentoKPI">E-mails para KPI</Label><Textarea id="preenchimentoKPI" name="preenchimentoKPI" value={control.preenchimentoKPI} onChange={handleInputChange}/></div>
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
