import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = join(TEST_DIR, '../../apps/admin');
const SRC_ROOT = join(APP_ROOT, 'src');
const FEATURE_ROOT = join(SRC_ROOT, 'features');

function sourceFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : [path];
  });
}

function source(path: string): string {
  return readFileSync(path, 'utf8');
}

describe('Feature: Approved frontend architecture and operational interaction patterns', () => {
  describe('Scenario: Application code uses shadcn and Radix primitives', () => {
    it('configures shadcn, Radix and Inter as the shared frontend foundation', () => {
      expect(existsSync(join(APP_ROOT, 'components.json'))).toBe(true);

      const packageJson = JSON.parse(source(join(APP_ROOT, 'package.json'))) as {
        dependencies?: Record<string, string>;
      };
      const dependencies = Object.keys(packageJson.dependencies ?? {});
      expect(
        dependencies.some((name) => name === 'radix-ui' || name.startsWith('@radix-ui/')),
      ).toBe(true);
      expect(source(join(SRC_ROOT, 'styles.css'))).toMatch(/--font-sans:\s*Inter\b/);
    });

    it('keeps native form-control tags inside the shadcn registry only', () => {
      const offenders = sourceFiles(SRC_ROOT)
        .filter((path) => ['.ts', '.tsx'].includes(extname(path)))
        .filter((path) => !path.includes(`${join('components', 'ui')}/`))
        .filter((path) => /<(?:button|input|select|textarea)(?:\s|>)/.test(source(path)))
        .map((path) => relative(SRC_ROOT, path));

      expect(offenders).toEqual([]);
    });
  });

  describe('Scenario: Feature code is nested and hooks have a dedicated boundary', () => {
    it('stores hook modules under feature hooks folders', () => {
      const offenders = sourceFiles(FEATURE_ROOT)
        .filter((path) => /^use-.+\.ts$/.test(path.split('/').at(-1) ?? ''))
        .filter((path) => !path.includes('/hooks/'))
        .map((path) => relative(FEATURE_ROOT, path));

      expect(offenders).toEqual([]);
    });

    it('keeps state, router and query hook declarations out of component modules', () => {
      const hookPattern = /\buse(?:State|Effect|Reducer|SearchParams|Query|Mutation)\s*\(/;
      const offenders = sourceFiles(FEATURE_ROOT)
        .filter((path) => path.endsWith('.tsx'))
        .filter((path) => hookPattern.test(source(path)))
        .map((path) => relative(FEATURE_ROOT, path));

      expect(offenders).toEqual([]);
    });

    it('allows only feature entrypoints at each feature root', () => {
      const offenders = readdirSync(FEATURE_ROOT, { withFileTypes: true }).flatMap((feature) => {
        if (!feature.isDirectory()) return [];
        const featurePath = join(FEATURE_ROOT, feature.name);
        return readdirSync(featurePath, { withFileTypes: true })
          .filter((entry) => entry.isFile() && entry.name !== 'index.ts')
          .map((entry) => relative(FEATURE_ROOT, join(featurePath, entry.name)));
      });

      expect(offenders).toEqual([]);
    });

    it('groups high-churn feature components by workflow responsibility', () => {
      const expectedFolders = [
        'fleet/components/calendar',
        'fleet/components/filters',
        'fleet/components/form',
        'fleet/components/list',
        'customers/components/form',
        'customers/components/list',
        'contracts/components/customer',
        'contracts/components/handover',
        'contracts/components/layout',
        'contracts/components/pricing',
        'contracts/components/success',
        'contracts/components/vehicle',
      ];
      expect(expectedFolders.every((folder) => existsSync(join(FEATURE_ROOT, folder)))).toBe(true);

      const flatOffenders = ['fleet', 'customers'].flatMap((feature) =>
        readdirSync(join(FEATURE_ROOT, feature, 'components'), { withFileTypes: true })
          .filter((entry) => entry.isFile())
          .map((entry) => `${feature}/components/${entry.name}`),
      );
      expect(flatOffenders).toEqual([]);
    });
  });
});
