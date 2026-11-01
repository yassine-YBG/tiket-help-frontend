// Render a component inside the same providers the app uses
// (router + TanStack Query + optional logged-in user), for component tests.
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { AuthContext } from '@/features/auth/authContext';

export const testUsers = {
  user: { id: 'u1', username: 'Nour', lastname: 'User', email: 'nour@test.com', role: 'user', createdAt: '2026-01-01' },
  admin: { id: 'a1', username: 'Malek', lastname: 'Admin', email: 'admin@test.com', role: 'admin', createdAt: '2026-01-01' },
};

export function renderWithProviders(
  ui,
  { route = '/', path = '*', extraRoutes = [], user = null, auth = {} } = {}
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const router = createMemoryRouter([{ path, element: ui }, ...extraRoutes], { initialEntries: [route] });
  const authValue = {
    user,
    status: user ? 'authenticated' : 'guest',
    login: async () => {},
    logout: () => {},
    updateToken: () => {},
    refreshUser: async () => user,
    ...auth,
  };
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>
        <RouterProvider router={router} />
      </AuthContext.Provider>
    </QueryClientProvider>
  );
  return { ...utils, router, queryClient };
}
