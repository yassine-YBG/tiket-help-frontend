import { LogOutIcon, MenuIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/features/auth/useAuth';
import { ROLE_LABELS } from '@/lib/constants';
import { RefreshButton } from './RefreshButton';

export function Topbar({ onOpenMenu }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenMenu} aria-label="Open menu">
        <MenuIcon />
      </Button>

      <div className="ml-auto flex items-center gap-3">
        <RefreshButton />
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-tight">
            {user.username} {user.lastname}
          </p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <Badge variant={user.role === 'user' ? 'secondary' : 'default'}>{ROLE_LABELS[user.role]}</Badge>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOutIcon />
          <span className="hidden sm:inline">Log out</span>
        </Button>
      </div>
    </header>
  );
}
