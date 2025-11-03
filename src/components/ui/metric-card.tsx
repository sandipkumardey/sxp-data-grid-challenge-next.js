import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type MetricCardProps = {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  className?: string;
};

export function MetricCard({ title, value, change, icon, className }: MetricCardProps) {
  const isPositive = change ? change >= 0 : null;
  
  return (
    <div className={cn(
      "rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md dark:shadow-neutral-800/50",
      className
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">{value}</span>
            {change !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center text-xs font-medium',
                  isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                )}
              >
                {isPositive ? (
                  <ArrowUp className="mr-0.5 h-3 w-3" />
                ) : (
                  <ArrowDown className="mr-0.5 h-3 w-3" />
                )}
                {Math.abs(change)}%
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
