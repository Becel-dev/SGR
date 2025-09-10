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
import { format } from 'date-fns';

export default function CaptureRiskPage() {
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
        <form className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Column 1 */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="risk-id">ID do Risco</Label>
              <Input id="risk-id" placeholder="Ex: R005" />
            </div>
            <div>
              <Label htmlFor="risk-title">Risco</Label>
              <Input id="risk-title" placeholder="Título resumido do risco" />
            </div>
            <div>
              <Label htmlFor="risk-description">Descrição do Risco</Label>
              <Textarea id="risk-description" rows={4} placeholder="Descreva o risco em detalhes" />
            </div>
             <div>
              <Label htmlFor="identification-date">Data de Identificação</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>Selecione uma data</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" />
                </PopoverContent>
              </Popover>
            </div>
             <div>
              <Label htmlFor="risk-source">Origem do Risco</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interna">Interna</SelectItem>
                  <SelectItem value="externa">Externa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="primary-cause">Causa Primária</Label>
              <Textarea id="primary-cause" rows={3} placeholder="Descreva a causa principal" />
            </div>
            <div>
              <Label htmlFor="consequence">Consequência</Label>
              <Textarea id="consequence" rows={3} placeholder="Descreva a principal consequência" />
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
             <div>
              <Label htmlFor="risk-type">Tipo de Risco</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="estrategico">Estratégico</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="operacional">Operacional</SelectItem>
                  <SelectItem value="conformidade">Conformidade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="responsible-area">Área Responsável</Label>
              <Input id="responsible-area" placeholder="Ex: Manutenção, Operações" />
            </div>
            <div>
              <Label htmlFor="impacted-process">Processo Impactado</Label>
              <Input id="impacted-process" placeholder="Ex: Operação Ferroviária" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="inherent-likelihood">Probabilidade Inerente</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="raro">Raro</SelectItem>
                    <SelectItem value="improvavel">Improvável</SelectItem>
                    <SelectItem value="possivel">Possível</SelectItem>
                    <SelectItem value="provavel">Provável</SelectItem>
                    <SelectItem value="quase-certo">Quase Certo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="inherent-impact">Impacto Inerente</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="insignificante">Insignificante</SelectItem>
                    <SelectItem value="menor">Menor</SelectItem>
                    <SelectItem value="moderado">Moderado</SelectItem>
                    <SelectItem value="maior">Maior</SelectItem>
                    <SelectItem value="catastrofico">Catastrófico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="response-strategy">Estratégia de Resposta</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a estratégia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mitigar">Mitigar</SelectItem>
                  <SelectItem value="aceitar">Aceitar</SelectItem>
                  <SelectItem value="transferir">Transferir</SelectItem>
                  <SelectItem value="evitar">Evitar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="control-description">Descrição do Controle</Label>
              <Textarea id="control-description" rows={3} placeholder="Descreva o controle aplicado" />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="control-type">Tipo de Controle</Label>
                    <Select>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="preventivo">Preventivo</SelectItem>
                        <SelectItem value="detectivo">Detectivo</SelectItem>
                        <SelectItem value="corretivo">Corretivo</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="control-effectiveness">Eficácia do Controle</Label>
                    <Select>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="ineficaz">Ineficaz</SelectItem>
                        <SelectItem value="pouco-eficaz">Pouco Eficaz</SelectItem>
                        <SelectItem value="eficaz">Eficaz</SelectItem>
                        <SelectItem value="muito-eficaz">Muito Eficaz</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </div>
          
          {/* Column 3 */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="residual-likelihood">Probabilidade Residual</Label>
                    <Select>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="raro">Raro</SelectItem>
                        <SelectItem value="improvavel">Improvável</SelectItem>
                        <SelectItem value="possivel">Possível</SelectItem>
                        <SelectItem value="provavel">Provável</SelectItem>
                        <SelectItem value="quase-certo">Quase Certo</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="residual-impact">Impacto Residual</Label>
                    <Select>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="insignificante">Insignificante</SelectItem>
                        <SelectItem value="menor">Menor</SelectItem>
                        <SelectItem value="moderado">Moderado</SelectItem>
                        <SelectItem value="maior">Maior</SelectItem>
                        <SelectItem value="catastrofico">Catastrófico</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
            </div>
            <div>
              <Label htmlFor="status">Status do Risco</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aberto">Aberto</SelectItem>
                  <SelectItem value="em-tratamento">Em Tratamento</SelectItem>
                  <SelectItem value="fechado">Fechado</SelectItem>
                  <SelectItem value="mitigado">Mitigado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="responsible">Responsável pelo Risco</Label>
              <Input id="responsible" placeholder="Nome do responsável" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                <Label htmlFor="last-review-date">Data da Última Revisão</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>Selecione uma data</span>
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" />
                    </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="next-review-date">Próxima Revisão Prevista</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>Selecione uma data</span>
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" />
                    </PopoverContent>
                </Popover>
              </div>
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
