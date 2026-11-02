import { SignalHighIcon, SignalLowIcon, SignalMediumIcon, SirenIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PRIORITY_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

// Only high and urgent get color: the eye should land on them first
const PRIORITY_STYLES = {
  low: { variant: 'outline', className: 'text-muted-foreground', icon: SignalLowIcon },
  normal: { variant: 'outline', className: '', icon: SignalMediumIcon },
  high: { variant: 'warning', className: '', icon: SignalHighIcon },
  urgent: { variant: 'danger', className: '', icon: SirenIcon },
};

export function PriorityBadge({ priority, className }) {
  const style = PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.normal;
  const Icon = style.icon;
  return (
    <Badge variant={style.variant} className={cn(style.className, className)}>
      <Icon aria-hidden="true" />
      {PRIORITY_LABELS[priority] ?? priority}
    </Badge>
  );
}
