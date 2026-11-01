import { defineConfig, devices } from '@playwright/test';

// End-to-end tests: a real browser clicks through the real app.
// `npm run test:e2e` starts its OWN backend (from ../tiket-help, or BACKEND_DIR) on a
// temporary in-memory database with test accounts — your real data is never touched.
// First time only: `npm run test:e2e:install` (downloads the Chromium browser).

export const BACKEND_PORT = Number(process.env.E2E_BACKEND_PORT || 3100);
export const FRONTEND_PORT = Number(process.env.E2E_FRONTEND_PORT || 5174);
const FRONTEND_URL = `http://localhost:${FRONTEND_PORT}`;

export default defineConfig({
  testDir: './e2e',
  // tests share one database: run them one after the other, in order
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: FRONTEND_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // E2E_BROWSER=msedge (or chrome) uses the browser already installed on the computer
        // instead of the one downloaded by `npm run test:e2e:install`.
        ...(process.env.E2E_BROWSER ? { channel: process.env.E2E_BROWSER } : {}),
      },
    },
  ],
  webServer: [
    {
      command: 'node e2e/start-backend.js',
      url: `http://localhost:${BACKEND_PORT}/`,
      timeout: 180_000, // first run downloads MongoDB for the test database
      reuseExistingServer: false,
      stdout: 'pipe',
      env: { E2E_BACKEND_PORT: String(BACKEND_PORT), E2E_FRONTEND_ORIGIN: FRONTEND_URL },
    },
    {
      command: `npx vite --port ${FRONTEND_PORT} --strictPort`,
      url: FRONTEND_URL,
      timeout: 60_000,
      reuseExistingServer: false,
      env: { VITE_API_URL: `http://localhost:${BACKEND_PORT}/api` },
    },
  ],
});
