

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Risk } from "@/lib/types";

const matrixConfig = {
    probabilities: [
        { level: "Muito Provável", weight: 10, num: 4 },
        { level: "Provável", weight: 8.0, num: 3 },
        { level: "Possível", weight: 5, num: 2 },
        { level: "Pouco Provável", weight: 2.5, num: 1 },
    ],
    impacts: [
        { level: "Baixo", weight: 25, letter: "A" },
        { level: "Moderado", weight: 50, letter: "B" },
        { level: "Significativo", weight: 80, letter: "C" },
        { level: "Alto", weight: 100, letter: "D" },
    ],
    ierValues: [ // From Top-Left to Bottom-Right
        [250, 500, 800, 1000],
        [200, 400, 640, 800],
        [125, 250, 400, 500],
        [63, 125, 200, 250],
    ],
    colors: [ // From Top-Left to Bottom-Right
        ["bg-yellow-400 text-black", "bg-orange-500 text-white", "bg-red-600 text-white", "bg-red-600 text-white"],
        ["bg-yellow-400 text-black", "bg-yellow-400 text-black", "bg-orange-500 text-white", "bg-red-600 text-white"],
        ["bg-green-400 text-black", "bg-yellow-400 text-black", "bg-orange-500 text-white", "bg-orange-500 text-white"],
        ["bg-green-400 text-black", "bg-green-400 text-black", "bg-yellow-400 text-black", "bg-yellow-400 text-black"],
    ]
};


const calculateRiskCounts = (risks: Risk[]) => {
    const probMap: Record<string, number> = { "Muito Provável": 0, "Provável": 1, "Possível": 2, "Pouco Provável": 3 };
    const impactMap: Record<string, number> = { "Baixo": 0, "Moderado": 1, "Significativo": 2, "Alto": 3 };

    const counts = Array(4).fill(0).map(() => Array(4).fill(0));

    risks.forEach(risk => {
        const probKey = risk.probabilidadeResidual;
        const impactKey = risk.impactoResidual;
        
        if (probKey && impactKey && probKey in probMap && impactKey in impactMap) {
            const probIndex = probMap[probKey];
            const impactIndex = impactMap[impactKey];
            counts[probIndex][impactIndex]++;
        }
    });

    return counts;
};


export function RiskMatrix({risks}: {risks: Risk[]}) {
  const riskCounts = calculateRiskCounts(risks);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matriz de Risco Residual</CardTitle>
        <CardDescription>Distribuição de riscos por probabilidade e impacto.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto p-4 flex flex-col items-center gap-4">
        
        <p className="font-bold">IMPACTO</p>
        <div className="flex items-center">
            <div className="flex items-center justify-center -mr-4">
                 <p className="font-bold [writing-mode:vertical-rl] rotate-180">PROBABILIDADE</p>
            </div>
            <div className="grid grid-cols-[auto_auto_repeat(4,_minmax(0,_1fr))] text-sm">
                {/* Header Row 1: PESOS + weights */}
                <div className="col-span-2 flex items-center justify-center font-bold bg-gray-200 text-black p-2">PESOS</div>
                {matrixConfig.impacts.map(impact => (
                    <div key={impact.weight} className="flex items-center justify-center font-bold bg-gray-200 text-black p-2">{impact.weight}</div>
                ))}

                {/* Header Row 2: Empty + A, B, C, D */}
                <div className="bg-gray-200 col-span-2"></div>
                {matrixConfig.impacts.map(impact => (
                    <div key={impact.letter} className="flex items-center justify-center font-bold bg-black text-white p-2">{impact.letter}</div>
                ))}

                {/* Matrix Body */}
                {matrixConfig.probabilities.map((prob, rowIndex) => (
                    <React.Fragment key={prob.level}>
                        <div className="flex flex-col items-center justify-center font-bold bg-gray-200 text-black p-2">
                           <span>{prob.weight.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</span>
                        </div>
                         <div className="flex flex-col items-center justify-center font-bold bg-black text-white p-2">
                            <span>{prob.num}</span>
                        </div>
                        {matrixConfig.ierValues[rowIndex].map((ier, colIndex) => (
                            <div key={colIndex} className={`flex flex-col items-center justify-center p-1 text-sm font-bold h-16 w-20 text-center ${matrixConfig.colors[rowIndex][colIndex]}`}>
                                <span>{ier}</span>
                                {riskCounts[rowIndex][colIndex] > 0 && (
                                     <span className="text-lg">{riskCounts[rowIndex][colIndex]}</span>
                                )}
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

