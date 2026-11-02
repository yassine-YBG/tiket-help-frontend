// User management: list, deactivate / activate, delete / restore, roles, pending accounts
import { test, expect, fixtures } from './fixtures';

const api = (account) => ({ headers: { Authorization: `Bearer ${account.token}` } });
const rowOf = (page, email) => page.getByRole('row').filter({ hasText: email });

test.describe('users list', () => {
  test('an admin deactivates a user (who is logged out at once), then activates them again', async ({ page, request, loginAs }) => {
    const { accounts, apiUrl } = fixtures();
    await loginAs('admin');
    await page.goto('/admin/users');
    await page.getByLabel('Search users').fill('mona');
    const row = rowOf(page, 'mona@e2e.test');
    await expect(row).toContainText('Active');

    await row.getByRole('button', { name: 'Deactivate' }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Deactivate' }).click();
    await expect(row).toContainText('Inactive');
    // the backend refuses her token right away
    expect((await request.get(`${apiUrl}/auth/me`, api(accounts.managed))).status()).toBe(401);

    await row.getByRole('button', { name: 'Activate' }).click();
    await expect(row).toContainText('Active');
    expect((await request.get(`${apiUrl}/auth/me`, api(accounts.managed))).status()).toBe(200);
  });

  test('delete, find it under "Deleted", restore', async ({ page, loginAs }) => {
    await loginAs('admin');
    await page.goto('/admin/users?search=mona');
    await rowOf(page, 'mona@e2e.test').getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('No account matches these filters')).toBeVisible();

    await page.getByLabel('Filter by account status').click();
    await page.getByRole('option', { name: 'Deleted' }).click();
    const row = rowOf(page, 'mona@e2e.test');
    await expect(row).toContainText('Deleted');
    await row.getByRole('button', { name: 'Restore' }).click();
    await expect(page.getByText('No account matches these filters')).toBeVisible(); // left the "Deleted" view
  });

  test('an admin cannot manage other admins nor change roles', async ({ page, loginAs }) => {
    await loginAs('admin');
    await page.goto('/admin/users?search=rami');
    const row = rowOf(page, 'rami@e2e.test');
    await expect(row).toContainText('Admin');
    await expect(row.getByRole('button')).toHaveCount(0);
    await expect(page.getByLabel(/Role of/)).toHaveCount(0);
  });

  test('the superadmin demotes an admin: confirmation, and his open tickets go back to the team', async ({ page, request, loginAs }) => {
    const { accounts, apiUrl } = fixtures();
    const created = await request.post(`${apiUrl}/tickets/create`, {
      ...api(accounts.user),
      multipart: { subject: 'Held by staff', category: 'Software', description: 'x' },
    });
    const id = (await created.json()).ticketId;
    await request.put(`${apiUrl}/tickets/assign/${id}`, api(accounts.staff));

    await loginAs('superadmin');
    await page.goto('/admin/users?search=staff');
    await page.getByLabel('Role of Sami Staff').click();
    await page.getByRole('option', { name: 'User' }).click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toContainText('Their open tickets go back to the team');
    await dialog.getByRole('button', { name: 'Change role' }).click();
    await expect(page.getByText('Sami Staff is now User. 1 open ticket(s) went back to the team.')).toBeVisible();

    const ticket = await (await request.get(`${apiUrl}/tickets/${id}`, api(accounts.superadmin))).json();
    expect(ticket.handledBy).toBeNull();
  });
});

test.describe('pending accounts', () => {
  test('activate one, reject another', async ({ page, request, loginAs }) => {
    const { accounts, apiUrl } = fixtures();
    await loginAs('admin');
    await page.goto('/admin/users/pending');

    await rowOf(page, 'amir@e2e.test').getByRole('button', { name: 'Activate' }).click();
    await expect(page.getByText('Amir Applicant can now log in.')).toBeVisible();
    await expect(rowOf(page, 'amir@e2e.test')).toHaveCount(0);
    expect((await request.get(`${apiUrl}/auth/me`, api(accounts.applicant))).status()).toBe(200);

    await rowOf(page, 'spam@e2e.test').getByRole('button', { name: 'Reject' }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Reject' }).click();
    await expect(rowOf(page, 'spam@e2e.test')).toHaveCount(0);
  });
});
