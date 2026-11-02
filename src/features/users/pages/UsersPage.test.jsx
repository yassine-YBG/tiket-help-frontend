import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, testUsers } from '@/test/render';
import { usersApi } from '@/api/users.api';
import UsersPage from './UsersPage';

vi.mock('@/api/users.api', () => ({
  usersApi: { list: vi.fn(), setActivated: vi.fn(), setRole: vi.fn(), remove: vi.fn(), restore: vi.fn() },
}));

const superadmin = { ...testUsers.admin, id: 's1', username: 'Sara', role: 'superadmin' };
const accounts = [
  { _id: 'u1', username: 'Nour', lastname: 'User', email: 'nour@test.com', role: 'user', activated: true, createdAt: '2026-10-01' },
  { _id: 'a2', username: 'Rami', lastname: 'Admin', email: 'rami@test.com', role: 'admin', activated: true, createdAt: '2026-10-02' },
  { _id: 'a1', username: 'Malek', lastname: 'Admin', email: 'admin@test.com', role: 'admin', activated: true, createdAt: '2026-10-03' },
];
const page = (users) => ({
  users,
  pagination: { page: 1, limit: 20, total: users.length, totalPages: 1, hasNextPage: false, hasPrevPage: false },
  sort: 'newest',
});
const setup = (user = testUsers.admin, route = '/admin/users') =>
  renderWithProviders(<UsersPage />, { route, path: '/admin/users', user });
const row = (name) => screen.getByRole('row', { name: new RegExp(name) });

beforeEach(() => vi.resetAllMocks());

describe('UsersPage', () => {
  it('lists accounts; an admin can act only on "user" accounts and never on himself', async () => {
    vi.mocked(usersApi.list).mockResolvedValue(page(accounts));
    setup();
    await screen.findAllByText('nour@test.com');
    expect(within(row('Nour')).getByRole('button', { name: 'Deactivate' })).toBeInTheDocument();
    expect(within(row('Rami')).queryByRole('button', { name: 'Deactivate' })).not.toBeInTheDocument();
    expect(within(row('Malek')).getByText('You')).toBeInTheDocument();
    expect(within(row('Malek')).queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Role of/)).not.toBeInTheDocument(); // only the superadmin changes roles
  });

  it('the superadmin manages admins and changes roles', async () => {
    vi.mocked(usersApi.list).mockResolvedValue(page(accounts));
    vi.mocked(usersApi.setRole).mockResolvedValue({ ticketsReleased: 0 });
    setup(superadmin);
    await screen.findAllByText('nour@test.com');
    expect(within(row('Rami')).getByRole('button', { name: 'Deactivate' })).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Role of Nour User'));
    await userEvent.click(await screen.findByRole('option', { name: 'Admin' }));
    await waitFor(() => expect(usersApi.setRole).toHaveBeenCalledWith('u1', 'admin'));
  });

  it('demoting an admin asks first (their open tickets go back to the team)', async () => {
    vi.mocked(usersApi.list).mockResolvedValue(page(accounts));
    vi.mocked(usersApi.setRole).mockResolvedValue({ ticketsReleased: 2 });
    setup(superadmin);
    await screen.findAllByText('rami@test.com');
    await userEvent.click(screen.getByLabelText('Role of Rami Admin'));
    await userEvent.click(await screen.findByRole('option', { name: 'User' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent('Their open tickets go back to the team');
    expect(usersApi.setRole).not.toHaveBeenCalled();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Change role' }));
    await waitFor(() => expect(usersApi.setRole).toHaveBeenCalledWith('a2', 'user'));
  });

  it('deactivating asks for confirmation', async () => {
    vi.mocked(usersApi.list).mockResolvedValue(page(accounts));
    vi.mocked(usersApi.setActivated).mockResolvedValue({ ticketsReleased: 0 });
    setup();
    await screen.findAllByText('nour@test.com');
    await userEvent.click(within(row('Nour')).getByRole('button', { name: 'Deactivate' }));
    const dialog = await screen.findByRole('alertdialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Deactivate' }));
    await waitFor(() => expect(usersApi.setActivated).toHaveBeenCalledWith('u1', false));
  });

  it('the "Deleted" filter asks the API for deleted accounts and offers Restore', async () => {
    vi.mocked(usersApi.list).mockResolvedValue(page([{ ...accounts[0], deleted: true }]));
    vi.mocked(usersApi.restore).mockResolvedValue({ message: 'ok' });
    setup(testUsers.admin, '/admin/users?status=deleted');
    await screen.findAllByText('nour@test.com');
    expect(usersApi.list).toHaveBeenCalledWith(expect.objectContaining({ deleted: 'true' }));
    expect(usersApi.list.mock.calls[0][0]).not.toHaveProperty('status');
    await userEvent.click(within(row('Nour')).getByRole('button', { name: 'Restore' }));
    await waitFor(() => expect(usersApi.restore).toHaveBeenCalledWith('u1'));
  });

  it('status filters map to the backend parameters', async () => {
    vi.mocked(usersApi.list).mockResolvedValue(page(accounts));
    setup(testUsers.admin, '/admin/users?status=inactive&role=user');
    await screen.findAllByText('nour@test.com');
    expect(usersApi.list).toHaveBeenCalledWith(expect.objectContaining({ activated: 'false', role: 'user' }));
  });
});
