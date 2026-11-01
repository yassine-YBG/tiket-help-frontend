import { useEffect, useState } from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { PRIORITY_LABELS, STATUS_LABELS, TICKET_PRIORITIES, TICKET_STATUSES } from '@/lib/constants';

const ALL = 'all'; // Radix Select needs a non-empty value for "no filter"

const SORT_LABELS = { priority: 'Sort: Priority', newest: 'Sort: Newest first', oldest: 'Sort: Oldest first' };

// Search + status + priority + sort. Values live in the URL (useUrlFilters).
export function TicketFilters({ filters, setFilters, resetFilters, activeCount, children }) {
  // the search box updates instantly; the URL (and the request) waits 300 ms
  const urlSearch = filters.search ?? '';
  const [search, setSearch] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(search, 300);

  // URL changed from elsewhere (clear filters, back button): show it in the box.
  // Done during render, as React recommends, instead of in an effect.
  const [previousUrlSearch, setPreviousUrlSearch] = useState(urlSearch);
  if (urlSearch !== previousUrlSearch) {
    setPreviousUrlSearch(urlSearch);
    if (urlSearch !== search.trim()) setSearch(urlSearch);
  }

  // the user stopped typing: write the search into the URL (this triggers the request)
  useEffect(() => {
    const value = debouncedSearch.trim();
    if (value !== urlSearch) setFilters({ search: value }, { replace: true });
    // only react to what the user typed, not to URL changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const selectFilter = (key) => (value) => setFilters({ [key]: value === ALL ? '' : value });

  return (
    <div className="flex flex-wrap items-center gap-2" role="search">
      <div className="relative w-full sm:w-64">
        <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search subject or description…"
          aria-label="Search tickets"
          value={search}
          maxLength={100}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <Select value={filters.status || ALL} onValueChange={selectFilter('status')}>
        <SelectTrigger aria-label="Filter by status" className="w-[150px]">
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
        <SelectTrigger aria-label="Filter by priority" className="w-[150px]">
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

      <Select value={filters.sort} onValueChange={(value) => setFilters({ sort: value })}>
        <SelectTrigger aria-label="Sort tickets" className="w-[180px]">
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

      {children}

      {activeCount > 0 && (
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <XIcon />
          Clear filters
        </Button>
      )}
    </div>
  );
}
