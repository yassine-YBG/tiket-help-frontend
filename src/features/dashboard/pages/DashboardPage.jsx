import { Link } from 'react-router';
import {
  ArrowRightIcon,
  CircleCheckIcon,
  CircleDotIcon,
  ClockIcon,
  InboxIcon,
  LoaderIcon,
  MessageSquareWarningIcon,
  TimerIcon,
  UserPlusIcon,
  UsersIcon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/layout/PageHeader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useAuth } from '@/features/auth/useAuth';
import { useTicketSummary } from '@/features/tickets/hooks/useTickets';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { PRIORITY_LABELS, ROLES, TICKET_PRIORITIES } from '@/lib/constants';
import { formatHours } from '@/lib/format';
import { cn } from '@/lib/utils';
import { INTERVAL_LABELS, PERIOD_LABELS, statsParams } from '../periods';
import { useStats } from '../hooks/useStats';
import { StatCard, StatGroup } from '../components/StatCard';
import { ChartCard } from '../components/ChartCard';
import { TimelineChart } from '../components/TimelineChart';
import { BarList } from '../components/BarList';
import { TeamTable } from '../components/TeamTable';

const DEFAULTS = { period: '30d' };

function Choice({ label, value, onChange, options, className = 'w-[150px]' }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {Object.entries(options).map(([key, text]) => (
          <SelectItem key={key} value={key}>
            {text}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function PeriodFilters({ filters, setFilters, interval }) {
  return (
    <div className="flex flex-wrap items-end gap-2">
      {filters.period === 'custom' && (
        <>
          <div className="grid gap-1">
            <Label htmlFor="stats-from" className="text-xs text-muted-foreground">From</Label>
            <Input id="stats-from" type="date" value={filters.from ?? ''} max={filters.to || undefined}
              onChange={(e) => setFilters({ from: e.target.value })} className="w-[150px]" />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="stats-to" className="text-xs text-muted-foreground">To</Label>
            <Input id="stats-to" type="date" value={filters.to ?? ''} min={filters.from || undefined}
              onChange={(e) => setFilters({ to: e.target.value })} className="w-[150px]" />
          </div>
        </>
      )}
      <Choice
        label="Period"
        value={filters.period}
        onChange={(period) => setFilters({ period, from: '', to: '' })}
        options={PERIOD_LABELS}
      />
      <Choice label="Group by" value={interval} onChange={(value) => setFilters({ interval: value })} options={INTERVAL_LABELS} className="w-[130px]" />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-6" aria-busy="true" aria-label="Loading the dashboard">
      <Skeleton className="h-28 rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}

// "Needs reply now": the one number that asks for action, shown as a call to action
function NeedsReplyCallout({ count }) {
  const waiting = !!count;
  return (
    <Link
      to="/admin/tickets?awaitingSupport=true"
      data-slot="card"
      className={cn(
        'pressable group flex items-center gap-4 rounded-xl border p-4 shadow-xs sm:p-5',
        waiting ? 'border-danger/25 bg-danger-soft/50 hover:bg-danger-soft/70' : 'bg-card hover:bg-accent/50'
      )}
    >
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-lg',
          waiting ? 'bg-danger text-white' : 'bg-success-soft text-success'
        )}
      >
        {waiting ? <MessageSquareWarningIcon className="size-5" /> : <CircleCheckIcon className="size-5" />}
      </span>
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span className="text-[13px] font-medium text-muted-foreground">Needs reply now</span>
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className={cn('text-2xl leading-tight font-semibold tabular-nums', waiting && 'text-danger')}>
            {count ?? '—'}
          </span>
          {count != null && (
            <span className="text-[13px] text-muted-foreground">
              {waiting
                ? `${count === 1 ? 'customer is' : 'customers are'} waiting for an answer`
                : 'every customer has an answer'}
            </span>
          )}
        </span>
      </span>
      <span className="hidden items-center gap-1 text-[13px] font-medium text-primary sm:flex">
        Open the list
        <ArrowRightIcon className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

// Overview of the support activity (GET /stats). Admins and the superadmin;
// the team table only comes back from the backend for the superadmin.
export default function DashboardPage() {
  const { user } = useAuth();
  const { filters, setFilters } = useUrlFilters(DEFAULTS);
  const params = statsParams(filters);
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useStats(params);
  const { data: summary } = useTicketSummary();

  let content;
  if (isPending) content = <DashboardSkeleton />;
  else if (isError) content = <ErrorState error={error} onRetry={refetch} />;
  else {
    const { tickets, resolutionTime, firstResponseTime, users } = data;
    const priorities = [...TICKET_PRIORITIES].reverse().map((p) => ({ label: PRIORITY_LABELS[p], value: data.byPriority[p] }));
    const categories = data.byCategory.map((c) => ({ label: c.category, value: c.count }));
    const speedHint = (s) => (s.count ? `Fastest ${formatHours(s.fastestHours)} · slowest ${formatHours(s.slowestHours)}` : 'No data yet');

    content = (
      <div className={cn('grid gap-6 transition-opacity duration-200', isPlaceholderData && 'opacity-60')}>
        <NeedsReplyCallout count={summary?.needsReply} />

        <StatGroup label="Tickets in this period" className="grid-cols-2 lg:grid-cols-4">
          <StatCard label="Tickets" value={tickets.total} icon={InboxIcon} hint={`${tickets.resolutionRate}% resolved`} />
          <StatCard label="Open" value={tickets.open} icon={CircleDotIcon} hint={`${tickets.unassigned} not assigned`} />
          <StatCard label="In progress" value={tickets.inProgress} icon={LoaderIcon} />
          <StatCard label="Resolved" value={tickets.resolved} icon={CircleCheckIcon} />
        </StatGroup>

        <StatGroup label="Response times" className="grid-cols-1 sm:grid-cols-2">
          <StatCard label="First response (avg.)" value={formatHours(firstResponseTime.averageHours)} icon={ClockIcon} hint={speedHint(firstResponseTime)} />
          <StatCard label="Resolution (avg.)" value={formatHours(resolutionTime.averageHours)} icon={TimerIcon} hint={speedHint(resolutionTime)} />
        </StatGroup>

        <ChartCard title="Created vs resolved" description={`${INTERVAL_LABELS[params.interval]} · tickets created in this period and how many of them are resolved`}>
          <TimelineChart data={data.timeline} />
        </ChartCard>

        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="By priority">
            <BarList items={priorities} label="Tickets by priority" />
          </ChartCard>
          <ChartCard title="Top categories">
            <BarList items={categories} label="Tickets by category" />
          </ChartCard>
        </div>

        {user?.role === ROLES.SUPERADMIN && (
          <ChartCard title="Team" description="Tickets handled and resolved by each admin in this period (visible to the superadmin only)">
            <TeamTable rows={data.byAdmin} />
          </ChartCard>
        )}

        <StatGroup label="Accounts" className="grid-cols-1 sm:grid-cols-2">
          <StatCard label="Accounts" value={users.total} icon={UsersIcon} hint={`${users.byRole.user} users · ${users.byRole.admin} admins · ${users.byRole.superadmin} superadmin`} />
          <StatCard
            label="Waiting for activation"
            value={users.pendingActivation}
            icon={UserPlusIcon}
            emphasis={users.pendingActivation > 0}
            hint={<Link to="/admin/users/pending" className="underline-offset-2 hover:underline">Pending accounts</Link>}
          />
        </StatGroup>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        refreshable
        eyebrow="Support console"
        title="Dashboard"
        description="Overview of the support activity."
        actions={<PeriodFilters filters={filters} setFilters={setFilters} interval={params.interval} />}
      />
      {content}
    </>
  );
}
