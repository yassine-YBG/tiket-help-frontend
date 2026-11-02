import { SearchXIcon, UsersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataPanel } from '@/components/data/DataPanel';
import { DebouncedSearch } from '@/components/form/DebouncedSearch';
import { FilterBar } from '@/components/form/FilterBar';
import { Pagination } from '@/components/data/Pagination';
import { TableSkeleton } from '@/components/data/TableSkeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { toApiParams, useUrlFilters } from '@/hooks/useUrlFilters';
import { ROLE_LABELS, ROLES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useUserList } from '../hooks/useUsers';
import { UsersTable } from '../components/UsersTable';

const DEFAULTS = { page: '1', limit: '20', sort: 'newest' };
const ALL = 'all'; // Radix Select needs a non-empty value for "no filter"

// "status" exists only in the URL; the backend uses activated / deleted
const STATUS_PARAMS = {
  active: { activated: 'true' },
  inactive: { activated: 'false' },
  deleted: { deleted: 'true' },
};
const STATUS_LABELS = { active: 'Active', inactive: 'Inactive', deleted: 'Deleted' };
const SORT_LABELS = { newest: 'Sort: Newest first', oldest: 'Sort: Oldest first', name: 'Sort: Name' };

function toUserApiParams({ status, ...filters }) {
  return toApiParams({ ...filters, ...(STATUS_PARAMS[status] ?? {}) });
}

function FilterSelect({ label, value, onChange, allLabel, options, className = 'w-[140px]' }) {
  return (
    <Select value={value || ALL} onValueChange={(next) => onChange(next === ALL ? '' : next)}>
      <SelectTrigger aria-label={label} className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {allLabel && <SelectItem value={ALL}>{allLabel}</SelectItem>}
        {Object.entries(options).map(([value, text]) => (
          <SelectItem key={value} value={value}>
            {text}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Every account (GET /auth/users, admins only). Actions follow the backend rules:
// admins manage "user" accounts; the superadmin manages everyone and changes roles.
export default function UsersPage() {
  const { filters, setFilters, resetFilters, activeCount } = useUrlFilters(DEFAULTS);
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useUserList(toUserApiParams(filters));

  let content;
  if (isPending) content = <TableSkeleton rows={6} columns={5} />;
  else if (isError) content = <ErrorState error={error} onRetry={refetch} />;
  else if (data.users.length === 0) {
    content =
      activeCount > 0 ? (
        <EmptyState
          icon={SearchXIcon}
          title="No account matches these filters"
          description="Try another name or remove a filter."
          action={<Button variant="outline" onClick={resetFilters}>Clear filters</Button>}
        />
      ) : (
        <EmptyState icon={UsersIcon} title="No accounts yet" />
      );
  } else {
    content = (
      <div className={cn('transition-opacity duration-200', isPlaceholderData && 'opacity-60')}>
        <UsersTable users={data.users} />
        <Pagination pagination={data.pagination} onPageChange={(page) => setFilters({ page })} disabled={isPlaceholderData} />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        refreshable
        eyebrow="Administration"
        title="Users"
        description="Every account: activate, deactivate, delete or restore. Only the superadmin changes roles."
      />
      <DataPanel
        toolbar={
          <FilterBar
            activeCount={activeCount}
            onReset={resetFilters}
            search={
              <DebouncedSearch
                value={filters.search ?? ''}
                onCommit={(search) => setFilters({ search }, { replace: true })}
                label="Search users"
                placeholder="Search name or email…"
              />
            }
          >
            <FilterSelect
              label="Filter by role"
              value={filters.role}
              onChange={(role) => setFilters({ role })}
              allLabel="All roles"
              options={Object.fromEntries(Object.values(ROLES).map((r) => [r, ROLE_LABELS[r]]))}
            />
            <FilterSelect
              label="Filter by account status"
              value={filters.status}
              onChange={(status) => setFilters({ status })}
              allLabel="All accounts"
              options={STATUS_LABELS}
            />
            <FilterSelect
              label="Sort users"
              value={filters.sort}
              onChange={(sort) => setFilters({ sort: sort || DEFAULTS.sort })}
              options={SORT_LABELS}
              className="w-[170px]"
            />
          </FilterBar>
        }
      >
        {content}
      </DataPanel>
    </>
  );
}
