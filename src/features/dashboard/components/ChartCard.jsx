import { BarChart3Icon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function ChartCard({ title, description, children, className }) {
  return (
    <Card className={cn('gap-0 py-0', className)}>
      <div className="grid gap-0.5 px-5 pt-5 pb-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        {description && <p className="text-[13px] text-muted-foreground">{description}</p>}
      </div>
      <div className="px-5 pb-5">{children}</div>
    </Card>
  );
}

// Shown inside a chart card when the period has no data
export function NoData({ text = 'No data for this period' }) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg bg-muted/40 text-sm text-muted-foreground">
      <BarChart3Icon className="size-5 text-muted-foreground/60" aria-hidden />
      <p>{text}</p>
    </div>
  );
}
