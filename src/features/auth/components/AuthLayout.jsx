import { TicketIcon } from 'lucide-react';

// Centered card used by the login and register pages
export function AuthLayout({ children }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center text-lg font-semibold">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <TicketIcon className="size-4" />
          </div>
          Tiket Help
        </div>
        {children}
      </div>
    </div>
  );
}
