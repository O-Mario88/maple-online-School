import { defineConfig } from '@playwright/test';

// The browser tests run against the sample-data web build. `npm run test:nav` exports it and serves
// it on NAV_TEST_PORT first (scripts/test-pages.mjs); `npx playwright test` alone starts a dev server,
// or reuses whatever already answers on NAV_TEST_PORT (npm run web:mock serves 8081).
const PORT = Number(process.env.NAV_TEST_PORT ?? 8089);
const CI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './e2e',
  // The dev server builds each page the first time it opens, so a first visit can take a while.
  timeout: 180_000,
  expect: { timeout: 45_000 },
  fullyParallel: false,
  workers: 1,
  retries: CI ? 1 : 0,
  reporter: CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    // The installed Google Chrome (on every GitHub runner too), so nothing needs downloading.
    channel: 'chrome',
    viewport: { width: 1440, height: 900 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npx expo start --web --port ${PORT}`,
    env: { EXPO_PUBLIC_MOCK_DATA: 'true', CI: '1' },
    url: `http://localhost:${PORT}`,
    // test:nav serves an export on this port before Playwright starts, in CI as well.
    reuseExistingServer: true,
    timeout: 300_000,
  },
});
