import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DebouncedSearch } from '@/components/form/DebouncedSearch';
import { FilterBar } from '@/components/form/FilterBar';
import { PRIORITY_LABELS, STATUS_LABELS, TICKET_PRIORITIES, TICKET_STATUSES } from '@/lib/constants';

const ALL = 'all'; // Radix Select needs a non-empty value for "no filter"

const SORT_LABELS = { priority: 'Sort: Priority', newest: 'Sort: Newest first', oldest: 'Sort: Oldest first' };

// Search + status + priority + sort. Values live in the URL (useUrlFilters).
// children: extra filters of the admin list.
export function TicketFilters({ filters, setFilters, resetFilters, activeCount, children }) {
  const selectFilter = (key) => (value) => setFilters({ [key]: value === ALL ? '' : value });

  return (
    <FilterBar
      activeCount={activeCount}
      onReset={resetFilters}
      search={
        <DebouncedSearch
          value={filters.search ?? ''}
          onCommit={(search) => setFilters({ search }, { replace: true })}
          label="Search tickets"
          placeholder="Search subject or description…"
        />
      }
    >
      <Select value={filters.status || ALL} onValueChange={selectFilter('status')}>
        <SelectTrigger aria-label="Filter by status" className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          {TICKET_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.priority || ALL} onValueChange={selectFilter('priority')}>
        <SelectTrigger aria-label="Filter by priority" className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All priorities</SelectItem>
          {TICKET_PRIORITIES.map((p) => (
            <SelectItem key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {children}

      <Select value={filters.sort} onValueChange={(value) => setFilters({ sort: value })}>
        <SelectTrigger aria-label="Sort tickets" className="w-[170px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(SORT_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterBar>
  );
}
