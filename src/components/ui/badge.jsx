import * as React from 'react';
import { Slot } from 'radix-ui';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Small label. "soft" variants are for status/meaning, "outline" for neutral facts.
const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border px-1.5 py-0.5 text-xs leading-4 font-medium [&>svg]:pointer-events-none [&>svg]:size-3 focus-visible:ring-[3px] focus-visible:ring-ring/40 transition-[color,box-shadow]',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        brand: 'border-transparent bg-brand-soft text-brand-soft-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-accent',
        destructive: 'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90',
        success: 'border-transparent bg-success-soft text-success',
        warning: 'border-transparent bg-warning-soft text-warning',
        info: 'border-transparent bg-info-soft text-info',
        danger: 'border-transparent bg-danger-soft text-danger',
        outline: 'border-border bg-card text-foreground [a&]:hover:bg-accent',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

function Badge({ className, variant, asChild = false, ...props }) {
  const Comp = asChild ? Slot.Root : 'span';
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
