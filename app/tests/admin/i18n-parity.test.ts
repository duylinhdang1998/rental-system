import { describe, expect, it } from 'vitest';
import i18n from '../../apps/admin/src/shared/i18n/i18n';

type Tree = Record<string, unknown>;

function flatten(tree: Tree, prefix = ''): Map<string, unknown> {
  const entries = new Map<string, unknown>();
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      for (const [nestedKey, nestedValue] of flatten(value as Tree, path)) {
        entries.set(nestedKey, nestedValue);
      }
    } else {
      entries.set(path, value);
    }
  }
  return entries;
}

describe('Feature: Security hardening, observability and go-live readiness — i18n', () => {
  describe('Scenario: Vietnamese and English translation trees stay in parity', () => {
    const en = flatten(i18n.getResourceBundle('en', 'translation') as Tree);
    const vi = flatten(i18n.getResourceBundle('vi', 'translation') as Tree);

    it('has the same keys in both languages', () => {
      const missingInVietnamese = [...en.keys()].filter((key) => !vi.has(key));
      const missingInEnglish = [...vi.keys()].filter((key) => !en.has(key));
      expect(missingInVietnamese).toEqual([]);
      expect(missingInEnglish).toEqual([]);
      expect(en.size).toBeGreaterThan(200);
    });

    it('has no empty or non-string leaf in either language', () => {
      const empties = [...en, ...vi].filter(
        ([, value]) => typeof value !== 'string' || value.trim() === '',
      );
      expect(empties).toEqual([]);
    });

    it('keeps interpolation placeholders identical between the two languages', () => {
      const placeholders = (value: unknown) =>
        [...String(value).matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]).sort();
      const drift = [...en].filter(
        ([key, value]) => placeholders(value).join(',') !== placeholders(vi.get(key)).join(','),
      );
      expect(drift.map(([key]) => key)).toEqual([]);
    });
  });
});
