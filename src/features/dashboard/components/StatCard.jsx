import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// One number with its label (and an optional small hint under it)
export function StatCard({ label, value, hint, emphasis = false, icon: Icon }) {
  return (
    <Card className="gap-0 py-4">
      <CardContent className="grid gap-1 px-4">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          {Icon && <Icon className="size-4" aria-hidden />}
          {label}
        </p>
        <p className={cn('text-2xl font-semibold tabular-nums tracking-tight', emphasis && 'text-destructive')}>{value}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
