import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const workspaceRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');
const assetsRoot = join(workspaceRoot, 'apps/admin/dist/assets');

describe('UI component showroom production exclusion', () => {
  it('tree-shakes the development route and showroom from the production bundle', () => {
    execFileSync('npm', ['run', 'build', '--workspace', '@rental/admin'], {
      cwd: workspaceRoot,
      env: { ...process.env, NODE_ENV: 'production' },
      stdio: 'pipe',
    });
    const bundle = readdirSync(assetsRoot)
      .filter((file) => file.endsWith('.js'))
      .map((file) => readFileSync(join(assetsRoot, file), 'utf8'))
      .join('\n');
    expect(bundle).not.toContain('UI Foundation');
    expect(bundle).not.toContain('/ui-kit');
  }, 15_000);
});
