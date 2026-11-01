import { SearchXIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/data/Pagination';
import { TableSkeleton } from '@/components/data/TableSkeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { TicketTable } from './TicketTable';

// Everything under the filters of a ticket list: loading, error, empty, table + pagination.
// Shared by "My tickets" and "All tickets" so both lists behave the same.
//   query       result of useTicketList
//   emptyState  what to show when there are no tickets at all (no filter active)
export function TicketListBody({ query, activeCount, resetFilters, onPageChange, emptyState, showCreator = false }) {
  const { data, isPending, isError, error, refetch, isPlaceholderData } = query;

  if (isPending) return <TableSkeleton rows={6} columns={showCreator ? 6 : 5} />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  if (data.tickets.length === 0) {
    if (activeCount === 0) return emptyState;
    return (
      <EmptyState
        icon={SearchXIcon}
        title="No ticket matches these filters"
        action={
          <Button variant="outline" onClick={resetFilters}>
            Clear filters
          </Button>
        }
      />
    );
  }

  return (
    <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : undefined}>
      <TicketTable tickets={data.tickets} showCreator={showCreator} />
      <Pagination pagination={data.pagination} onPageChange={onPageChange} disabled={isPlaceholderData} />
    </div>
  );
}
