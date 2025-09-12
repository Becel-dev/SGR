

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Risk } from "@/lib/types";

const probabilityLevels: Risk['probabilidadeResidual'][] = ["Pouco Provável", "Possível", "Provável", "Muito Provável"];
const impactLevels: Risk['impactoResidual'][] = ["Baixo", "Moderado", "Significativo", "Alto"];

const probabilityWeights = {
    "Muito Provável": { label: "MUITO PROVÁVEL", weight: 10, num: 4 },
    "Provável": { label: "PROVÁVEL", weight: 8.0, num: 3 },
    "Possível": { label: "POSSÍVEL", weight: 5, num: 2 },
    "Pouco Provável": { label: "POUCO PROVÁVEL", weight: 2.5, num: 1 },
};

const impactWeights = {
    "Baixo": { label: "BAIXO", weight: 25 },
    "Moderado": { label: "MODERADO", weight: 50 },
    "Significativo": { label: "SIGNIFICATIVO", weight: 80 },
    "Alto": { label: "ALTO", weight: 100 },
};

// Using Tailwind full class names to avoid purging issues.
const matrixColors = [
    ["bg-yellow-500", "bg-orange-500", "bg-red-600", "bg-red-700"],     // Muito provável
    ["bg-yellow-400", "bg-yellow-500", "bg-orange-500", "bg-red-600"],    // Provável
    ["bg-green-400", "bg-yellow-400", "bg-yellow-500", "bg-orange-500"],    // Possível
    ["bg-green-300", "bg-green-400", "bg-yellow-400", "bg-yellow-500"], // Pouco provável
].reverse(); // Reverse to match the visual layout (Quase Certo at the top)

const calculateRiskCounts = (risks: Risk[]) => {
    // A matriz de probabilidade do protótipo tem 4 níveis, mas nosso tipo tem 5.
    // Vamos mapear "Raro" para "Pouco Provável" e "Quase Certo" para "Muito Provável".
    // "Insignificante" -> "Baixo", "Menor" -> "Baixo", "Maior" -> "Alto", "Catastrófico" -> "Alto"
    const probMap: Record<string, typeof probabilityLevels[number]> = {
        "Raro": "Pouco Provável",
        "Improvável": "Pouco Provável",
        "Possível": "Possível",
        "Provável": "Provável",
        "Quase Certo": "Muito Provável",
    };
     const impactMap: Record<string, typeof impactLevels[number]> = {
        "Insignificante": "Baixo",
        "Menor": "Baixo",
        "Moderado": "Moderado",
        "Significativo": "Significativo",
        "Maior": "Alto",
        "Catastrófico": "Alto",
    };

    const counts = Array(probabilityLevels.length).fill(0).map(() => Array(impactLevels.length).fill(0));
    
    risks.forEach(risk => {
        const probKey = risk.probabilidadeResidual ? probMap[risk.probabilidadeResidual] || "Possível" : "Possível";
        const impactKey = risk.impactoResidual ? impactMap[risk.impactoResidual] || "Moderado" : "Moderado";

        const probIndex = probabilityLevels.indexOf(probKey);
        const impactIndex = impactLevels.indexOf(impactKey);

        if (probIndex !== -1 && impactIndex !== -1) {
            counts[probIndex][impactIndex]++;
        }
    });

    return counts.reverse(); // Reverse to match the visual layout
};

export function RiskMatrix({risks}: {risks: Risk[]}) {
  const riskCounts = calculateRiskCounts(risks);
  const reversedProbLevels = [...probabilityLevels].reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matriz de Risco Residual</CardTitle>
        <CardDescription>Distribuição de riscos por probabilidade e impacto.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto p-4 flex justify-center">
        <div className="inline-grid grid-cols-[auto_auto_repeat(5,_minmax(0,_1fr))] grid-rows-[auto_repeat(3,_auto)] text-xs font-bold">

            {/* Row 1: Header Principal */}
            <div className="col-start-1 col-end-3 row-start-1 bg-gray-800 text-white flex items-center justify-center p-2 border border-gray-600">MATRIZ DE RISCO</div>
            <div className="col-start-3 col-end-8 row-start-1 bg-gray-800 text-white flex items-center justify-center p-2 border border-gray-600">IMPACTO</div>

            {/* Row 2: Header Impacto */}
            <div className="col-start-1 col-end-3 row-start-2 bg-gray-800 text-white flex items-center justify-center p-2 border border-gray-600"></div>
            {Object.values(impactWeights).map(impact => (
                <div key={impact.label} className="bg-blue-800 text-white flex items-center justify-center p-2 border border-gray-600">{impact.label}</div>
            ))}
            
             {/* Row 3: Pesos Impacto */}
            <div className="col-start-2 row-start-3 bg-gray-800 text-white flex items-center justify-center p-2 border border-gray-600">PESOS</div>
            {Object.values(impactWeights).map(impact => (
                <div key={impact.weight} className="bg-gray-200 text-black flex items-center justify-center p-2 border border-gray-600">{impact.weight}</div>
            ))}

            {/* Row 4: A,B,C,D */}
            <div className="col-start-2 row-start-4 bg-gray-800 text-white flex items-center justify-center p-2 border border-gray-600"></div>
            {["A", "B", "C", "D"].map(char => (
                <div key={char} className="bg-black text-white flex items-center justify-center p-2 border border-gray-600">{char}</div>
            ))}

            {/* Probabilidade Labels */}
            <div className="col-start-1 row-start-3 row-span-full bg-gray-800 text-white flex items-center justify-center p-2 writing-mode-vertical-rl rotate-180 border border-gray-600">PROBABILIDADE</div>

            {/* Matrix Body */}
            {reversedProbLevels.map((probLevel, rowIndex) => (
                <React.Fragment key={probLevel}>
                    <div className="bg-blue-800 text-white flex items-center justify-center p-2 border border-gray-600 text-center">{probabilityWeights[probLevel as keyof typeof probabilityWeights].label}</div>
                    <div className="bg-gray-200 text-black flex items-center justify-center p-2 border border-gray-600">{probabilityWeights[probLevel as keyof typeof probabilityWeights].weight}</div>
                    <div className="bg-black text-white flex items-center justify-center p-2 border border-gray-600">{probabilityWeights[probLevel as keyof typeof probabilityWeights].num}</div>
                    
                    {impactLevels.map((_, colIndex) => (
                        <div key={colIndex} className={`${matrixColors[rowIndex][colIndex]} text-black flex items-center justify-center text-lg p-4 border border-gray-400`}>
                            {riskCounts[rowIndex][colIndex] > 0 ? riskCounts[rowIndex][colIndex] : '-'}
                        </div>
                    ))}
                </React.Fragment>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
