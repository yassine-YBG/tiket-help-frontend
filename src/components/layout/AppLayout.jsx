import { useState } from 'react';
import { Outlet } from 'react-router';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileTabBar } from './MobileTabBar';

// Frame of every logged-in page.
//  - tablet / desktop (md+): fixed sidebar on the canvas, the page in a raised panel
//  - phone: top bar + bottom tab bar; "More" opens the full menu as a drawer
export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-canvas md:grid md:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="hidden md:block">
        <div className="sticky top-0 h-dvh">
          <Sidebar />
        </div>
      </aside>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" title="Menu" className="md:hidden">
          <Sidebar onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-col md:py-2 md:pr-2">
        <Topbar />
        <main
          id="main"
          className="flex-1 bg-background px-4 pt-5 pb-[calc(var(--tabbar-height)+env(safe-area-inset-bottom,0px)+1.5rem)] md:min-h-[calc(100dvh-1rem)] md:rounded-xl md:px-8 md:pt-8 md:pb-10 md:shadow-panel"
        >
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileTabBar onOpenMenu={() => setMenuOpen(true)} />
    </div>
  );
}
