import { cn } from '@/lib/utils';

// Surface for a list page: filters on top, then the rows.
// On phones it runs edge to edge (no side borders), like a native list.
export function DataPanel({ toolbar, children, className }) {
  return (
    <section
      className={cn(
        'rounded-xl border bg-card shadow-xs max-sm:-mx-4 max-sm:rounded-none max-sm:border-x-0 max-sm:shadow-none',
        className
      )}
    >
      {toolbar && <div className="border-b px-4 py-3 sm:px-5">{toolbar}</div>}
      <div className="px-4 pb-4 sm:px-5">{children}</div>
    </section>
  );
}
