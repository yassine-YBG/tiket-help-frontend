import { Badge } from '@/components/ui/badge';
import { STATUS_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const STATUS_STYLES = {
  'non résolu': 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
  'en cours': 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300',
  'résolu': 'border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300',
};

export function StatusBadge({ status, className }) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLES[status], className)}>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
