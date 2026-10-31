import { NavLink } from 'react-router';
import { TicketIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/useAuth';
import { visibleSections } from './navigation';

export function Sidebar({ onNavigate }) {
  const { user } = useAuth();

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
          {section.items.map(({ to, label, icon: Icon, end }) => (
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
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}
