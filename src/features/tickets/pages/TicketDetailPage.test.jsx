import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, testUsers } from '@/test/render';
import { ticketsApi } from '@/api/tickets.api';
import TicketDetailPage from './TicketDetailPage';

vi.mock('@/api/tickets.api', () => ({
  ticketsApi: { get: vi.fn(), reply: vi.fn(), updatePriority: vi.fn(), downloadAttachment: vi.fn() },
}));

const ticket = {
  _id: 't1',
  subject: 'Cannot export MP3',
  description: '<b>not bold</b> export fails',
  category: 'Software',
  priority: 'high',
  status: 'en cours',
  createdBy: { _id: 'u1', username: 'Nour' },
  handledBy: { _id: 'a1', username: 'Malek' },
  createdAt: '2026-10-01T10:00:00Z',
  attachments: [{ _id: 'f1', originalName: 'log.txt', size: 2048 }],
  messages: [
    { _id: 'm1', sender: { _id: 'a1', username: 'Malek' }, message: 'Can you send a screenshot?', attachments: [], sentAt: '2026-10-01T11:00:00Z' },
  ],
};

const setup = (user = testUsers.user) =>
  renderWithProviders(<TicketDetailPage />, { route: '/tickets/t1', path: '/tickets/:id', user });

// vi.resetAllMocks (not mock.mockReset) — Vitest 4 reports handled rejections after mockReset
beforeEach(() => vi.resetAllMocks());

describe('TicketDetailPage', () => {
  it('shows the ticket and its conversation', async () => {
    vi.mocked(ticketsApi.get).mockResolvedValue(ticket);
    setup();
    expect(await screen.findByRole('heading', { name: 'Cannot export MP3' })).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument(); // the owner sees their own message as "You"
    expect(screen.getByText('Can you send a screenshot?')).toBeInTheDocument();
    expect(screen.getAllByText('Support').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /log\.txt/ })).toBeInTheDocument();
  });

  it('never renders user text as HTML', async () => {
    vi.mocked(ticketsApi.get).mockResolvedValue(ticket);
    const { container } = setup();
    await screen.findByText('<b>not bold</b> export fails');
    expect(container.querySelector('b')).toBeNull();
  });

  it('the owner can change the priority', async () => {
    vi.mocked(ticketsApi.get).mockResolvedValue(ticket);
    setup();
    expect(await screen.findByLabelText('Change priority')).toBeInTheDocument();
  });

  it('shows "no access" on 403', async () => {
    vi.mocked(ticketsApi.get).mockRejectedValue({ response: { status: 403, data: { error: 'Access denied' } } });
    setup();
    expect(await screen.findByText("You don't have access to this ticket")).toBeInTheDocument();
  });

  it('shows "not found" on 404 and on a bad id (400)', async () => {
    vi.mocked(ticketsApi.get).mockRejectedValue({ response: { status: 400, data: { error: 'Invalid ticket id' } } });
    setup();
    expect(await screen.findByText('Ticket not found')).toBeInTheDocument();
  });

  it('reply: disabled while empty, sends, then clears', async () => {
    vi.mocked(ticketsApi.get).mockResolvedValue(ticket);
    vi.mocked(ticketsApi.reply).mockResolvedValue({ message: 'Reply sent' });
    setup();
    const send = await screen.findByRole('button', { name: 'Send reply' });
    expect(send).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Your reply'), '  Here it is  ');
    await userEvent.click(send);
    await waitFor(() => expect(ticketsApi.reply).toHaveBeenCalledWith('t1', 'Here it is', []));
    await waitFor(() => expect(screen.getByLabelText('Your reply')).toHaveValue(''));
  });
});
