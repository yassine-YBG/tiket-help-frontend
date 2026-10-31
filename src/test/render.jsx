// Render a component inside the same providers the app uses
// (router + TanStack Query), for component tests.
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router';

export function renderWithProviders(ui, { route = '/', path = '*', extraRoutes = [] } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const router = createMemoryRouter([{ path, element: ui }, ...extraRoutes], { initialEntries: [route] });
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
  return { ...utils, router, queryClient };
}
