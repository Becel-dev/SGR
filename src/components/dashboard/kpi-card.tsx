import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type KpiCardProps = {
  title: string;
  value: string;
  change?: number;
  description: string;
  Icon: LucideIcon;
};

export function KpiCard({ title, value, change, description, Icon }: KpiCardProps) {
  const isPositive = change !== undefined && change >= 0;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center">
            {change !== undefined && (
                <span className={`flex items-center mr-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {Math.abs(change)}%
                </span>
            )}
            {description}
        </p>
      </CardContent>
    </Card>
  );
}
