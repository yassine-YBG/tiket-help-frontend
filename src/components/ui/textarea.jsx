import * as React from 'react';
import { cn } from '@/lib/utils';

function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm leading-relaxed text-foreground shadow-xs outline-none transition-[border-color,box-shadow] duration-150',
        'placeholder:text-muted-foreground/80',
        'hover:border-[color-mix(in_oklch,var(--input)_60%,var(--foreground)_15%)]',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/15',
        'disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
