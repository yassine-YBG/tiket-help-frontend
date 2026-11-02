import { Link } from 'react-router';
import { HistoryIcon, SearchXIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/layout/PageHeader';
import { Pagination } from '@/components/data/Pagination';
import { TableSkeleton } from '@/components/data/TableSkeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { RoleBadge } from '@/features/users/components/UserBadges';
import { toApiParams, useUrlFilters } from '@/hooks/useUrlFilters';
import { formatDateTime } from '@/lib/format';
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
      <Link to={`/tickets/${log.target}`} className="text-primary underline-offset-2 hover:underline">
        Open ticket
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
        <EmptyState icon={HistoryIcon} title="No activity yet" />
      );
  } else {
    content = (
      <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : undefined}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">When</TableHead>
              <TableHead className="w-48">Who</TableHead>
              <TableHead>What</TableHead>
              <TableHead className="hidden w-28 md:table-cell">On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.logs.map((log) => (
              <TableRow key={log._id}>
                <TableCell className="text-muted-foreground tabular-nums">{formatDateTime(log.timestamp)}</TableCell>
                <TableCell>
                  {log.user ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className="font-medium hover:underline"
                        title={`Show only ${log.user.username}'s actions`}
                        onClick={() => showOnly(log.user)}
                      >
                        {log.user.username}
                      </button>
                      <RoleBadge role={log.user.role} />
                    </div>
                  ) : (
                    <span className="text-muted-foreground">(deleted account)</span>
                  )}
                </TableCell>
                <TableCell className="min-w-64 whitespace-normal break-words">{log.action}</TableCell>
                <TableCell className="hidden md:table-cell">
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
        title="Activity logs"
        description="Every important action, newest first. Click a name to see only that person's actions."
      />
      <Card className="gap-4 py-4">
        <CardContent className="grid gap-4 px-4">
          <div className="flex flex-wrap items-end gap-2" role="search">
            <Select value={filters.targetModel || ALL} onValueChange={(v) => setFilters({ targetModel: v === ALL ? '' : v })}>
              <SelectTrigger aria-label="Filter by type" className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All actions</SelectItem>
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid gap-1">
              <Label htmlFor="logs-from" className="text-xs text-muted-foreground">From</Label>
              <Input id="logs-from" type="date" value={filters.from ?? ''} max={filters.to || undefined}
                onChange={(e) => setFilters({ from: e.target.value })} className="w-[160px]" />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="logs-to" className="text-xs text-muted-foreground">To</Label>
              <Input id="logs-to" type="date" value={filters.to ?? ''} min={filters.from || undefined}
                onChange={(e) => setFilters({ to: e.target.value })} className="w-[160px]" />
            </div>
            {filters.user && (
              <Button variant="secondary" size="sm" onClick={() => setFilters({ user: '', userName: '' })}>
                Only actions by {filters.userName || 'one person'}
                <XIcon />
              </Button>
            )}
            {activeCount > 0 && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <XIcon />
                Clear filters
              </Button>
            )}
          </div>
          {content}
        </CardContent>
      </Card>
    </>
  );
}
