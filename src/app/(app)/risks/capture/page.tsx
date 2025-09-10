
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
import { Calendar as CalendarIcon, Siren } from 'lucide-react';
import { useState } from 'react';


export default function CaptureRiskPage() {
    const [identificationDate, setIdentificationDate] = useState<Date>();
    const [lastReviewDate, setLastReviewDate] = useState<Date>();
    const [nextReviewDate, setNextReviewDate] = useState<Date>();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Siren />
            Cadastro de Novo Risco
        </CardTitle>
        <CardDescription>
          Preencha os campos abaixo para registrar um novo risco.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Column 1 */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="gerencia">Gerência</Label>
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
                </SelectContent>
              </Select>
            </div>
             <div>
              <Label htmlFor="risk-title">Risco</Label>
              <Input id="risk-title" name="risco" placeholder="Título resumido do risco" />
            </div>
            <div>
              <Label htmlFor="risk-description">Descrição do Risco</Label>
              <Textarea id="risk-description" name="descricaoDoRisco" rows={4} placeholder="Descreva o risco em detalhes" />
            </div>
            <div>
                <Label htmlFor="identification-date">Data de Identificação</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {identificationDate ? <span>{identificationDate.toLocaleDateString()}</span> : <span>Selecione uma data</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={identificationDate} onSelect={setIdentificationDate} initialFocus/>
                    </PopoverContent>
                </Popover>
            </div>
            <div>
              <Label htmlFor="risk-source">Origem do Risco</Label>
              <Select name="origemDoRisco">
                <SelectTrigger id="risk-source"><SelectValue placeholder="Selecione a origem" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Interna">Interna</SelectItem>
                  <SelectItem value="Externa">Externa</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div>
              <Label htmlFor="primary-cause">Causa Raiz do Risco</Label>
              <Textarea id="primary-cause" name="causaRaizDoRisco" rows={3} placeholder="Descreva a causa principal" />
            </div>
            <div>
              <Label htmlFor="consequence">Consequência do Risco</Label>
              <Textarea id="consequence" name="consequenciaDoRisco" rows={3} placeholder="Descreva a principal consequência" />
            </div>
            <div>
              <Label htmlFor="risk-type">Tipo de Risco</Label>
              <Select name="tipoDeRisco">
                <SelectTrigger id="risk-type"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Estratégico">Estratégico</SelectItem>
                  <SelectItem value="Financeiro">Financeiro</SelectItem>
                  <SelectItem value="Operacional">Operacional</SelectItem>
                  <SelectItem value="Conformidade">Conformidade</SelectItem>
                  <SelectItem value="Ambiental">Ambiental</SelectItem>
                  <SelectItem value="Regulatório">Regulatório</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                  <SelectItem value="Imagem">Imagem</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="impacted-process">Processo Afetado</Label>
              <Input id="impacted-process" name="processoAfetado" placeholder="Ex: Operação Ferroviária" />
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            <div className="rounded-md border p-4 space-y-4">
                <p className="font-medium text-sm">Risco Inerente</p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="inherent-likelihood">Probabilidade</Label>
                        <Select name="probabilidadeInerente">
                        <SelectTrigger id="inherent-likelihood"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Raro">Raro</SelectItem>
                            <SelectItem value="Improvável">Improvável</SelectItem>
                            <SelectItem value="Possível">Possível</SelectItem>
                            <SelectItem value="Provável">Provável</SelectItem>
                            <SelectItem value="Quase Certo">Quase Certo</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="inherent-impact">Impacto</Label>
                        <Select name="impactoInerente">
                        <SelectTrigger id="inherent-impact"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Insignificante">Insignificante</SelectItem>
                            <SelectItem value="Menor">Menor</SelectItem>
                            <SelectItem value="Moderado">Moderado</SelectItem>
                            <SelectItem value="Maior">Maior</SelectItem>
                            <SelectItem value="Catastrófico">Catastrófico</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            <div>
              <Label htmlFor="response-strategy">Estratégia de Resposta</Label>
              <Select name="estrategia">
                <SelectTrigger id="response-strategy"><SelectValue placeholder="Selecione a estratégia" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mitigar">Mitigar</SelectItem>
                  <SelectItem value="Aceitar">Aceitar</SelectItem>
                  <SelectItem value="Transferir">Transferir</SelectItem>
                  <SelectItem value="Evitar">Evitar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="control-description">Descrição do Controle</Label>
              <Textarea id="control-description" name="descricaoDoControle" rows={3} placeholder="Descreva o controle aplicado" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="control-nature">Natureza do Controle</Label>
                    <Select name="naturezaDoControle">
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
                    <Select name="tipoDeControle">
                        <SelectTrigger id="control-type"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Preventivo">Preventivo</SelectItem>
                            <SelectItem value="Detectivo">Detectivo</SelectItem>
                            <SelectItem value="Corretivo">Corretivo</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="control-classification">Classificação</Label>
                    <Select name="classificacaoDoControle">
                        <SelectTrigger id="control-classification"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Chave">Chave</SelectItem>
                            <SelectItem value="Não Chave">Não Chave</SelectItem>
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
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div>
                <Label htmlFor="control-effectiveness">Eficácia do Controle</Label>
                <Select name="eficaciaDoControle">
                    <SelectTrigger id="control-effectiveness"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Ineficaz">Ineficaz</SelectItem>
                        <SelectItem value="Pouco Eficaz">Pouco Eficaz</SelectItem>
                        <SelectItem value="Eficaz">Eficaz</SelectItem>
                        <SelectItem value="Muito Eficaz">Muito Eficaz</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          
          {/* Column 3 */}
          <div className="space-y-6">
            <div className="rounded-md border p-4 space-y-4">
                <p className="font-medium text-sm">Risco Residual</p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="residual-likelihood">Probabilidade</Label>
                        <Select name="probabilidadeResidual">
                        <SelectTrigger id="residual-likelihood"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Raro">Raro</SelectItem>
                            <SelectItem value="Improvável">Improvável</SelectItem>
                            <SelectItem value="Possível">Possível</SelectItem>
                            <SelectItem value="Provável">Provável</SelectItem>
                            <SelectItem value="Quase Certo">Quase Certo</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="residual-impact">Impacto</Label>
                        <Select name="impactoResidual">
                        <SelectTrigger id="residual-impact"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Insignificante">Insignificante</SelectItem>
                            <SelectItem value="Menor">Menor</SelectItem>
                            <SelectItem value="Moderado">Moderado</SelectItem>
                            <SelectItem value="Maior">Maior</SelectItem>
                            <SelectItem value="Catastrófico">Catastrófico</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            <div>
              <Label htmlFor="status">Status do Risco</Label>
              <Select name="statusDoRisco">
                <SelectTrigger id="status"><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aberto">Aberto</SelectItem>
                  <SelectItem value="Em Tratamento">Em Tratamento</SelectItem>
                  <SelectItem value="Fechado">Fechado</SelectItem>
                  <SelectItem value="Mitigado">Mitigado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="responsible">Responsável pelo Risco</Label>
              <Input id="responsible" name="responsavelPeloRisco" placeholder="Nome do responsável" />
            </div>
             <div>
                <Label htmlFor="last-review-date">Data da Última Revisão</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {lastReviewDate ? <span>{lastReviewDate.toLocaleDateString()}</span> : <span>Selecione uma data</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={lastReviewDate} onSelect={setLastReviewDate} />
                    </PopoverContent>
                </Popover>
            </div>
            <div>
            <Label htmlFor="next-review-date">Próxima Revisão Prevista</Label>
            <Popover>
                <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {nextReviewDate ? <span>{nextReviewDate.toLocaleDateString()}</span> : <span>Selecione uma data</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={nextReviewDate} onSelect={setNextReviewDate}/>
                </PopoverContent>
            </Popover>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline">Cancelar</Button>
        <Button>Salvar Risco</Button>
      </CardFooter>
    </Card>
  );
}
