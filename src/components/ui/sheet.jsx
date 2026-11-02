import * as React from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Panel that slides in from an edge (phone menu). Built on Radix Dialog:
// focus trap, Escape to close, scroll lock and screen-reader title for free.
// side="bottom" = iOS-style sheet with a grabber; side="left" = drawer.
const SIDES = {
  bottom:
    'inset-x-0 bottom-0 max-h-[85dvh] rounded-t-2xl pb-safe data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
  left: 'inset-y-0 left-0 h-full w-[min(20rem,85vw)] pt-safe data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left',
};

function Sheet(props) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetContent({ side = 'bottom', title, description, className, children, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-200"
      />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-50 flex flex-col overflow-hidden bg-popover text-popover-foreground shadow-float outline-none',
          'data-[state=open]:animate-in data-[state=open]:duration-300 data-[state=open]:ease-(--ease-drawer)',
          'data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=closed]:ease-(--ease-drawer)',
          SIDES[side],
          className
        )}
        {...props}
      >
        {side === 'bottom' && <div aria-hidden className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-border" />}
        {/* drawer: the content brings its own header, the title is for screen readers */}
        <div className={cn('flex items-center justify-between gap-2 px-4 pt-3 pb-1', side === 'left' && 'contents')}>
          <DialogPrimitive.Title className={cn('text-base font-semibold', side === 'left' && 'sr-only')}>{title}</DialogPrimitive.Title>
          <DialogPrimitive.Close
            className={cn(
              'pressable -mr-1.5 flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent',
              side === 'left' && 'absolute top-[calc(env(safe-area-inset-top,0px)+0.75rem)] right-3.5 z-10 mr-0'
            )}
            aria-label="Close menu"
          >
            <XIcon className="size-5" />
          </DialogPrimitive.Close>
        </div>
        {description ? (
          <DialogPrimitive.Description className="px-4 text-sm text-muted-foreground">{description}</DialogPrimitive.Description>
        ) : (
          <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export { Sheet, SheetContent };
