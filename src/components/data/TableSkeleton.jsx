import { Skeleton } from '@/components/ui/skeleton';

// Grey placeholder rows while a list loads (better than a blank page or a spinner)
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="grid gap-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }, (_, col) => (
            <Skeleton key={col} className="h-5" />
          ))}
        </div>
      ))}
    </div>
  );
}
