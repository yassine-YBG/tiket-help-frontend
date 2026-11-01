import { Link } from 'react-router';
import { PlusIcon, SearchXIcon, TicketIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { Pagination } from '@/components/data/Pagination';
import { TableSkeleton } from '@/components/data/TableSkeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { toApiParams, useUrlFilters } from '@/hooks/useUrlFilters';
import { useTicketList } from '../hooks/useTickets';
import { TicketFilters } from '../components/TicketFilters';
import { TicketTable } from '../components/TicketTable';

const DEFAULTS = { page: '1', limit: '20', sort: 'priority' };

export default function MyTicketsPage() {
  const { filters, setFilters, resetFilters, activeCount } = useUrlFilters(DEFAULTS);
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useTicketList('mine', toApiParams(filters));

  const newTicketButton = (
    <Button asChild>
      <Link to="/tickets/new">
        <PlusIcon />
        New ticket
      </Link>
    </Button>
  );

  let content;
  if (isPending) {
    content = <TableSkeleton rows={6} columns={5} />;
  } else if (isError) {
    content = <ErrorState error={error} onRetry={refetch} />;
  } else if (data.tickets.length === 0) {
    content =
      activeCount > 0 ? (
        <EmptyState
          icon={SearchXIcon}
          title="No ticket matches these filters"
          action={
            <Button variant="outline" onClick={resetFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={TicketIcon}
          title="You have no tickets yet"
          description="Open a ticket and the support team will help you."
          action={newTicketButton}
        />
      );
  } else {
    content = (
      <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : undefined}>
        <TicketTable tickets={data.tickets} />
        <Pagination
          pagination={data.pagination}
          onPageChange={(page) => setFilters({ page })}
          disabled={isPlaceholderData}
        />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="My tickets"
        description="Follow the tickets you have opened."
        actions={newTicketButton}
      />
      <Card className="gap-4 py-4">
        <CardContent className="grid gap-4 px-4">
          <TicketFilters
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
            activeCount={activeCount}
          />
          {content}
        </CardContent>
      </Card>
    </>
  );
}
