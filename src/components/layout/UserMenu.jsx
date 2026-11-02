import { Link } from 'react-router';
import { LogOutIcon, MonitorIcon, MoonIcon, SunIcon, UserCircleIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/features/auth/useAuth';
import { ROLE_LABELS } from '@/lib/constants';
import { useTheme } from '@/lib/theme';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
  { value: 'system', label: 'System', icon: MonitorIcon },
];

// Theme choice, shared by the account menu
export function ThemeItems() {
  const { theme, setTheme } = useTheme();
  return (
    <>
      <DropdownMenuLabel>Appearance</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
          <DropdownMenuRadioItem key={value} value={value}>
            <Icon />
            {label}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </>
  );
}

// Account menu (phone top bar): who is logged in, profile, theme, log out
export function UserMenu() {
  const { user, logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="pressable flex size-10 items-center justify-center rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
        aria-label="Account menu"
      >
        <Avatar first={user.username} last={user.lastname} seed={user.email} size="sm" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="flex items-center gap-3 px-2.5 py-2">
          <Avatar first={user.username} last={user.lastname} seed={user.email} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {user.username} {user.lastname}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <p className="px-2.5 pb-2 text-xs text-muted-foreground">{ROLE_LABELS[user.role]} account</p>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <UserCircleIcon />
            Profile & security
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <ThemeItems />
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={logout}>
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
