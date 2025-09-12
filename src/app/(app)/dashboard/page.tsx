
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RiskMappingDashboard } from "@/components/dashboard/risk-mapping-dashboard";
import { RiskAnalysisDashboard } from "@/components/dashboard/risk-analysis-dashboard";
import { EsgDashboard } from "@/components/dashboard/esg-dashboard";
import { MatrixAppetiteDashboard } from "@/components/dashboard/matrix-appetite-dashboard";

export default function DashboardPage() {
  return (
    <Tabs defaultValue="risk-mapping">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="risk-mapping">Mapeamento de Riscos</TabsTrigger>
        <TabsTrigger value="risk-analysis">Análise do Risco</TabsTrigger>
        <TabsTrigger value="esg">ESG</TabsTrigger>
        <TabsTrigger value="matrix-appetite">Matriz & Apetite</TabsTrigger>
      </TabsList>
      <TabsContent value="risk-mapping">
        <RiskMappingDashboard />
      </TabsContent>
      <TabsContent value="risk-analysis">
        <RiskAnalysisDashboard />
      </TabsContent>
      <TabsContent value="esg">
        <EsgDashboard />
      </TabsContent>
      <TabsContent value="matrix-appetite">
        <MatrixAppetiteDashboard />
      </TabsContent>
    </Tabs>
  );
}
