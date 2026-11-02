import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, testUsers } from '@/test/render';
import { usersApi } from '@/api/users.api';
import PendingUsersPage from './PendingUsersPage';

vi.mock('@/api/users.api', () => ({ usersApi: { pending: vi.fn(), setActivated: vi.fn(), remove: vi.fn() } }));

const waiting = [
  { _id: 'p1', username: 'Pat', lastname: 'New', email: 'pat@test.com', role: 'user', createdAt: '2026-11-01' },
  { _id: 'p2', username: 'Adam', lastname: 'Boss', email: 'adam@test.com', role: 'admin', createdAt: '2026-11-01' },
];
const setup = (user = testUsers.admin) =>
  renderWithProviders(<PendingUsersPage />, { route: '/admin/users/pending', path: '/admin/users/pending', user });

beforeEach(() => vi.resetAllMocks());

describe('PendingUsersPage', () => {
  it('activates a waiting account', async () => {
    vi.mocked(usersApi.pending).mockResolvedValue(waiting);
    vi.mocked(usersApi.setActivated).mockResolvedValue({ ticketsReleased: 0 });
    setup();
    const pat = (await screen.findAllByText('pat@test.com'))[0].closest('tr');
    await userEvent.click(within(pat).getByRole('button', { name: 'Activate' }));
    await waitFor(() => expect(usersApi.setActivated).toHaveBeenCalledWith('p1', true));
  });

  it('rejecting asks first', async () => {
    vi.mocked(usersApi.pending).mockResolvedValue(waiting);
    vi.mocked(usersApi.remove).mockResolvedValue({ ticketsReleased: 0 });
    setup();
    const pat = (await screen.findAllByText('pat@test.com'))[0].closest('tr');
    await userEvent.click(within(pat).getByRole('button', { name: 'Reject' }));
    const dialog = await screen.findByRole('alertdialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Reject' }));
    await waitFor(() => expect(usersApi.remove).toHaveBeenCalledWith('p1'));
  });

  it('an admin cannot activate a pending admin account (superadmin only)', async () => {
    vi.mocked(usersApi.pending).mockResolvedValue(waiting);
    setup();
    const adam = (await screen.findAllByText('adam@test.com'))[0].closest('tr');
    expect(within(adam).getByText('Superadmin only')).toBeInTheDocument();
    expect(within(adam).queryByRole('button')).not.toBeInTheDocument();
  });

  it('nothing waiting -> a clear empty state', async () => {
    vi.mocked(usersApi.pending).mockResolvedValue([]);
    setup();
    expect(await screen.findByText('No account is waiting')).toBeInTheDocument();
  });
});
