// Dashboard (charts) and activity logs, on the real backend
import { test, expect, fixtures } from './fixtures';

const api = (account) => ({ headers: { Authorization: `Bearer ${account.token}` } });

test.describe('dashboard', () => {
  test('an admin sees the numbers and the chart, but not the team table', async ({ page, loginAs }) => {
    await loginAs('admin');
    await page.goto('/admin/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Created vs resolved')).toBeVisible();
    await expect(page.getByText('First response (avg.)')).toBeVisible();
    await expect(page.getByText('Team', { exact: true })).toHaveCount(0);
  });

  test('the period is kept in the URL; the superadmin sees the team table', async ({ page, request, loginAs }) => {
    const { accounts, apiUrl } = fixtures();
    // make sure someone handled a ticket
    const created = await request.post(`${apiUrl}/tickets/create`, {
      ...api(accounts.user),
      multipart: { subject: 'Dashboard team', category: 'Payment', description: 'x' },
    });
    await request.put(`${apiUrl}/tickets/assign/${(await created.json()).ticketId}`, api(accounts.admin));

    await loginAs('superadmin');
    await page.goto('/admin/dashboard');
    await page.getByLabel('Period', { exact: true }).click();
    await page.getByRole('option', { name: 'All time' }).click();
    await expect(page).toHaveURL(/period=all/);
    await expect(page.getByText('Team', { exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: /Malek/ })).toBeVisible();
    // a real chart is drawn (svg) when there is data
    await expect(page.locator('.recharts-wrapper svg').first()).toBeVisible();
  });

  test('custom dates', async ({ page, loginAs }) => {
    await loginAs('admin');
    await page.goto('/admin/dashboard?period=custom');
    await page.getByLabel('From').fill('2000-01-01');
    await page.getByLabel('To').fill('2000-01-31');
    await expect(page).toHaveURL(/from=2000-01-01/);
    await expect(page.getByText('No data for this period').first()).toBeVisible();
  });
});

test.describe('activity logs', () => {
  test("an admin never sees the superadmin's actions; the superadmin sees them", async ({ page, request, loginAs }) => {
    const { accounts, apiUrl } = fixtures();
    const created = await request.post(`${apiUrl}/tickets/create`, {
      ...api(accounts.user),
      multipart: { subject: 'Logs visibility', category: 'Software', description: 'x' },
    });
    await request.put(`${apiUrl}/tickets/assign/${(await created.json()).ticketId}`, api(accounts.superadmin));

    await loginAs('admin');
    await page.goto('/admin/activity');
    await expect(page.getByRole('button', { name: 'Nour' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sara' })).toHaveCount(0);

    // and the API refuses them too
    const res = await request.get(`${apiUrl}/activity-logs?user=${accounts.superadmin.id}`, api(accounts.admin));
    expect((await res.json()).pagination.total).toBe(0);
  });

  test('click a name to see only their actions; links open the ticket', async ({ page, loginAs }) => {
    await loginAs('superadmin');
    await page.goto('/admin/activity');
    await page.getByRole('button', { name: 'Sara' }).first().click();
    await expect(page.getByRole('button', { name: /Only actions by Sara/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Nour' })).toHaveCount(0);
    await page.getByRole('link', { name: 'Open ticket' }).first().click();
    await expect(page).toHaveURL(/\/tickets\/[a-f0-9]{24}$/);
  });
});

test('the menu shows how many accounts wait for activation', async ({ page, loginAs }) => {
  await loginAs('admin');
  await page.goto('/admin/dashboard');
  await expect(page.getByRole('navigation', { name: 'Main' }).getByLabel(/accounts? waiting for activation/)).toBeVisible();
});
