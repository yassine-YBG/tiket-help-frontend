import { ArrowDownIcon, ArrowUpIcon, ChevronsUpIcon, MinusIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PRIORITY_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const PRIORITY_STYLES = {
  low: { className: 'text-muted-foreground', icon: ArrowDownIcon },
  normal: { className: 'text-foreground', icon: MinusIcon },
  high: { className: 'border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300', icon: ArrowUpIcon },
  urgent: { className: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300', icon: ChevronsUpIcon },
};

export function PriorityBadge({ priority, className }) {
  const style = PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.normal;
  const Icon = style.icon;
  return (
    <Badge variant="outline" className={cn(style.className, className)}>
      <Icon aria-hidden="true" />
      {PRIORITY_LABELS[priority] ?? priority}
    </Badge>
  );
}
