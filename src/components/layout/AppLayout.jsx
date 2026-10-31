import { useState } from 'react';
import { Outlet } from 'react-router';
import { XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

// Frame of every logged-in page: sidebar on the left, top bar, page content.
// On small screens the sidebar opens as an overlay from the menu button.
export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-svh md:grid md:grid-cols-[15rem_1fr]">
      <aside className="hidden border-r md:block">
        <div className="sticky top-0 h-svh">
          <Sidebar />
        </div>
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 border-r shadow-lg">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-3"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <XIcon />
            </Button>
            <Sidebar onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <Topbar onOpenMenu={() => setMenuOpen(true)} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
