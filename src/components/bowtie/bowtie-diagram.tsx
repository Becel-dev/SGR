
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { BowtieData, BowtieBarrierNode, BowtieThreat, BowtieConsequence, BowtieTopEvent } from "@/lib/types";
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


const statusColors: Record<BowtieBarrierNode['status'], string> = {
  'Implementado': 'bg-green-200 text-green-800',
  'Pendente': 'bg-yellow-200 text-yellow-800',
  'Não Implementado': 'bg-red-200 text-red-800',
};

const effectivenessColors: Record<BowtieBarrierNode['effectiveness'], string> = {
    'Eficaz': 'bg-gray-200 text-gray-800',
    'Pouco Eficaz': 'bg-gray-400 text-white',
    'Ineficaz': 'bg-gray-600 text-white',
};

// --- Editor Popovers ---
const BarrierEditor = ({ barrier, onUpdate, trigger }: { barrier: BowtieBarrierNode, onUpdate: (updatedBarrier: BowtieBarrierNode) => void, trigger: React.ReactNode }) => {
    const [title, setTitle] = React.useState(barrier.title);
    const [responsible, setResponsible] = React.useState(barrier.responsible);
    const [effectiveness, setEffectiveness] = React.useState(barrier.effectiveness);
    const [status, setStatus] = React.useState(barrier.status);

    const handleSave = () => {
        onUpdate({ ...barrier, title, responsible, effectiveness, status });
    };

    return (
         <Popover>
            <PopoverTrigger asChild>{trigger}</PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Editar Barreira</h4>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="b-title">Título</Label>
                        <Input id="b-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                        <Label htmlFor="b-resp">Responsável</Label>
                        <Input id="b-resp" value={responsible} onChange={(e) => setResponsible(e.target.value)} />
                        <Label htmlFor="b-eff">Eficácia</Label>
                        <Select value={effectiveness} onValueChange={(v: BowtieBarrierNode['effectiveness']) => setEffectiveness(v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Eficaz">Eficaz</SelectItem>
                                <SelectItem value="Pouco Eficaz">Pouco Eficaz</SelectItem>
                                <SelectItem value="Ineficaz">Ineficaz</SelectItem>
                            </SelectContent>
                        </Select>
                        <Label htmlFor="b-status">Status</Label>
                        <Select value={status} onValueChange={(v: BowtieBarrierNode['status']) => setStatus(v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Implementado">Implementado</SelectItem>
                                <SelectItem value="Pendente">Pendente</SelectItem>
                                <SelectItem value="Não Implementado">Não Implementado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleSave}>Salvar</Button>
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
const BarrierNode = ({ barrier, onUpdate, onDelete }: { barrier: BowtieBarrierNode; onUpdate: (updatedBarrier: BowtieBarrierNode) => void; onDelete: () => void; }) => (
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
            <div className={`p-1.5 rounded-b-md text-center truncate ${statusColors[barrier.status]}`}>
                {barrier.status}
            </div>
        </div>
        <div className="absolute top-1 right-1 flex items-center opacity-0 group-hover/barrier:opacity-100 transition-opacity">
            <BarrierEditor barrier={barrier} onUpdate={onUpdate} trigger={
                 <Button variant="ghost" size="icon" className="h-6 w-6"><Edit className="h-3 w-3" /></Button>
            } />
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Excluir Barreira?</AlertDialogTitle></AlertDialogHeader>
                    <AlertDialogDescription>Tem certeza que deseja excluir a barreira "{barrier.title}"?</AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete}>Excluir</AlertDialogAction>
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

const TopEventNode = ({ topEvent, onUpdate }: { topEvent: BowtieTopEvent; onUpdate: (updatedEvent: BowtieTopEvent) => void; }) => {
     const [title, setTitle] = React.useState(topEvent.title);
     const [description, setDescription] = React.useState(topEvent.description);

     const handleSave = () => onUpdate({ title, description });

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="w-56 h-32 bg-green-100 border-2 border-green-600 rounded-lg shadow-xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-green-400">
                    <div className="w-full bg-green-600 p-1 text-white font-bold text-sm flex items-center justify-center gap-1 rounded-t-md">
                        <AlertTriangle size={16} />
                        Evento de Topo
                    </div>
                    <div className="p-2 flex-grow flex flex-col justify-center">
                        <p className="font-bold text-base text-green-800">{topEvent.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{topEvent.description}</p>
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                 <div className="grid gap-4">
                    <div className="space-y-2"><h4 className="font-medium leading-none">Editar Evento de Topo</h4></div>
                    <div className="grid gap-2">
                        <Label htmlFor="te-title">Título</Label>
                        <Input id="te-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                        <Label htmlFor="te-desc">Descrição</Label>
                        <Textarea id="te-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <Button onClick={handleSave}>Salvar</Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};


const AddNodeButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
    <Button variant="outline" className="h-24 w-48 border-dashed" onClick={onClick}>
        <div className="flex flex-col items-center gap-2">
            <PlusCircle className="h-6 w-6 text-muted-foreground" />
            <span className="text-xs">{children}</span>
        </div>
    </Button>
);

const Line = ({ position }: { position: 'start' | 'middle' | 'end' }) => (
    <div className="flex-1 flex items-center">
        <div className={cn("w-1/2 h-px", position === 'start' ? 'bg-transparent' : 'bg-gray-300')}></div>
        <div className="w-px h-full bg-gray-300"></div>
        <div className={cn("w-1/2 h-px", position === 'end' ? 'bg-transparent' : 'bg-gray-300')}></div>
    </div>
);


export const BowtieDiagram = ({ data, onUpdate, onDelete }: { data: BowtieData, onUpdate: (data: BowtieData) => void, onDelete: (id: string) => void }) => {

    const handleUpdate = (updates: Partial<BowtieData>) => {
        onUpdate({ ...data, ...updates });
    };

    const addThreat = () => {
        const newThreat: BowtieThreat = { id: `T${Date.now()}`, title: 'Nova Ameaça', barriers: [] };
        handleUpdate({ threats: [...data.threats, newThreat] });
    };

    const addConsequence = () => {
        const newConsequence: BowtieConsequence = { id: `C${Date.now()}`, title: 'Nova Consequência', barriers: [] };
        handleUpdate({ consequences: [...data.consequences, newConsequence] });
    };
    
    const addBarrier = (side: 'threat' | 'consequence', ownerId: string) => {
        const newBarrier: BowtieBarrierNode = { id: `B${Date.now()}`, title: 'Nova Barreira', responsible: 'Indefinido', effectiveness: 'Eficaz', status: 'Pendente' };
        if (side === 'threat') {
            const updatedThreats = data.threats.map(t => t.id === ownerId ? { ...t, barriers: [...t.barriers, newBarrier] } : t);
            handleUpdate({ threats: updatedThreats });
        } else {
            const updatedConsequences = data.consequences.map(c => c.id === ownerId ? { ...c, barriers: [...c.barriers, newBarrier] } : c);
            handleUpdate({ consequences: updatedConsequences });
        }
    };
    
    const updateThreat = (updatedThreat: BowtieThreat) => {
        const updatedThreats = data.threats.map(t => t.id === updatedThreat.id ? updatedThreat : t);
        handleUpdate({ threats: updatedThreats });
    };
    
    const updateConsequence = (updatedConsequence: BowtieConsequence) => {
        const updatedConsequences = data.consequences.map(c => c.id === updatedConsequence.id ? updatedConsequence : c);
        handleUpdate({ consequences: updatedConsequences });
    };

    const updateBarrier = (ownerId: string, updatedBarrier: BowtieBarrierNode, side: 'threat' | 'consequence') => {
        if(side === 'threat') {
            const updatedThreats = data.threats.map(t => {
                if (t.id === ownerId) {
                    return {...t, barriers: t.barriers.map(b => b.id === updatedBarrier.id ? updatedBarrier : b)}
                }
                return t;
            });
            handleUpdate({ threats: updatedThreats });
        } else {
            const updatedConsequences = data.consequences.map(c => {
                if(c.id === ownerId) {
                    return {...c, barriers: c.barriers.map(b => b.id === updatedBarrier.id ? updatedBarrier : b)}
                }
                return c;
            });
            handleUpdate({ consequences: updatedConsequences });
        }
    };
    
    const deleteThreat = (threatId: string) => {
        handleUpdate({ threats: data.threats.filter(t => t.id !== threatId) });
    };

    const deleteConsequence = (consequenceId: string) => {
        handleUpdate({ consequences: data.consequences.filter(c => c.id !== consequenceId) });
    };

    const deleteBarrier = (ownerId: string, barrierId: string, side: 'threat' | 'consequence') => {
        if(side === 'threat') {
            const updatedThreats = data.threats.map(t => {
                if (t.id === ownerId) {
                    return {...t, barriers: t.barriers.filter(b => b.id !== barrierId)}
                }
                return t;
            });
            handleUpdate({ threats: updatedThreats });
        } else {
            const updatedConsequences = data.consequences.map(c => {
                if(c.id === ownerId) {
                    return {...c, barriers: c.barriers.filter(b => b.id !== barrierId)}
                }
                return c;
            });
            handleUpdate({ consequences: updatedConsequences });
        }
    };


    const maxPreventiveBarriers = Math.max(1, ...data.threats.map(t => t.barriers.length));
    const maxMitigatoryBarriers = Math.max(1, ...data.consequences.map(c => c.barriers.length));
    
    const DiagramHeader = ({ title, color, columns, side }: { title: string; color: string; columns?: number; side: 'left' | 'right' }) => (
        <div className={`flex items-center ${side === 'right' ? 'flex-row-reverse' : ''}`}>
             <div className={`w-48 px-3 py-1 text-center font-semibold text-sm text-white rounded ${color}`}>
                {title}
            </div>
            {Array.from({ length: columns || 0 }).map((_, i) => (
                <React.Fragment key={i}>
                    <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                    <div className={`w-48 px-3 py-1 text-center font-semibold text-sm text-gray-600 bg-gray-200 rounded`}>
                       {side === 'left' ? 'Barreira Preventiva' : 'Barreira Mitigatória'}
                    </div>
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <Card className="overflow-x-auto p-4">
            <CardHeader className='pb-2'>
                <div className='flex justify-between items-center'>
                    <CardTitle className="flex items-center gap-2"><GitFork /> Visualização Bowtie</CardTitle>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive-outline"><Trash2 className="mr-2 h-4 w-4" /> Excluir Diagrama</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Excluir Diagrama Bowtie?</AlertDialogTitle></AlertDialogHeader>
                            <AlertDialogDescription>Esta ação excluirá permanentemente o diagrama Bowtie para o risco "{data.topEvent.title}".</AlertDialogDescription>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(data.id)} className="bg-destructive hover:bg-destructive/90">Sim, excluir</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <div className="flex justify-center mb-4">
                    <div className="w-56 text-center">
                        <div className="px-3 py-1 font-semibold text-sm text-white rounded bg-green-600">Evento de Topo</div>
                    </div>
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-x-4">
                    {/* Left Side Header */}
                    <DiagramHeader title="Ameaça" color="bg-orange-400" columns={maxPreventiveBarriers} side="left" />
                    
                    {/* Spacer */}
                    <div></div> 
                    
                    {/* Right Side Header */}
                    <DiagramHeader title="Consequência" color="bg-red-500" columns={maxMitigatoryBarriers} side="right" />
                </div>
                
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-4 min-w-[1800px] mt-4">
                    {/* Left side threats and barriers */}
                    <div className="flex flex-col gap-4">
                        {data.threats.map((threat) => (
                            <div key={threat.id} className="flex items-center">
                                <ThreatNode threat={threat} onUpdate={updateThreat} onDelete={() => deleteThreat(threat.id)} />
                                <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                                {threat.barriers.map(barrier => (
                                    <React.Fragment key={barrier.id}>
                                        <BarrierNode barrier={barrier} onUpdate={(b) => updateBarrier(threat.id, b, 'threat')} onDelete={() => deleteBarrier(threat.id, barrier.id, 'threat')} />
                                        <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                                    </React.Fragment>
                                ))}
                                {/* Fill empty barrier slots */}
                                {Array.from({ length: maxPreventiveBarriers - threat.barriers.length }).map((_, i) => (
                                   <React.Fragment key={i}>
                                        <div className="w-48 h-24" /> {/* Placeholder */}
                                        <div className="flex-1 h-px bg-transparent mx-4"></div>
                                   </React.Fragment>
                                ))}
                                <Button size="icon" variant="ghost" onClick={() => addBarrier('threat', threat.id)}><PlusCircle className="h-5 w-5"/></Button>
                            </div>
                        ))}
                         <div className='flex items-center'>
                            <AddNodeButton onClick={addThreat}>Adicionar Ameaça</AddNodeButton>
                        </div>
                    </div>

                    {/* Center Top Event */}
                    <div className="flex flex-col items-center justify-center self-stretch">
                         <Line position='start' />
                         <TopEventNode topEvent={data.topEvent} onUpdate={(te) => handleUpdate({ topEvent: te })} />
                         <Line position='end' />
                    </div>

                    {/* Right side consequences and barriers */}
                    <div className="flex flex-col gap-4">
                       {data.consequences.map((consequence) => (
                            <div key={consequence.id} className="flex items-center flex-row-reverse">
                                <ConsequenceNode consequence={consequence} onUpdate={updateConsequence} onDelete={() => deleteConsequence(consequence.id)} />
                                <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                                {consequence.barriers.map(barrier => (
                                    <React.Fragment key={barrier.id}>
                                        <BarrierNode barrier={barrier} onUpdate={(b) => updateBarrier(consequence.id, b, 'consequence')} onDelete={() => deleteBarrier(consequence.id, barrier.id, 'consequence')} />
                                        <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                                    </React.Fragment>
                                ))}
                                {/* Fill empty barrier slots */}
                                {Array.from({ length: maxMitigatoryBarriers - consequence.barriers.length }).map((_, i) => (
                                   <React.Fragment key={i}>
                                        <div className="w-48 h-24" /> {/* Placeholder */}
                                        <div className="flex-1 h-px bg-transparent mx-4"></div>
                                   </React.Fragment>
                                ))}
                                 <Button size="icon" variant="ghost" onClick={() => addBarrier('consequence', consequence.id)}><PlusCircle className="h-5 w-5"/></Button>
                            </div>
                        ))}
                        <div className='flex items-center flex-row-reverse'>
                            <AddNodeButton onClick={addConsequence}>Adicionar Consequência</AddNodeButton>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
