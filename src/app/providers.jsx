import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/features/auth/AuthProvider';

// Server data cache (TanStack Query): lists and tickets are fetched once,
// shared between pages and refreshed in the background.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // data is "fresh" for 30 s
      refetchOnWindowFocus: true,
      // never retry errors the user must fix (400, 401, 403, 404...)
      retry: (failureCount, error) => {
        const status = error?.response?.status;
        if (status && status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});

export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
