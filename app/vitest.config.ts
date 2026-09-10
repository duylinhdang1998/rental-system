import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const ADMIN_SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), './apps/admin/src');

export default defineConfig({
  resolve: { alias: { '@': ADMIN_SRC } },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      thresholds: { branches: 80, functions: 80, lines: 80, statements: 80 },
    },
    environmentMatchGlobs: [['tests/admin/**', 'jsdom']],
    /** The NestJS app boots per test under parallel workers; cold starts exceed the 10s default. */
    hookTimeout: 30_000,
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    testTimeout: 30_000,
  },
});
