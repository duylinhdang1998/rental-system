import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  // Vite serves the admin unbundled in dev, so a cold first navigation can take well over 30s.
  timeout: 90_000,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm run dev --workspace @rental/api',
      env: {
        ...process.env,
        RATE_LIMIT_EXPORT_PER_TEN_MINUTES: '100000',
        RATE_LIMIT_LOGIN_PER_MINUTE: '100000',
        RATE_LIMIT_MUTATION_PER_MINUTE: '100000',
        RATE_LIMIT_READ_PER_MINUTE: '100000',
      },
      port: 3000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run dev --workspace @rental/admin -- --host 127.0.0.1',
      port: 5173,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
