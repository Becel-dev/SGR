'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { BowtieData, BowtieBarrierNode, BowtieThreat, BowtieConsequence, BowtieTopEvent, Control } from "@/lib/types";
import { ArrowRight, ChevronRight, GitFork, Shield, Siren, Zap, Edit, Trash2, PlusCircle, Palette, AlertTriangle } from "lucide-react";
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { v4 as uuidv4 } from 'uuid';
import { Download } from 'lucide-react';
// import { controlsData } from '@/lib/mock-data';
import { PermissionButton } from '@/components/auth/permission-button';


const statusColors: Record<BowtieBarrierNode['status'], string> = {
  'Implementado': 'bg-green-200 text-green-800',
  'Pendente': 'bg-yellow-200 text-yellow-800',
  'Não Implementado': 'bg-red-200 text-red-800',
  'Implementado com Pendência': 'bg-blue-200 text-blue-800',
  'Implementação Futura': 'bg-gray-200 text-gray-800',
};

const effectivenessColors: Record<BowtieBarrierNode['effectiveness'], string> = {
    'Eficaz': 'bg-gray-200 text-gray-800',
    'Pouco Eficaz': 'bg-gray-400 text-white',
    'Ineficaz': 'bg-gray-600 text-white',
};

// --- Editor Popovers ---
const BarrierEditor = ({ barrier, onUpdate, trigger, controls, readOnly }: { barrier: BowtieBarrierNode, onUpdate: (updatedBarrier: BowtieBarrierNode) => void, trigger: React.ReactNode, controls: Control[], readOnly?: boolean }) => {
    const [selectedControlId, setSelectedControlId] = React.useState<string | undefined>(barrier.controlId?.toString());
    const [effectiveness, setEffectiveness] = React.useState(barrier.effectiveness);

    const handleSave = () => {
        const control = controls.find((c: Control) => c.id.toString() === selectedControlId);
        if (control) {
            onUpdate({ 
                ...barrier, 
                controlId: control.id,
                title: control.nomeControle,
                responsible: control.donoControle,
                status: control.status as BowtieBarrierNode['status'], // Type assertion
                effectiveness: effectiveness,
            });
        }
    };

    const handleControlSelect = (controlId: string) => {
        setSelectedControlId(controlId);
    };
    
    if (readOnly) {
        return <>{trigger}</>;
    }
    
    return (
        <Popover>
            <PopoverTrigger asChild>{trigger}</PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Editar Barreira (Controle)</h4>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="b-control">Controle</Label>
                        <Select value={selectedControlId} onValueChange={handleControlSelect}>
                            <SelectTrigger id="b-control">
                                <SelectValue placeholder="Selecione um controle..." />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                {controls.map((c: Control) => (
                                    <SelectItem key={c.id} value={c.id.toString()}>
                                       {`[${c.id}] ${c.nomeControle}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Label htmlFor="b-eff">Eficácia</Label>
                        <Select value={effectiveness} onValueChange={(v: BowtieBarrierNode['effectiveness']) => setEffectiveness(v)}>
                            <SelectTrigger id="b-eff"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Eficaz">Eficaz</SelectItem>
                                <SelectItem value="Pouco Eficaz">Pouco Eficaz</SelectItem>
                                <SelectItem value="Ineficaz">Ineficaz</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleSave} disabled={!selectedControlId}>Salvar</Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

const ThreatConsequenceEditor = ({ item, onUpdate, trigger }: { item: {id: string, title: string}, onUpdate: (updatedItem: {id: string, title: string}) => void, trigger: React.ReactNode }) => {
    const [title, setTitle] = React.useState(item.title);

    const handleSave = () => {
        onUpdate({ ...item, title });
    };

    return (
         <Popover>
            <PopoverTrigger asChild>{trigger}</PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Editar Item</h4>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="t-title">Título</Label>
                        <Input id="t-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <Button onClick={handleSave}>Salvar</Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

// --- Node Components ---
const BarrierNode = ({ barrier, onUpdate, onDelete, controls, readOnly, kpiStatuses }: { barrier: BowtieBarrierNode; onUpdate: (updatedBarrier: BowtieBarrierNode) => void; onDelete: () => void; controls: Control[]; readOnly?: boolean; kpiStatuses: Map<string, string> }) => {
    // Busca o controle associado para exibir informações completas
    const associatedControl = controls.find(c => c.id === barrier.controlId);
    const kpiStatus = associatedControl ? kpiStatuses.get(associatedControl.id) : undefined;
    const isCritico = associatedControl?.criticidade === 'Crítico';
    
    return (
        <div className="relative group/barrier">
            <div className="w-56 bg-white border border-gray-300 rounded-md shadow-sm flex flex-col text-xs">
                {/* Nome do Controle */}
                <div className="p-2 border-b font-semibold text-center flex items-center justify-center gap-2 bg-green-50">
                    <Shield size={14} className="text-green-600 flex-shrink-0" />
                    <span className='truncate' title={associatedControl?.nomeControle || barrier.title}>
                        {associatedControl?.nomeControle || barrier.title}
                    </span>
                </div>
                
                {/* Dono do Controle */}
                <div className="p-1.5 border-b text-center truncate bg-gray-50" title={associatedControl?.donoControle || barrier.responsible}>
                    <span className="font-medium text-gray-600">Dono: </span>
                    {associatedControl?.donoControle || barrier.responsible}
                </div>
                
                {/* Categoria */}
                <div className="p-1.5 border-b text-center truncate bg-blue-50" title={associatedControl?.categoria || 'Não definida'}>
                    <span className="font-medium text-blue-700">Cat: </span>
                    {associatedControl?.categoria || '-'}
                </div>
                
                {/* Criticidade */}
                <div className={`p-1.5 border-b text-center font-medium ${isCritico ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'}`}>
                    <span className="font-semibold">Crítico: </span>
                    {isCritico ? 'Sim' : 'Não'}
                </div>
                
                {/* Status KPI */}
                <div className={`p-1.5 border-b text-center font-medium ${
                    kpiStatus === 'OK' ? 'bg-green-100 text-green-800' : 
                    kpiStatus === 'NOK' ? 'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-700'
                }`}>
                    <span className="font-semibold">KPI: </span>
                    {kpiStatus || 'Sem KPI'}
                </div>
                
                {/* Status */}
                <div className={`p-1.5 rounded-b-md text-center truncate font-medium ${statusColors[barrier.status as keyof typeof statusColors] || 'bg-gray-200 text-gray-800'}`}>
                    {associatedControl?.status || barrier.status}
                </div>
            </div>
            {!readOnly && (<div className="absolute top-1 right-1 flex items-center opacity-0 group-hover/barrier:opacity-100 transition-opacity">
                <BarrierEditor barrier={barrier} onUpdate={onUpdate} controls={controls} readOnly={readOnly} trigger={
                     <Button variant="ghost" size="icon" className="h-6 w-6"><Edit className="h-3 w-3" /></Button>
                } />
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tem certeza que deseja excluir esta barreira? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>)}
        </div>
    );
};

const ThreatNode = ({ threat, onUpdate, onDelete, readOnly }: { threat: BowtieThreat; onUpdate: (updatedThreat: BowtieThreat) => void; onDelete: () => void; readOnly?: boolean; }) => (
    <div className="relative group/threat">
        <div className="w-48 h-24 bg-orange-400 text-white rounded-md shadow-md flex items-center justify-center p-2 text-center font-semibold">
            {threat.title}
        </div>
        {!readOnly && (<div className="absolute top-1 right-1 flex items-center opacity-0 group-hover/threat:opacity-100 transition-opacity">
            <ThreatConsequenceEditor item={threat} onUpdate={(item) => onUpdate({...threat, title: item.title})} trigger={
                 <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:text-white"><Edit className="h-3 w-3" /></Button>
            } />
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:text-white"><Trash2 className="h-3 w-3" /></Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Excluir Ameaça?</AlertDialogTitle></AlertDialogHeader>
                    <AlertDialogDescription>Tem certeza que deseja excluir a ameaça "{threat.title}" e todas as suas barreiras?</AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete}>Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>)}
    </div>
);

const ConsequenceNode = ({ consequence, onUpdate, onDelete, readOnly }: { consequence: BowtieConsequence; onUpdate: (updatedConsequence: BowtieConsequence) => void; onDelete: () => void; readOnly?: boolean; }) => (
     <div className="relative group/consequence">
        <div className="w-48 h-24 bg-red-500 text-white rounded-md shadow-md flex items-center justify-center p-2 text-center font-semibold">
            {consequence.title}
        </div>
         {!readOnly && (<div className="absolute top-1 right-1 flex items-center opacity-0 group-hover/consequence:opacity-100 transition-opacity">
             <ThreatConsequenceEditor item={consequence} onUpdate={(item) => onUpdate({...consequence, title: item.title})} trigger={
                 <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:text-white"><Edit className="h-3 w-3" /></Button>
            } />
            <AlertDialog>
                <AlertDialogTrigger asChild>
                     <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:text-white"><Trash2 className="h-3 w-3" /></Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Excluir Consequência?</AlertDialogTitle></AlertDialogHeader>
                    <AlertDialogDescription>Tem certeza que deseja excluir a consequência "{consequence.title}" e todas as suas barreiras?</AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete}>Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>)}
    </div>
);

const EventNode = ({ title, description, onUpdate }: { title: string, description: string, onUpdate: (updates: { title: string, description: string }) => void }) => (
    <Popover>
        <PopoverTrigger asChild>
            <div className="w-64 bg-yellow-100 border-2 border-yellow-400 rounded-md shadow-lg flex flex-col text-center">
                <div className="px-3 py-2">
                    <h3 className="font-bold text-lg">{title}</h3>
                    <p className="text-xs text-gray-600">{description}</p>
                </div>
            </div>
        </PopoverTrigger>
        <PopoverContent className="w-80">
             <div className="grid gap-4">
                <div className="space-y-2"><h4 className="font-medium leading-none">Editar Evento de Topo</h4></div>
                <div className="grid gap-2">
                    <Label htmlFor="te-title">Título</Label>
                    <Input id="te-title" value={title} onChange={(e) => onUpdate({ title: e.target.value, description })} />
                    <Label htmlFor="te-desc">Descrição</Label>
                    <Textarea id="te-desc" value={description} onChange={(e) => onUpdate({ title, description: e.target.value })} />
                </div>
                <Button onClick={() => onUpdate({ title, description })}>Salvar</Button>
            </div>
        </PopoverContent>
    </Popover>
);

const TopEventNode = ({ title, description, onUpdate, readOnly }: { title: string, description: string, onUpdate: (updates: { title: string, description: string }) => void, readOnly?: boolean }) => (
    <div className="relative group/topevent">
        <div className="w-64 bg-yellow-100 border-2 border-yellow-400 rounded-md shadow-lg flex flex-col text-center">
            <div className="px-3 py-2">
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="text-xs text-gray-600">{description}</p>
            </div>
        </div>
        {!readOnly && (<div className="absolute top-1 right-1 opacity-0 group-hover/topevent:opacity-100 transition-opacity">
            <EventNode title={title} description={description} onUpdate={onUpdate} />
        </div>)}
    </div>
);

const StatusBadge = ({ status, className }: { status: BowtieBarrierNode['status'], className?: string }) => (
    <div className={cn("px-2 py-1 text-xs rounded-full font-semibold", className, statusColors[status])}>
        {status}
    </div>
);

const AddNodeButton = ({ onClick, children, className }: { onClick: () => void; children: React.ReactNode; className?: string }) => (
    <Button variant="outline" className={cn("h-24 w-48 border-dashed", className)} onClick={onClick}>
        <div className="flex flex-col items-center gap-2">
            <PlusCircle className="h-6 w-6 text-muted-foreground" />
            <span className="text-xs">{children}</span>
        </div>
    </Button>
);

const Line = ({ className }: { className?: string }) => (
    <div className={cn("flex-1 h-px bg-gray-300", className)} />
);

const DiagramHeader = ({ title, color, className }: { title: string; color: string; className?: string }) => (
    <div className={cn(`px-3 py-1 text-center font-semibold text-sm text-white rounded ${color}`, className)}>
        {title}
    </div>
);

export const BowtieDiagram = ({ data, onUpdate, onDelete, readOnly = false }: { data: BowtieData, onUpdate: (data: BowtieData) => void, onDelete: (id: string) => void, readOnly?: boolean }) => {
    const [localData, setLocalData] = React.useState<BowtieData>(() => JSON.parse(JSON.stringify(data)));
    const [hasChanges, setHasChanges] = React.useState(false);
    const [controls, setControls] = React.useState<Control[]>([]);
    const [kpiStatuses, setKpiStatuses] = React.useState<Map<string, string>>(new Map());
    const [isExporting, setIsExporting] = React.useState(false);
    const diagramRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        setLocalData(JSON.parse(JSON.stringify(data)));
    }, [data]);

    React.useEffect(() => {
        setHasChanges(JSON.stringify(localData) !== JSON.stringify(data));
    }, [localData, data]);

    React.useEffect(() => {
        const fetchControls = async () => {
            try {
                const res = await fetch('/api/controls', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                if (!res.ok) {
                    console.warn(`Falha ao buscar controles: ${res.status} ${res.statusText}`);
                    setControls([]); // Define array vazio em caso de erro
                    return;
                }
                
                const fetchedControls = await res.json();
                setControls(Array.isArray(fetchedControls) ? fetchedControls : []);
            } catch (error) {
                console.error("Erro ao carregar controles:", error);
                setControls([]); // Define array vazio em caso de erro
            }
        };
        fetchControls();
    }, []);

    React.useEffect(() => {
        const fetchKpiStatuses = async () => {
            try {
                const res = await fetch('/api/kpis', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                if (!res.ok) {
                    console.warn(`Falha ao buscar KPIs: ${res.status} ${res.statusText}`);
                    return;
                }
                
                const kpis = await res.json();
                
                // Agrupa KPIs por controle e calcula status agregado
                const statusMap = new Map<string, string>();
                
                // Agrupa por controlId
                const kpisByControl = new Map<string, any[]>();
                kpis.forEach((kpi: any) => {
                    if (!kpisByControl.has(kpi.controlId)) {
                        kpisByControl.set(kpi.controlId, []);
                    }
                    kpisByControl.get(kpi.controlId)?.push(kpi);
                });
                
                // Calcula status agregado para cada controle
                kpisByControl.forEach((controlKpis, controlId) => {
                    if (controlKpis.length === 0) {
                        statusMap.set(controlId, 'Sem KPI');
                    } else {
                        const hasNok = controlKpis.some(kpi => kpi.status === 'NOK');
                        statusMap.set(controlId, hasNok ? 'NOK' : 'OK');
                    }
                });
                
                setKpiStatuses(statusMap);
            } catch (error) {
                console.error("Erro ao carregar KPIs:", error);
            }
        };
        fetchKpiStatuses();
    }, []);

    const handleSave = () => {
        onUpdate(localData);
    };

    const handleDiscard = () => {
        setLocalData(JSON.parse(JSON.stringify(data)));
    };

    const handleExportPDF = async () => {
        if (!diagramRef.current) {
            console.error('Referência do diagrama não encontrada');
            alert('Erro: Diagrama não encontrado. Recarregue a página.');
            return;
        }
        
        setIsExporting(true);
        try {
            console.log('Iniciando exportação PDF...');
            
            // Importa dinamicamente para evitar problemas de SSR
            console.log('Importando bibliotecas...');
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = await import('jspdf');
            console.log('Bibliotecas importadas com sucesso');
            
            // Aguarda um pouco para garantir que os botões foram ocultados via CSS
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Captura o elemento do diagrama
            console.log('Capturando diagrama...');
            const canvas = await html2canvas(diagramRef.current, {
                scale: 2, // Qualidade maior
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff', // Fundo branco para PDF
                allowTaint: true,
                imageTimeout: 15000,
                width: diagramRef.current.scrollWidth,
                height: diagramRef.current.scrollHeight,
            });
            console.log('Diagrama capturado:', canvas.width, 'x', canvas.height);
            
            // Cria PDF em paisagem (landscape) A4
            console.log('Criando PDF...');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4',
            });
            
            // Dimensões da página A4 landscape
            const pdfWidth = 297; // mm
            const pdfHeight = 210; // mm
            
            // Calcula dimensões mantendo aspect ratio e cabendo na página
            const canvasAspectRatio = canvas.width / canvas.height;
            const pdfAspectRatio = pdfWidth / pdfHeight;
            
            let finalWidth: number;
            let finalHeight: number;
            let xOffset = 0;
            let yOffset = 0;
            
            if (canvasAspectRatio > pdfAspectRatio) {
                // Imagem mais larga - limita pela largura
                finalWidth = pdfWidth - 20; // Margem de 10mm de cada lado
                finalHeight = finalWidth / canvasAspectRatio;
                xOffset = 10;
                yOffset = (pdfHeight - finalHeight) / 2;
            } else {
                // Imagem mais alta - limita pela altura
                finalHeight = pdfHeight - 20; // Margem de 10mm em cima e embaixo
                finalWidth = finalHeight * canvasAspectRatio;
                yOffset = 10;
                xOffset = (pdfWidth - finalWidth) / 2;
            }
            
            const imgData = canvas.toDataURL('image/png');
            console.log('Imagem convertida para base64');
            
            console.log('Adicionando imagem ao PDF...');
            pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
            
            // Adiciona metadados
            const fileName = `Bowtie_${localData.riskId}_${new Date().toISOString().split('T')[0]}.pdf`;
            console.log('Salvando PDF:', fileName);
            pdf.save(fileName);
            console.log('PDF exportado com sucesso!');
            
        } catch (error) {
            console.error('Erro detalhado ao exportar PDF:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            alert(`Erro ao gerar PDF: ${errorMessage}\n\nVerifique o console para mais detalhes.`);
        } finally {
            setIsExporting(false);
        }
    };

    const handleUpdate = (updates: Partial<BowtieData>) => {
        setLocalData(prevData => ({ ...prevData, ...updates } as BowtieData));
    };

    const addThreat = () => {
        const newThreat: BowtieThreat = {
            id: `threat-${uuidv4()}`,
            title: 'Nova Ameaça',
            barriers: []
        };
        setLocalData(prevData => ({ ...prevData, threats: [...prevData.threats, newThreat] }));
    };

    const addConsequence = () => {
        const newConsequence: BowtieConsequence = {
            id: `consequence-${uuidv4()}`,
            title: 'Nova Consequência',
            barriers: []
        };
        setLocalData(prevData => ({ ...prevData, consequences: [...prevData.consequences, newConsequence] }));
    };
    
    const addBarrier = (side: 'threat' | 'consequence', ownerId: string) => {
        const newBarrier: BowtieBarrierNode = {
            id: `barrier-${uuidv4()}`,
            controlId: '',
            title: 'Nova Barreira',
            responsible: 'Não definido',
            effectiveness: 'Ineficaz',
            status: 'Pendente'
        };

        if (side === 'threat') {
            const updatedThreats = localData.threats.map(t => {
                if (t.id === ownerId) {
                    return { ...t, barriers: [...t.barriers, newBarrier] };
                }
                return t;
            });
            setLocalData(prevData => ({ ...prevData, threats: updatedThreats }));
        } else {
            const updatedConsequences = localData.consequences.map(c => {
                if (c.id === ownerId) {
                    return { ...c, barriers: [...c.barriers, newBarrier] };
                }
                return c;
            });
            setLocalData(prevData => ({ ...prevData, consequences: updatedConsequences }));
        }
    };
    
    const updateThreat = (updatedThreat: BowtieThreat) => {
        const updatedThreats = localData.threats.map(t => t.id === updatedThreat.id ? updatedThreat : t);
        setLocalData(prevData => ({ ...prevData, threats: updatedThreats }));
    };
    
    const updateConsequence = (updatedConsequence: BowtieConsequence) => {
        const updatedConsequences = localData.consequences.map(c => c.id === updatedConsequence.id ? updatedConsequence : c);
        setLocalData(prevData => ({ ...prevData, consequences: updatedConsequences }));
    };

    const updateBarrier = (ownerId: string, updatedBarrier: BowtieBarrierNode, side: 'threat' | 'consequence') => {
        if(side === 'threat') {
            const updatedThreats = localData.threats.map(t => {
                if (t.id === ownerId) {
                    return {...t, barriers: t.barriers.map(b => b.id === updatedBarrier.id ? updatedBarrier : b)}
                }
                return t;
            });
            setLocalData(prevData => ({ ...prevData, threats: updatedThreats }));
        } else {
            const updatedConsequences = localData.consequences.map(c => {
                if(c.id === ownerId) {
                    return {...c, barriers: c.barriers.map(b => b.id === updatedBarrier.id ? updatedBarrier : b)}
                }
                return c;
            });
            setLocalData(prevData => ({ ...prevData, consequences: updatedConsequences }));
        }
    };
    
    const deleteThreat = (threatId: string) => {
        setLocalData(prevData => ({ ...prevData, threats: prevData.threats.filter(t => t.id !== threatId) }));
    };

    const deleteConsequence = (consequenceId: string) => {
        setLocalData(prevData => ({ ...prevData, consequences: prevData.consequences.filter(c => c.id !== consequenceId) }));
    };

    const deleteBarrier = (ownerId: string, barrierId: string, side: 'threat' | 'consequence') => {
        if(side === 'threat') {
            const updatedThreats = localData.threats.map(t => {
                if (t.id === ownerId) {
                    return {...t, barriers: t.barriers.filter(b => b.id !== barrierId)}
                }
                return t;
            });
            setLocalData(prevData => ({ ...prevData, threats: updatedThreats }));
        } else {
            const updatedConsequences = localData.consequences.map(c => {
                if(c.id === ownerId) {
                    return {...c, barriers: c.barriers.filter(b => b.id !== barrierId)}
                }
                return c;
            });
            setLocalData(prevData => ({ ...prevData, consequences: updatedConsequences }));
        }
    };


    const maxPreventiveBarriers = localData.threats.length > 0 ? Math.max(1, ...localData.threats.map(t => t.barriers.length)) : 1;
    const maxMitigatoryBarriers = localData.consequences.length > 0 ? Math.max(1, ...localData.consequences.map(c => c.barriers.length)) : 1;


    return (
        <div className="w-full overflow-x-auto">
            <div ref={diagramRef} className={cn("bg-gray-50 p-8 rounded-lg min-w-max", isExporting && "scale-75 origin-top-left")}>
                <style>
                    {isExporting ? `
                        .export-hidden {
                            display: none !important;
                        }
                    ` : ''}
                </style>
                <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Diagrama Bowtie</h2>
                    <p className="text-muted-foreground">Risco Associado: {localData.riskId}</p>
                </div>
                <div className={cn('flex items-center gap-2 export-hidden', readOnly && 'hidden')}>
                    <Button onClick={handleExportPDF} disabled={isExporting} variant="secondary">
                        {isExporting ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span>
                                Gerando PDF...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Exportar PDF
                            </>
                        )}
                    </Button>
                    <Button onClick={handleSave} disabled={!hasChanges}>
                        Salvar Alterações
                    </Button>
                    <Button variant="outline" onClick={handleDiscard} disabled={!hasChanges}>
                        Descartar
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <PermissionButton 
                              module="bowtie" 
                              action="delete" 
                              variant="outline" 
                              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Excluir Diagrama
                            </PermissionButton>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Tem certeza que deseja excluir este diagrama Bowtie? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(localData.id)} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

                <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-x-4">
                {/* Preventive Side */}
                <div className="flex flex-col gap-4">
                    <DiagramHeader title="Ameaças (Causas)" color="bg-orange-500" />
                    <div className="flex flex-col items-stretch gap-4">
                        {localData.threats.map(threat => (
                            <div key={threat.id} className="flex items-center gap-4">
                                <ThreatNode threat={threat} onUpdate={updateThreat} onDelete={() => deleteThreat(threat.id)} readOnly={readOnly} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-4 p-2">
                                        {threat.barriers.map(barrier => (
                                            <React.Fragment key={barrier.id}>
                                                <Line />
                                                <BarrierNode 
                                                    barrier={barrier} 
                                                    onUpdate={(b) => updateBarrier(threat.id, b, 'threat')} 
                                                    onDelete={() => deleteBarrier(threat.id, barrier.id, 'threat')}
                                                    controls={controls}
                                                    readOnly={readOnly}
                                                    kpiStatuses={kpiStatuses}
                                                />
                                            </React.Fragment>
                                        ))}
                                        <Line />
                                        {!readOnly && (<AddNodeButton onClick={() => addBarrier('threat', threat.id)} className="export-hidden">
                                            Barreira
                                        </AddNodeButton>)}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {!readOnly && (<div className="flex justify-start export-hidden">
                            <AddNodeButton onClick={addThreat}>
                                Ameaça
                            </AddNodeButton>
                        </div>)}
                    </div>
                </div>

                {/* Center (Top Event) */}
                <div className="flex flex-col items-center justify-center pt-16">
                     <TopEventNode title={localData.topEvent.title} description={localData.topEvent.description} onUpdate={(te) => handleUpdate({ topEvent: te })} readOnly={readOnly} />
                </div>

                {/* Mitigatory Side */}
                <div className="flex flex-col gap-4">
                    <DiagramHeader title="Consequências (Impactos)" color="bg-red-500" />
                    <div className="flex flex-col items-stretch gap-4">
                        {localData.consequences.map(consequence => (
                            <div key={consequence.id} className="flex items-center gap-4 justify-end">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-4 p-2">
                                        {!readOnly && (<AddNodeButton onClick={() => addBarrier('consequence', consequence.id)} className="export-hidden">
                                            Barreira
                                        </AddNodeButton>)}
                                        {consequence.barriers.slice().reverse().map(barrier => (
                                            <React.Fragment key={barrier.id}>
                                                <Line />
                                                <BarrierNode 
                                                    barrier={barrier} 
                                                    onUpdate={(b) => updateBarrier(consequence.id, b, 'consequence')} 
                                                    onDelete={() => deleteBarrier(consequence.id, barrier.id, 'consequence')}
                                                    controls={controls}
                                                    readOnly={readOnly}
                                                    kpiStatuses={kpiStatuses}
                                                />
                                            </React.Fragment>
                                        ))}
                                        <Line />
                                    </div>
                                </div>
                                <ConsequenceNode consequence={consequence} onUpdate={updateConsequence} onDelete={() => deleteConsequence(consequence.id)} readOnly={readOnly} />
                            </div>
                        ))}
                        {!readOnly && (<div className="flex justify-end export-hidden">
                            <AddNodeButton onClick={addConsequence}>
                                Consequência
                            </AddNodeButton>
                        </div>)}
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
};
