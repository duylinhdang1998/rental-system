import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      thresholds: { branches: 80, functions: 80, lines: 80, statements: 80 },
    },
    environmentMatchGlobs: [['tests/admin/**', 'jsdom']],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
  },
});
