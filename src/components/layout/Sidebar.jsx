import { NavLink } from 'react-router';
import { TicketIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/useAuth';
import { useTicketSummary } from '@/features/tickets/hooks/useTickets';
import { visibleSections } from './navigation';

const COUNTER_LABELS = {
  newAnswers: (n) => `${n} ticket${n > 1 ? 's' : ''} with a new answer`,
  needsReply: (n) => `${n} ticket${n > 1 ? 's' : ''} waiting for a support reply`,
};

// Small red number next to a menu item (hidden when 0)
function Counter({ name, value }) {
  if (!value) return null;
  return (
    <span
      className="ml-auto min-w-5 rounded-full bg-destructive px-1.5 text-center text-xs font-semibold leading-5 text-white"
      aria-label={COUNTER_LABELS[name](value)}
      title={COUNTER_LABELS[name](value)}
    >
      {value > 99 ? '99+' : value}
    </span>
  );
}

export function Sidebar({ onNavigate }) {
  const { user } = useAuth();
  const { data: summary } = useTicketSummary({ enabled: !!user });

  return (
    <nav className="flex h-full flex-col gap-6 bg-sidebar px-3 py-4 text-sidebar-foreground" aria-label="Main">
      <div className="flex items-center gap-2 px-2 text-base font-semibold">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <TicketIcon className="size-4" />
        </div>
        Tiket Help
      </div>

      {visibleSections(user).map((section) => (
        <div key={section.title} className="grid gap-1">
          <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {section.title}
          </p>
          {section.items.map(({ to, label, icon: Icon, end, counter }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isActive && 'bg-primary/10 text-sidebar-primary hover:bg-primary/15 hover:text-sidebar-primary'
                )
              }
            >
              <Icon className="size-4" />
              {label}
              {counter && <Counter name={counter} value={summary?.[counter]} />}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}
