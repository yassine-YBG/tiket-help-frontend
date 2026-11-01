// Admin side of tickets: all-tickets list, assign / take over, status, delete
import { test, expect, fixtures } from './fixtures';

const api = (account) => ({ headers: { Authorization: `Bearer ${account.token}` } });

// Create a ticket directly through the API (faster than the form), optionally with one text file
async function apiCreateTicket(request, account, fields, fileName) {
  const multipart = { category: 'Software', description: 'Created by the test', priority: 'normal', ...fields };
  if (fileName) {
    multipart.attachments = { name: fileName, mimeType: 'text/plain', buffer: Buffer.from(`content of ${fileName}`) };
  }
  const res = await request.post(`${fixtures().apiUrl}/tickets/create`, { ...api(account), multipart });
  expect(res.status()).toBe(201);
  return (await res.json()).ticketId;
}

test.describe('all tickets list', () => {
  test('an admin sees tickets of every user, with who created them', async ({ page, request, loginAs }) => {
    const { accounts } = fixtures();
    await apiCreateTicket(request, accounts.user, { subject: 'Admin list - from Nour' });
    await apiCreateTicket(request, accounts.user2, { subject: 'Admin list - from Ali' });
    await loginAs('admin');
    await page.goto('/admin/tickets');

    await page.getByLabel('Search tickets').fill('Admin list');
    const rows = page.getByRole('row');
    await expect(page.getByRole('link', { name: 'Admin list - from Nour' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Admin list - from Ali' })).toBeVisible();
    await expect(rows.filter({ hasText: 'Admin list - from Ali' })).toContainText('Ali');
    await expect(page).toHaveURL(/search=Admin/);
  });

  test('"Not assigned" and "Assigned to me" filters', async ({ page, request, loginAs }) => {
    const { accounts } = fixtures();
    const mine = await apiCreateTicket(request, accounts.user, { subject: 'Filter assignee - mine' });
    await apiCreateTicket(request, accounts.user, { subject: 'Filter assignee - free' });
    const res = await request.put(`${fixtures().apiUrl}/tickets/assign/${mine}`, api(accounts.admin));
    expect(res.status()).toBe(200);

    await loginAs('admin');
    await page.goto('/admin/tickets?search=Filter+assignee');
    await page.getByLabel('Filter by assignee').click();
    await page.getByRole('option', { name: 'Not assigned' }).click();
    await expect(page).toHaveURL(/handledBy=none/);
    await expect(page.getByRole('link', { name: 'Filter assignee - free' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Filter assignee - mine' })).toHaveCount(0);

    await page.getByLabel('Filter by assignee').click();
    await page.getByRole('option', { name: 'Assigned to me' }).click();
    await expect(page.getByRole('link', { name: 'Filter assignee - mine' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Filter assignee - free' })).toHaveCount(0);
  });
});

test.describe('admin actions on a ticket', () => {
  test('assign to me, then resolve', async ({ page, request, loginAs }) => {
    const id = await apiCreateTicket(request, fixtures().accounts.user, { subject: 'Assign and resolve' });
    await loginAs('admin');
    await page.goto(`/tickets/${id}`);

    await expect(page.getByLabel('Change status')).toHaveText('Open');
    await page.getByRole('button', { name: 'Assign to me' }).click();
    await expect(page.getByText('You are handling this ticket')).toBeVisible();
    await expect(page.getByLabel('Change status')).toHaveText('In progress'); // the backend moved it
    await expect(page.getByRole('complementary', { name: 'Ticket details' })).toContainText('Malek');

    await page.getByLabel('Change status').click();
    await page.getByRole('option', { name: 'Resolved' }).click();
    await expect(page.getByText('Status changed to Resolved')).toBeVisible();
    await expect(page.getByRole('complementary', { name: 'Ticket details' }).getByText('Resolved', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('This ticket is resolved.')).toBeVisible();
  });

  test('taking over a ticket another admin handles asks first', async ({ page, request, loginAs }) => {
    const { accounts } = fixtures();
    const id = await apiCreateTicket(request, accounts.user, { subject: 'Take over test' });
    await request.put(`${fixtures().apiUrl}/tickets/assign/${id}`, api(accounts.superadmin));

    await loginAs('admin');
    await page.goto(`/tickets/${id}`);
    await page.getByRole('button', { name: 'Take over' }).click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toContainText('Sara is handling this ticket');

    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('complementary', { name: 'Ticket details' })).toContainText('Sara'); // nothing changed

    await page.getByRole('button', { name: 'Take over' }).click();
    await dialog.getByRole('button', { name: 'Take over' }).click();
    await expect(page.getByText('You took over this ticket')).toBeVisible();
    await expect(page.getByText('You are handling this ticket')).toBeVisible();
  });

  test('delete with its files: gone for the admin and for the owner', async ({ page, request, loginAs }) => {
    const { accounts, apiUrl } = fixtures();
    const id = await apiCreateTicket(request, accounts.user, { subject: 'Delete me' }, 'delete-me.txt');
    await loginAs('admin');
    await page.goto(`/tickets/${id}`);

    await page.getByRole('button', { name: 'Delete ticket' }).click();
    const dialog = page.getByRole('alertdialog');
    const alsoFiles = dialog.getByLabel(/also delete the 1 attached file/i);
    await expect(alsoFiles).not.toBeChecked();
    await alsoFiles.check();
    await dialog.getByRole('button', { name: 'Delete' }).click();

    await expect(page).toHaveURL(/\/admin\/tickets$/);
    await expect(page.getByText('Ticket deleted and 1 file(s)')).toBeVisible();

    // the owner can't open it any more
    const res = await request.get(`${apiUrl}/tickets/${id}`, api(accounts.user));
    expect(res.status()).toBe(404);
    await page.goto(`/tickets/${id}`);
    await expect(page.getByText('Ticket not found')).toBeVisible();
  });

  test('a normal user sees none of these actions', async ({ page, request, loginAs }) => {
    const id = await apiCreateTicket(request, fixtures().accounts.user, { subject: 'No admin buttons' });
    await loginAs('user');
    await page.goto(`/tickets/${id}`);
    await expect(page.getByRole('heading', { name: 'No admin buttons' })).toBeVisible();
    await expect(page.getByLabel('Change status')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Assign to me' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Delete ticket' })).toHaveCount(0);
  });

  test('the backend refuses admin actions from a normal user (even without the UI)', async ({ request }) => {
    const { accounts, apiUrl } = fixtures();
    const id = await apiCreateTicket(request, accounts.user, { subject: 'Direct API attempt' });
    const asUser = api(accounts.user);
    expect((await request.put(`${apiUrl}/tickets/status/${id}`, { ...asUser, data: { status: 'résolu' } })).status()).toBe(403);
    expect((await request.put(`${apiUrl}/tickets/assign/${id}`, asUser)).status()).toBe(403);
    expect((await request.delete(`${apiUrl}/tickets/${id}`, asUser)).status()).toBe(403);
    expect((await request.get(`${apiUrl}/tickets`, asUser)).status()).toBe(403);
  });
});
