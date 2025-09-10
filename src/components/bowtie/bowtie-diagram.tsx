
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { BowtieData, BowtieNodeData, BowtieSide } from "@/lib/types";
import { ArrowRight, ChevronRight, GitFork, Shield, Siren, Zap, Edit, Trash2, PlusCircle, Palette } from "lucide-react";
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

const nodeIcons: { [key in BowtieSide]: React.ReactNode } = {
    threats: <Zap size={20} />,
    preventiveControls: <Shield size={20} />,
    consequences: <ArrowRight size={20} />,
    mitigatoryControls: <Shield size={20} />,
};

const defaultColors: { [key in BowtieSide]: string } = {
    threats: "#FECACA", // red-200
    preventiveControls: "#DBEAFE", // blue-200
    consequences: "#FED7AA", // orange-200
    mitigatoryControls: "#D1FAE5", // green-200
};

type BowtieNodeProps = {
    node: BowtieNodeData;
    onUpdate: (updatedNode: BowtieNodeData) => void;
    onDelete: () => void;
    className?: string;
    icon?: React.ReactNode;
};

const EditableBowtieNode = ({ node, onUpdate, onDelete, className, icon }: BowtieNodeProps) => {
    const [label, setLabel] = React.useState(node.label);
    const [description, setDescription] = React.useState(node.description);
    const [color, setColor] = React.useState(node.color);
    const [isOpen, setIsOpen] = React.useState(false);

    const handleSave = () => {
        onUpdate({ ...node, label, description, color });
        setIsOpen(false);
    };

    return (
        <Card className={cn("w-64 h-28 flex flex-col justify-center shadow-lg relative group/node", className)} style={{ backgroundColor: node.color }}>
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    {icon && <div className="text-primary">{icon}</div>}
                    <div className="flex-1">
                        <p className="font-semibold text-sm truncate">{node.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{node.description}</p>
                    </div>
                </div>
            </CardContent>

            <div className="absolute top-1 right-1 flex items-center opacity-0 group-hover/node:opacity-100 transition-opacity">
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" side="bottom" align="center">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Editar Nó</h4>
                                <p className="text-sm text-muted-foreground">Altere as informações abaixo.</p>
                            </div>
                            <div className="grid gap-2">
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label htmlFor="label">Título</Label>
                                    <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} className="col-span-2 h-8" />
                                </div>
                                <div className="grid grid-cols-3 items-start gap-4">
                                    <Label htmlFor="description">Descrição</Label>
                                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-2 min-h-[60px]" />
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label htmlFor="color">Cor</Label>
                                    <Input id="color" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="col-span-2 h-8 p-1" />
                                </div>
                            </div>
                            <Button onClick={handleSave}>Salvar</Button>
                        </div>
                    </PopoverContent>
                </Popover>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tem certeza que deseja excluir o nó "{node.label}"? Essa ação não pode ser desfeita.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={onDelete}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Card>
    );
};

const AddNodeButton = ({ onAdd }: { onAdd: () => void }) => (
    <Button variant="outline" size="sm" className="h-28 w-28 border-dashed" onClick={onAdd}>
        <PlusCircle className="h-6 w-6 text-muted-foreground" />
    </Button>
);

const Line = ({ hasArrow = false }: { hasArrow?: boolean }) => (
    <div className="relative flex-1 h-0.5 bg-border mx-2">
        {hasArrow && <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />}
    </div>
);

