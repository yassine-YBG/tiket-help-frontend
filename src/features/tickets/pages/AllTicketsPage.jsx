import { InboxIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { toApiParams, useUrlFilters } from '@/hooks/useUrlFilters';
import { useTicketList } from '../hooks/useTickets';
import { TicketFilters } from '../components/TicketFilters';
import { TicketListBody } from '../components/TicketListBody';

// Support sees the most important tickets first
const DEFAULTS = { page: '1', limit: '20', sort: 'priority' };

const ANYONE = 'all'; // Radix Select needs a non-empty value for "no filter"
// values of the backend ?handledBy= filter
const ASSIGNEE_OPTIONS = [
  [ANYONE, 'Anyone assigned'],
  ['me', 'Assigned to me'],
  ['none', 'Not assigned'],
];

function AssigneeFilter({ value, onChange }) {
  return (
    <Select value={value || ANYONE} onValueChange={(next) => onChange(next === ANYONE ? '' : next)}>
      <SelectTrigger aria-label="Filter by assignee" className="w-[160px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ASSIGNEE_OPTIONS.map(([option, label]) => (
          <SelectItem key={option} value={option}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Admin list: every ticket of every user (GET /tickets, admins only)
export default function AllTicketsPage() {
  const { filters, setFilters, resetFilters, activeCount } = useUrlFilters(DEFAULTS);
  const query = useTicketList('all', toApiParams(filters));

  return (
    <>
      <PageHeader title="All tickets" description="Every ticket: filter, assign and resolve." />
      <Card className="gap-4 py-4">
        <CardContent className="grid gap-4 px-4">
          <TicketFilters
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
            activeCount={activeCount}
          >
            <AssigneeFilter value={filters.handledBy} onChange={(handledBy) => setFilters({ handledBy })} />
          </TicketFilters>
          <TicketListBody
            query={query}
            activeCount={activeCount}
            resetFilters={resetFilters}
            onPageChange={(page) => setFilters({ page })}
            showCreator
            emptyState={
              <EmptyState icon={InboxIcon} title="No tickets yet" description="New tickets from users will appear here." />
            }
          />
        </CardContent>
      </Card>
    </>
  );
}
