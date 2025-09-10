
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Risk } from "@/lib/types";

const probabilityLevels: Risk['probabilidadeResidual'][] = ["Raro", "Improvável", "Possível", "Provável", "Quase Certo"];
const impactLevels: Risk['impactoResidual'][] = ["Insignificante", "Menor", "Moderado", "Maior", "Catastrófico"];

// Using Tailwind full class names to avoid purging issues.
const matrixColors = [
    ["bg-green-200", "bg-green-300", "bg-yellow-200", "bg-yellow-300", "bg-orange-300"],
    ["bg-green-300", "bg-yellow-200", "bg-yellow-300", "bg-orange-300", "bg-orange-400"],
    ["bg-yellow-200", "bg-yellow-300", "bg-orange-300", "bg-orange-400", "bg-red-400"],
    ["bg-yellow-300", "bg-orange-300", "bg-orange-400", "bg-red-400", "bg-red-500"],
    ["bg-orange-300", "bg-orange-400", "bg-red-400", "bg-red-500", "bg-red-600"],
];

const calculateRiskCounts = (risks: Risk[]) => {
    const counts = Array(probabilityLevels.length).fill(0).map(() => Array(impactLevels.length).fill(0));
    
    risks.forEach(risk => {
        const probIndex = probabilityLevels.indexOf(risk.probabilidadeResidual);
        const impactIndex = impactLevels.indexOf(risk.impactoResidual);
        if (probIndex !== -1 && impactIndex !== -1) {
            counts[probIndex][impactIndex]++;
        }
    });

    return counts.reverse();
};

export function RiskMatrix({risks}: {risks: Risk[]}) {
  const riskCounts = calculateRiskCounts(risks);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Matriz de Risco Residual</CardTitle>
        <CardDescription>Distribuição de riscos por probabilidade e impacto.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="flex items-start">
          <div className="flex h-[300px] items-center -rotate-90 whitespace-nowrap -ml-8 mr-2">
            <span className="font-semibold text-sm text-muted-foreground">Probabilidade</span>
          </div>
          <div className="w-full">
            <Table className="min-w-[500px]">
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-24 border-r"></TableHead>
                        {impactLevels.map(level => (
                            <TableHead key={level} className="text-center font-semibold text-foreground">{level}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {probabilityLevels.slice().reverse().map((probLevel, rowIndex) => (
                        <TableRow key={probLevel} className="hover:bg-transparent">
                            <TableHead className="text-right font-semibold text-foreground border-r whitespace-nowrap">{probLevel}</TableHead>
                            {impactLevels.map((_, colIndex) => (
                                <TableCell key={colIndex} className={`text-center font-bold text-lg text-card-foreground/80 ${matrixColors[rowIndex][colIndex]}`}>
                                    {riskCounts[rowIndex][colIndex] > 0 ? riskCounts[rowIndex][colIndex] : '-'}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="text-center mt-2">
                <span className="font-semibold text-sm text-muted-foreground">Impacto</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
