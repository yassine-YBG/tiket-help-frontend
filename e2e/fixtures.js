// Shared helpers for the browser tests
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test as base, expect } from '@playwright/test';

const here = path.dirname(fileURLToPath(import.meta.url));
const TOKEN_KEY = 'tiket-help-token';

// written by e2e/start-backend.js
export const fixtures = () => JSON.parse(fs.readFileSync(path.join(here, '.fixtures.json'), 'utf8'));

export const test = base.extend({
  // await loginAs('admin') -> the page starts logged in as that account (no login form)
  loginAs: async ({ page }, use) => {
    await use(async (accountKey) => {
      const account = fixtures().accounts[accountKey];
      await page.addInitScript(
        ([key, token]) => {
          if (!sessionStorage.getItem('e2e-token-set')) {
            localStorage.setItem(key, token);
            sessionStorage.setItem('e2e-token-set', '1');
          }
        },
        [TOKEN_KEY, account.token]
      );
      return account;
    });
  },
});

export { expect };
export { TOKEN_KEY };