export const BowtieDiagram = ({ data, onUpdate, onDelete }: { data: BowtieData, onUpdate: (data: BowtieData) => void, onDelete: (id: string) => void }) => {

    const handleNodeUpdate = (side: BowtieSide | 'event', index: number, updatedNode: BowtieNodeData | BowtieData['event']) => {
        const newData = JSON.parse(JSON.stringify(data));
        if (side === 'event') {
            newData.event = updatedNode;
        } else {
            (newData as any)[side][index] = updatedNode;
        }
        onUpdate(newData);
    };

    const handleAddNode = (side: BowtieSide) => {
        const newData = JSON.parse(JSON.stringify(data));
        const newId = `${side.slice(0,1).toUpperCase()}${newData[side].length + 1}`;
        const newNode: BowtieNodeData = { id: newId, label: 'Novo Item', description: 'Clique para editar', color: defaultColors[side] };

        if (side === 'threats' || side === 'preventiveControls') {
             newData.threats.push(side === 'threats' ? newNode : { id: newId.replace("T", "TH"), label: 'Nova Ameaça', description: '...', color: defaultColors.threats });
             newData.preventiveControls.push(side === 'preventiveControls' ? newNode : { id: newId.replace("P", "PC"), label: 'Novo Controle', description: '...', color: defaultColors.preventiveControls });
        } else {
             newData.consequences.push(side === 'consequences' ? newNode : { id: newId.replace("C", "CO"), label: 'Nova Consequência', description: '...', color: defaultColors.consequences });
             newData.mitigatoryControls.push(side === 'mitigatoryControls' ? newNode : { id: newId.replace("M", "MC"), label: 'Novo Controle', description: '...', color: defaultColors.mitigatoryControls });
        }
        onUpdate(newData);
    };

    const handleDeleteNode = (side: BowtieSide, index: number) => {
        const newData = JSON.parse(JSON.stringify(data));
        if (side === 'threats' || side === 'preventiveControls') {
            newData.threats.splice(index, 1);
            newData.preventiveControls.splice(index, 1);
        } else {
            newData.consequences.splice(index, 1);
            newData.mitigatoryControls.splice(index, 1);
        }
        onUpdate(newData);
    };

    return (
        <Card className="overflow-x-auto">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className='flex items-center gap-2'>
                        <GitFork />
                        Visualização Bowtie
                    </div>
                     <div className='flex items-center gap-4'>
                        <p className='text-sm font-normal text-muted-foreground'>Passe o mouse sobre um nó para editar ou excluir.</p>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive-outline">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir Diagrama
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Diagrama Bowtie?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o diagrama Bowtie para o risco "{data.event.label}".
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(data.id)} className="bg-destructive hover:bg-destructive/90">
                                    Sim, excluir
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardTitle>
                <CardDescription>{data.event.label}: {data.event.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <div className="flex items-center justify-center min-w-[1400px] py-8">
                    {/* Left Side */}
                    <div className="flex flex-col items-end justify-center w-2/5 space-y-4 pr-4">
                        {data.threats.map((threat, index) => (
                            <div key={threat.id} className="flex items-center w-full">
                                <EditableBowtieNode node={threat} onUpdate={(n) => handleNodeUpdate('threats', index, n)} onDelete={() => handleDeleteNode('threats', index)} icon={nodeIcons.threats} />
                                <Line hasArrow />
                                <EditableBowtieNode node={data.preventiveControls[index]} onUpdate={(n) => handleNodeUpdate('preventiveControls', index, n)} onDelete={() => handleDeleteNode('preventiveControls', index)} icon={nodeIcons.preventiveControls} />
                            </div>
                        ))}
                         <div className="flex items-center w-full">
                            <AddNodeButton onAdd={() => handleAddNode('threats')} />
                            <div className="flex-1 h-0.5 bg-transparent mx-2" />
                            <AddNodeButton onAdd={() => handleAddNode('preventiveControls')} />
                        </div>
                    </div>

                    {/* Center: Event */}
                    <div className="flex items-center justify-center flex-shrink-0 px-4">
                        <div className="flex items-center">
                            <Line hasArrow />
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Card className="w-72 h-36 flex flex-col items-center justify-center text-center shadow-xl border-2 border-primary cursor-pointer hover:border-primary/70" style={{backgroundColor: data.event.color}}>
                                        <CardHeader className="p-2"> <Siren className="h-8 w-8 text-primary mx-auto" /> </CardHeader>
                                        <CardContent className="p-2">
                                            <p className="font-bold text-base text-primary">{data.event.label}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{data.event.description}</p>
                                        </CardContent>
                                    </Card>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <h4 className="font-medium leading-none">Editar Evento Central</h4>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="event-label">Título do Evento</Label>
                                            <Input id="event-label" value={data.event.label} onChange={(e) => handleNodeUpdate('event', 0, { ...data.event, label: e.target.value })} />
                                            <Label htmlFor="event-desc">Descrição do Evento</Label>
                                            <Textarea id="event-desc" value={data.event.description} onChange={(e) => handleNodeUpdate('event', 0, { ...data.event, description: e.target.value })} />
                                            <Label htmlFor="event-color">Cor</Label>
                                            <Input id="event-color" type="color" value={data.event.color} onChange={(e) => handleNodeUpdate('event', 0, { ...data.event, color: e.target.value })} className="p-1" />
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <Line hasArrow />
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex flex-col items-start justify-center w-2/5 space-y-4 pl-4">
                        {data.consequences.map((consequence, index) => (
                            <div key={consequence.id} className="flex items-center w-full">
                                <EditableBowtieNode node={data.mitigatoryControls[index]} onUpdate={(n) => handleNodeUpdate('mitigatoryControls', index, n)} onDelete={() => handleDeleteNode('mitigatoryControls', index)} icon={nodeIcons.mitigatoryControls}/>
                                <Line hasArrow />
                                <EditableBowtieNode node={consequence} onUpdate={(n) => handleNodeUpdate('consequences', index, n)} onDelete={() => handleDeleteNode('consequences', index)} icon={nodeIcons.consequences} />
                            </div>
                        ))}
                         <div className="flex items-center w-full">
                            <AddNodeButton onAdd={() => handleAddNode('mitigatoryControls')} />
                            <div className="flex-1 h-0.5 bg-transparent mx-2" />
                            <AddNodeButton onAdd={() => handleAddNode('consequences')} />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
