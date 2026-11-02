import { Link } from 'react-router';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/Logo';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas px-6 pt-safe pb-safe">
      <header className="flex h-16 items-center">
        <Link to="/">
          <Logo />
        </Link>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-5 pb-16 text-center">
        <p className="text-sm font-semibold tracking-wide text-primary">Error 404</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Page not found</h1>
        <p className="max-w-sm text-muted-foreground">This page does not exist or was moved.</p>
        <Button asChild size="lg">
          <Link to="/">
            <ArrowLeftIcon />
            Go home
          </Link>
        </Button>
      </main>
    </div>
  );
}
