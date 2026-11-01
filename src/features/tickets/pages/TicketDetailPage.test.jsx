import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, testUsers } from '@/test/render';
import { ticketsApi } from '@/api/tickets.api';
import TicketDetailPage from './TicketDetailPage';

vi.mock('@/api/tickets.api', () => ({
  ticketsApi: {
    get: vi.fn(),
    reply: vi.fn(),
    updatePriority: vi.fn(),
    updateStatus: vi.fn(),
    assignToMe: vi.fn(),
    archive: vi.fn(),
    unarchive: vi.fn(),
    markSeen: vi.fn(),
    summary: vi.fn(),
    downloadAttachment: vi.fn(),
  },
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
  renderWithProviders(<TicketDetailPage />, {
    route: '/tickets/t1',
    path: '/tickets/:id',
    user,
    extraRoutes: [{ path: '/admin/tickets', element: <h1>All tickets list</h1> }],
  });

// testUsers.admin is "Malek" (id a1), who already handles `ticket`
const otherAdmin = { ...testUsers.admin, id: 'a2', username: 'Sara' };

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

  it('a normal user sees no admin actions', async () => {
    vi.mocked(ticketsApi.get).mockResolvedValue(ticket);
    setup();
    await screen.findByRole('heading', { name: 'Cannot export MP3' });
    expect(screen.queryByLabelText('Change status')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /assign to me|take over/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Archive ticket' })).not.toBeInTheDocument();
  });

  describe('admin', () => {
    it('changes the status', async () => {
      vi.mocked(ticketsApi.get).mockResolvedValue(ticket);
      vi.mocked(ticketsApi.updateStatus).mockResolvedValue({ message: 'ok' });
      setup(testUsers.admin);
      await userEvent.click(await screen.findByLabelText('Change status'));
      await userEvent.click(await screen.findByRole('option', { name: 'Resolved' }));
      await waitFor(() => expect(ticketsApi.updateStatus).toHaveBeenCalledWith('t1', 'résolu'));
    });

    it('an unassigned ticket: no reply box, no status change, one "Assign to me" above the conversation', async () => {
      vi.mocked(ticketsApi.get).mockResolvedValue({ ...ticket, handledBy: null });
      setup(testUsers.admin);
      expect(await screen.findByText('Assign this ticket to yourself to reply to the user.')).toBeInTheDocument();
      expect(screen.queryByLabelText('Your reply')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Change status')).not.toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: 'Assign to me' })).toHaveLength(1);
    });

    it("another admin's ticket: no reply box, no status change, Take over", async () => {
      vi.mocked(ticketsApi.get).mockResolvedValue(ticket); // handled by Malek
      setup(otherAdmin);
      expect(await screen.findByText('Malek is handling this ticket. Take it over to reply.')).toBeInTheDocument();
      expect(screen.queryByLabelText('Your reply')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Change status')).not.toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: 'Take over' })).toHaveLength(1);
    });

    it('a superadmin follows the same rule', async () => {
      vi.mocked(ticketsApi.get).mockResolvedValue(ticket);
      setup({ ...otherAdmin, role: 'superadmin' });
      expect(await screen.findByText(/Take it over to reply/)).toBeInTheDocument();
      expect(screen.queryByLabelText('Your reply')).not.toBeInTheDocument();
    });

    it('the handler gets the reply box and the status dropdown', async () => {
      vi.mocked(ticketsApi.get).mockResolvedValue(ticket); // handled by Malek = testUsers.admin
      setup(testUsers.admin);
      expect(await screen.findByLabelText('Your reply')).toBeInTheDocument();
      expect(screen.getByLabelText('Change status')).toBeInTheDocument();
    });

    it('assigns an unassigned ticket in one click', async () => {
      vi.mocked(ticketsApi.get).mockResolvedValue({ ...ticket, handledBy: null });
      vi.mocked(ticketsApi.assignToMe).mockResolvedValue({ status: 'en cours' });
      setup(testUsers.admin);
      await userEvent.click(await screen.findByRole('button', { name: 'Assign to me' }));
      await waitFor(() => expect(ticketsApi.assignToMe).toHaveBeenCalledWith('t1'));
    });

    it('says so when the admin already handles the ticket', async () => {
      vi.mocked(ticketsApi.get).mockResolvedValue(ticket);
      setup(testUsers.admin);
      expect(await screen.findByText('You are handling this ticket')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /assign to me|take over/i })).not.toBeInTheDocument();
    });

    it('asks before taking over a ticket another admin handles', async () => {
      vi.mocked(ticketsApi.get).mockResolvedValue(ticket);
      vi.mocked(ticketsApi.assignToMe).mockResolvedValue({ status: 'en cours' });
      setup(otherAdmin);
      await userEvent.click(await screen.findByRole('button', { name: 'Take over' }));
      const dialog = await screen.findByRole('alertdialog');
      expect(dialog).toHaveTextContent('Malek is handling this ticket');
      expect(ticketsApi.assignToMe).not.toHaveBeenCalled();
      await userEvent.click(within(dialog).getByRole('button', { name: 'Take over' }));
      await waitFor(() => expect(ticketsApi.assignToMe).toHaveBeenCalledWith('t1'));
    });

    it('a ticket that is not resolved cannot be archived', async () => {
      vi.mocked(ticketsApi.get).mockResolvedValue(ticket); // en cours, handled by me
      setup(testUsers.admin);
      expect(await screen.findByText('Resolve the ticket to be able to archive it.')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Archive ticket' })).not.toBeInTheDocument();
    });

    it('another admin (not the handler) cannot archive', async () => {
      vi.mocked(ticketsApi.get).mockResolvedValue({ ...ticket, status: 'résolu' });
      setup(otherAdmin);
      await screen.findByRole('button', { name: 'Take over' });
      expect(screen.queryByRole('button', { name: 'Archive ticket' })).not.toBeInTheDocument();
    });

    it('a superadmin can archive any resolved ticket', async () => {
      vi.mocked(ticketsApi.get).mockResolvedValue({ ...ticket, status: 'résolu' });
      setup({ ...otherAdmin, role: 'superadmin' });
      expect(await screen.findByRole('button', { name: 'Archive ticket' })).toBeInTheDocument();
    });

    it('the handler archives a resolved ticket after confirmation, then goes back to the list', async () => {
      vi.mocked(ticketsApi.get).mockResolvedValue({ ...ticket, status: 'résolu' });
      vi.mocked(ticketsApi.archive).mockResolvedValue({ message: 'Ticket archived' });
      setup(testUsers.admin);
      await userEvent.click(await screen.findByRole('button', { name: 'Archive ticket' }));
      const dialog = await screen.findByRole('alertdialog');
      expect(dialog).toHaveTextContent('The user still sees it');
      expect(ticketsApi.archive).not.toHaveBeenCalled();
      await userEvent.click(within(dialog).getByRole('button', { name: 'Archive' }));
      await waitFor(() => expect(ticketsApi.archive).toHaveBeenCalledWith('t1'));
      expect(await screen.findByRole('heading', { name: 'All tickets list' })).toBeInTheDocument();
    });

    it('a refused archive keeps the dialog open and stays on the ticket', async () => {
      vi.mocked(ticketsApi.get).mockResolvedValue({ ...ticket, status: 'résolu' });
      vi.mocked(ticketsApi.archive).mockRejectedValue({ response: { status: 400, data: { error: 'Only resolved tickets can be archived' } } });
      setup(testUsers.admin);
      await userEvent.click(await screen.findByRole('button', { name: 'Archive ticket' }));
      const dialog = await screen.findByRole('alertdialog');
      await userEvent.click(within(dialog).getByRole('button', { name: 'Archive' }));
      await waitFor(() => expect(ticketsApi.archive).toHaveBeenCalled());
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      // still on the ticket (hidden: the open dialog hides the page from screen readers)
      expect(screen.getByRole('heading', { name: 'Cannot export MP3', hidden: true })).toBeInTheDocument();
    });

    it('an archived ticket shows the note and a Restore button', async () => {
      vi.mocked(ticketsApi.get).mockResolvedValue({ ...ticket, status: 'résolu', archived: true });
      vi.mocked(ticketsApi.unarchive).mockResolvedValue({ message: 'Ticket restored' });
      setup(testUsers.admin);
      expect(await screen.findByText(/hidden from the All tickets list\. Restore it/)).toBeInTheDocument();
      expect(screen.queryByLabelText('Your reply')).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Restore ticket' }));
      await waitFor(() => expect(ticketsApi.unarchive).toHaveBeenCalledWith('t1'));
    });
  });

  it('the owner sees "Closed by support" on an archived ticket, cannot reply, can open a follow-up', async () => {
    vi.mocked(ticketsApi.get).mockResolvedValue({ ...ticket, status: 'résolu', archived: true });
    setup();
    expect(await screen.findByText(/Closed by support\. If you still need help, open a new ticket/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Your reply')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open a new ticket' })).toHaveAttribute('href', '/tickets/new');
    expect(screen.queryByRole('button', { name: 'Restore ticket' })).not.toBeInTheDocument();
  });

  it('a resolved ticket is closed for the admin too', async () => {
    vi.mocked(ticketsApi.get).mockResolvedValue({ ...ticket, status: 'résolu' });
    setup(testUsers.admin);
    expect(await screen.findByText(/can set the status back to In progress to write in it/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Your reply')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Open a new ticket' })).not.toBeInTheDocument();
  });

  describe('"New answer" alert', () => {
    const answered = { ...ticket, supportUpdatedAt: '2026-10-01T11:00:00Z', ownerSeenAt: '2026-10-01T10:30:00Z' };

    it('the owner opening a ticket with a new answer marks it seen (once)', async () => {
      vi.mocked(ticketsApi.get).mockResolvedValue(answered);
      vi.mocked(ticketsApi.markSeen).mockResolvedValue({ ownerSeenAt: '2026-10-01T12:00:00Z' });
      setup();
      await screen.findByRole('heading', { name: 'Cannot export MP3' });
      await waitFor(() => expect(ticketsApi.markSeen).toHaveBeenCalledWith('t1'));
      expect(ticketsApi.markSeen).toHaveBeenCalledTimes(1);
    });

    it('nothing new -> nothing sent', async () => {
      vi.mocked(ticketsApi.get).mockResolvedValue({ ...answered, ownerSeenAt: '2026-10-01T12:00:00Z' });
      setup();
      await screen.findByRole('heading', { name: 'Cannot export MP3' });
      expect(ticketsApi.markSeen).not.toHaveBeenCalled();
    });

    it('an admin opening the ticket never marks it seen', async () => {
      vi.mocked(ticketsApi.get).mockResolvedValue(answered);
      setup(testUsers.admin);
      await screen.findByRole('heading', { name: 'Cannot export MP3' });
      expect(ticketsApi.markSeen).not.toHaveBeenCalled();
    });
  });
});
