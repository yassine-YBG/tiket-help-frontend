import { Skeleton } from '@/components/ui/skeleton';

// Placeholder rows while a list loads: same rhythm as the real rows,
// so nothing jumps when the data arrives.
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="divide-y" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex items-center gap-4 py-3.5">
          <div className="grid flex-[2] gap-2">
            <Skeleton className="h-4 w-[70%]" />
            <Skeleton className="h-3 w-[40%]" />
          </div>
          {Array.from({ length: Math.max(columns - 1, 0) }, (_, col) => (
            <Skeleton key={col} className="hidden h-5 flex-1 sm:block" />
          ))}
        </div>
      ))}
    </div>
  );
}
