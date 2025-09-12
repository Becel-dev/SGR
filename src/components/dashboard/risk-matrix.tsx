

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Risk } from "@/lib/types";

const probabilityLevels: Risk['probabilidadeResidual'][] = ["Pouco Provável", "Possível", "Provável", "Muito Provável"];
const impactLevels: Risk['impactoResidual'][] = ["Baixo", "Moderado", "Significativo", "Alto"];

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
        ["bg-yellow-400", "bg-orange-500", "bg-red-600", "bg-red-600"],
        ["bg-yellow-400", "bg-yellow-400", "bg-orange-500", "bg-red-600"],
        ["bg-green-400", "bg-yellow-400", "bg-orange-500", "bg-orange-500"],
        ["bg-green-400", "bg-green-400", "bg-yellow-400", "bg-yellow-400"],
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

const Cell = ({ className, children, ...props }: { className?: string, children?: React.ReactNode, [key:string]: any }) => (
    <div className={`flex items-center justify-center p-1 text-xs font-bold ${className}`} {...props}>
        {children}
    </div>
);

export function RiskMatrix({risks}: {risks: Risk[]}) {
  const riskCounts = calculateRiskCounts(risks);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matriz de Risco Residual</CardTitle>
        <CardDescription>Distribuição de riscos por probabilidade e impacto.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto p-4 flex justify-center">
        <div className="grid grid-cols-[auto_auto_auto_auto_auto_auto] grid-rows-[auto_auto_auto_auto_auto_auto_auto] text-white" style={{ fontFamily: 'Arial, sans-serif' }}>
            
            {/* Row 1: Impact Header */}
            <Cell className="col-start-4 col-span-4 bg-transparent text-black">IMPACTO</Cell>

            {/* Row 2: Matrix Title and Impact Levels */}
            <Cell className="col-start-1 col-span-2 row-start-2 row-span-2 bg-[#0F1E36] text-base">MATRIZ DE RISCO</Cell>
            {matrixConfig.impacts.map(impact => (
                <Cell key={impact.level} className="bg-[#1D3C67] writing-mode-vertical-rl rotate-180 py-2 h-24">{impact.level.toUpperCase()}</Cell>
            ))}

            {/* Row 3: Pesos and Impact Weights */}
            <Cell className="col-start-2 row-start-4 bg-gray-300 text-black">PESOS</Cell>
            {matrixConfig.impacts.map(impact => (
                 <Cell key={impact.weight} className="bg-gray-200 text-black">{impact.weight}</Cell>
            ))}
           
            {/* Row 4: Letters */}
            <Cell className="col-start-3 row-start-5 bg-black" /> 
            {matrixConfig.impacts.map(impact => (
                <Cell key={impact.letter} className="bg-black">{impact.letter}</Cell>
            ))}

            {/* Row 5-8: Probability, Weights, and IER Matrix */}
            <Cell className="row-start-5 row-span-4 bg-gray-200 text-black writing-mode-vertical-rl rotate-180">PROBABILIDADE</Cell>
            
            {matrixConfig.probabilities.map((prob, probIndex) => (
                <React.Fragment key={prob.level}>
                    <Cell className="bg-[#1D3C67] px-2 w-32">{prob.level.toUpperCase()}</Cell>
                    <Cell className="bg-gray-200 text-black">{prob.weight.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</Cell>
                    <Cell className="bg-black">{prob.num}</Cell>
                    {matrixConfig.ierValues[probIndex].map((ier, ierIndex) => (
                        <Cell key={ierIndex} className={`${matrixConfig.colors[probIndex][ierIndex]} text-black h-16 w-20 flex-col text-sm`}>
                            <span>{ier}</span>
                            <span className="text-lg">{riskCounts[probIndex][ierIndex] > 0 ? riskCounts[probIndex][ierIndex] : ''}</span>
                        </Cell>
                    ))}
                </React.Fragment>
            ))}

        </div>
      </CardContent>
    </Card>
  );
}
