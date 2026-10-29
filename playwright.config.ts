import { defineConfig, devices } from '@playwright/test';

/**
 * E2E-Tests (QA). Läuft gegen den Produktions-Build (`vite preview`), lokaler Modus ohne .env.
 * Start: `npm run test:e2e`  (baut vorher automatisch).
 * Gerät: iPad Pro 11 quer (1194×834, Touch), Engine Chromium.
 */
const PORT = 4173;

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  fullyParallel: true,
  workers: 4,
  retries: 0,
  timeout: 45_000,
  expect: { timeout: 7_000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
  },
  projects: [
    {
      name: 'ipad-landscape-chromium',
      use: { ...devices['iPad Pro 11 landscape'], browserName: 'chromium' },
    },
  ],
  webServer: {
    // Kein dauerhafter Prozess: Playwright startet und beendet den Server selbst.
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: { VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' },
  },
});
