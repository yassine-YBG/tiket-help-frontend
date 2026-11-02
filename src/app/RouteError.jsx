import { Link, useRouteError } from 'react-router';
import { RotateCwIcon, SparklesIcon, TriangleAlertIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Shown instead of a page that crashed, inside the app layout:
// one broken page never breaks the whole app.
export default function RouteError() {
  const error = useRouteError();

  // After a new version is deployed, old page files no longer exist on the server
  const isOutdated =
    error instanceof TypeError && /dynamically imported module|Importing a module script failed/i.test(error.message);

  if (import.meta.env.DEV) console.error(error);

  const Icon = isOutdated ? SparklesIcon : TriangleAlertIcon;

  return (
    <div role="alert" className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center gap-5 px-6 py-16 text-center">
      <div className={isOutdated ? 'flex size-12 items-center justify-center rounded-xl bg-brand-soft' : 'flex size-12 items-center justify-center rounded-xl bg-danger-soft'}>
        <Icon className={isOutdated ? 'size-5 text-primary' : 'size-5 text-danger'} />
      </div>
      <div className="grid gap-1.5">
        <h1 className="text-lg font-semibold tracking-tight">
          {isOutdated ? 'A new version is available' : 'Something went wrong on this page'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isOutdated ? 'Reload the page to get the latest version.' : 'Try reloading the page. If it keeps happening, contact support.'}
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => window.location.reload()}>
          <RotateCwIcon />
          Reload
        </Button>
        <Button variant="outline" asChild>
          <Link to="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
