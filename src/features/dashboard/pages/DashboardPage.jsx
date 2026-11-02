import { Link } from 'react-router';
import { ClockIcon, InboxIcon, MessageSquareWarningIcon, TimerIcon, UserPlusIcon } from 'lucide-react';
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
import { INTERVAL_LABELS, PERIOD_LABELS, statsParams } from '../periods';
import { useStats } from '../hooks/useStats';
import { StatCard } from '../components/StatCard';
import { ChartCard } from '../components/ChartCard';
import { TimelineChart } from '../components/TimelineChart';
import { BarList } from '../components/BarList';
import { TeamTable } from '../components/TeamTable';

const DEFAULTS = { period: '30d' };

function Choice({ label, value, onChange, options, className = 'w-[160px]' }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
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
    <div className="mb-6 flex flex-wrap items-end gap-2">
      <Choice
        label="Period"
        value={filters.period}
        onChange={(period) => setFilters({ period, from: '', to: '' })}
        options={PERIOD_LABELS}
      />
      {filters.period === 'custom' && (
        <>
          <div className="grid gap-1">
            <Label htmlFor="stats-from" className="text-xs text-muted-foreground">From</Label>
            <Input id="stats-from" type="date" value={filters.from ?? ''} max={filters.to || undefined}
              onChange={(e) => setFilters({ from: e.target.value })} className="w-[160px]" />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="stats-to" className="text-xs text-muted-foreground">To</Label>
            <Input id="stats-to" type="date" value={filters.to ?? ''} min={filters.from || undefined}
              onChange={(e) => setFilters({ to: e.target.value })} className="w-[160px]" />
          </div>
        </>
      )}
      <Choice label="Group by" value={interval} onChange={(value) => setFilters({ interval: value })} options={INTERVAL_LABELS} className="w-[140px]" />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4" aria-busy="true" aria-label="Loading the dashboard">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
      <Skeleton className="h-80" />
    </div>
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
      <div className={`grid gap-6 ${isPlaceholderData ? 'opacity-60 transition-opacity' : ''}`}>
        <section aria-label="Tickets in this period" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Tickets" value={tickets.total} icon={InboxIcon} hint={`${tickets.resolutionRate}% resolved`} />
          <StatCard label="Open" value={tickets.open} hint={`${tickets.unassigned} not assigned`} />
          <StatCard label="In progress" value={tickets.inProgress} />
          <StatCard label="Resolved" value={tickets.resolved} />
        </section>

        <section aria-label="Response times and current work" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="First response (avg.)" value={formatHours(firstResponseTime.averageHours)} icon={ClockIcon} hint={speedHint(firstResponseTime)} />
          <StatCard label="Resolution (avg.)" value={formatHours(resolutionTime.averageHours)} icon={TimerIcon} hint={speedHint(resolutionTime)} />
          <StatCard
            label="Needs reply now"
            value={summary?.needsReply ?? '—'}
            icon={MessageSquareWarningIcon}
            emphasis={!!summary?.needsReply}
            hint={<Link to="/admin/tickets?awaitingSupport=true" className="underline underline-offset-2">Open the list</Link>}
          />
        </section>

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

        <section aria-label="Accounts" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Accounts" value={users.total} hint={`${users.byRole.user} users · ${users.byRole.admin} admins · ${users.byRole.superadmin} superadmin`} />
          <StatCard
            label="Waiting for activation"
            value={users.pendingActivation}
            icon={UserPlusIcon}
            emphasis={users.pendingActivation > 0}
            hint={<Link to="/admin/users/pending" className="underline underline-offset-2">Pending accounts</Link>}
          />
        </section>
      </div>
    );
  }

  return (
    <>
      <PageHeader refreshable title="Dashboard" description="Overview of the support activity." />
      <PeriodFilters filters={filters} setFilters={setFilters} interval={params.interval} />
      {content}
    </>
  );
}
