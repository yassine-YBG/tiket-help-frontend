import { Link } from 'react-router';
import { PlusIcon, TicketIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { toApiParams, useUrlFilters } from '@/hooks/useUrlFilters';
import { useTicketList } from '../hooks/useTickets';
import { TicketFilters } from '../components/TicketFilters';
import { TicketListBody } from '../components/TicketListBody';

const DEFAULTS = { page: '1', limit: '20', sort: 'priority' };

export default function MyTicketsPage() {
  const { filters, setFilters, resetFilters, activeCount } = useUrlFilters(DEFAULTS);
  const query = useTicketList('mine', toApiParams(filters));

  const newTicketButton = (
    <Button asChild>
      <Link to="/tickets/new">
        <PlusIcon />
        New ticket
      </Link>
    </Button>
  );

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
          <TicketListBody
            query={query}
            activeCount={activeCount}
            resetFilters={resetFilters}
            onPageChange={(page) => setFilters({ page })}
            emptyState={
              <EmptyState
                icon={TicketIcon}
                title="You have no tickets yet"
                description="Open a ticket and the support team will help you."
                action={newTicketButton}
              />
            }
          />
        </CardContent>
      </Card>
    </>
  );
}
