import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, testUsers } from '@/test/render';
import { ticketsApi } from '@/api/tickets.api';
import NewTicketPage from './NewTicketPage';

vi.mock('@/api/tickets.api', () => ({ ticketsApi: { create: vi.fn() } }));

const setup = (user = testUsers.user) =>
  renderWithProviders(<NewTicketPage />, {
    route: '/tickets/new',
    path: '/tickets/new',
    user,
    extraRoutes: [{ path: '/tickets/:id', element: <p>Ticket page</p> }],
  });

// vi.resetAllMocks (not mock.mockReset) — Vitest 4 reports handled rejections after mockReset
beforeEach(() => vi.resetAllMocks());

describe('NewTicketPage', () => {
  it('requires subject, category and description', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Create ticket' }));
    expect(await screen.findByText('Subject is required')).toBeInTheDocument();
    expect(screen.getByText('Category is required')).toBeInTheDocument();
    expect(screen.getByText('Description is required')).toBeInTheDocument();
    expect(ticketsApi.create).not.toHaveBeenCalled();
  });

  it('only spaces is not a valid subject', async () => {
    setup();
    await userEvent.type(screen.getByLabelText('Subject'), '   ');
    await userEvent.click(screen.getByRole('button', { name: 'Create ticket' }));
    expect(await screen.findByText('Subject is required')).toBeInTheDocument();
  });

  it('sends trimmed values with the files, then opens the new ticket', async () => {
    vi.mocked(ticketsApi.create).mockResolvedValue({ ticketId: 't123' });
    const user = userEvent.setup({ applyAccept: false });
    setup();
    await user.type(screen.getByLabelText('Subject'), '  Cannot log in  ');
    await user.type(screen.getByLabelText('Category'), 'Account');
    await user.type(screen.getByLabelText('Description'), 'Error after password reset');
    const png = new File(['x'], 'screen.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('Attach files'), png);
    await user.click(screen.getByRole('button', { name: 'Create ticket' }));

    await waitFor(() => expect(ticketsApi.create).toHaveBeenCalledTimes(1));
    expect(vi.mocked(ticketsApi.create).mock.calls[0]).toEqual([
      { subject: 'Cannot log in', category: 'Account', priority: 'normal', description: 'Error after password reset' },
      [png],
    ]);
    expect(await screen.findByText('Ticket page')).toBeInTheDocument();
  });

  it('shows the server error and stays on the form', async () => {
    vi.mocked(ticketsApi.create).mockRejectedValue({ response: { status: 400, data: { error: 'Type de fichier non autorisé' } } });
    setup();
    await userEvent.type(screen.getByLabelText('Subject'), 'A');
    await userEvent.type(screen.getByLabelText('Category'), 'B');
    await userEvent.type(screen.getByLabelText('Description'), 'C');
    await userEvent.click(screen.getByRole('button', { name: 'Create ticket' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Type de fichier non autorisé');
  });

  it('a user cannot choose "Urgent"; each level is explained', async () => {
    setup();
    expect(screen.getByText('Something does not work as expected')).toBeInTheDocument(); // normal
    await userEvent.click(screen.getByLabelText('Priority'));
    const options = screen.getAllByRole('option').map((o) => o.textContent);
    expect(options).toEqual(['Low', 'Normal', 'High']);
  });

  it('an admin can choose "Urgent"', async () => {
    setup(testUsers.admin);
    await userEvent.click(screen.getByLabelText('Priority'));
    expect(screen.getByRole('option', { name: 'Urgent' })).toBeInTheDocument();
  });

  it('a follow-up of a closed ticket starts with the subject and a link to it', async () => {
    renderWithProviders(<NewTicketPage />, {
      route: { pathname: '/tickets/new', state: { followUp: { id: 'abc123', subject: 'Cannot export MP3' } } },
      path: '/tickets/new',
      user: testUsers.user,
    });
    expect(screen.getByLabelText('Subject')).toHaveValue('Follow-up: Cannot export MP3');
    expect(screen.getByLabelText('Description').value).toMatch(/^Follow-up of my previous ticket: http.*\/tickets\/abc123/);
  });

  it('a very long subject still fits the 150-character limit', () => {
    renderWithProviders(<NewTicketPage />, {
      route: { pathname: '/tickets/new', state: { followUp: { id: 'x', subject: 'a'.repeat(150) } } },
      path: '/tickets/new',
      user: testUsers.user,
    });
    expect(screen.getByLabelText('Subject').value).toHaveLength(150);
  });
});
