import { useState } from 'react';
import { SlidersHorizontalIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Toolbar of a list: search, then filters.
// Phones: the filters fold behind a "Filters" button (with the active count) and
// open as a 2-column grid, so the list stays in view. Tablet/desktop: one row.
// The filters are rendered once; only the layout changes.
export function FilterBar({ search, children, activeCount = 0, onReset }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2" role="search">
      <div className="min-w-0 flex-1 md:flex-none">{search}</div>
      {children && (
        <Button
          type="button"
          variant="outline"
          className="md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          <SlidersHorizontalIcon />
          Filters
          {activeCount > 0 && (
            <span className="min-w-5 rounded-full bg-primary px-1.5 text-[11px] leading-5 font-semibold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      )}
      <div
        className={cn(
          'basis-full grid-cols-2 gap-2 max-md:[&>*]:!w-full md:flex md:flex-1 md:basis-auto md:flex-wrap md:items-center',
          open ? 'grid' : 'hidden'
        )}
      >
        {children}
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground max-md:col-span-2">
            <XIcon />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
