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
// import { controlsData } from '@/lib/mock-data';


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
const BarrierEditor = ({ barrier, onUpdate, trigger, controls }: { barrier: BowtieBarrierNode, onUpdate: (updatedBarrier: BowtieBarrierNode) => void, trigger: React.ReactNode, controls: Control[] }) => {
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
const BarrierNode = ({ barrier, onUpdate, onDelete, controls }: { barrier: BowtieBarrierNode; onUpdate: (updatedBarrier: BowtieBarrierNode) => void; onDelete: () => void; controls: Control[] }) => (
    <div className="relative group/barrier">
        <div className="w-48 bg-white border border-gray-300 rounded-md shadow-sm flex flex-col text-sm">
            <div className="p-2 border-b font-semibold text-center flex items-center justify-center gap-2">
                <Shield size={14} className="text-green-600" />
                <span className='truncate'>{barrier.title}</span>
            </div>
            <div className={`p-1.5 border-b text-center truncate ${effectivenessColors[barrier.effectiveness]}`}>
                {barrier.responsible}
            </div>
            <div className={`p-1.5 border-b text-center truncate ${effectivenessColors[barrier.effectiveness]}`}>
                {barrier.effectiveness}
            </div>
            <div className={`p-1.5 rounded-b-md text-center truncate ${statusColors[barrier.status] || 'bg-gray-200 text-gray-800'}`}>
                {barrier.status}
            </div>
        </div>
        <div className="absolute top-1 right-1 flex items-center opacity-0 group-hover/barrier:opacity-100 transition-opacity">
            <BarrierEditor barrier={barrier} onUpdate={onUpdate} controls={controls} trigger={
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
        </div>
    </div>
);

const ThreatNode = ({ threat, onUpdate, onDelete }: { threat: BowtieThreat; onUpdate: (updatedThreat: BowtieThreat) => void; onDelete: () => void; }) => (
    <div className="relative group/threat">
        <div className="w-48 h-24 bg-orange-400 text-white rounded-md shadow-md flex items-center justify-center p-2 text-center font-semibold">
            {threat.title}
        </div>
        <div className="absolute top-1 right-1 flex items-center opacity-0 group-hover/threat:opacity-100 transition-opacity">
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
        </div>
    </div>
);

const ConsequenceNode = ({ consequence, onUpdate, onDelete }: { consequence: BowtieConsequence; onUpdate: (updatedConsequence: BowtieConsequence) => void; onDelete: () => void; }) => (
     <div className="relative group/consequence">
        <div className="w-48 h-24 bg-red-500 text-white rounded-md shadow-md flex items-center justify-center p-2 text-center font-semibold">
            {consequence.title}
        </div>
         <div className="absolute top-1 right-1 flex items-center opacity-0 group-hover/consequence:opacity-100 transition-opacity">
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
        </div>
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

const TopEventNode = ({ title, description, onUpdate }: { title: string, description: string, onUpdate: (updates: { title: string, description: string }) => void }) => (
    <div className="relative group/topevent">
        <div className="w-64 bg-yellow-100 border-2 border-yellow-400 rounded-md shadow-lg flex flex-col text-center">
            <div className="px-3 py-2">
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="text-xs text-gray-600">{description}</p>
            </div>
        </div>
        <div className="absolute top-1 right-1 opacity-0 group-hover/topevent:opacity-100 transition-opacity">
            <EventNode title={title} description={description} onUpdate={onUpdate} />
        </div>
    </div>
);

const StatusBadge = ({ status, className }: { status: BowtieBarrierNode['status'], className?: string }) => (
    <div className={cn("px-2 py-1 text-xs rounded-full font-semibold", className, statusColors[status])}>
        {status}
    </div>
);

const AddNodeButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
    <Button variant="outline" className="h-24 w-48 border-dashed" onClick={onClick}>
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

export const BowtieDiagram = ({ data, onUpdate, onDelete }: { data: BowtieData, onUpdate: (data: BowtieData) => void, onDelete: (id: string) => void }) => {
    const [localData, setLocalData] = React.useState<BowtieData>(() => JSON.parse(JSON.stringify(data)));
    const [hasChanges, setHasChanges] = React.useState(false);
    const [controls, setControls] = React.useState<Control[]>([]);

    React.useEffect(() => {
        setLocalData(JSON.parse(JSON.stringify(data)));
    }, [data]);

    React.useEffect(() => {
        setHasChanges(JSON.stringify(localData) !== JSON.stringify(data));
    }, [localData, data]);

    React.useEffect(() => {
        const fetchControls = async () => {
            try {
                const res = await fetch('/api/controls');
                if (!res.ok) throw new Error('Falha ao buscar controles');
                const fetchedControls = await res.json();
                setControls(fetchedControls);
            } catch (error) {
                console.error("Erro ao carregar controles:", error);
            }
        };
        fetchControls();
    }, []);

    const handleSave = () => {
        onUpdate(localData);
    };

    const handleDiscard = () => {
        setLocalData(JSON.parse(JSON.stringify(data)));
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
            <div className="bg-gray-50 p-8 rounded-lg min-w-max">
                <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Diagrama Bowtie</h2>
                    <p className="text-muted-foreground">Risco Associado: {localData.riskId}</p>
                </div>
                <div className='flex items-center gap-2'>
                    <Button onClick={handleSave} disabled={!hasChanges}>
                        Salvar Alterações
                    </Button>
                    <Button variant="outline" onClick={handleDiscard} disabled={!hasChanges}>
                        Descartar
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                                <Trash2 className="mr-2 h-4 w-4" /> Excluir Diagrama
                            </Button>
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
                                <ThreatNode threat={threat} onUpdate={updateThreat} onDelete={() => deleteThreat(threat.id)} />
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
                                                />
                                            </React.Fragment>
                                        ))}
                                        <Line />
                                        <AddNodeButton onClick={() => addBarrier('threat', threat.id)}>
                                            Barreira
                                        </AddNodeButton>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-start">
                            <AddNodeButton onClick={addThreat}>
                                Ameaça
                            </AddNodeButton>
                        </div>
                    </div>
                </div>

                {/* Center (Top Event) */}
                <div className="flex flex-col items-center justify-center pt-16">
                     <TopEventNode title={localData.topEvent.title} description={localData.topEvent.description} onUpdate={(te) => handleUpdate({ topEvent: te })} />
                </div>

                {/* Mitigatory Side */}
                <div className="flex flex-col gap-4">
                    <DiagramHeader title="Consequências (Impactos)" color="bg-red-500" />
                    <div className="flex flex-col items-stretch gap-4">
                        {localData.consequences.map(consequence => (
                            <div key={consequence.id} className="flex items-center gap-4 justify-end">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-4 p-2">
                                        <AddNodeButton onClick={() => addBarrier('consequence', consequence.id)}>
                                            Barreira
                                        </AddNodeButton>
                                        {consequence.barriers.slice().reverse().map(barrier => (
                                            <React.Fragment key={barrier.id}>
                                                <Line />
                                                <BarrierNode 
                                                    barrier={barrier} 
                                                    onUpdate={(b) => updateBarrier(consequence.id, b, 'consequence')} 
                                                    onDelete={() => deleteBarrier(consequence.id, barrier.id, 'consequence')}
                                                    controls={controls}
                                                />
                                            </React.Fragment>
                                        ))}
                                        <Line />
                                    </div>
                                </div>
                                <ConsequenceNode consequence={consequence} onUpdate={updateConsequence} onDelete={() => deleteConsequence(consequence.id)} />
                            </div>
                        ))}
                        <div className="flex justify-end">
                            <AddNodeButton onClick={addConsequence}>
                                Consequência
                            </AddNodeButton>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
};
