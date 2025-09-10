
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { BowtieData, BowtieNodeData } from "@/lib/types";
import { ArrowRight, ChevronRight, GitFork, Shield, Siren, Zap, Edit } from "lucide-react";
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type BowtieNodeProps = {
    node: BowtieNodeData;
    onUpdate: (updatedNode: BowtieNodeData) => void;
    className?: string;
    icon?: React.ReactNode;
};

const EditableBowtieNode = ({ node, onUpdate, className, icon }: BowtieNodeProps) => {
    const [label, setLabel] = React.useState(node.label);
    const [description, setDescription] = React.useState(node.description);
    const [isOpen, setIsOpen] = React.useState(false);

    const handleSave = () => {
        onUpdate({ label, description });
        setIsOpen(false);
    };

    return (
        <Card className={cn("w-64 h-28 flex flex-col justify-center shadow-lg relative group/node", className)}>
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    {icon && <div className="text-primary">{icon}</div>}
                    <div className="flex-1">
                        <p className="font-semibold text-sm truncate">{node.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{node.description}</p>
                    </div>
                </div>
            </CardContent>

            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover/node:opacity-100 transition-opacity"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" side="bottom" align="center">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Editar Nó</h4>
                            <p className="text-sm text-muted-foreground">
                                Altere as informações abaixo.
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="label">Título</Label>
                                <Input
                                    id="label"
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                    className="col-span-2 h-8"
                                />
                            </div>
                            <div className="grid grid-cols-3 items-start gap-4">
                                <Label htmlFor="description">Descrição</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="col-span-2 min-h-[60px]"
                                />
                            </div>
                        </div>
                        <Button onClick={handleSave}>Salvar</Button>
                    </div>
                </PopoverContent>
            </Popover>
        </Card>
    );
};

const Line = ({ hasArrow = false }: { hasArrow?: boolean }) => (
    <div className="relative flex-1 h-0.5 bg-border mx-2">
        {hasArrow && <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />}
    </div>
);

export const BowtieDiagram = ({ data, onUpdate }: { data: BowtieData, onUpdate: (data: BowtieData) => void }) => {

    const handleNodeUpdate = (path: string, index: number, updatedNode: BowtieNodeData) => {
        const newData = JSON.parse(JSON.stringify(data)); // Deep copy
        
        if (path === 'event') {
            newData.event = updatedNode;
        } else {
            (newData as any)[path][index] = updatedNode;
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
                     <p className='text-sm font-normal text-muted-foreground'>Clique em um nó para editar.</p>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="flex items-center justify-center min-w-[1200px] py-8">
                    {/* Left Side: Threats and Preventive Controls */}
                    <div className="flex flex-col items-end justify-center w-1/3 space-y-8 pr-4">
                        {data.threats.map((threat, index) => (
                            <div key={`threat-${index}`} className="flex items-center w-full">
                                <EditableBowtieNode 
                                    node={threat} 
                                    onUpdate={(newNode) => handleNodeUpdate('threats', index, newNode)}
                                    icon={<Zap size={20} />} 
                                    className="bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900" 
                                />
                                <Line hasArrow />
                                <EditableBowtieNode 
                                    node={data.preventiveControls[index]} 
                                    onUpdate={(newNode) => handleNodeUpdate('preventiveControls', index, newNode)}
                                    icon={<Shield size={20} />} 
                                    className="bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Center: Event */}
                    <div className="flex items-center justify-center flex-shrink-0 px-4">
                        <div className="flex items-center">
                            <Line hasArrow />
                             <div className="relative group/node">
                                <Card className="w-72 h-36 flex flex-col items-center justify-center text-center shadow-xl border-2 border-primary bg-amber-50 dark:bg-amber-950/50">
                                    <CardHeader className="p-2">
                                        <Siren className="h-8 w-8 text-primary mx-auto" />
                                    </CardHeader>
                                    <CardContent className="p-2">
                                        <p className="font-bold text-base text-primary">{data.event.label}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{data.event.description}</p>
                                    </CardContent>
                                </Card>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover/node:opacity-100 transition-opacity">
                                            <Edit className="h-4 w-4" />
                                        </Button>
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
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <Line hasArrow />
                        </div>
                    </div>

                    {/* Right Side: Mitigatory Controls and Consequences */}
                    <div className="flex flex-col items-start justify-center w-1/3 space-y-8 pl-4">
                        {data.consequences.map((consequence, index) => (
                            <div key={`consequence-${index}`} className="flex items-center w-full">
                                <EditableBowtieNode 
                                    node={data.mitigatoryControls[index]} 
                                    onUpdate={(newNode) => handleNodeUpdate('mitigatoryControls', index, newNode)}
                                    icon={<Shield size={20} />} 
                                    className="bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-900"
                                />
                                <Line hasArrow />
                                <EditableBowtieNode 
                                    node={consequence} 
                                    onUpdate={(newNode) => handleNodeUpdate('consequences', index, newNode)}
                                    icon={<ArrowRight size={20} />} 
                                    className="bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-900"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
