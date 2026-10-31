import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { AuthContext } from '../authContext';
import { ProtectedRoute } from './ProtectedRoute';

function renderAt(url, auth, roles) {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <p>Login page</p> },
      { path: '/', element: <p>Home page</p> },
      { element: <ProtectedRoute roles={roles} />, children: [{ path: '/secret', element: <p>Secret page</p> }] },
    ],
    { initialEntries: [url] }
  );
  render(
    <AuthContext.Provider value={auth}>
      <RouterProvider router={router} />
    </AuthContext.Provider>
  );
  return router;
}

const user = (role) => ({ status: 'authenticated', user: { role } });

describe('ProtectedRoute', () => {
  it('sends visitors to /login and remembers where they wanted to go', () => {
    const router = renderAt('/secret', { status: 'guest', user: null });
    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(router.state.location.state.from.pathname).toBe('/secret');
  });

  it('shows a spinner while the session is checked', () => {
    renderAt('/secret', { status: 'loading', user: null });
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('lets a logged-in user in', () => {
    renderAt('/secret', user('user'));
    expect(screen.getByText('Secret page')).toBeInTheDocument();
  });

  it('sends a user without the right role home', () => {
    renderAt('/secret', user('user'), ['admin', 'superadmin']);
    expect(screen.getByText('Home page')).toBeInTheDocument();
  });

  it('lets an admin into admin routes', () => {
    renderAt('/secret', user('superadmin'), ['admin', 'superadmin']);
    expect(screen.getByText('Secret page')).toBeInTheDocument();
  });
});
