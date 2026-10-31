import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/render';
import { AuthContext } from '../authContext';
import LoginPage from './LoginPage';

function setup(login) {
  const auth = { status: 'guest', user: null, login };
  return renderWithProviders(
    <AuthContext.Provider value={auth}>
      <LoginPage />
    </AuthContext.Provider>,
    { route: '/login', path: '/login', extraRoutes: [{ path: '/', element: <p>App home</p> }] }
  );
}

const httpError = (status, error) => Object.assign(new Error(), { response: { status, data: { error } } });

async function fillAndSubmit(email = 'nour@test.com', password = 'secret123') {
  await userEvent.type(screen.getByLabelText('Email'), email);
  await userEvent.type(screen.getByLabelText('Password'), password);
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }));
}

describe('LoginPage', () => {
  it('requires email and password', async () => {
    const login = vi.fn();
    setup(login);
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('logs in and opens the app', async () => {
    const login = vi.fn().mockResolvedValue({ role: 'user' });
    setup(login);
    await fillAndSubmit('  nour@test.com ');
    expect(login).toHaveBeenCalledWith('nour@test.com', 'secret123');
    expect(await screen.findByText('App home')).toBeInTheDocument();
  });

  it('shows the backend error for a wrong password', async () => {
    setup(vi.fn().mockRejectedValue(httpError(401, 'Invalid email or password')));
    await fillAndSubmit();
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
  });

  it('explains a not-activated account (403)', async () => {
    setup(vi.fn().mockRejectedValue(httpError(403, 'Account is not activated')));
    await fillAndSubmit();
    expect(await screen.findByRole('alert')).toHaveTextContent(/not activated yet/);
  });

  it('explains the rate limit (429)', async () => {
    setup(vi.fn().mockRejectedValue(httpError(429, 'Too many attempts')));
    await fillAndSubmit();
    expect(await screen.findByRole('alert')).toHaveTextContent(/wait 15 minutes/);
  });
});
