import { defineConfig, devices } from '@playwright/test';

/**
 * E2E suite against the BUILT site. `npm run test:e2e` assumes `dist/`
 * exists (CI builds first); `npm run test:e2e:full` builds then tests.
 * wrangler dev serves dist with _headers and _redirects applied, the
 * closest local stand-in for the Cloudflare Pages production edge.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:8787',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    // 390px wide; pinned to Chromium so the suite needs only one browser.
    { name: 'mobile', use: { ...devices['iPhone 13'], browserName: 'chromium' } },
  ],
  webServer: {
    command: 'npx wrangler dev --port 8787',
    url: 'http://127.0.0.1:8787/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { WRANGLER_SEND_METRICS: 'false' },
  },
});
