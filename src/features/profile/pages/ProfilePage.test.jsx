import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, testUsers } from '@/test/render';
import { authApi } from '@/api/auth.api';
import ProfilePage from './ProfilePage';

vi.mock('@/api/auth.api', () => ({ authApi: { changePassword: vi.fn() } }));
// vi.resetAllMocks (not mock.mockReset) — Vitest 4 reports handled rejections after mockReset
beforeEach(() => vi.resetAllMocks());

async function fill(current, next, confirm = next) {
  await userEvent.type(screen.getByLabelText('Current password'), current);
  await userEvent.type(screen.getByLabelText('New password'), next);
  await userEvent.type(screen.getByLabelText('Confirm new password'), confirm);
  await userEvent.click(screen.getByRole('button', { name: 'Change password' }));
}

describe('ProfilePage', () => {
  it('shows the account information', () => {
    renderWithProviders(<ProfilePage />, { user: testUsers.admin });
    expect(screen.getByText('admin@test.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('checks the new password before sending', async () => {
    renderWithProviders(<ProfilePage />, { user: testUsers.user });
    await fill('secret123', 'abc');
    expect(await screen.findByText('At least 6 characters', { selector: 'p.text-destructive' })).toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText('New password'));
    await userEvent.clear(screen.getByLabelText('Confirm new password'));
    await userEvent.type(screen.getByLabelText('New password'), 'newsecret1');
    await userEvent.type(screen.getByLabelText('Confirm new password'), 'other-one');
    await userEvent.click(screen.getByRole('button', { name: 'Change password' }));
    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(authApi.changePassword).not.toHaveBeenCalled();
  });

  it('changes the password and keeps the user logged in with the new token', async () => {
    vi.mocked(authApi.changePassword).mockResolvedValue({ message: 'ok', token: 'new-token' });
    const updateToken = vi.fn();
    renderWithProviders(<ProfilePage />, { user: testUsers.user, auth: { updateToken } });
    await fill('secret123', 'newsecret1');
    await waitFor(() => expect(authApi.changePassword).toHaveBeenCalledWith('secret123', 'newsecret1'));
    expect(updateToken).toHaveBeenCalledWith('new-token');
    await waitFor(() => expect(screen.getByLabelText('Current password')).toHaveValue(''));
  });

  it('shows a wrong current password', async () => {
    vi.mocked(authApi.changePassword).mockRejectedValue({ response: { status: 401, data: { error: 'Current password is incorrect' } } });
    renderWithProviders(<ProfilePage />, { user: testUsers.user });
    await fill('wrongpass', 'newsecret1');
    expect(await screen.findByRole('alert')).toHaveTextContent('Current password is incorrect');
  });
});
