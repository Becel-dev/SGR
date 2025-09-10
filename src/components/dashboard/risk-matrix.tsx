import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const probabilityLevels = ["Raro", "Improvável", "Possível", "Provável", "Quase Certo"];
const impactLevels = ["Insignificante", "Menor", "Moderado", "Maior", "Catastrófico"];

const matrixColors = [
    ["bg-green-200", "bg-green-300", "bg-yellow-200", "bg-yellow-300", "bg-orange-300"],
    ["bg-green-300", "bg-yellow-200", "bg-yellow-300", "bg-orange-300", "bg-orange-400"],
    ["bg-yellow-200", "bg-yellow-300", "bg-orange-300", "bg-orange-400", "bg-red-400"],
    ["bg-yellow-300", "bg-orange-300", "bg-orange-400", "bg-red-400", "bg-red-500"],
    ["bg-orange-300", "bg-orange-400", "bg-red-400", "bg-red-500", "bg-red-600"],
];

// Mock data for number of risks in each cell
const riskCounts = [
    [5, 3, 2, 1, 0],
    [2, 8, 5, 3, 1],
    [1, 4, 12, 7, 2],
    [0, 2, 6, 10, 4],
    [0, 1, 2, 3, 3],
].reverse(); // Reverse to match visual layout (higher prob at top)


export function RiskMatrix() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Matriz de Risco</CardTitle>
        <CardDescription>Distribuição de riscos por probabilidade e impacto.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="flex">
          <div className="flex items-center -rotate-90 whitespace-nowrap -ml-8 mr-2">
            <span className="font-semibold text-sm text-muted-foreground">Probabilidade</span>
          </div>
          <div className="w-full">
            <Table className="min-w-[600px]">
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
