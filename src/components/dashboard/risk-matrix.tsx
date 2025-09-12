

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Risk } from "@/lib/types";

const probabilityLevels: Risk['probabilidadeResidual'][] = ["Pouco Provável", "Possível", "Provável", "Muito Provável"];
const impactLevels: Risk['impactoResidual'][] = ["Baixo", "Moderado", "Significativo", "Alto"];

const probabilityConfig = {
    "Muito Provável": { label: "MUITO PROVÁVEL", weight: 10, num: 4 },
    "Provável": { label: "PROVÁVEL", weight: 8, num: 3 },
    "Possível": { label: "POSSÍVEL", weight: 5, num: 2 },
    "Pouco Provável": { label: "POUCO PROVÁVEL", weight: 2.5, num: 1 },
};

const impactConfig = {
    "Baixo": { label: "BAIXO", weight: 50 },
    "Moderado": { label: "MODERADO", weight: 80 },
    "Significativo": { label: "SIGNIFICATIVO", weight: 100 },
    "Alto": { label: "ALTO", weight: 'A' },
};


const matrixColors = [
    ["bg-yellow-500", "bg-orange-500", "bg-red-600", "bg-red-700"],     
    ["bg-yellow-400", "bg-yellow-500", "bg-orange-500", "bg-red-600"],    
    ["bg-green-400", "bg-yellow-400", "bg-yellow-500", "bg-orange-500"],    
    ["bg-green-300", "bg-green-400", "bg-yellow-400", "bg-yellow-500"], 
].reverse(); 

const calculateRiskCounts = (risks: Risk[]) => {
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

const Cell = ({ className, children }: { className?: string, children?: React.ReactNode }) => (
    <div className={`flex items-center justify-center p-2 border border-gray-600 text-xs font-bold ${className}`}>
        {children}
    </div>
);

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
        <div className="grid grid-cols-[auto_auto_auto_auto_auto_auto_auto] text-white" style={{ gridTemplateRows: 'auto auto auto auto auto auto' }}>
            {/* Headers */}
            <Cell className="row-span-2 bg-[#0F1E36]">MATRIZ DE RISCO</Cell>
            <Cell className="col-span-4 bg-[#0F1E36]">IMPACTO</Cell>
            <Cell className="bg-[#0F1E36]">25</Cell>
            <Cell className="bg-[#0F1E36]"></Cell>

            <Cell className="bg-[#1D3C67]">BAIXO</Cell>
            <Cell className="bg-[#1D3C67]">MODERADO</Cell>
            <Cell className="bg-[#1D3C67]">SIGNIFICATIVO</Cell>
            <Cell className="bg-[#1D3C67]">ALTO</Cell>
            <Cell className="bg-black">A</Cell>
            <Cell className="bg-black">B</Cell>

            <Cell className="row-span-4 bg-[#0F1E36]"><span className="writing-mode-vertical-rl rotate-180">PROBABILIDADE</span></Cell>
            <Cell className="bg-[#0F1E36]">PESOS</Cell>
            <Cell className="bg-gray-200 text-black">50</Cell>
            <Cell className="bg-gray-200 text-black">80</Cell>
            <Cell className="bg-gray-200 text-black">100</Cell>
            <Cell className="bg-black">C</Cell>
            <Cell className="bg-black">D</Cell>

            {/* Matrix Body */}
            {reversedProbLevels.map((probLevel, rowIndex) => {
                const config = probabilityConfig[probLevel as keyof typeof probabilityConfig];
                return (
                    <React.Fragment key={probLevel}>
                        <Cell className="bg-[#1D3C67]">{config.label}</Cell>
                        {impactLevels.map((_, colIndex) => (
                             <Cell key={colIndex} className={`${matrixColors[rowIndex][colIndex]} text-black text-lg h-14 w-14`}>
                                {riskCounts[rowIndex][colIndex] > 0 ? riskCounts[rowIndex][colIndex] : '-'}
                            </Cell>
                        ))}
                        <Cell className="bg-[#1D3C67]">{config.weight}</Cell>
                        <Cell className="bg-black">{config.num}</Cell>
                    </React.Fragment>
                )
            })}
        </div>
      </CardContent>
    </Card>
  );
}
