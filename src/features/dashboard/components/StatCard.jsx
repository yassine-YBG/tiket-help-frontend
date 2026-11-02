import { cn } from '@/lib/utils';

// Group of numbers sharing one surface, separated by hairlines (less visual
// noise than one card per number). Columns: tailwind grid classes.
export function StatGroup({ label, className, children }) {
  return (
    <section
      aria-label={label}
      className={cn('grid gap-px overflow-hidden rounded-xl border bg-border shadow-xs', className)}
    >
      {children}
    </section>
  );
}

// One number with its label (and an optional small hint under it).
// emphasis = someone is waiting: the number turns red with a soft tint.
export function StatCard({ label, value, hint, emphasis = false, icon: Icon }) {
  return (
    <div className={cn('grid content-start gap-2 bg-card p-4 sm:p-5', emphasis && 'bg-danger-soft/40')}>
      <p className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
        {Icon && <Icon className={cn('size-4', emphasis ? 'text-danger' : 'text-muted-foreground/80')} aria-hidden />}
        {label}
      </p>
      <p
        className={cn(
          'text-[26px] leading-none font-semibold tracking-tight tabular-nums sm:text-[28px]',
          emphasis && 'text-danger'
        )}
      >
        {value}
      </p>
      {hint && <p className="text-xs text-muted-foreground [&_a]:font-medium [&_a]:text-primary">{hint}</p>}
    </div>
  );
}
