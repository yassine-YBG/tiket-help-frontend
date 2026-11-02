import { Link, NavLink } from 'react-router';
import { LogOutIcon, MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Logo } from '@/components/brand/Logo';
import { useAuth } from '@/features/auth/useAuth';
import { useTicketSummary } from '@/features/tickets/hooks/useTickets';
import { ROLE_LABELS, isAdmin } from '@/lib/constants';
import { useTheme } from '@/lib/theme';
import { COUNTER_LABELS, visibleSections } from './navigation';
import { ThemeItems } from './UserMenu';

// Number next to a menu item (hidden when 0). Red = someone is waiting.
function Counter({ name, value }) {
  if (!value) return null;
  return (
    <span
      className="ml-auto min-w-5 rounded-full bg-destructive px-1.5 text-center text-[11px] leading-5 font-semibold text-white tabular-nums"
      aria-label={COUNTER_LABELS[name](value)}
      title={COUNTER_LABELS[name](value)}
    >
      {value > 99 ? '99+' : value}
    </span>
  );
}

const THEME_ICONS = { light: SunIcon, dark: MoonIcon, system: MonitorIcon };

function ThemeButton() {
  const { theme } = useTheme();
  const Icon = THEME_ICONS[theme];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" aria-label="Change theme">
          <Icon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-44">
        <ThemeItems />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Who is logged in + theme + log out, at the bottom of the sidebar
function AccountFooter({ onNavigate }) {
  const { user, logout } = useAuth();
  return (
    <div className="flex items-center gap-1 border-t border-sidebar-border pt-3">
      <Link
        to="/profile"
        onClick={onNavigate}
        className="pressable flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-1.5 hover:bg-sidebar-accent"
        title="Your profile"
      >
        <Avatar first={user.username} last={user.lastname} seed={user.email} size="sm" />
        <span className="grid min-w-0 leading-tight">
          <span className="truncate text-[13px] font-medium text-foreground">
            {user.username} {user.lastname}
          </span>
          <span className="truncate text-xs text-muted-foreground" title={`${ROLE_LABELS[user.role]} · ${user.email}`}>
            {user.email}
          </span>
        </span>
      </Link>
      <ThemeButton />
      <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" onClick={logout} aria-label="Log out" title="Log out">
        <LogOutIcon />
      </Button>
    </div>
  );
}

export function Sidebar({ onNavigate }) {
  const { user } = useAuth();
  const { data: summary } = useTicketSummary({ enabled: !!user });

  return (
    <div className="flex h-full flex-col gap-5 bg-sidebar px-3 pt-4 pb-3 text-sidebar-foreground">
      <Link to="/" onClick={onNavigate} className="rounded-lg px-1.5 py-1 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40">
        <Logo subtitle={isAdmin(user) ? 'Support console' : 'Customer support'} />
      </Link>

      <nav className="-mx-1 flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-1" aria-label="Main">
        {visibleSections(user).map((section) => (
          <div key={section.title} className="grid gap-0.5">
            <p className="px-2.5 pb-1.5 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
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
                    'group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium transition-colors duration-150 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
                    isActive
                      ? 'bg-card text-foreground shadow-panel'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn('size-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                    {label}
                    {counter && <Counter name={counter} value={summary?.[counter]} />}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {user && <AccountFooter onNavigate={onNavigate} />}
    </div>
  );
}
