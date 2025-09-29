'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { complianceChartData } from '@/lib/mock-data';

export function RiskComplianceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conformidade de KPIs</CardTitle>
        <CardDescription>Conformidade percentual mensal vs. meta</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-72 w-full">
          <ResponsiveContainer>
            <BarChart data={complianceChartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="compliance" name="Conformidade" fill="hsl(var(--chart-1))" radius={4} />
              <Bar dataKey="target" name="Meta" fill="hsl(var(--chart-2))" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
