import * as React from 'react';
import { cn } from '@/lib/utils';

// Text field. 16px on touch screens (index.css) so iOS never zooms in.
function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-9 w-full min-w-0 rounded-lg border border-input bg-card px-3 py-1 text-sm text-foreground shadow-xs outline-none transition-[border-color,box-shadow] duration-150',
        'placeholder:text-muted-foreground/80 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'hover:border-[color-mix(in_oklch,var(--input)_60%,var(--foreground)_15%)]',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/15',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60',
        '[&::-webkit-search-cancel-button]:cursor-pointer',
        className
      )}
      {...props}
    />
  );
}

export { Input };
