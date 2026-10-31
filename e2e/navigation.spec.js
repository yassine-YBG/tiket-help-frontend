// Menus, role protection, error pages, mobile layout
import { test, expect } from './fixtures';

const ADMIN_PAGES = [
  ['Dashboard', '/admin/dashboard'],
  ['All tickets', '/admin/tickets'],
  ['Users', '/admin/users'],
  ['Pending accounts', '/admin/users/pending'],
  ['Activity logs', '/admin/activity'],
];

test('an admin lands on the dashboard and every menu link opens its page', async ({ page, loginAs }) => {
  await loginAs('admin');
  await page.goto('/');
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  for (const [label, url] of [...ADMIN_PAGES, ['My tickets', '/tickets'], ['New ticket', '/tickets/new'], ['Profile', '/profile']]) {
    await page.getByRole('link', { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${url}$`));
    await expect(page.getByRole('link', { name: label, exact: true })).toHaveAttribute('aria-current', 'page');
  }
});

test('a superadmin also sees the admin menu', async ({ page, loginAs }) => {
  await loginAs('superadmin');
  await page.goto('/');
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(page.getByText('Administration')).toBeVisible();
});

for (const [, url] of ADMIN_PAGES) {
  test(`a normal user typing ${url} is sent back`, async ({ page, loginAs }) => {
    await loginAs('user');
    await page.goto(url);
    await expect(page).toHaveURL(/\/tickets$/);
  });
}

test('an unknown address shows "Page not found"', async ({ page, loginAs }) => {
  await loginAs('user');
  await page.goto('/this-does-not-exist');
  await expect(page.getByText('Page not found')).toBeVisible();
});

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the menu opens as an overlay and closes after navigating', async ({ page, loginAs }) => {
    await loginAs('admin');
    await page.goto('/admin/dashboard');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('dialog').getByRole('link', { name: 'All tickets' }).click();
    await expect(page).toHaveURL(/\/admin\/tickets$/);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});

test('no errors in the browser console while browsing', async ({ page, loginAs }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  await loginAs('admin');
  for (const [, url] of ADMIN_PAGES) {
    await page.goto(url);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
  expect(errors).toEqual([]);
});
