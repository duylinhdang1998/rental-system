import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '../../apps/admin/src');
const uiKitRoot = join(appRoot, 'features/ui-kit');

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : /\.tsx?$/.test(path) ? [path] : [];
  });
}

describe('UI component showroom architecture', () => {
  it('has a dedicated feature and does not use native form controls', () => {
    expect(existsSync(join(uiKitRoot, 'pages/UiKitPage.tsx'))).toBe(true);
    const source = sourceFiles(uiKitRoot)
      .map((path) => readFileSync(path, 'utf8'))
      .join('\n');
    expect(source).toMatch(/@\/components\/ui/);
    expect(source).not.toMatch(/from ['"]\.{1,2}\//);
    expect(source).not.toMatch(/<(button|input|select|textarea)(\s|>)/);
  });

  it('registers the showroom behind the Vite development guard', () => {
    const app = readFileSync(join(appRoot, 'App.tsx'), 'utf8');
    expect(app).toMatch(/import\.meta\.env\.DEV[\s\S]+path="\/ui-kit"/);
  });
});
