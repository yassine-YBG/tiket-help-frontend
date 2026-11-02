import { InboxIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataPanel } from '@/components/data/DataPanel';
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

// values of the backend ?archived= filter (no value = archived tickets hidden)
const HIDE_ARCHIVED = 'hide';
const ARCHIVED_OPTIONS = [
  [HIDE_ARCHIVED, 'Hide archived'],
  ['only', 'Archived only'],
  ['include', 'Include archived'],
];

function ArchivedFilter({ value, onChange }) {
  return (
    <Select value={value || HIDE_ARCHIVED} onValueChange={(next) => onChange(next === HIDE_ARCHIVED ? '' : next)}>
      <SelectTrigger aria-label="Archived tickets" className="w-[150px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ARCHIVED_OPTIONS.map(([option, label]) => (
          <SelectItem key={option} value={option}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// "Needs reply" = the user wrote last and support has not answered (?awaitingSupport=true)
function NeedsReplyFilter({ value, onChange }) {
  return (
    <Select value={value === 'true' ? 'true' : ANYONE} onValueChange={(next) => onChange(next === ANYONE ? '' : next)}>
      <SelectTrigger aria-label="Filter by reply" className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ANYONE}>All replies</SelectItem>
        <SelectItem value="true">Needs reply</SelectItem>
      </SelectContent>
    </Select>
  );
}

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
      <PageHeader
        refreshable
        eyebrow="Support console"
        title="All tickets"
        description="Every ticket: filter, assign and resolve. Archived tickets are hidden unless you ask for them."
      />
      <DataPanel
        toolbar={
          <TicketFilters
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
            activeCount={activeCount}
          >
            <NeedsReplyFilter
              value={filters.awaitingSupport}
              onChange={(awaitingSupport) => setFilters({ awaitingSupport })}
            />
            <AssigneeFilter value={filters.handledBy} onChange={(handledBy) => setFilters({ handledBy })} />
            <ArchivedFilter value={filters.archived} onChange={(archived) => setFilters({ archived })} />
          </TicketFilters>
        }
      >
        <TicketListBody
          query={query}
          activeCount={activeCount}
          resetFilters={resetFilters}
          onPageChange={(page) => setFilters({ page })}
          adminView
          emptyState={
            <EmptyState icon={InboxIcon} title="No tickets yet" description="New tickets from users will appear here." />
          }
        />
      </DataPanel>
    </>
  );
}
