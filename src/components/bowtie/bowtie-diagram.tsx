import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { BowtieData } from "@/lib/types";
import { ArrowRight, ChevronRight, GitFork, Shield, Siren, Zap } from "lucide-react";

type BowtieNodeProps = {
    label: string;
    description?: string;
    className?: string;
    icon?: React.ReactNode;
};

const BowtieNode = ({ label, description, className, icon }: BowtieNodeProps) => (
    <Card className={cn("w-64 h-24 flex flex-col justify-center shadow-lg", className)}>
        <CardContent className="p-4">
            <div className="flex items-center gap-3">
                {icon && <div className="text-primary">{icon}</div>}
                <div>
                    <p className="font-semibold text-sm">{label}</p>
                    {description && <p className="text-xs text-muted-foreground">{description}</p>}
                </div>
            </div>
        </CardContent>
    </Card>
);

const Line = ({ hasArrow = false }: { hasArrow?: boolean }) => (
    <div className="relative flex-1 h-0.5 bg-border mx-2">
        {hasArrow && <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />}
    </div>
);

export const BowtieDiagram = ({ data }: { data: BowtieData }) => {
    return (
        <Card className="overflow-x-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <GitFork />
                    Visualização Bowtie
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="flex items-center justify-center min-w-[1200px] py-8">
                    {/* Left Side: Threats and Preventive Controls */}
                    <div className="flex flex-col items-end justify-center w-1/3 space-y-8 pr-4">
                        {data.threats.map((threat, index) => (
                            <div key={`threat-${index}`} className="flex items-center w-full">
                                <BowtieNode label={threat.label} description={threat.description} icon={<Zap size={20} />} className="bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900" />
                                <Line hasArrow />
                                <BowtieNode label={data.preventiveControls[index].label} description={data.preventiveControls[index].description} icon={<Shield size={20} />} className="bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900"/>
                            </div>
                        ))}
                    </div>

                    {/* Center: Event */}
                    <div className="flex items-center justify-center flex-shrink-0 px-4">
                        <div className="flex items-center">
                            <Line hasArrow />
                             <Card className="w-72 h-36 flex flex-col items-center justify-center text-center shadow-xl border-2 border-primary bg-amber-50 dark:bg-amber-950/50">
                                <CardHeader className="p-2">
                                     <Siren className="h-8 w-8 text-primary mx-auto" />
                                </CardHeader>
                                <CardContent className="p-2">
                                    <p className="font-bold text-base text-primary">{data.event.label}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{data.event.description}</p>
                                </CardContent>
                            </Card>
                            <Line hasArrow />
                        </div>
                    </div>

                    {/* Right Side: Mitigatory Controls and Consequences */}
                    <div className="flex flex-col items-start justify-center w-1/3 space-y-8 pl-4">
                        {data.consequences.map((consequence, index) => (
                            <div key={`consequence-${index}`} className="flex items-center w-full">
                                <BowtieNode label={data.mitigatoryControls[index].label} description={data.mitigatoryControls[index].description} icon={<Shield size={20} />} className="bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-900"/>
                                <Line hasArrow />
                                <BowtieNode label={consequence.label} description={consequence.description} icon={<ArrowRight size={20} />} className="bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-900"/>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
