import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  trendPositive?: boolean; // true means "up is good", false means "down is good"
}

export function MetricCard({ label, value, unit, trend, trendValue, trendPositive = true }: MetricCardProps) {
  const isGood = trend === 'neutral' || (trend === 'up' && trendPositive) || (trend === 'down' && !trendPositive);
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <Card className="bg-card">
      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${isGood ? 'text-semaforo-verde' : 'text-semaforo-rojo'}`}>
            <TrendIcon className="h-3 w-3" />
            {trendValue && <span>{trendValue}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
