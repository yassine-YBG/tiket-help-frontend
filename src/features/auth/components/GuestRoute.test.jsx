import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { AuthContext } from '../authContext';
import { GuestRoute } from './GuestRoute';

function renderAt(entry, status) {
  const router = createMemoryRouter(
    [
      { element: <GuestRoute />, children: [{ path: '/login', element: <p>Login page</p> }] },
      { path: '/', element: <p>Home page</p> },
      { path: '/profile', element: <p>Profile page</p> },
    ],
    { initialEntries: [entry] }
  );
  render(
    <AuthContext.Provider value={{ status, user: status === 'authenticated' ? { role: 'user' } : null }}>
      <RouterProvider router={router} />
    </AuthContext.Provider>
  );
}

describe('GuestRoute', () => {
  it('shows the login page to visitors', () => {
    renderAt('/login', 'guest');
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('sends a logged-in user home', () => {
    renderAt('/login', 'authenticated');
    expect(screen.getByText('Home page')).toBeInTheDocument();
  });

  it('after login, goes back to the page asked for before login', () => {
    renderAt({ pathname: '/login', state: { from: { pathname: '/profile' } } }, 'authenticated');
    expect(screen.getByText('Profile page')).toBeInTheDocument();
  });
});
