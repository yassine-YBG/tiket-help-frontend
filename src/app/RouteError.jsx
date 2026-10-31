import { Link, useRouteError } from 'react-router';
import { AlertTriangleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Shown instead of a page that crashed, inside the app layout:
// one broken page never breaks the whole app.
export default function RouteError() {
  const error = useRouteError();

  // After a new version is deployed, old page files no longer exist on the server
  const isOutdated =
    error instanceof TypeError && /dynamically imported module|Importing a module script failed/i.test(error.message);

  if (import.meta.env.DEV) console.error(error);

  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangleIcon className="size-6 text-destructive" />
      </div>
      <div className="grid gap-1">
        <h1 className="text-lg font-semibold">
          {isOutdated ? 'A new version is available' : 'Something went wrong on this page'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isOutdated ? 'Reload the page to get the latest version.' : 'Try reloading the page. If it keeps happening, contact support.'}
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => window.location.reload()}>Reload</Button>
        <Button variant="outline" asChild>
          <Link to="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
