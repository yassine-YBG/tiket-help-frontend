import { cn } from '@/lib/utils';

// Brand mark: a ticket stub with a reply notch. Drawn in SVG (sharp at any size).
export function LogoMark({ className }) {
  return (
    <span
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground [box-shadow:inset_0_1px_0_oklch(1_0_0/0.18),var(--shadow-xs)]',
        className
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="size-[60%]" fill="none">
        <path
          d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v1.25a1.75 1.75 0 0 0 0 3.5v1.25A2.5 2.5 0 0 1 17.5 16H11l-3.5 3v-3h-1A2.5 2.5 0 0 1 4 13.5v-6Z"
          fill="currentColor"
          fillOpacity="0.95"
        />
        <path d="M8.5 9.25h5M8.5 11.75h3" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

// Mark + name. "subtitle" is the small line under the name (sidebar).
export function Logo({ className, subtitle, markClassName }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className={markClassName} />
      <span className="grid leading-tight">
        <span className="text-[15px] font-semibold tracking-tight text-foreground">Tiket Help</span>
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
      </span>
    </span>
  );
}
