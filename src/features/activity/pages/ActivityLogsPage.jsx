import { Link } from 'react-router';
import { ArrowUpRightIcon, HistoryIcon, SearchXIcon, UserRoundIcon, XIcon } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataPanel } from '@/components/data/DataPanel';
import { FilterBar } from '@/components/form/FilterBar';
import { Pagination } from '@/components/data/Pagination';
import { TableSkeleton } from '@/components/data/TableSkeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { RoleBadge } from '@/features/users/components/UserBadges';
import { toApiParams, useUrlFilters } from '@/hooks/useUrlFilters';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useActivityLogs } from '../hooks/useActivityLogs';

const DEFAULTS = { page: '1', limit: '25' };
const ALL = 'all';
const TYPE_LABELS = { Ticket: 'Tickets', User: 'Accounts' };

// userName is only shown in the "Only actions by" chip, never sent to the API
function toLogApiParams(filters) {
  const params = { ...filters };
  delete params.userName;
  return toApiParams(params);
}

// What the action was about: a link to the ticket, or "Account"
function Target({ log }) {
  if (log.targetModel === 'Ticket' && log.target) {
    return (
      <Link
        to={`/tickets/${log.target}`}
        className="inline-flex items-center gap-0.5 font-medium text-primary underline-offset-2 hover:underline"
      >
        Open ticket
        <ArrowUpRightIcon className="size-3.5" aria-hidden />
      </Link>
    );
  }
  if (log.targetModel === 'User') return <span className="text-muted-foreground">Account</span>;
  return <span className="text-muted-foreground">—</span>;
}

// Every important action, newest first (GET /activity-logs).
// Admins never see the superadmin's actions; the superadmin sees everything (backend rule).
export default function ActivityLogsPage() {
  const { filters, setFilters, resetFilters, activeCount } = useUrlFilters(DEFAULTS);
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useActivityLogs(toLogApiParams(filters));

  const showOnly = (person) => setFilters({ user: person._id, userName: person.username });

  let content;
  if (isPending) content = <TableSkeleton rows={8} columns={4} />;
  else if (isError) content = <ErrorState error={error} onRetry={refetch} />;
  else if (data.logs.length === 0) {
    content =
      activeCount > 0 ? (
        <EmptyState
          icon={SearchXIcon}
          title="No action matches these filters"
          action={<Button variant="outline" onClick={resetFilters}>Clear filters</Button>}
        />
      ) : (
        <EmptyState icon={HistoryIcon} title="No activity yet" description="Actions on tickets and accounts will be recorded here." />
      );
  } else {
    content = (
      <div className={cn('transition-opacity duration-200', isPlaceholderData && 'opacity-60')}>
        <Table className="max-md:block">
          <TableHeader className="max-md:hidden">
            <TableRow>
              <TableHead className="w-44">When</TableHead>
              <TableHead className="w-56">Who</TableHead>
              <TableHead>What</TableHead>
              <TableHead className="w-32 text-right">On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="max-md:block">
            {data.logs.map((log) => (
              <TableRow key={log._id} className="max-md:flex max-md:flex-wrap max-md:items-center max-md:gap-x-3 max-md:gap-y-1.5 max-md:py-3.5">
                <TableCell className="text-[13px] text-muted-foreground tabular-nums max-md:order-2 max-md:block max-md:p-0 max-md:text-xs">
                  {formatDateTime(log.timestamp)}
                </TableCell>
                <TableCell className="max-md:order-1 max-md:block max-md:p-0">
                  {log.user ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <Avatar first={log.user.username} seed={log.user._id ?? log.user.username} size="xs" />
                      <button
                        type="button"
                        className="font-medium underline-offset-2 hover:text-primary hover:underline"
                        title={`Show only ${log.user.username}'s actions`}
                        onClick={() => showOnly(log.user)}
                      >
                        {log.user.username}
                      </button>
                      <RoleBadge role={log.user.role} />
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <UserRoundIcon className="size-4" aria-hidden />
                      (deleted account)
                    </span>
                  )}
                </TableCell>
                <TableCell className="min-w-64 whitespace-normal break-words max-md:order-3 max-md:block max-md:min-w-0 max-md:basis-full max-md:p-0">
                  {log.action}
                </TableCell>
                <TableCell className="text-right text-[13px] max-md:order-4 max-md:block max-md:p-0">
                  <Target log={log} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination pagination={data.pagination} onPageChange={(page) => setFilters({ page })} disabled={isPlaceholderData} />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        refreshable
        eyebrow="Administration"
        title="Activity logs"
        description="Every important action, newest first. Click a name to see only that person's actions."
      />
      <DataPanel
        toolbar={
          <FilterBar
            activeCount={activeCount}
            onReset={resetFilters}
            search={
              <Select value={filters.targetModel || ALL} onValueChange={(v) => setFilters({ targetModel: v === ALL ? '' : v })}>
                <SelectTrigger aria-label="Filter by type" className="w-full md:w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All actions</SelectItem>
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          >
            <div className="flex items-center gap-2">
              <Label htmlFor="logs-from" className="shrink-0 text-xs text-muted-foreground">From</Label>
              <Input id="logs-from" type="date" value={filters.from ?? ''} max={filters.to || undefined}
                onChange={(e) => setFilters({ from: e.target.value })} className="md:w-[150px]" />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="logs-to" className="shrink-0 text-xs text-muted-foreground">To</Label>
              <Input id="logs-to" type="date" value={filters.to ?? ''} min={filters.from || undefined}
                onChange={(e) => setFilters({ to: e.target.value })} className="md:w-[150px]" />
            </div>
            {filters.user && (
              <Button variant="secondary" size="sm" onClick={() => setFilters({ user: '', userName: '' })}>
                Only actions by {filters.userName || 'one person'}
                <XIcon />
              </Button>
            )}
          </FilterBar>
        }
      >
        {content}
      </DataPanel>
    </>
  );
}
