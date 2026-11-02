import { NavLink } from 'react-router';
import { MenuIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/useAuth';
import { useTicketSummary } from '@/features/tickets/hooks/useTickets';
import { COUNTER_LABELS, tabItems } from './navigation';

const tabClass =
  'pressable relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[11px] font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40';

// Phone navigation: native-style tab bar pinned above the home indicator.
// "More" opens the full menu (every page, account, log out).
export function MobileTabBar({ onOpenMenu }) {
  const { user } = useAuth();
  const { data: summary } = useTicketSummary({ enabled: !!user });

  return (
    <nav
      aria-label="Quick navigation"
      className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 backdrop-blur-xl backdrop-saturate-150 md:hidden"
    >
      <div className="mx-auto flex h-(--tabbar-height) max-w-lg items-stretch gap-1 px-2">
        {tabItems(user).map(({ to, short, label, icon: Icon, end, counter }) => {
          const count = counter ? summary?.[counter] : 0;
          return (
            <NavLink
              key={to}
              to={to}
              end={end ?? to === '/tickets/new'}
              aria-label={label}
              className={({ isActive }) => cn(tabClass, isActive ? 'text-primary' : 'text-muted-foreground')}
            >
              <span className="relative">
                <Icon className="size-[22px]" strokeWidth={1.9} />
                {count > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-4 rounded-full bg-destructive px-1 text-center text-[10px] leading-4 font-semibold text-white ring-2 ring-background">
                    {count > 99 ? '99+' : count}
                    <span className="sr-only"> — {COUNTER_LABELS[counter](count)}</span>
                  </span>
                )}
              </span>
              <span className="max-w-full truncate">{short}</span>
            </NavLink>
          );
        })}
        <button type="button" onClick={onOpenMenu} className={cn(tabClass, 'text-muted-foreground')} aria-label="Open menu">
          <MenuIcon className="size-[22px]" strokeWidth={1.9} />
          <span>More</span>
        </button>
      </div>
    </nav>
  );
}
