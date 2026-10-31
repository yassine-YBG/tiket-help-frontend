import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Works with the backend's pagination block:
// { page, limit, total, totalPages, hasNextPage, hasPrevPage }
export function Pagination({ pagination, onPageChange, disabled = false }) {
  if (!pagination || pagination.total === 0) return null;

  const { page, limit, total, totalPages, hasNextPage, hasPrevPage } = pagination;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 pt-4" aria-label="Pagination">
      <p className="text-sm text-muted-foreground">
        {from <= total ? (
          <>
            Showing <span className="font-medium text-foreground">{from}</span>–
            <span className="font-medium text-foreground">{to}</span> of{' '}
            <span className="font-medium text-foreground">{total}</span>
          </>
        ) : (
          <>No results on this page</>
        )}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || !hasPrevPage}
          aria-label="Previous page"
        >
          <ChevronLeftIcon />
          <span className="hidden sm:inline">Previous</span>
        </Button>
        <span className="text-sm tabular-nums text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || !hasNextPage}
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRightIcon />
        </Button>
      </div>
    </nav>
  );
}
