
import { AlertCircle, BarChart, CheckCircle, TrendingDown } from 'lucide-react';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { RiskComplianceChart } from '@/components/dashboard/risk-compliance-chart';
import { StatusBreakdownChart } from '@/components/dashboard/status-breakdown-chart';
import { kpiData, risksData } from '@/lib/mock-data';
import { RecentActivityTable } from '@/components/dashboard/recent-activity-table';
import { RiskMatrix } from '@/components/dashboard/risk-matrix';

export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="% de KPIs em conformidade"
          value={`${kpiData.compliance.value}%`}
          change={kpiData.compliance.change}
          description="no último mês"
          Icon={CheckCircle}
        />
        <KpiCard
          title="Itens atrasados"
          value={kpiData.overdueItems.value.toString()}
          change={kpiData.overdueItems.change}
          description="no último mês"
          Icon={AlertCircle}
        />
        <KpiCard
          title="Riscos críticos sem controle"
          value={kpiData.criticalRisks.value.toString()}
          change={kpiData.criticalRisks.change}
          description="novos este mês"
          Icon={TrendingDown}
        />
        <KpiCard
          title="Controles com desvios"
          value={kpiData.controlDeviations.value.toString()}
          change={kpiData.controlDeviations.change}
          description="reincidentes este mês"
          Icon={BarChart}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RiskComplianceChart />
        </div>
        <div className="lg:col-span-2">
            <StatusBreakdownChart />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RiskMatrix risks={risksData} />
        <RecentActivityTable />
      </div>
    </div>
  );
}
