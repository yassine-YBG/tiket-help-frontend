import { InboxIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Shown when a list is empty, a page is not built yet, etc.
// The icon sits on a soft "tile" stack so an empty screen still looks intentional.
export function EmptyState({ icon: Icon = InboxIcon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 px-6 py-14 text-center sm:py-20', className)}>
      <div className="relative">
        <div aria-hidden className="absolute inset-0 translate-x-1.5 translate-y-1.5 rotate-6 rounded-xl border bg-muted" />
        <div className="relative flex size-12 items-center justify-center rounded-xl border bg-card shadow-xs">
          <Icon className="size-5 text-muted-foreground" />
        </div>
      </div>
      <div className="grid max-w-sm gap-1">
        <p className="text-[15px] font-semibold">{title}</p>
        {description && <p className="text-sm text-pretty text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
