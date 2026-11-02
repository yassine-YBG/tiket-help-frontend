import { Badge } from '@/components/ui/badge';
import { STATUS_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

// open = waiting (amber), in progress = being worked on (blue), resolved = done (green)
const STATUS_STYLES = {
  'non résolu': { variant: 'warning', dot: 'bg-warning' },
  'en cours': { variant: 'info', dot: 'bg-info' },
  'résolu': { variant: 'success', dot: 'bg-success' },
};

export function StatusBadge({ status, className }) {
  const style = STATUS_STYLES[status] ?? { variant: 'secondary', dot: 'bg-muted-foreground' };
  return (
    <Badge variant={style.variant} className={cn('gap-1.5 pl-1.5', className)}>
      <span aria-hidden className={cn('size-1.5 rounded-full', style.dot)} />
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
