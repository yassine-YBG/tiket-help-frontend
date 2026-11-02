import { Link, useLocation } from 'react-router';
import { LogoMark } from '@/components/brand/Logo';
import { pageTitle } from './navigation';
import { UserMenu } from './UserMenu';

// Phone / small tablet top bar: brand, page title, account menu.
// (On larger screens the sidebar carries all of this.)
export function Topbar() {
  const { pathname } = useLocation();

  return (
    <header className="pt-safe sticky top-0 z-30 border-b bg-background/85 backdrop-blur-xl backdrop-saturate-150 md:hidden">
      <div className="flex h-14 items-center gap-3 px-4">
        <Link to="/" aria-label="Tiket Help home" className="pressable rounded-lg">
          <LogoMark />
        </Link>
        <p className="min-w-0 flex-1 truncate text-[15px] font-semibold tracking-tight">{pageTitle(pathname)}</p>
        <UserMenu />
      </div>
    </header>
  );
}
